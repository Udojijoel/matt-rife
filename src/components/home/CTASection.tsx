import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { getWhatsAppUrl, getGeneralTicketMessage } from "@/lib/whatsapp";
import { trackEvent, Events } from "@/lib/analytics";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6">
            READY TO <span className="gradient-text">LAUGH?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join millions of fans who have experienced the Matt Rife phenomenon live. 
            Your unforgettable night of comedy awaits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="hero" size="xl" className="group">
              <a
                href={getWhatsAppUrl(getGeneralTicketMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(Events.GetTicketsClick, { location: "cta_section" })}
              >
                <Ticket size={20} />
                Get Your Tickets
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>
            </Button>
            <Link to="/about">
              <Button variant="hero-outline" size="xl">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Instant Delivery
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Money-Back Guarantee
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
