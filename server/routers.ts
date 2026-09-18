import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { activateAiTrial, createActivityLog, createAppointment, createDealAlert, createLocalUser, createOrder, createProduct, deleteProduct, deleteService, getAiAccess, getSiteSettings, listActivityLogs, listDealAlerts, listDealOffers, listDealSources, listFavorites, listOrders, listProducts, listServices, listUsers, createService, saveSiteSettings, searchAiCatalog, toggleFavorite, updateLocalProfile, updateOrderStatus, updateProduct, updateService, updateUserRole, verifyLocalCredentials } from "./db";
import { products } from "../drizzle/schema";
import { createPowerPetCheckout } from "./stripe";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { timingSafeEqual } from "node:crypto";


const adminOnly = protectedProcedure.use(({ ctx, next }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso exclusivo para administradores." }); return next(); });
const loginAttempts = new Map<string, number[]>();
const allowLogin = (key: string) => { const now = Date.now(); const recent = (loginAttempts.get(key) ?? []).filter(time => now - time < 60_000); if (recent.length >= 10) return false; recent.push(now); loginAttempts.set(key, recent); return true; };

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (!allowLogin(String(ctx.req.ip ?? "unknown"))) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Muitas tentativas. Aguarde um minuto e tente novamente." });
      const user = await verifyLocalCredentials(input.email, input.password);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos." });
      const token = await sdk.createSessionToken(user.openId, { name: user.name || "Cliente", expiresInMs: 1000 * 60 * 60 * 12 });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 12 });
      return { success: true } as const;
    }),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(120), email: z.string().email(), password: z.string().min(10).max(256) })).mutation(async ({ input, ctx }) => {
      try { const user = await createLocalUser(input); const token = await sdk.createSessionToken(user!.openId, { name: user!.name || "Cliente", expiresInMs: 1000 * 60 * 60 * 12 }); ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 12 }); return { success: true } as const; }
      catch (error) { throw new TRPCError({ code: "CONFLICT", message: error instanceof Error ? error.message : "Não foi possível criar a conta." }); }
    }),
    profile: router({ update: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(120).optional(), email: z.string().email().optional(), password: z.string().min(10).max(256).optional() })).mutation(async ({ input, ctx }) => { try { return await updateLocalProfile(ctx.user.id, input); } catch { throw new TRPCError({ code: "CONFLICT", message: "Este e-mail já está em uso." }); } }) }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  site: router({ settings: publicProcedure.query(async () => (await getSiteSettings()) ?? { storeName: "DealHunter", logoUrl: "", whatsapp: "", phone: "", email: "", address: "", openingHours: "", instagram: "", deliveryRegions: "EUA e redirecionamento internacional", deliveryFee: "0.00", paymentMode: "manual", stripeEnabled: 0, whatsappEnabled: 0, serviceDuration: 60, simultaneousCapacity: 2, blockedDates: "" }) }),
  offers: router({
    list: publicProcedure.input(z.object({ search: z.string().trim().max(120).optional(), category: z.string().trim().max(80).optional(), sort: z.enum(["price", "discount", "score"]).optional() }).optional()).query(({ input }) => listDealOffers(input ?? {})),
    sources: publicProcedure.query(() => listDealSources()),
    favorites: protectedProcedure.query(({ ctx }) => listFavorites(ctx.user.id)),
    toggleFavorite: protectedProcedure.input(z.object({ offerId: z.number().int().positive() })).mutation(async ({ input, ctx }) => { const result = await toggleFavorite(ctx.user.id, input.offerId); await createActivityLog({ userId: ctx.user.id, action: result.saved ? "favorite.add" : "favorite.remove", entity: "offer", metadata: input }); return result; }),
    alerts: protectedProcedure.query(({ ctx }) => listDealAlerts(ctx.user.id)),
    createAlert: protectedProcedure.input(z.object({ keyword: z.string().trim().min(2).max(120), maxPrice: z.number().positive().max(1_000_000).optional(), region: z.string().trim().max(120).optional(), channel: z.enum(["site", "email", "telegram", "discord"]).default("site") })).mutation(({ input, ctx }) => createDealAlert({ ...input, userId: ctx.user.id })),
  }),
  locator: router({
    access: protectedProcedure.query(({ ctx }) => getAiAccess(ctx.user.id)),
    activateTrial: protectedProcedure.mutation(({ ctx }) => activateAiTrial(ctx.user.id)),
    search: protectedProcedure.input(z.object({ query: z.string().trim().min(2).max(120) })).mutation(async ({ input, ctx }) => { const result = await searchAiCatalog(ctx.user.id, input.query); if (!result.access.active) throw new TRPCError({ code: "FORBIDDEN", message: result.access.pending ? "Ative seu teste gratuito para usar o Localizador IA." : "Seu teste gratuito terminou. Ative o Premium para continuar." }); await createActivityLog({ userId: ctx.user.id, action: "ai.locator.search", entity: "dealOffer", metadata: { query: input.query } }); return result; }),
  }),
  catalog: router({ list: publicProcedure.input(z.object({ category: z.string().optional() }).optional()).query(async ({ input }) => { const dbProducts = await listProducts(); return input?.category ? dbProducts.filter((p: any) => p.category === input.category) : dbProducts; }) }),
  appointments: router({ request: protectedProcedure.input(z.object({ petName: z.string().min(1), service: z.string().min(1), startsAt: z.coerce.date(), transport: z.enum(["store", "pickup"]), pickupAddress: z.string().optional() })).mutation(async ({ input, ctx }) => ({ success: true, requestedBy: ctx.user.id, ...(await createAppointment({ ...input, userId: ctx.user.id })) })) }),
  checkout: router({ prepare: protectedProcedure.input(z.object({ items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive().max(50) })).min(1) })).mutation(async ({ input, ctx }) => { const catalog = await listProducts(); const source = catalog; const items = input.items.map(item => { const product = source.find((p: any) => p.id === item.productId && p.active !== 0); if (!product) throw new TRPCError({ code: "BAD_REQUEST", message: "Produto indisponível." }); return { name: String(product.name), quantity: item.quantity, unitPrice: Number(product.price) }; }); const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0); const checkoutUrl = await createPowerPetCheckout({ userId: ctx.user.id, email: ctx.user.email, name: ctx.user.name, total, items, origin: ctx.req.headers.origin }); const order = await createOrder({ userId: ctx.user.id, total, paymentMethod: checkoutUrl ? "stripe" : "manual" }); return { ready: Boolean(checkoutUrl), configured: Boolean(checkoutUrl), provider: "stripe" as const, checkoutUrl, orderId: order.id, customerEmail: ctx.user.email, userId: ctx.user.id, total, items, message: checkoutUrl ? "Checkout seguro criado." : "Pedido recebido. A loja confirmará o pagamento e a entrega." }; }) }),
  admin: router({
    users: adminOnly.query(() => listUsers()),
    updateUserRole: adminOnly.input(z.object({ id: z.number().int().positive(), role: z.enum(["user", "admin"]) })).mutation(async ({ input, ctx }) => { const result = await updateUserRole(input.id, input.role); await createActivityLog({ userId: ctx.user.id, action: "user.role.update", entity: "user", metadata: input }); return result; }),
    sources: adminOnly.query(() => listDealSources()),
    logs: adminOnly.query(() => listActivityLogs()),
    settings: router({ get: adminOnly.query(() => getSiteSettings()), save: adminOnly.input(z.object({ storeName: z.string().min(2), logoUrl: z.string().optional(), whatsapp: z.string().optional(), phone: z.string().optional(), email: z.string().email().or(z.literal("")).optional(), address: z.string().optional(), openingHours: z.string().optional(), instagram: z.string().optional(), deliveryRegions: z.string().optional(), deliveryFee: z.string().regex(/^\d+(\.\d{1,2})?$/), paymentMode: z.enum(["manual", "stripe", "pix"]), stripeEnabled: z.number().int().min(0).max(1), whatsappEnabled: z.number().int().min(0).max(1), serviceDuration: z.number().int().min(15).max(480), simultaneousCapacity: z.number().int().min(1).max(20), blockedDates: z.string().optional() })).mutation(({ input }) => saveSiteSettings(input)) }),
    products: router({ list: adminOnly.query(async () => { const result = await listProducts(); return result; }), create: adminOnly.input(z.object({ name: z.string().min(2), slug: z.string().min(2), price: z.string(), stock: z.number().int().min(0), description: z.string().optional(), imageUrl: z.string().optional(), brand: z.string().optional() })).mutation(({ input }) => createProduct({ ...input, price: input.price, active: 1 })), update: adminOnly.input(z.object({ id: z.number().int(), name: z.string().min(2).optional(), price: z.string().optional(), stock: z.number().int().min(0).optional(), active: z.number().int().min(0).max(1).optional() })).mutation(({ input }) => { const { id, ...values } = input; return updateProduct(id, values); }), delete: adminOnly.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteProduct(input.id)) }),
    services: router({ list: adminOnly.query(async () => { const result = await listServices(); return result.length ? result : [{ id: 1, name: "Monitoramento de preço", durationMinutes: 60, price: "19.90", active: 1 }, { id: 2, name: "Curadoria de ofertas", durationMinutes: 90, price: "39.90", active: 1 }, { id: 3, name: "Análise Scam Shield", durationMinutes: 45, price: "29.90", active: 1 }]; }), create: adminOnly.input(z.object({ name: z.string().min(2), durationMinutes: z.number().int().min(15), price: z.string() })).mutation(({ input }) => createService({ ...input, active: 1 })), update: adminOnly.input(z.object({ id: z.number().int(), name: z.string().min(2).optional(), durationMinutes: z.number().int().min(15).optional(), price: z.string().optional(), active: z.number().int().min(0).max(1).optional() })).mutation(({ input }) => { const { id, ...values } = input; return updateService(id, values); }), delete: adminOnly.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteService(input.id)) }),
    orders: router({ list: adminOnly.query(() => listOrders()), updateStatus: adminOnly.input(z.object({ id: z.number().int(), status: z.enum(["pending", "paid", "preparing", "out_for_delivery", "delivered", "cancelled"]) })).mutation(({ input }) => updateOrderStatus(input.id, input.status)) }),
  }),
});
export type AppRouter = typeof appRouter;
