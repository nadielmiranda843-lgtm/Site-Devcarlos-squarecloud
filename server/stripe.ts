import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = secretKey ? new Stripe(secretKey) : null;

export async function createPowerPetCheckout(input: { userId: number; email?: string | null; name?: string | null; total: number; items: Array<{ name: string; quantity: number; unitPrice: number }>; origin?: string }) {
  if (!stripe) return null;
  const origin = input.origin || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email || undefined,
    client_reference_id: String(input.userId),
    metadata: { user_id: String(input.userId), customer_email: input.email || "", customer_name: input.name || "" },
    allow_promotion_codes: true,
    line_items: input.items.map(item => ({ price_data: { currency: "brl", product_data: { name: item.name }, unit_amount: Math.round(item.unitPrice * 100) }, quantity: item.quantity })),
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
  });
  return session.url;
}

export function constructPowerPetWebhook(rawBody: Buffer, signature: string | undefined) {
  if (!stripe || !webhookSecret || !signature) return null;
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
