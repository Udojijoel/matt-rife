import { Button } from "@/components/ui/button";
import { Users, Video, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getWhatsAppUrl, getMeetGreetMessage, getVideoCallMessage } from "@/lib/whatsapp";

const experiences = [
  {
    id: "meet-greet",
    title: "Meet & Greet",
    description: "Get face-to-face with Matt. Photo opportunities, autographs, and memories that last a lifetime.",
    icon: Users,
    features: ["Personal photo", "Autographed merch", "Exclusive access"],
    link: "/meet-greet",
    price: "From $299",
    gradient: "from-primary to-primary/50",
  },
  {
    id: "video-call",
    title: "Video Calls",
    description: "Can't make it to a show? Book a private video call for birthdays, celebrations, or just to chat.",
    icon: Video,
    features: ["10 or 30 minutes", "Recording included", "Flexible scheduling"],
    link: "/video-calls",
    price: "From $149",
    gradient: "from-accent to-accent/50",
  },
  {
    id: "private-show",
    title: "Private Shows",
    description: "Book Matt for your corporate event, private party, or special celebration.",
    icon: Star,
    features: ["Custom performance", "Full production", "VIP experience"],
    link: "/private-shows",
    price: "Contact for pricing",
    gradient: "from-yellow-500 to-yellow-500/50",
  },
];

export function ExperienceSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Exclusive Access
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            PREMIUM <span className="gradient-text">EXPERIENCES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Go beyond the show. Create unforgettable memories with exclusive 
            meet and greets, personal video calls, and private performances.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {experiences.map((exp, index) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.id}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${exp.gradient}`} />
                
                <div className="p-6 lg:p-8">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${exp.gradient} flex items-center justify-center mb-6`}>
                    <Icon size={28} className="text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-2xl text-foreground mb-3">
                    {exp.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {exp.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {exp.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <span className="font-display text-lg gradient-text">
                      {exp.price}
                    </span>
                    {exp.id === "private-show" ? (
                      <Link to={exp.link}>
                        <Button variant="hero" size="sm" className="group/btn">
                          Contact Us
                          <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={16} />
                        </Button>
                      </Link>
                    ) : (
                      <Button asChild variant="hero" size="sm" className="group/btn">
                        <a
                          href={getWhatsAppUrl(
                            exp.id === "meet-greet" 
                              ? getMeetGreetMessage("Standard", 299)
                              : getVideoCallMessage("Quick Chat", "10 minutes", 149)
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book Now
                          <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={16} />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
