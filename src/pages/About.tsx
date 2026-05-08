import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Youtube, Ticket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import mattRifeImage from "@/assets/matt-rife-about.jpeg";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

const defaultMilestones: Milestone[] = [
  { year: "2016", title: "Comedy Beginnings", description: "Started performing stand-up at local clubs in Columbus, Ohio" },
  { year: "2018", title: "Wild 'N Out", description: "Became a cast member on MTV's Wild 'N Out" },
  { year: "2022", title: "TikTok Sensation", description: "Videos went viral, amassing over 18 million followers" },
  { year: "2023", title: "Netflix Special", description: "Released debut Netflix special 'Natural Selection'" },
  { year: "2024", title: "World Tour", description: "Sold out arenas across North America and Europe" },
  { year: "2025", title: "The Journey Continues", description: "New specials, world tour, and more surprises ahead" },
];

const defaultStats: Stat[] = [
  { value: "18M+", label: "TikTok Followers" },
  { value: "10M+", label: "Instagram Followers" },
  { value: "2M+", label: "Tickets Sold" },
  { value: "100+", label: "Sold Out Shows" },
];

const About = () => {
  const [bio, setBio] = useState("Matt Rife is a stand-up comedian, actor, and social media phenomenon who has taken the comedy world by storm. Known for his quick wit, crowd work, and undeniable charm, Matt has built a massive following and sold out shows across the globe.");
  const [bioSecond, setBioSecond] = useState("From humble beginnings in Columbus, Ohio to headlining arenas worldwide, Matt's journey is a testament to his talent and relentless work ethic. His viral TikTok clips have garnered billions of views, making him one of the most recognizable comedians of his generation.");
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [aboutImage, setAboutImage] = useState<string>(mattRifeImage);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("*");
      const bioSetting = data?.find(s => s.key === "about_bio");
      const bioSecondSetting = data?.find(s => s.key === "about_bio_second");
      const milestonesSetting = data?.find(s => s.key === "about_milestones");
      const statsSetting = data?.find(s => s.key === "about_stats");
      const imageSetting = data?.find(s => s.key === "about_image_url");
      if (bioSetting) setBio(String(bioSetting.value));
      if (bioSecondSetting) setBioSecond(String(bioSecondSetting.value));
      if (milestonesSetting && Array.isArray(milestonesSetting.value)) {
        setMilestones(milestonesSetting.value as unknown as Milestone[]);
      }
      if (statsSetting && Array.isArray(statsSetting.value)) {
        setStats(statsSetting.value as unknown as Stat[]);
      }
      if (imageSetting && String(imageSetting.value)) {
        setAboutImage(String(imageSetting.value));
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden gradient-border">
                  <img
                    src={aboutImage}
                    alt="Matt Rife"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-xl p-4 shadow-xl">
                  <div className="font-display text-3xl gradient-text">18M+</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  About Matt
                </span>
                <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">
                  COMEDIAN. ACTOR. <span className="gradient-text">ICON.</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-6">
                  {bio}
                </p>
                <p className="text-muted-foreground mb-8">
                  {bioSecond}
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {[
                    { icon: Instagram, href: "https://instagram.com", label: "18M" },
                    { icon: Twitter, href: "https://twitter.com", label: "2M" },
                    { icon: Youtube, href: "https://youtube.com", label: "5M" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-primary/10 transition-all"
                    >
                      <social.icon size={18} className="text-primary" />
                      <span className="text-sm font-medium">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl md:text-5xl gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl md:text-5xl text-center mb-4">
              THE <span className="gradient-text">JOURNEY</span>
            </h2>
            <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
              From open mics to sold-out arenas, here's how Matt became one of comedy's biggest stars.
            </p>

            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative flex gap-6 pb-12 last:pb-0">
                  {/* Line */}
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-[39px] top-12 bottom-0 w-px bg-gradient-to-b from-primary to-transparent" />
                  )}
                  
                  {/* Year Badge */}
                  <div className="flex-shrink-0 w-20 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <span className="font-display text-sm text-primary-foreground">{milestone.year}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="font-display text-xl text-foreground mb-1">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              READY TO SEE MATT <span className="gradient-text">LIVE?</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Don't miss your chance to experience the comedy phenomenon everyone's talking about.
            </p>
            <Link to="/shows">
              <Button variant="hero" size="xl" className="group">
                <Ticket size={20} />
                Get Tickets
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
