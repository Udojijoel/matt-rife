import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Clock, Star, Sparkles, Loader2 } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent, Events } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

interface Show {
  id: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  status: string;
}

interface TicketPurchaseDialogProps {
  show: Show | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_MEET_GREET_PRICE = 250;

export function TicketPurchaseDialog({ show, open, onOpenChange }: TicketPurchaseDialogProps) {
  const [includeMeetGreet, setIncludeMeetGreet] = useState(false);
  const [meetGreetPrice, setMeetGreetPrice] = useState(DEFAULT_MEET_GREET_PRICE);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  useEffect(() => {
    if (open) {
      fetchMeetGreetPrice();
    }
  }, [open]);

  const fetchMeetGreetPrice = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "meet_greet_price")
        .maybeSingle();

      if (error) throw error;
      
      if (data?.value) {
        setMeetGreetPrice(Number(data.value));
      }
    } catch (error) {
      console.error("Error fetching meet & greet price:", error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  if (!show) return null;

  const totalPrice = show.price + (includeMeetGreet ? meetGreetPrice : 0);
  
  const getTicketMessageWithOptions = () => {
    const meetGreetText = includeMeetGreet 
      ? `\n🌟 Meet & Greet: Yes (+$${meetGreetPrice})`
      : "";
    
    return `Hi! I'm interested in getting tickets for the Matt Rife show:\n\n📍 City: ${show.city}\n🎭 Venue: ${show.venue}\n📅 Date: ${show.date}${meetGreetText}\n💰 Total: $${totalPrice}\n\nPlease let me know about availability and how to proceed!`;
  };

  const handleClose = () => {
    setIncludeMeetGreet(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Get Tickets</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Show Details */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-display text-xl gradient-text mb-3">{show.city}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{show.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(show.date).toLocaleDateString("en-US", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{show.time}</span>
              </div>
            </div>
          </div>

          {/* Ticket Price */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <span className="text-foreground font-medium">Show Ticket</span>
            <span className="font-display text-xl gradient-text">${show.price}</span>
          </div>

          {/* Meet & Greet Add-on */}
          <div 
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              includeMeetGreet 
                ? "bg-primary/10 border-primary" 
                : "bg-secondary/30 border-border hover:border-primary/50"
            }`}
            onClick={() => setIncludeMeetGreet(!includeMeetGreet)}
          >
            <div className="flex items-start gap-3">
              <Checkbox 
                id="meet-greet" 
                checked={includeMeetGreet}
                onCheckedChange={(checked) => setIncludeMeetGreet(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="meet-greet" className="flex items-center gap-2 cursor-pointer">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Add Meet & Greet</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Optional</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get a personal photo and autograph with Matt Rife before the show
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-primary" />
                    Photo opportunity
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-primary" />
                    Autograph
                  </span>
                </div>
              </div>
              <span className="font-display text-lg gradient-text">+${meetGreetPrice}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary">
            <span className="text-foreground font-semibold">Total</span>
            <span className="font-display text-2xl gradient-text">${totalPrice}</span>
          </div>

          {/* CTA */}
          <Button asChild variant="hero" className="w-full" size="lg">
            <a
              href={getWhatsAppUrl(getTicketMessageWithOptions())}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(Events.GetTicketsClick, {
                location: "ticket_dialog",
                show_id: show.id,
                city: show.city,
                meet_greet: includeMeetGreet,
                total: totalPrice,
              })}
            >
              Continue to Purchase
            </a>
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to WhatsApp to complete your booking
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
