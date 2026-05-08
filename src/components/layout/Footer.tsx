import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// TikTok icon component since lucide-react doesn't have it
const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialLinks {
  instagram: string;
  tiktok: string;
  facebook: string;
  telegram: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinksConfig {
  [sectionTitle: string]: FooterLink[];
}

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/mattrife?igsh=Mzlnc2xlbGhteDhu",
  tiktok: "https://www.tiktok.com/@matt_rife?_r=1&_t=ZS-92jyyMD5UBA",
  facebook: "https://www.facebook.com/share/1AgXrCaoFi/?mibextid=wwXIfr",
  telegram: "https://t.me/MSRmanagementteam",
};

const DEFAULT_FOOTER_LINKS: FooterLinksConfig = {
  "Quick Links": [
    { label: "Shows", href: "/shows" },
    { label: "Store", href: "/store" },
    { label: "Meet & Greet", href: "/meet-greet" },
    { label: "Video Calls", href: "/video-calls" },
  ],
  "Experiences": [
    { label: "About", href: "/about" },
    { label: "Private Shows", href: "/private-shows" },
    { label: "Track Order", href: "/orders" },
  ],
};

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);
  const [footerLinks, setFooterLinks] = useState<FooterLinksConfig>(DEFAULT_FOOTER_LINKS);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value, key")
        .in("key", ["social_links", "footer_links"]);
      
      if (data) {
        const socialSetting = data.find(s => s.key === "social_links");
        if (socialSetting?.value && typeof socialSetting.value === 'object' && !Array.isArray(socialSetting.value)) {
          setSocialLinks(socialSetting.value as unknown as SocialLinks);
        }
        const footerSetting = data.find(s => s.key === "footer_links");
        if (footerSetting?.value && typeof footerSetting.value === 'object' && !Array.isArray(footerSetting.value)) {
          setFooterLinks(footerSetting.value as unknown as FooterLinksConfig);
        }
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-3xl gradient-text tracking-wider">
                MATT RIFE
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Comedian, actor, and content creator. Join the journey and experience 
              unforgettable moments of laughter.
            </p>
            <div className="flex gap-4">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="TikTok"
              >
                <TikTokIcon size={18} />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-lg text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-display text-xl text-foreground mb-1">
                Stay in the Loop
              </h4>
              <p className="text-muted-foreground text-sm">
                Get exclusive updates on shows, merch drops, and more.
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Matt Rife. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
