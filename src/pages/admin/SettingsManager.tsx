import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Settings, User, Calendar, Plus, Trash2, BarChart3, Image, Video, Type, Share2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

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

interface HeroStats {
  value: string;
  label: string;
}

export default function SettingsManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [meetGreetPrice, setMeetGreetPrice] = useState("");
  const [trailerVideoId, setTrailerVideoId] = useState("7592027662499990839");
  const [aboutBio, setAboutBio] = useState("");
  const [aboutBioSecond, setAboutBioSecond] = useState("");
  const [aboutImageUrl, setAboutImageUrl] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { year: "2016", title: "Comedy Beginnings", description: "Started performing stand-up at local clubs in Columbus, Ohio" },
  ]);
  const [stats, setStats] = useState<Stat[]>([
    { value: "18M+", label: "TikTok Followers" },
    { value: "10M+", label: "Instagram Followers" },
    { value: "2M+", label: "Tickets Sold" },
    { value: "100+", label: "Sold Out Shows" },
  ]);
  
  // Hero section content
  const [heroHeadline, setHeroHeadline] = useState({ line1: "MATT", line2: "RIFE" });
  const [heroSubheadline, setHeroSubheadline] = useState("Comedian. Actor. Internet Sensation. Experience the live show that's breaking records and leaving audiences breathless.");
  const [heroBadge, setHeroBadge] = useState("Now Touring Worldwide");
  const [heroStats, setHeroStats] = useState<HeroStats[]>([
    { value: "100+", label: "Shows Sold Out" },
    { value: "2M+", label: "Tickets Sold" },
    { value: "50+", label: "Cities Worldwide" },
  ]);
  
  // Social media links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "https://www.instagram.com/mattrife?igsh=Mzlnc2xlbGhteDhu",
    tiktok: "https://www.tiktok.com/@matt_rife?_r=1&_t=ZS-92jyyMD5UBA",
    facebook: "https://www.facebook.com/share/1AgXrCaoFi/?mibextid=wwXIfr",
    telegram: "https://t.me/MSRmanagementteam",
  });
  
  // Footer links
  const [footerLinks, setFooterLinks] = useState<FooterLinksConfig>({
    "Quick Links": [
      { label: "Shows", href: "/shows" },
      { label: "Store", href: "/store" },
      { label: "Meet & Greet", href: "/meet-greet" },
      { label: "Video Calls", href: "/video-calls" },
    ],
    "Experiences": [
      { label: "About", href: "/about" },
      { label: "Private Shows", href: "/private-shows" },
    ],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*");

      if (error) throw error;
      
      // Set meet & greet price from settings
      const meetGreetSetting = data?.find(s => s.key === "meet_greet_price");
      if (meetGreetSetting) {
        setMeetGreetPrice(String(meetGreetSetting.value));
      }

      // Set about bio from settings
      const aboutBioSetting = data?.find(s => s.key === "about_bio");
      if (aboutBioSetting) {
        setAboutBio(String(aboutBioSetting.value));
      }
      const aboutBioSecondSetting = data?.find(s => s.key === "about_bio_second");
      if (aboutBioSecondSetting) {
        setAboutBioSecond(String(aboutBioSecondSetting.value));
      }

      // Set milestones from settings
      const milestonesSetting = data?.find(s => s.key === "about_milestones");
      if (milestonesSetting && Array.isArray(milestonesSetting.value)) {
        setMilestones(milestonesSetting.value as unknown as Milestone[]);
      }

      // Set stats from settings
      const statsSetting = data?.find(s => s.key === "about_stats");
      if (statsSetting && Array.isArray(statsSetting.value)) {
        setStats(statsSetting.value as unknown as Stat[]);
      }

      // Set about image from settings
      const aboutImageSetting = data?.find(s => s.key === "about_image_url");
      if (aboutImageSetting) {
        setAboutImageUrl(String(aboutImageSetting.value));
      }

      // Set trailer video ID from settings
      const trailerSetting = data?.find(s => s.key === "hero_trailer_id");
      if (trailerSetting) {
        setTrailerVideoId(String(trailerSetting.value));
      }

      // Set hero content from settings
      const heroHeadlineSetting = data?.find(s => s.key === "hero_headline");
      if (heroHeadlineSetting && typeof heroHeadlineSetting.value === 'object') {
        setHeroHeadline(heroHeadlineSetting.value as { line1: string; line2: string });
      }

      const heroSubheadlineSetting = data?.find(s => s.key === "hero_subheadline");
      if (heroSubheadlineSetting) {
        setHeroSubheadline(String(heroSubheadlineSetting.value));
      }

      const heroBadgeSetting = data?.find(s => s.key === "hero_badge");
      if (heroBadgeSetting) {
        setHeroBadge(String(heroBadgeSetting.value));
      }

      const heroStatsSetting = data?.find(s => s.key === "hero_stats");
      if (heroStatsSetting && Array.isArray(heroStatsSetting.value)) {
        setHeroStats(heroStatsSetting.value as unknown as HeroStats[]);
      }

      // Set social links from settings
      const socialLinksSetting = data?.find(s => s.key === "social_links");
      if (socialLinksSetting && typeof socialLinksSetting.value === 'object' && !Array.isArray(socialLinksSetting.value)) {
         setSocialLinks(socialLinksSetting.value as unknown as SocialLinks);
       }

      // Set footer links from settings
      const footerLinksSetting = data?.find(s => s.key === "footer_links");
      if (footerLinksSetting && typeof footerLinksSetting.value === 'object' && !Array.isArray(footerLinksSetting.value)) {
        setFooterLinks(footerLinksSetting.value as unknown as FooterLinksConfig);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const price = parseFloat(meetGreetPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: price })
        .eq("key", "meet_greet_price");

      if (error) throw error;
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTrailer = async () => {
    if (!trailerVideoId.trim()) {
      toast.error("Please enter a valid TikTok video ID");
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "hero_trailer_id", value: trailerVideoId as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Trailer video saved successfully");
    } catch (error) {
      console.error("Error saving trailer:", error);
      toast.error("Failed to save trailer video");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "about_bio", value: aboutBio as unknown as Record<string, unknown> } as never, { onConflict: "key" });

      await supabase
        .from("settings")
        .upsert({ key: "about_bio_second", value: aboutBioSecond as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("About content saved successfully");
    } catch (error) {
      console.error("Error saving about content:", error);
      toast.error("Failed to save about content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAboutImage = async (url: string) => {
    setAboutImageUrl(url);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "about_image_url", value: url as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("About image saved successfully");
    } catch (error) {
      console.error("Error saving about image:", error);
      toast.error("Failed to save about image");
    }
  };

  const handleSaveMilestones = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "about_milestones", value: milestones as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Milestones saved successfully");
    } catch (error) {
      console.error("Error saving milestones:", error);
      toast.error("Failed to save milestones");
    } finally {
      setIsSaving(false);
    }
  };

  const addMilestone = () => {
    setMilestones([...milestones, { year: "", title: "", description: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSaveStats = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "about_stats", value: stats as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Stats saved successfully");
    } catch (error) {
      console.error("Error saving stats:", error);
      toast.error("Failed to save stats");
    } finally {
      setIsSaving(false);
    }
  };

  const addStat = () => {
    setStats([...stats, { value: "", label: "" }]);
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const updated = [...stats];
    updated[index][field] = value;
    setStats(updated);
  };

  // Hero section handlers
  const handleSaveHeroContent = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "hero_headline", value: heroHeadline as unknown as Record<string, unknown> } as never, { onConflict: "key" });

      await supabase
        .from("settings")
        .upsert({ key: "hero_subheadline", value: heroSubheadline as unknown as Record<string, unknown> } as never, { onConflict: "key" });

      await supabase
        .from("settings")
        .upsert({ key: "hero_badge", value: heroBadge as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Hero content saved successfully");
    } catch (error) {
      console.error("Error saving hero content:", error);
      toast.error("Failed to save hero content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHeroStats = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "hero_stats", value: heroStats as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Hero stats saved successfully");
    } catch (error) {
      console.error("Error saving hero stats:", error);
      toast.error("Failed to save hero stats");
    } finally {
      setIsSaving(false);
    }
  };

  const addHeroStat = () => {
    setHeroStats([...heroStats, { value: "", label: "" }]);
  };

  const removeHeroStat = (index: number) => {
    setHeroStats(heroStats.filter((_, i) => i !== index));
  };

  const updateHeroStat = (index: number, field: keyof HeroStats, value: string) => {
    const updated = [...heroStats];
    updated[index][field] = value;
    setHeroStats(updated);
  };

  // Social links handler
  const handleSaveSocialLinks = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "social_links", value: socialLinks as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Social links saved successfully");
    } catch (error) {
      console.error("Error saving social links:", error);
      toast.error("Failed to save social links");
    } finally {
      setIsSaving(false);
    }
  };

  // Footer links handlers
  const handleSaveFooterLinks = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "footer_links", value: footerLinks as unknown as Record<string, unknown> } as never, { onConflict: "key" });
      
      toast.success("Footer links saved successfully");
    } catch (error) {
      console.error("Error saving footer links:", error);
      toast.error("Failed to save footer links");
    } finally {
      setIsSaving(false);
    }
  };

  const addFooterSection = () => {
    const name = prompt("Enter section name:");
    if (name && name.trim()) {
      setFooterLinks({ ...footerLinks, [name.trim()]: [] });
    }
  };

  const removeFooterSection = (sectionTitle: string) => {
    const updated = { ...footerLinks };
    delete updated[sectionTitle];
    setFooterLinks(updated);
  };

  const addFooterLink = (sectionTitle: string) => {
    setFooterLinks({
      ...footerLinks,
      [sectionTitle]: [...footerLinks[sectionTitle], { label: "", href: "" }],
    });
  };

  const removeFooterLink = (sectionTitle: string, index: number) => {
    setFooterLinks({
      ...footerLinks,
      [sectionTitle]: footerLinks[sectionTitle].filter((_, i) => i !== index),
    });
  };

  const updateFooterLink = (sectionTitle: string, index: number, field: keyof FooterLink, value: string) => {
    const updatedSection = [...footerLinks[sectionTitle]];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setFooterLinks({ ...footerLinks, [sectionTitle]: updatedSection });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage site configuration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ticket Options
          </CardTitle>
          <CardDescription>
            Configure pricing for ticket add-ons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="meet-greet-price">Meet & Greet Price (USD)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="meet-greet-price"
                type="number"
                min="0"
                step="1"
                value={meetGreetPrice}
                onChange={(e) => setMeetGreetPrice(e.target.value)}
                className="max-w-[200px]"
                placeholder="250"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This is the additional price charged when users add Meet & Greet to their ticket purchase.
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Hero Trailer Video
          </CardTitle>
          <CardDescription>
            Configure the TikTok video shown when users click "Watch Trailer"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Preview */}
          {trailerVideoId && (
            <div className="space-y-2">
              <Label>Current Preview</Label>
              <div className="w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border border-border">
                <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${trailerVideoId}`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="encrypted-media"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="trailer-video-id">TikTok Video ID</Label>
            <Input
              id="trailer-video-id"
              value={trailerVideoId}
              onChange={(e) => setTrailerVideoId(e.target.value)}
              placeholder="7592027662499990839"
            />
            <p className="text-sm text-muted-foreground">
              Enter the TikTok video ID from the video URL. For example, in
              https://www.tiktok.com/@matt_rife/video/<strong>7592027662499990839</strong>, the ID is the number at the end.
            </p>
          </div>

          <Button onClick={handleSaveTrailer} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Trailer
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Hero Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Hero Section Content
          </CardTitle>
          <CardDescription>
            Customize the headline, subheadline, and badge text in the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hero-badge">Badge Text</Label>
            <Input
              id="hero-badge"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="Now Touring Worldwide"
            />
            <p className="text-sm text-muted-foreground">
              The small badge shown above the main headline
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-headline-1">Headline Line 1</Label>
              <Input
                id="hero-headline-1"
                value={heroHeadline.line1}
                onChange={(e) => setHeroHeadline({ ...heroHeadline, line1: e.target.value })}
                placeholder="MATT"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-headline-2">Headline Line 2</Label>
              <Input
                id="hero-headline-2"
                value={heroHeadline.line2}
                onChange={(e) => setHeroHeadline({ ...heroHeadline, line2: e.target.value })}
                placeholder="RIFE"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-subheadline">Subheadline</Label>
            <Textarea
              id="hero-subheadline"
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              rows={3}
              placeholder="Comedian. Actor. Internet Sensation..."
            />
          </div>

          <Button onClick={handleSaveHeroContent} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Hero Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Hero Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Hero Stats
          </CardTitle>
          <CardDescription>
            Edit the statistics displayed at the bottom of the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {heroStats.map((stat, index) => (
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Value</Label>
                  <Input
                    value={stat.value}
                    onChange={(e) => updateHeroStat(index, "value", e.target.value)}
                    placeholder="100+"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Label</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => updateHeroStat(index, "label", e.target.value)}
                    placeholder="Shows Sold Out"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeHeroStat(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addHeroStat} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Stat
          </Button>

          <Button onClick={handleSaveHeroStats} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Hero Stats
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Social Media Links
          </CardTitle>
          <CardDescription>
            Configure social media links shown in the hero section and footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="social-instagram">Instagram URL</Label>
            <Input
              id="social-instagram"
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              placeholder="https://www.instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-tiktok">TikTok URL</Label>
            <Input
              id="social-tiktok"
              value={socialLinks.tiktok}
              onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
              placeholder="https://www.tiktok.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-facebook">Facebook URL</Label>
            <Input
              id="social-facebook"
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              placeholder="https://www.facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-telegram">Telegram URL</Label>
            <Input
              id="social-telegram"
              value={socialLinks.telegram}
              onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
              placeholder="https://t.me/..."
            />
          </div>

          <Button onClick={handleSaveSocialLinks} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Social Links
              </>
            )}
          </Button>
        </CardContent>

      {/* Footer Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Footer Links
          </CardTitle>
          <CardDescription>
            Configure the link sections displayed in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(footerLinks).map(([sectionTitle, links]) => (
            <div key={sectionTitle} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{sectionTitle}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFooterSection(sectionTitle)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {links.map((link, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    value={link.label}
                    onChange={(e) => updateFooterLink(sectionTitle, index, "label", e.target.value)}
                    placeholder="Link label"
                    className="flex-1"
                  />
                  <Input
                    value={link.href}
                    onChange={(e) => updateFooterLink(sectionTitle, index, "href", e.target.value)}
                    placeholder="/path"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFooterLink(sectionTitle, index)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addFooterLink(sectionTitle)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Link
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addFooterSection} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>

          <Button onClick={handleSaveFooterLinks} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Footer Links
              </>
            )}
          </Button>
        </CardContent>
      </Card>

        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            About Page Photo
          </CardTitle>
          <CardDescription>
            Upload a new photo for the About page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            currentImageUrl={aboutImageUrl}
            onImageUploaded={handleSaveAboutImage}
            folder="products"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            About Page Content
          </CardTitle>
          <CardDescription>
            Edit the biography text displayed on the About page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="about-bio">First Paragraph</Label>
            <Textarea
              id="about-bio"
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              rows={4}
              placeholder="Matt Rife is a stand-up comedian..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about-bio-second">Second Paragraph</Label>
            <Textarea
              id="about-bio-second"
              value={aboutBioSecond}
              onChange={(e) => setAboutBioSecond(e.target.value)}
              rows={4}
              placeholder="From humble beginnings..."
            />
          </div>

          <Button onClick={handleSaveAbout} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save About Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline / Milestones
          </CardTitle>
          <CardDescription>
            Edit the career milestones displayed on the About page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Year</Label>
                  <Input
                    value={milestone.year}
                    onChange={(e) => updateMilestone(index, "year", e.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, "title", e.target.value)}
                    placeholder="Major Achievement"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, "description", e.target.value)}
                    placeholder="Brief description..."
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMilestone(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addMilestone} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>

          <Button onClick={handleSaveMilestones} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Milestones
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Stats
          </CardTitle>
          <CardDescription>
            Edit the statistics displayed on the About page (e.g., followers, tickets sold)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Value</Label>
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                    placeholder="18M+"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Label</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                    placeholder="TikTok Followers"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStat(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addStat} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Stat
          </Button>

          <Button onClick={handleSaveStats} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Stats
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
