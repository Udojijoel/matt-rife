import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getWhatsAppUrl, getTicketMessage } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";

interface Show {
  id: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  status: "available" | "limited" | "soldout";
  price: number;
}

const statusColors: Record<string, string> = {
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  limited: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  soldout: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  limited: "Limited",
  soldout: "Sold Out",
};

export function UpcomingShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const { data, error } = await supabase
        .from("shows")
        .select("id, city, venue, date, time, status, price")
        .order("date", { ascending: true })
        .limit(4);

      if (error) throw error;
      setShows((data as Show[]) || []);
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Live Shows
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            UPCOMING <span className="gradient-text">SHOWS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't miss your chance to see Matt Rife live. Get your tickets before they sell out.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && shows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming shows at the moment. Check back soon!</p>
          </div>
        )}

        {/* Shows Grid */}
        {!isLoading && shows.length > 0 && (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {shows.map((show, index) => (
              <div
                key={show.id}
                className="group gradient-border p-6 hover:bg-secondary/50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Date */}
                  <div className="flex items-center gap-4 md:w-32">
                    <div className="text-center">
                      <div className="font-display text-3xl gradient-text">
                        {new Date(show.date).getDate()}
                      </div>
                      <div className="text-sm text-muted-foreground uppercase">
                        {new Date(show.date).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-foreground mb-1">
                      {show.city}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {show.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {show.time}
                      </span>
                    </div>
                  </div>

                  {/* Status & CTA */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[show.status] || statusColors.available}`}>
                      {statusLabels[show.status] || "Available"}
                    </span>
                    {show.status === "soldout" ? (
                      <Button variant="outline" size="sm" disabled>
                        Sold Out
                      </Button>
                    ) : (
                      <Button asChild variant="hero" size="sm">
                        <a
                          href={getWhatsAppUrl(getTicketMessage(show.city, show.date, show.venue))}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get Tickets
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link to="/shows">
            <Button variant="hero-outline" size="lg" className="group">
              View All Shows
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
