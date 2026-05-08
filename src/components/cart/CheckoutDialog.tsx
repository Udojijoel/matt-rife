import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, MessageCircle, Package, Receipt as ReceiptIcon } from "lucide-react";
import { z } from "zod";
import { getWhatsAppWebUrl, getWhatsAppUrl, getCartOrderMessage, openWhatsAppWithFallback } from "@/lib/whatsapp";
import { trackEvent, Events } from "@/lib/analytics";

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().max(20, "Phone number too long").optional(),
  notes: z.string().trim().max(500, "Notes too long").optional(),
});

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappMessage, setWhatsappMessage] = useState<string>("");
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState<string>("");
  const [orderRef, setOrderRef] = useState<string>("");
  const [orderEmail, setOrderEmail] = useState<string>("");
  const [savedOrderId, setSavedOrderId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    trackEvent(Events.CheckoutSubmit, { item_count: items.length, total });

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Snapshot cart before clearing
      const snapshotItems = items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      }));
      const snapshotTotal = total;

      // Prepare items for the secure function
      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      // Use secure server-side function to create order with validated prices
      const { data: orderId, error: orderError } = await supabase
        .rpc("create_order_with_items", {
          p_customer_name: formData.name,
          p_customer_email: formData.email,
          p_customer_phone: formData.phone || null,
          p_notes: formData.notes || null,
          p_items: orderItems,
        });

      if (orderError) throw orderError;

      // Build WhatsApp URLs for payment — primary uses web.whatsapp.com (no
      // desktop redirect to the often-blocked api.whatsapp.com).
      const orderIdStr = String(orderId);
      const message = getCartOrderMessage(formData.name, snapshotItems, snapshotTotal, orderIdStr);
      const waUrl = getWhatsAppWebUrl(message);
      const waFallback = getWhatsAppUrl(message);
      const receiptUrl = `${window.location.origin}/receipt/${orderIdStr}`;

      setWhatsappMessage(message);
      setWhatsappUrl(waUrl);
      setWhatsappFallbackUrl(waFallback);
      setOrderRef(orderIdStr.slice(0, 8).toUpperCase());
      setOrderEmail(formData.email);
      setSavedOrderId(orderIdStr);

      setIsSuccess(true);
      clearCart();
      trackEvent(Events.CheckoutSuccess, { order_id: orderIdStr, total: snapshotTotal });

      // Fire-and-forget order confirmation email (don't block UI)
      supabase.functions.invoke("send-order-confirmation", {
        body: {
          customerName: formData.name,
          customerEmail: formData.email,
          orderId: orderIdStr,
          total: snapshotTotal,
          items: snapshotItems,
          whatsappUrl: waFallback, // wa.me works in any email client
          receiptUrl,
        },
      }).catch((err) => console.warn("confirmation email failed:", err));

      toast.success("Order saved! Check your email & continue on WhatsApp.");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false);
      setWhatsappUrl("");
      setWhatsappFallbackUrl("");
      setWhatsappMessage("");
      setOrderRef("");
      setOrderEmail("");
      setSavedOrderId("");
      setFormData({ name: "", email: "", phone: "", notes: "" });
    }
    onOpenChange(false);
  };

  if (isSuccess) {
    const trackUrl = `/orders?ref=${encodeURIComponent(orderRef)}&email=${encodeURIComponent(orderEmail)}`;
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm text-center">
          <div className="py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="font-display text-2xl">Order Confirmed!</h2>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Your Order Reference
              </p>
              <p className="font-display text-2xl gradient-text tracking-widest">
                {orderRef}
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                Save this — you'll need it (with your email) to track the order.
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              We've emailed your receipt and a payment link. Or continue here:
            </p>
            <Button asChild variant="hero" className="w-full">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent(Events.WhatsAppCheckoutClick, {
                    order_id: savedOrderId,
                    method: "primary_web",
                  })
                }
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Continue on WhatsApp
              </a>
            </Button>
            <button
              type="button"
              onClick={() => {
                trackEvent(Events.WhatsAppCheckoutClick, {
                  order_id: savedOrderId,
                  method: "smart_fallback",
                });
                openWhatsAppWithFallback(whatsappMessage);
              }}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              WhatsApp not opening? Try smart fallback
            </button>
            <a
              href={whatsappFallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent(Events.WhatsAppCheckoutClick, {
                  order_id: savedOrderId,
                  method: "wame_fallback",
                })
              }
              className="block text-xs text-muted-foreground underline hover:text-foreground"
            >
              Or open via wa.me link
            </a>
            <Button asChild variant="hero-outline" className="w-full">
              <Link to={`/receipt/${savedOrderId}`} onClick={handleClose}>
                <ReceiptIcon className="mr-2 h-4 w-4" />
                View &amp; Share Receipt
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to={trackUrl} onClick={handleClose}>
                <Package className="mr-2 h-4 w-4" />
                Track My Order
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleClose}>
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Checkout</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span className="gradient-text">${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests..."
              rows={3}
              className={errors.notes ? "border-destructive" : ""}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order - $${total.toFixed(2)}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
