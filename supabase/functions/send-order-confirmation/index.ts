import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Payload {
  customerName: string;
  customerEmail: string;
  orderId: string;
  total: number;
  items: OrderItem[];
  whatsappUrl: string;
  receiptUrl: string;
}

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: Payload = await req.json();

    if (!body.customerEmail || !body.orderId || !body.customerName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const ref = body.orderId.slice(0, 8).toUpperCase();
    const itemsHtml = body.items
      .map(
        (i) =>
          `<tr><td style="padding:6px 0">${escapeHtml(i.name)} × ${i.quantity}</td><td style="text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`,
      )
      .join("");

    await resend.emails.send({
      from: "Matt Rife Store <onboarding@resend.dev>",
      to: [body.customerEmail],
      subject: `Order Confirmation #${ref} — Complete payment on WhatsApp`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#0f172a">
          <h1 style="color:#1e40af">Thanks, ${escapeHtml(body.customerName)}!</h1>
          <p>We've saved your order. Your reference is:</p>
          <p style="font-size:24px;font-weight:bold;letter-spacing:3px;color:#1e40af;background:#f1f5f9;padding:12px 16px;border-radius:8px;text-align:center">${ref}</p>

          <h2 style="color:#334155;margin-top:24px">Order Summary</h2>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">
            ${itemsHtml}
            <tr style="border-top:1px solid #e2e8f0"><td style="padding:8px 0;font-weight:bold">Total</td><td style="text-align:right;font-weight:bold">$${body.total.toFixed(2)}</td></tr>
          </table>

          <h2 style="color:#334155;margin-top:24px">Next step: complete payment</h2>
          <p>Click the button below to message us on WhatsApp and finalise your payment.</p>
          <p style="text-align:center;margin:24px 0">
            <a href="${body.whatsappUrl}" style="background:#25d366;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Continue on WhatsApp</a>
          </p>

          <p style="margin-top:24px">View or share your receipt anytime:</p>
          <p><a href="${body.receiptUrl}" style="color:#1e40af">${body.receiptUrl}</a></p>

          <p style="color:#64748b;font-size:12px;margin-top:32px">
            If you didn't place this order, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-order-confirmation error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
