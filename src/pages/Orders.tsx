import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { OrderCard } from "./OrderLookup";

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

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, customer_phone, notes, status, total, created_at, order_items(id, quantity, price, product_id, products(name))")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error("Failed to load your orders");
      } else {
        setOrders((data as unknown as OrderRow[]) ?? []);
      }
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl">My Orders</h1>
              <p className="text-muted-foreground">Your saved orders</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                <Button asChild variant="hero">
                  <Link to="/store">Browse the Store</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
