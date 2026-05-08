import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Filter, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TicketPurchaseDialog } from "@/components/shows/TicketPurchaseDialog";

interface Show {
  id: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  status: string;
  image_url: string | null;
}

const statusConfig = {
  available: { label: "Available", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  limited: { label: "Limited", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  soldout: { label: "Sold Out", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const Shows = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setShows(data || []);
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredShows = shows.filter((show) => {
    const matchesSearch = show.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         show.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || show.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-center mb-4">
              UPCOMING <span className="gradient-text">SHOWS</span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Catch Matt Rife live on his world tour. Select your city and grab your tickets 
              before they sell out.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search by city or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                {["all", "available", "limited"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Shows List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredShows.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No shows found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredShows.map((show) => (
                  <div
                    key={show.id}
                    className="gradient-border p-6 hover:bg-secondary/30 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Date */}
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[80px]">
                          <div className="font-display text-4xl gradient-text">
                            {new Date(show.date).getDate()}
                          </div>
                          <div className="text-sm text-muted-foreground uppercase">
                            {new Date(show.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </div>
                        </div>
                        
                        <div className="h-16 w-px bg-border hidden md:block" />
                        
                        {/* Venue */}
                        <div>
                          <h3 className="font-display text-2xl text-foreground mb-2">{show.city}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {show.venue}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {show.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(show.date).toLocaleDateString("en-US", { weekday: "long" })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Starting at</div>
                          <div className="font-display text-2xl gradient-text">${show.price}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[show.status as keyof typeof statusConfig]?.color || statusConfig.available.color}`}>
                          {statusConfig[show.status as keyof typeof statusConfig]?.label || show.status}
                        </span>
                        {show.status === "soldout" ? (
                          <Button variant="outline" disabled>
                            Sold Out
                          </Button>
                        ) : (
                          <Button 
                            variant="hero"
                            onClick={() => {
                              setSelectedShow(show);
                              setDialogOpen(true);
                            }}
                          >
                            Get Tickets
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <TicketPurchaseDialog
        show={selectedShow}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default Shows;
