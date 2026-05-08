import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Instagram, Facebook, Send } from "lucide-react";
import { getWhatsAppUrl, getGeneralTicketMessage } from "@/lib/whatsapp";
import { trackEvent, Events } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface HeroStats {
  value: string;
  label: string;
}

interface SocialLinks {
  instagram: string;
  tiktok: string;
  facebook: string;
  telegram: string;
}

const DEFAULT_TIKTOK_VIDEO_ID = "7592027662499990839";
const DEFAULT_HEADLINE = { line1: "MATT", line2: "RIFE" };
const DEFAULT_SUBHEADLINE = "Comedian. Actor. Internet Sensation. Experience the live show that's breaking records and leaving audiences breathless.";
const DEFAULT_BADGE = "Now Touring Worldwide";
const DEFAULT_STATS: HeroStats[] = [
  { value: "100+", label: "Shows Sold Out" },
  { value: "2M+", label: "Tickets Sold" },
  { value: "50+", label: "Cities Worldwide" },
];
const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/mattrife?igsh=Mzlnc2xlbGhteDhu",
  tiktok: "https://www.tiktok.com/@matt_rife?_r=1&_t=ZS-92jyyMD5UBA",
  facebook: "https://www.facebook.com/share/1AgXrCaoFi/?mibextid=wwXIfr",
  telegram: "https://t.me/MSRmanagementteam",
};

export function HeroSection() {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(DEFAULT_TIKTOK_VIDEO_ID);
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [subheadline, setSubheadline] = useState(DEFAULT_SUBHEADLINE);
  const [badge, setBadge] = useState(DEFAULT_BADGE);
  const [stats, setStats] = useState<HeroStats[]>(DEFAULT_STATS);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("key, value");
      
      if (data) {
        const trailerSetting = data.find(s => s.key === "hero_trailer_id");
        if (trailerSetting?.value) {
          setTrailerVideoId(String(trailerSetting.value));
        }

        const headlineSetting = data.find(s => s.key === "hero_headline");
        if (headlineSetting?.value && typeof headlineSetting.value === 'object' && !Array.isArray(headlineSetting.value)) {
          setHeadline(headlineSetting.value as { line1: string; line2: string });
        }

        const subheadlineSetting = data.find(s => s.key === "hero_subheadline");
        if (subheadlineSetting?.value) {
          setSubheadline(String(subheadlineSetting.value));
        }

        const badgeSetting = data.find(s => s.key === "hero_badge");
        if (badgeSetting?.value) {
          setBadge(String(badgeSetting.value));
        }

        const statsSetting = data.find(s => s.key === "hero_stats");
        if (statsSetting?.value && Array.isArray(statsSetting.value)) {
          setStats(statsSetting.value as unknown as HeroStats[]);
        }

        const socialSetting = data.find(s => s.key === "social_links");
        if (socialSetting?.value && typeof socialSetting.value === 'object' && !Array.isArray(socialSetting.value)) {
          setSocialLinks(socialSetting.value as unknown as SocialLinks);
        }
      }
    };
    fetchSettings();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-primary">{badge}</span>
          </div>

          {/* Main Headline */}
          <h1 
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block text-foreground">{headline.line1}</span>
            <span className="block gradient-text">{headline.line2}</span>
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {subheadline}
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              variant="hero"
              size="xl"
              className="group"
            >
              <a
                href={getWhatsAppUrl(getGeneralTicketMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(Events.GetTicketsClick, { location: "hero" })}
              >
                Get Tickets Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl" 
              className="group"
              onClick={() => setTrailerOpen(true)}
            >
              <Play size={18} className="mr-1" />
              Watch Trailer
            </Button>
          </div>

          {/* TikTok Trailer Modal */}
          <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
            <DialogContent className="sm:max-w-[400px] p-0 bg-background border-border overflow-hidden">
              <DialogTitle className="sr-only">Watch Trailer</DialogTitle>
              <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${trailerVideoId}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="encrypted-media"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Social Links */}
          <div 
            className="flex items-center justify-center gap-4 mt-8 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href={socialLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="TikTok"
            >
              <TikTokIcon size={20} />
            </a>
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Telegram"
            >
              <Send size={20} />
            </a>
          </div>

          {/* Stats */}
          <div 
            className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/50 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl lg:text-5xl gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
