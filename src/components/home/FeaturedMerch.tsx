import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getWhatsAppUrl, getProductMessage } from "@/lib/whatsapp";

type FeaturedProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  badge: string | null;
};

export function FeaturedMerch() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image_url, category, badge")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);

      setProducts((data as FeaturedProduct[]) || []);
      setIsLoading(false);
    };

    fetchFeatured();
  }, []);

  const hasProducts = products.length > 0;

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl bg-card border border-border p-4"
              aria-hidden
            >
              <div className="aspect-[4/5] rounded-lg bg-secondary animate-pulse" />
              <div className="mt-4 h-3 w-24 rounded bg-secondary animate-pulse" />
              <div className="mt-2 h-5 w-40 rounded bg-secondary animate-pulse" />
              <div className="mt-3 h-6 w-16 rounded bg-secondary animate-pulse" />
            </div>
          ))}
        </div>
      );
    }

    if (!hasProducts) {
      return (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">
            No products yet. Add your merch in the admin dashboard to show it here.
          </p>
          <div className="mt-6">
            <Link to="/store">
              <Button variant="hero" className="group">
                Open Store
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <Link
            key={product.id}
            to="/store"
            className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Image */}
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={`${product.name} merch product`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Badge */}
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground">
                  {product.badge}
                </span>
              )}
              {/* Quick Add */}
              <Button
                asChild
                variant="hero"
                className="absolute inset-x-4 bottom-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              >
                <a
                  href={getWhatsAppUrl(getProductMessage(product.name, product.price))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShoppingBag size={16} />
                  Buy Now
                </a>
              </Button>
            </div>

            {/* Info */}
            <div className="p-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="font-display text-lg text-foreground mt-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-lg font-semibold gradient-text mt-2">
                ${product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }, [hasProducts, isLoading, products]);

  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Official Store
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
              FEATURED <span className="gradient-text">MERCH</span>
            </h2>
          </div>
          <Link to="/store">
            <Button variant="hero-outline" className="group">
              Shop All
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {content}
      </div>
    </section>
  );
}
