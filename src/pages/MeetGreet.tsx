import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Star, Users, Camera, Gift } from "lucide-react";
import { getWhatsAppUrl, getMeetGreetMessage } from "@/lib/whatsapp";

const packages = [
  {
    id: "standard",
    name: "Standard",
    price: 299,
    description: "A memorable fan experience with photo opportunity",
    features: [
      "Professional photo with Matt",
      "Exclusive Meet & Greet lanyard",
      "Early venue access (30 min)",
      "Commemorative ticket",
    ],
    popular: false,
  },
  {
    id: "vip",
    name: "VIP Experience",
    price: 499,
    description: "The ultimate fan experience with exclusive perks",
    features: [
      "Everything in Standard",
      "Autographed merchandise item",
      "Extended conversation time",
      "Front row seating (when available)",
      "Exclusive VIP gift bag",
      "Priority entry to all Matt Rife shows",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Group",
    price: 899,
    description: "Perfect for groups up to 4 people",
    features: [
      "Everything in VIP",
      "Group photo (up to 4 people)",
      "Private moment with Matt",
      "Personalized video message",
      "Lifetime VIP status",
      "Complimentary refreshments",
    ],
    popular: false,
  },
];

const MeetGreet = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-[80px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="text-primary" size={32} />
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-center mb-4">
              MEET & <span className="gradient-text">GREET</span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto text-lg">
              Your chance to meet Matt Rife in person. Choose your experience level 
              and create memories that last a lifetime.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Camera, title: "Pro Photos", desc: "High-quality photos with professional lighting" },
                { icon: Gift, title: "Exclusive Merch", desc: "Autographed items and limited edition gifts" },
                { icon: Star, title: "VIP Treatment", desc: "Early access and priority seating options" },
              ].map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    <feature.icon size={28} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl text-center mb-4">
              CHOOSE YOUR <span className="gradient-text">PACKAGE</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Select the experience that's right for you. All packages include a 
              guaranteed meet and greet opportunity.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl border transition-all duration-300 ${
                    pkg.popular 
                      ? "border-primary bg-primary/5 scale-105" 
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 lg:p-8">
                    <h3 className="font-display text-2xl text-foreground mb-2">{pkg.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{pkg.description}</p>
                    
                    <div className="mb-6">
                      <span className="font-display text-4xl gradient-text">${pkg.price}</span>
                      <span className="text-muted-foreground text-sm ml-2">per person</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="text-primary mt-0.5 flex-shrink-0" size={16} />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      variant={pkg.popular ? "hero" : "hero-outline"}
                      className="w-full"
                    >
                      <a
                        href={getWhatsAppUrl(getMeetGreetMessage(pkg.name, pkg.price))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        Book via WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl text-center mb-12">
              FREQUENTLY ASKED <span className="gradient-text">QUESTIONS</span>
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "When does the Meet & Greet happen?", a: "Meet & Greets typically occur 1-2 hours before the show begins. You'll receive specific timing details via email 48 hours before the event." },
                { q: "Can I bring items to be autographed?", a: "VIP and Premium packages include autographed merchandise. Standard package holders may bring ONE personal item for signing." },
                { q: "What's the refund policy?", a: "Full refunds are available up to 7 days before the event. Within 7 days, you may transfer your package to another guest." },
                { q: "Is there an age requirement?", a: "All ages are welcome! Guests under 16 must be accompanied by a parent or guardian." },
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-xl bg-card border border-border">
                  <h4 className="font-display text-lg text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MeetGreet;
