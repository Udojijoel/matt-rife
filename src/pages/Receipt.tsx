import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageCircle, Share2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent, Events } from "@/lib/analytics";

interface ReceiptItem {
  product_name: string;
  quantity: number;
  price: number;
}
interface Receipt {
  id: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
  notes: string | null;
  items: ReceiptItem[];
}

export default function Receipt() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_public_receipt", { p_id: id });
      if (error) console.error(error);
      setReceipt((data as unknown as Receipt) ?? null);
      setLoading(false);
    })();
  }, [id]);

  const ref = receipt ? receipt.id.slice(0, 8).toUpperCase() : "";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const buildShareMessage = () => {
    if (!receipt) return "";
    const lines = receipt.items
      .map((i) => `• ${i.product_name} x${i.quantity}`)
      .join("\n");
    return `🧾 Matt Rife Order Receipt\n\nRef: ${ref}\nName: ${receipt.customer_name}\nTotal: $${Number(receipt.total).toFixed(2)}\nStatus: ${receipt.status}\n\nItems:\n${lines}\n\nView receipt: ${shareUrl}`;
  };

  const handleWhatsAppShare = () => {
    trackEvent(Events.ReceiptShareClick, { method: "whatsapp", order_id: receipt?.id });
    window.open(getWhatsAppUrl(buildShareMessage()), "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    trackEvent(Events.ReceiptShareClick, { method: "copy", order_id: receipt?.id });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Receipt link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Long-press the URL to copy manually.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !receipt ? (
            <Card>
              <CardContent className="py-16 text-center space-y-3">
                <h1 className="font-display text-2xl">Receipt not found</h1>
                <p className="text-muted-foreground">
                  This receipt link is invalid or the order has been removed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center border-b border-border">
                <CardTitle className="font-display text-3xl gradient-text">
                  Order #{ref}
                </CardTitle>
                <CardDescription>
                  {new Date(receipt.created_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </CardDescription>
                <span className="inline-flex mx-auto items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium capitalize text-primary">
                  {receipt.status}
                </span>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer</p>
                  <p className="font-medium">{receipt.customer_name}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Items</p>
                  {receipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.product_name} <span className="text-muted-foreground text-xs">×{item.quantity}</span></span>
                      <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-2xl gradient-text">${Number(receipt.total).toFixed(2)}</span>
                </div>

                {receipt.notes && (
                  <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">
                    "{receipt.notes}"
                  </p>
                )}

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-3 h-3" /> Share this receipt
                  </p>
                  <Button onClick={handleWhatsAppShare} variant="hero" className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" /> Share via WhatsApp
                  </Button>
                  <Button onClick={handleCopy} variant="hero-outline" className="w-full">
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Link copied" : "Copy receipt link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
