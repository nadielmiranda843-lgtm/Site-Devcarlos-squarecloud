import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { InsertUser, User } from "../drizzle/schema";

const scrypt = promisify(scryptCallback);
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as typeof import("node:sqlite");
const databasePath = resolve(process.env.LOCAL_DATABASE_PATH || "data/power-pet.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });
const sqlite = new DatabaseSync(databasePath);
sqlite.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, openId TEXT UNIQUE NOT NULL, name TEXT, email TEXT UNIQUE, loginMethod TEXT, role TEXT NOT NULL DEFAULT 'user', stripeCustomerId TEXT, passwordHash TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, lastSignedIn TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS siteSettings (id INTEGER PRIMARY KEY AUTOINCREMENT, storeName TEXT NOT NULL DEFAULT 'DealHunter', logoUrl TEXT, whatsapp TEXT, phone TEXT, email TEXT, address TEXT, openingHours TEXT, instagram TEXT, deliveryRegions TEXT, deliveryFee TEXT NOT NULL DEFAULT '0.00', paymentMode TEXT NOT NULL DEFAULT 'manual', stripeEnabled INTEGER NOT NULL DEFAULT 0, whatsappEnabled INTEGER NOT NULL DEFAULT 0, serviceDuration INTEGER NOT NULL DEFAULT 60, simultaneousCapacity INTEGER NOT NULL DEFAULT 2, blockedDates TEXT, updatedAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, categoryId INTEGER, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, price TEXT NOT NULL, promoPrice TEXT, stock INTEGER NOT NULL DEFAULT 0, imageUrl TEXT, brand TEXT, active INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS dealSources (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, region TEXT NOT NULL DEFAULT 'US', active INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS dealOffers (id INTEGER PRIMARY KEY AUTOINCREMENT, productKey TEXT NOT NULL, title TEXT NOT NULL, store TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, oldPrice REAL NOT NULL, score INTEGER NOT NULL DEFAULT 0, safety TEXT NOT NULL DEFAULT 'Verificar', trend TEXT NOT NULL DEFAULT 'Sem previsão', imageUrl TEXT, sourceUrl TEXT, expiresAt TEXT, active INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, offerId INTEGER NOT NULL, createdAt TEXT NOT NULL, UNIQUE(userId, offerId));
  CREATE TABLE IF NOT EXISTS dealAlerts (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, keyword TEXT NOT NULL, maxPrice REAL, region TEXT, channel TEXT NOT NULL DEFAULT 'site', active INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS activityLogs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, action TEXT NOT NULL, entity TEXT NOT NULL, metadata TEXT, createdAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, durationMinutes INTEGER NOT NULL, price TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
  CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', total TEXT NOT NULL, paymentMethod TEXT, stripePaymentIntentId TEXT, createdAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, petName TEXT NOT NULL, service TEXT NOT NULL, startsAt TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'requested', transport TEXT NOT NULL, pickupAddress TEXT, createdAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS aiChatMessages (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, role TEXT NOT NULL, text TEXT NOT NULL, createdAt TEXT NOT NULL);
`);
for (const statement of [
  "ALTER TABLE users ADD COLUMN aiTrialStartedAt TEXT",
  "ALTER TABLE users ADD COLUMN aiPremiumUntil TEXT",
]) { try { sqlite.exec(statement); } catch { /* colunas já existem */ } }

sqlite.exec(`INSERT OR IGNORE INTO dealSources (id,name,slug,region,active,createdAt) VALUES (1,'Best Buy','best-buy','US',1,'2026-01-01T00:00:00.000Z'),(2,'Amazon US','amazon-us','US',1,'2026-01-01T00:00:00.000Z'),(3,'Nike Outlet','nike-outlet','US',1,'2026-01-01T00:00:00.000Z'),(4,'eBay','ebay','US',1,'2026-01-01T00:00:00.000Z')`);
sqlite.exec(`INSERT OR IGNORE INTO dealOffers (id,productKey,title,store,category,price,oldPrice,score,safety,trend,imageUrl,active,createdAt,updatedAt) VALUES (1,'sony-ps5-slim','Sony PlayStation 5 Slim','Best Buy','Eletrônicos',449.99,499.99,96,'Seguro','Espere 2 dias','https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),(2,'apple-airpods-pro-2','Apple AirPods Pro 2','Amazon US','Eletrônicos',169.99,249.99,94,'Seguro','Compre agora','https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),(3,'nike-air-max-dn','Nike Air Max Dn','Nike Outlet','Moda',89,160,89,'Seguro','Queda provável','https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),(4,'macbook-air-m2-refurb','MacBook Air M2 recondicionado','eBay','Eletrônicos',699,999,72,'Verificar','Compre agora','https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z')`);

const now = () => new Date().toISOString();
const sqlValues = (input: Record<string, unknown>) => Object.values(input) as any[];
const toUser = (row: Record<string, unknown>): User => ({ ...row, createdAt: new Date(String(row.createdAt)), updatedAt: new Date(String(row.updatedAt)), lastSignedIn: new Date(String(row.lastSignedIn)) } as User);

export async function hashPassword(password: string) { const salt = randomUUID(); const hash = Buffer.from(await scrypt(password, salt, 64) as Buffer).toString("hex"); return `${salt}:${hash}`; }
async function passwordMatches(password: string, stored: string) { const [salt, expected] = stored.split(":"); if (!salt || !expected) return false; const actual = Buffer.from(await scrypt(password, salt, 64) as Buffer).toString("hex"); return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected)); }

export async function createLocalUser(input: { name: string; email: string; password: string; role?: "user" | "admin" }) {
  const email = input.email.trim().toLowerCase(); const timestamp = now(); const openId = `local_${randomUUID()}`; const passwordHash = await hashPassword(input.password);
  try { const result = sqlite.prepare("INSERT INTO users (openId,name,email,loginMethod,role,passwordHash,createdAt,updatedAt,lastSignedIn) VALUES (?,?,?,?,?,?,?,?,?)").run(openId, input.name.trim(), email, "password", input.role ?? "user", passwordHash, timestamp, timestamp, timestamp); return getUserById(Number(result.lastInsertRowid)); }
  catch (error) { if (String(error).includes("UNIQUE")) throw new Error("Já existe uma conta com este e-mail."); throw error; }
}
export async function ensureInitialAdmin(input: { name: string; email: string; password: string }) { const existing = sqlite.prepare("SELECT * FROM users WHERE email=?").get(input.email.trim().toLowerCase()) as Record<string, unknown> | undefined; if (existing) return toUser(existing); return createLocalUser({ ...input, role: "admin" }); }
export async function verifyLocalCredentials(email: string, password: string) { const row = sqlite.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as Record<string, unknown> | undefined; if (!row || !row.passwordHash || !(await passwordMatches(password, String(row.passwordHash)))) return undefined; const id = Number(row.id); sqlite.prepare("UPDATE users SET lastSignedIn=?, updatedAt=? WHERE id=?").run(now(), now(), id); return getUserById(id); }
export async function updateLocalProfile(id: number, values: { name?: string; email?: string; password?: string }) { const current = await getUserById(id); if (!current) return undefined; const name = values.name?.trim() || current.name; const email = values.email?.trim().toLowerCase() || current.email; const passwordHash = values.password ? await hashPassword(values.password) : (sqlite.prepare("SELECT passwordHash FROM users WHERE id=?").get(id) as { passwordHash: string }).passwordHash; sqlite.prepare("UPDATE users SET name=?, email=?, passwordHash=?, updatedAt=? WHERE id=?").run(name, email, passwordHash, now(), id); return getUserById(id); }
export async function getUserById(id: number) { const row = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown> | undefined; return row ? toUser(row) : undefined; }
export async function getAiAccess(userId: number) {
  const row = sqlite.prepare("SELECT aiTrialStartedAt, aiPremiumUntil FROM users WHERE id=?").get(userId) as { aiTrialStartedAt?: string; aiPremiumUntil?: string } | undefined;
  const startedAt = row?.aiTrialStartedAt ? new Date(row.aiTrialStartedAt) : undefined;
  if (!startedAt) return { plan: "trial" as const, active: false, pending: true, startedAt: null, expiresAt: null, daysRemaining: 0 };
  const premiumUntil = row?.aiPremiumUntil ? new Date(row.aiPremiumUntil) : undefined;
  const expiresAt = premiumUntil && premiumUntil > startedAt ? premiumUntil : new Date(startedAt.getTime() + 7 * 86400000);
  const active = expiresAt.getTime() > Date.now();
  return { plan: premiumUntil && premiumUntil > new Date() ? "premium" as const : "trial" as const, active, pending: false, startedAt: startedAt.toISOString(), expiresAt: expiresAt.toISOString(), daysRemaining: Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)) };
}
export async function activateAiTrial(userId: number) { const existing = sqlite.prepare("SELECT aiTrialStartedAt FROM users WHERE id=?").get(userId) as { aiTrialStartedAt?: string } | undefined; if (existing?.aiTrialStartedAt) return getAiAccess(userId); const timestamp = now(); sqlite.prepare("UPDATE users SET aiTrialStartedAt=?, updatedAt=? WHERE id=?").run(timestamp, timestamp, userId); return getAiAccess(userId); }
export async function searchAiCatalog(userId: number, query: string) { const access = await getAiAccess(userId); if (!access.active) return { access, offers: [] }; return { access, offers: await listDealOffers({ search: query, sort: "score" }) }; }
export function listAiChatMessages(userId: number) { return sqlite.prepare("SELECT id, role, text, createdAt FROM aiChatMessages WHERE userId=? ORDER BY id ASC LIMIT 100").all(userId) as Array<{ id: number; role: "user" | "bot"; text: string; createdAt: string }>; }
export function saveAiChatMessage(input: { userId: number; role: "user" | "bot"; text: string }) { const result = sqlite.prepare("INSERT INTO aiChatMessages (userId,role,text,createdAt) VALUES (?,?,?,?)").run(input.userId, input.role, input.text.trim(), now()); return { id: Number(result.lastInsertRowid), ...input, createdAt: now() }; }
export async function upsertUser(user: InsertUser): Promise<void> { if (!user.openId) throw new Error("User openId is required"); const existing = await getUserByOpenId(user.openId); if (existing) { sqlite.prepare("UPDATE users SET name=?,email=?,loginMethod=?,role=?,updatedAt=?,lastSignedIn=? WHERE id=?").run(user.name ?? existing.name, user.email ?? existing.email, user.loginMethod ?? existing.loginMethod, user.role ?? existing.role, now(), now(), existing.id); return; } const timestamp = now(); sqlite.prepare("INSERT INTO users (openId,name,email,loginMethod,role,createdAt,updatedAt,lastSignedIn) VALUES (?,?,?,?,?,?,?,?)").run(user.openId, user.name ?? null, user.email ?? null, user.loginMethod ?? null, user.role ?? "user", timestamp, timestamp, timestamp); }
export async function getUserByOpenId(openId: string) { const row = sqlite.prepare("SELECT * FROM users WHERE openId = ?").get(openId) as Record<string, unknown> | undefined; return row ? toUser(row) : undefined; }

export async function getSiteSettings(): Promise<any> { return sqlite.prepare("SELECT * FROM siteSettings ORDER BY id LIMIT 1").get(); }
export async function saveSiteSettings(values: Record<string, unknown>): Promise<any> { const existing = await getSiteSettings(); if (!existing) { const keys = Object.keys(values); const result = sqlite.prepare(`INSERT INTO siteSettings (storeName,${keys.join(",")},updatedAt) VALUES (${["?", ...keys.map(() => "?") , "?"].join(",")})`).run("DealHunter", ...sqlValues(values), now()); return { id: Number(result.lastInsertRowid), storeName: "DealHunter", ...values }; } const keys = Object.keys(values); if (keys.length) sqlite.prepare(`UPDATE siteSettings SET ${keys.map(k => `${k}=?`).join(",")},updatedAt=? WHERE id=?`).run(...sqlValues(values), now(), existing.id); return { ...existing, ...values }; }
export async function listProducts(): Promise<any[]> { return sqlite.prepare("SELECT * FROM products ORDER BY createdAt DESC").all() as any[]; }
export async function createProduct(input: Record<string, unknown>): Promise<any> { const timestamp = now(); const keys = Object.keys(input); const result = sqlite.prepare(`INSERT INTO products (${keys.join(",")},createdAt,updatedAt) VALUES (${[...keys.map(() => "?"), "?", "?"].join(",")})`).run(...sqlValues(input), timestamp, timestamp); return { id: Number(result.lastInsertRowid), ...input }; }
export async function updateProduct(id: number, input: Record<string, unknown>): Promise<any> { const keys = Object.keys(input); if (keys.length) sqlite.prepare(`UPDATE products SET ${keys.map(k => `${k}=?`).join(",")},updatedAt=? WHERE id=?`).run(...sqlValues(input), now(), id); return { id, ...input }; }
export async function deleteProduct(id: number) { sqlite.prepare("DELETE FROM products WHERE id=?").run(id); return true; }
export async function listServices(): Promise<any[]> { return sqlite.prepare("SELECT * FROM services ORDER BY id DESC").all() as any[]; }
export async function createService(input: Record<string, unknown>): Promise<any> { const keys = Object.keys(input); const result = sqlite.prepare(`INSERT INTO services (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`).run(...sqlValues(input)); return { id: Number(result.lastInsertRowid), ...input }; }
export async function updateService(id: number, input: Record<string, unknown>): Promise<any> { const keys = Object.keys(input); if (keys.length) sqlite.prepare(`UPDATE services SET ${keys.map(k => `${k}=?`).join(",")} WHERE id=?`).run(...sqlValues(input), id); return { id, ...input }; }
export async function deleteService(id: number) { sqlite.prepare("DELETE FROM services WHERE id=?").run(id); return true; }
export async function listOrders(): Promise<any[]> { return sqlite.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all() as any[]; }
export async function createOrder(input: { userId: number; total: number; paymentMethod: string }) { const result = sqlite.prepare("INSERT INTO orders (userId,status,total,paymentMethod,createdAt) VALUES (?,?,?,?,?)").run(input.userId, "pending", input.total.toFixed(2), input.paymentMethod, now()); return { id: Number(result.lastInsertRowid), ...input, status: "pending" as const }; }
export async function updateOrderStatus(id: number, status: string) { sqlite.prepare("UPDATE orders SET status=? WHERE id=?").run(status, id); return { id, status }; }
export async function createAppointment(input: { userId: number; petName: string; service: string; startsAt: Date; transport: string; pickupAddress?: string }) { const result = sqlite.prepare("INSERT INTO appointments (userId,petName,service,startsAt,transport,pickupAddress,createdAt) VALUES (?,?,?,?,?,?,?)").run(input.userId, input.petName, input.service, input.startsAt.toISOString(), input.transport, input.pickupAddress ?? null, now()); return { id: Number(result.lastInsertRowid), ...input, status: "requested" as const }; }

export async function listDealOffers(filters: { search?: string; category?: string; sort?: "price" | "discount" | "score" } = {}) {
  const clauses = ["active=1", "(expiresAt IS NULL OR expiresAt > ?)"];
  const params: any[] = [now()];
  if (filters.search?.trim()) { clauses.push("(lower(title) LIKE ? OR lower(store) LIKE ? OR lower(category) LIKE ?)"); const term = `%${filters.search.trim().toLowerCase()}%`; params.push(term, term, term); }
  if (filters.category && filters.category !== "Todas") { clauses.push("category=?"); params.push(filters.category); }
  const order = filters.sort === "price" ? "price ASC" : filters.sort === "discount" ? "((oldPrice-price)/oldPrice) DESC" : "score DESC";
  return sqlite.prepare(`SELECT * FROM dealOffers WHERE ${clauses.join(" AND ")} ORDER BY ${order}`).all(...params) as any[];
}
export async function listDealSources() { return sqlite.prepare("SELECT * FROM dealSources ORDER BY name").all() as any[]; }
export async function listFavorites(userId: number) { return sqlite.prepare("SELECT f.*, o.title, o.store, o.price, o.oldPrice, o.imageUrl, o.score, o.safety FROM favorites f JOIN dealOffers o ON o.id=f.offerId WHERE f.userId=? ORDER BY f.createdAt DESC").all(userId) as any[]; }
export async function toggleFavorite(userId: number, offerId: number) { const existing = sqlite.prepare("SELECT id FROM favorites WHERE userId=? AND offerId=?").get(userId, offerId) as { id: number } | undefined; if (existing) { sqlite.prepare("DELETE FROM favorites WHERE id=?").run(existing.id); return { saved: false }; } sqlite.prepare("INSERT INTO favorites (userId,offerId,createdAt) VALUES (?,?,?)").run(userId, offerId, now()); return { saved: true }; }
export async function createDealAlert(input: { userId: number; keyword: string; maxPrice?: number; region?: string; channel?: string }) { const result = sqlite.prepare("INSERT INTO dealAlerts (userId,keyword,maxPrice,region,channel,active,createdAt) VALUES (?,?,?,?,?,1,?)").run(input.userId, input.keyword.trim(), input.maxPrice ?? null, input.region ?? null, input.channel ?? "site", now()); return { id: Number(result.lastInsertRowid), ...input, active: 1 }; }
export async function listDealAlerts(userId: number) { return sqlite.prepare("SELECT * FROM dealAlerts WHERE userId=? ORDER BY createdAt DESC").all(userId) as any[]; }
export async function createActivityLog(input: { userId?: number; action: string; entity: string; metadata?: unknown }) { sqlite.prepare("INSERT INTO activityLogs (userId,action,entity,metadata,createdAt) VALUES (?,?,?,?,?)").run(input.userId ?? null, input.action, input.entity, input.metadata ? JSON.stringify(input.metadata) : null, now()); }
export async function listActivityLogs() { return sqlite.prepare("SELECT * FROM activityLogs ORDER BY createdAt DESC LIMIT 200").all() as any[]; }
export async function listUsers() { return sqlite.prepare("SELECT id,openId,name,email,loginMethod,role,createdAt,updatedAt,lastSignedIn FROM users ORDER BY createdAt DESC").all() as any[]; }
export async function updateUserRole(id: number, role: "user" | "admin") { sqlite.prepare("UPDATE users SET role=?,updatedAt=? WHERE id=?").run(role, now(), id); return getUserById(id); }
