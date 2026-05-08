import { supabase } from "@/integrations/supabase/client";

// Persistent anonymous session id (per browser)
function getSessionId(): string {
  try {
    const k = "mr_session_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return "no-session";
  }
}

export async function trackEvent(
  eventName: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      metadata: metadata as never,
      user_id: user?.id ?? null,
      session_id: getSessionId(),
    });
  } catch (err) {
    // Analytics must never break the user flow
    console.warn("analytics:", err);
  }
}

// Common event names — keep in one place to avoid typos
export const Events = {
  GetTicketsClick: "get_tickets_click",
  WhatsAppCheckoutClick: "whatsapp_checkout_click",
  CheckoutSubmit: "checkout_submit",
  CheckoutSuccess: "checkout_success",
  ReceiptShareClick: "receipt_share_click",
} as const;
