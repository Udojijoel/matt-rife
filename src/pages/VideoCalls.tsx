import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Video, Clock, Gift, Calendar, Star } from "lucide-react";
import { getWhatsAppUrl, getVideoCallMessage } from "@/lib/whatsapp";

const packages = [
  {
    id: "quick",
    name: "Quick Chat",
    duration: "10 minutes",
    price: 149,
    description: "Perfect for a quick hello, birthday wish, or special message",
    features: [
      "10-minute private video call",
      "Recording of your call",
      "Digital certificate",
      "Flexible scheduling",
    ],
  },
  {
    id: "premium",
    name: "Premium Call",
    duration: "30 minutes",
    price: 349,
    description: "Extended time for a more personal and memorable experience",
    features: [
      "30-minute private video call",
      "Recording of your call",
      "Digital certificate",
      "Flexible scheduling",
      "Priority booking access",
      "Personalized video intro",
    ],
    popular: true,
  },
];

const occasions = [
  "Birthday Wish",
  "Anniversary",
  "Graduation",
  "Get Well Soon",
  "Just Because",
  "Pep Talk",
  "Corporate Event",
  "Special Surprise",
];

const VideoCalls = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Video className="text-accent" size={32} />
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-center mb-4">
              VIDEO <span className="gradient-text">CALLS</span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto text-lg">
              Can't make it to a show? Book a personal video call with Matt for birthdays, 
              celebrations, or just to say hi.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl text-center mb-12">
              HOW IT <span className="gradient-text">WORKS</span>
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { step: 1, icon: Gift, title: "Choose Package", desc: "Select 10 or 30 minute call" },
                { step: 2, icon: Calendar, title: "Pick a Time", desc: "Choose from available slots" },
                { step: 3, icon: Video, title: "Join the Call", desc: "Get your video link via email" },
                { step: 4, icon: Star, title: "Make Memories", desc: "Receive your recording after" },
              ].map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    <item.icon size={28} className="text-primary-foreground" />
                  </div>
                  <span className="absolute top-0 right-1/2 translate-x-8 -translate-y-2 w-6 h-6 rounded-full bg-accent text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="font-display text-lg text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl text-center mb-4">
              SELECT YOUR <span className="gradient-text">EXPERIENCE</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Both packages include a full recording of your call that you can keep forever.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                    pkg.popular 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-primary" size={24} />
                    <span className="text-lg text-muted-foreground">{pkg.duration}</span>
                  </div>

                  <h3 className="font-display text-3xl text-foreground mb-2">{pkg.name}</h3>
                  <p className="text-muted-foreground mb-6">{pkg.description}</p>
                  
                  <div className="mb-8">
                    <span className="font-display text-5xl gradient-text">${pkg.price}</span>
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
                    size="lg"
                  >
                    <a
                      href={getWhatsAppUrl(getVideoCallMessage(pkg.name, pkg.duration, pkg.price))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      Book via WhatsApp
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Occasions */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl text-center mb-4">
              PERFECT FOR <span className="gradient-text">ANY OCCASION</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Whether it's a special celebration or you just want to brighten someone's day, 
              Matt's got you covered.
            </p>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {occasions.map((occasion) => (
                <span
                  key={occasion}
                  className="px-6 py-3 rounded-full bg-secondary border border-border text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer"
                >
                  {occasion}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VideoCalls;
