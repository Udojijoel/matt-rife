import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Package, Search, MessageCircle } from "lucide-react";
import { getWhatsAppUrl, getCartOrderMessage } from "@/lib/whatsapp";

interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  total: number;
  created_at: string;
  order_items: { id: string; quantity: number; price: number; product_id: string; products?: { name: string } | null }[];
}

const STATUS_VARIANT: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  processing: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  paid: "bg-green-500/15 text-green-500 border-green-500/30",
  shipped: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-green-500/15 text-green-500 border-green-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_VARIANT[status.toLowerCase()] ?? "bg-secondary text-foreground border-border";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

export function OrderCard({ order }: { order: OrderRow }) {
  const items = (order.order_items || []).map((i) => ({
    name: i.products?.name ?? "Item",
    quantity: i.quantity,
    price: Number(i.price),
  }));
  const waUrl = getWhatsAppUrl(getCartOrderMessage(order.customer_name, items, Number(order.total), order.id));
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
            <CardDescription>
              Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </CardDescription>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} <span className="text-xs">×{item.quantity}</span>
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="text-muted-foreground">Total</span>
          <span className="font-display text-xl gradient-text">${Number(order.total).toFixed(2)}</span>
        </div>
        {order.notes && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">"{order.notes}"</p>
        )}
        <Button asChild variant="hero-outline" className="w-full">
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Message us about this order
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Public guest order lookup page. Signed-in users are sent to /orders.
 */
export default function OrderLookup() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [refInput, setRefInput] = useState(searchParams.get("ref") ?? "");
  const [emailInput, setEmailInput] = useState(searchParams.get("email") ?? "");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<OrderRow | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) navigate("/orders", { replace: true });
  }, [user, authLoading, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");
    if (ref && email && !lookupResult) handleLookup(ref, email);
  }, []);

  const handleLookup = async (refOverride?: string, emailOverride?: string) => {
    const ref = (refOverride ?? refInput).trim().toUpperCase();
    const email = (emailOverride ?? emailInput).trim().toLowerCase();
    setLookupError(null);
    setLookupResult(null);
    if (!ref || !email) {
      setLookupError("Please enter both your order reference and email");
      return;
    }
    setLookupLoading(true);
    try {
      const { data, error } = await supabase.rpc("lookup_order_by_ref", { p_ref: ref, p_email: email });
      if (error) throw error;
      if (!data) {
        setLookupError("No order found. Please double-check your reference and email.");
      } else {
        const d = data as any;
        setLookupResult({
          id: d.id,
          customer_name: d.customer_name,
          customer_email: d.customer_email,
          customer_phone: d.customer_phone,
          notes: d.notes,
          status: d.status,
          total: d.total,
          created_at: d.created_at,
          order_items: (d.items ?? []).map((i: any) => ({
            id: i.id, quantity: i.quantity, price: i.price, product_id: i.product_id,
            products: { name: i.product_name ?? "Item" },
          })),
        });
        setSearchParams({ ref, email });
      }
    } catch (e: any) {
      setLookupError(e.message || "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl">Track Your Order</h1>
              <p className="text-muted-foreground">Look up an order with your reference and email</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Find your order</CardTitle>
              <CardDescription>Enter the order reference (shown after checkout) and the email you used.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ref">Order Reference</Label>
                <Input id="ref" placeholder="e.g. A1B2C3D4" value={refInput} onChange={(e) => setRefInput(e.target.value)} maxLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              </div>
              {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}
              <Button variant="hero" className="w-full" onClick={() => handleLookup()} disabled={lookupLoading}>
                {lookupLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>) : (<><Search className="mr-2 h-4 w-4" /> Find Order</>)}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Have an account?{" "}
                <Link to={`/auth?redirect=${encodeURIComponent("/orders")}`} className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to see all your orders.
              </p>
            </CardContent>
          </Card>

          {lookupResult && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Your order</h2>
              <OrderCard order={lookupResult} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
