import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { createLogger } from "@/lib/logger"

// Stripe SDK is a runtime dependency — installed with: pnpm add stripe
// STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be set in environment

export const dynamic = "force-dynamic"

const logger = createLogger("stripe-webhook")

// Minimal types for the Stripe events we handle
interface StripeMetadata {
  user_id?: string
  product_slug?: string
  [key: string]: string | undefined
}

interface StripeCheckoutSession {
  id: string
  metadata: StripeMetadata | null
  subscription: string | { id: string } | null
  customer: string | { id: string } | null
}

interface StripeSubscription {
  id: string
  metadata: StripeMetadata
  status: string
  current_period_end: number
  customer: string | { id: string }
}

interface StripeEvent {
  type: string
  data: { object: unknown }
}

const PRODUCT_SLUG_MAP: Record<string, string> = {
  diagnostic: "diagnostic",
  essencial: "essencial",
  profissional: "profissional",
  enterprise: "enterprise",
}

// ---- Supabase helpers ----

interface EntitlementRow {
  user_id: string
  product_slug: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: string
  expires_at: string | null
  updated_at: string
}

async function upsertEntitlement(params: {
  userId: string
  productSlug: string
  subscriptionId: string | null
  customerId: string | null
  status: "active" | "expired" | "cancelled" | "trial"
  expiresAt: string | null
}) {
  const supabase = createServiceClient()
  const row: EntitlementRow = {
    user_id: params.userId,
    product_slug: params.productSlug,
    stripe_subscription_id: params.subscriptionId,
    stripe_customer_id: params.customerId,
    status: params.status,
    expires_at: params.expiresAt,
    updated_at: new Date().toISOString(),
  }

  // Cast to bypass generated types — table added via migration 20260325_academy_entitlements.sql
  const { error } = await (supabase as unknown as {
    from: (table: string) => {
      upsert: (
        row: EntitlementRow,
        opts: { onConflict: string }
      ) => Promise<{ error: { message: string } | null }>
    }
  })
    .from("academy_entitlements")
    .upsert(row, { onConflict: "user_id,product_slug" })

  if (error) throw new Error(error.message)
}

async function updateEntitlementStatus(params: {
  userId: string
  productSlug: string
  subscriptionId: string
  status: "cancelled" | "expired"
}) {
  const supabase = createServiceClient()

  const { error } = await (supabase as unknown as {
    from: (table: string) => {
      update: (row: Partial<EntitlementRow>) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
          }
        }
      }
    }
  })
    .from("academy_entitlements")
    .update({ status: params.status, updated_at: new Date().toISOString() })
    .eq("user_id", params.userId)
    .eq("product_slug", params.productSlug)
    .eq("stripe_subscription_id", params.subscriptionId)

  if (error) throw new Error(error.message)
}

// ---- Stripe signature verification ----

async function verifyWebhookSignature(req: NextRequest): Promise<StripeEvent> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET")
  if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY")

  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")
  if (!signature) throw new Error("Missing stripe-signature header")

  // Dynamic import — Stripe SDK must be installed: pnpm add stripe
  // Using dynamic import so the build doesn't break if the package isn't installed yet
  let StripeConstructor: new (
    key: string,
    opts: { apiVersion: string }
  ) => {
    webhooks: {
      constructEvent: (body: string, sig: string, secret: string) => StripeEvent
    }
  }

  try {
    const mod = await import("stripe")
    StripeConstructor = (mod.default ?? mod) as typeof StripeConstructor
  } catch {
    throw new Error("Stripe SDK not installed. Run: pnpm add stripe")
  }

  const stripe = new StripeConstructor(stripeKey, {
    apiVersion: "2025-02-24.acacia",
  })

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}

// ---- Event handlers ----

async function handleCheckoutSessionCompleted(obj: unknown) {
  const session = obj as StripeCheckoutSession
  const userId = session.metadata?.user_id
  const productSlug = session.metadata?.product_slug

  if (!userId || !productSlug) {
    logger.warn("checkout.session.completed missing metadata", {
      sessionId: session.id,
    })
    return
  }

  const normalizedSlug = PRODUCT_SLUG_MAP[productSlug]
  if (!normalizedSlug) {
    logger.warn("Unknown product_slug in Stripe metadata", { productSlug })
    return
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : null
  const customerId =
    typeof session.customer === "string" ? session.customer : null

  await upsertEntitlement({
    userId,
    productSlug: normalizedSlug,
    subscriptionId,
    customerId,
    status: "active",
    expiresAt: null,
  })

  logger.info("Academy entitlement created", { userId, productSlug: normalizedSlug })
}

async function handleSubscriptionUpdated(obj: unknown) {
  const subscription = obj as StripeSubscription
  const userId = subscription.metadata?.user_id
  const productSlug = subscription.metadata?.product_slug

  if (!userId || !productSlug) return

  const normalizedSlug = PRODUCT_SLUG_MAP[productSlug]
  if (!normalizedSlug) return

  const status: "active" | "expired" =
    subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : "expired"

  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : null

  await upsertEntitlement({
    userId,
    productSlug: normalizedSlug,
    subscriptionId: subscription.id,
    customerId,
    status,
    expiresAt,
  })

  logger.info("Academy entitlement updated", { userId, productSlug: normalizedSlug, status })
}

async function handleSubscriptionDeleted(obj: unknown) {
  const subscription = obj as StripeSubscription
  const userId = subscription.metadata?.user_id
  const productSlug = subscription.metadata?.product_slug

  if (!userId || !productSlug) return

  const normalizedSlug = PRODUCT_SLUG_MAP[productSlug]
  if (!normalizedSlug) return

  await updateEntitlementStatus({
    userId,
    productSlug: normalizedSlug,
    subscriptionId: subscription.id,
    status: "cancelled",
  })

  logger.info("Academy entitlement cancelled", { userId, productSlug: normalizedSlug })
}

// ---- Route handler ----

export async function POST(req: NextRequest): Promise<NextResponse> {
  let event: StripeEvent

  try {
    event = await verifyWebhookSignature(req)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed"
    logger.warn("Stripe webhook signature error", { message })
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break
      default:
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler error"
    logger.error("Stripe webhook handler error", { message, eventType: event.type })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
