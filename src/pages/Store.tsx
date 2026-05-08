import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Filter, Grid, LayoutList, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  badge: string | null;
  stock: number;
}

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-center mb-4">
              OFFICIAL <span className="gradient-text">STORE</span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Rep your favorite comedian with exclusive merchandise. Limited
              editions and tour exclusives available now.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter size={18} className="text-muted-foreground flex-shrink-0" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No products available yet. Check back soon!
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    : "grid gap-4"
                }
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500 ${
                      viewMode === "list" ? "flex items-center" : ""
                    }`}
                  >
                    {/* Image */}
                    <div
                      className={`overflow-hidden bg-secondary ${
                        viewMode === "list" ? "w-32 h-32" : "aspect-[4/5]"
                      }`}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingCart size={32} />
                        </div>
                      )}
                      {product.badge && viewMode === "grid" && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground">
                          {product.badge}
                        </span>
                      )}
                      {viewMode === "grid" && (
                        <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <Button
                            variant="hero"
                            className="w-full"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock < 1}
                          >
                            <ShoppingCart size={16} />
                            {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div
                      className={`p-4 ${
                        viewMode === "list"
                          ? "flex-1 flex items-center justify-between"
                          : ""
                      }`}
                    >
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {product.category}
                        </span>
                        <h3 className="font-display text-lg text-foreground mt-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg font-semibold gradient-text mt-2">
                          ${product.price.toFixed(2)}
                        </p>
                        {product.stock < 5 && product.stock > 0 && (
                          <p className="text-xs text-orange-500 mt-1">
                            Only {product.stock} left!
                          </p>
                        )}
                      </div>
                      {viewMode === "list" && (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock < 1}
                        >
                          <ShoppingCart size={16} />
                          {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
