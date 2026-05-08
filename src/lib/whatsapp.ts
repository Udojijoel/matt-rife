// WhatsApp Configuration
// Update this number with your actual WhatsApp business number
export const WHATSAPP_NUMBER = "+17123605202";

// Generate WhatsApp URL with pre-filled message (wa.me — official short link)
export function getWhatsAppUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  const phone = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// Force WhatsApp Web (bypasses api.whatsapp.com desktop redirect that some
// ad blockers / networks block).
export function getWhatsAppWebUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  const phone = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
}

// Open WhatsApp with automatic fallback: try wa.me first; if the new tab
// is still focused after a short delay (meaning the redirect was blocked
// and nothing loaded), open web.whatsapp.com directly.
export function openWhatsAppWithFallback(message: string): void {
  const primary = getWhatsAppUrl(message);
  const fallback = getWhatsAppWebUrl(message);

  const win = window.open(primary, "_blank", "noopener,noreferrer");

  // If popup was blocked, immediately try the web URL in same tab
  if (!win) {
    window.location.href = fallback;
    return;
  }

  // After 1.5s, check if the opened tab is still on a blocked page.
  // We can't read its URL (cross-origin) but we can detect if it closed
  // itself or if the user is still on our page — then redirect to web fallback.
  setTimeout(() => {
    try {
      if (!win.closed) {
        // Replace the blocked tab's location with the web.whatsapp.com URL
        win.location.href = fallback;
      }
    } catch {
      // Cross-origin access denied means wa.me loaded successfully — do nothing
    }
  }, 1500);
}

// Pre-built message templates
export function getTicketMessage(showCity: string, showDate: string, venue: string): string {
  return `Hi! I'm interested in getting tickets for the Matt Rife show:\n\n📍 City: ${showCity}\n🎭 Venue: ${venue}\n📅 Date: ${showDate}\n\nPlease let me know about availability and pricing!`;
}

export function getProductMessage(productName: string, price: number): string {
  return `Hi! I'd like to purchase:\n\n🛍️ Product: ${productName}\n💰 Price: $${price}\n\nPlease let me know how to proceed with the order!`;
}

export function getMeetGreetMessage(packageName: string, price: number): string {
  return `Hi! I'm interested in booking a Meet & Greet:\n\n🎟️ Package: ${packageName}\n💰 Price: $${price}\n\nPlease share the available dates and booking details!`;
}

export function getVideoCallMessage(packageName: string, duration: string, price: number): string {
  return `Hi! I'd like to book a Video Call:\n\n📹 Package: ${packageName}\n⏱️ Duration: ${duration}\n💰 Price: $${price}\n\nPlease let me know about available time slots!`;
}

export function getGeneralTicketMessage(): string {
  return `Hi! I'm interested in getting tickets for an upcoming Matt Rife show. Can you help me with availability and pricing?`;
}

export interface CartOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export function getCartOrderMessage(
  customerName: string,
  items: CartOrderItem[],
  total: number,
  orderId?: string,
): string {
  const itemLines = items
    .map((i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
  const ref = orderId ? `\n\n🔖 Order Ref: ${orderId.slice(0, 8).toUpperCase()}` : "";
  return `Hi! I just placed an order on the Matt Rife store and I'd like to complete payment.\n\n👤 Name: ${customerName}\n\n🛍️ Items:\n${itemLines}\n\n💰 Total: $${total.toFixed(2)}${ref}\n\nPlease share payment instructions. Thanks!`;
}
