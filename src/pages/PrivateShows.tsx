import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, Building2, PartyPopper, Users, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const eventTypes = [
  { id: "corporate", label: "Corporate Event", icon: Building2 },
  { id: "private", label: "Private Party", icon: PartyPopper },
  { id: "wedding", label: "Wedding", icon: Star },
  { id: "other", label: "Other", icon: Users },
];

const PrivateShows = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    eventType: "",
    eventDate: "",
    location: "",
    audienceSize: "",
    budget: "",
    details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventType) {
      toast({
        title: "Please select an event type",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke("send-private-show-inquiry", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Inquiry Submitted!",
        description: "We'll get back to you within 48 hours with more information.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        eventType: "",
        eventDate: "",
        location: "",
        audienceSize: "",
        budget: "",
        details: "",
      });
    } catch (error: any) {
      console.error("Error submitting inquiry:", error);
      toast({
        title: "Error submitting inquiry",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-[150px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Star className="text-yellow-500" size={32} />
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-center mb-4">
              PRIVATE <span className="gradient-text">SHOWS</span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto text-lg">
              Book Matt Rife for your corporate event, private party, or special celebration. 
              Create an unforgettable experience for your guests.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Star, title: "Custom Performance", desc: "Tailored to your audience" },
                { icon: Building2, title: "Full Production", desc: "Professional setup included" },
                { icon: Users, title: "Meet & Greet", desc: "Optional VIP experiences" },
                { icon: CheckCircle, title: "White Glove Service", desc: "Dedicated event coordinator" },
              ].map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-xl bg-card border border-border">
                  <feature.icon className="mx-auto mb-4 text-primary" size={28} />
                  <h3 className="font-display text-lg text-foreground mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Info */}
              <div>
                <h2 className="font-display text-4xl mb-6">
                  LET'S CREATE <span className="gradient-text">MAGIC</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether you're planning a corporate gala, milestone celebration, or exclusive 
                  private event, Matt Rife brings the energy, humor, and star power to make it 
                  unforgettable.
                </p>

                <div className="space-y-6 mb-8">
                  <h3 className="font-display text-xl text-foreground">What's Included:</h3>
                  <ul className="space-y-3">
                    {[
                      "Customized comedy set (30-60 minutes)",
                      "Professional sound & lighting coordination",
                      "Pre-event consultation call",
                      "Optional Meet & Greet packages",
                      "Dedicated event coordinator",
                      "Social media shoutout (optional)",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle className="text-primary flex-shrink-0" size={18} />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <h4 className="font-display text-lg text-foreground mb-2">Need More Info?</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our team typically responds within 48 hours. For urgent inquiries, 
                    please indicate in your message.
                  </p>
                  <p className="text-sm text-primary">
                    📧 bookings@mattrife.com
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="rounded-2xl bg-card border border-border p-6 lg:p-8">
                <h3 className="font-display text-2xl mb-6">Submit Your Inquiry</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Company/Organization</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-foreground mb-2">Event Type *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {eventTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, eventType: type.id })}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            formData.eventType === type.id
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <type.icon className="mx-auto mb-1" size={20} />
                          <span className="text-xs">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Event Date *</label>
                      <input
                        type="date"
                        name="eventDate"
                        required
                        value={formData.eventDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Location *</label>
                      <input
                        type="text"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Expected Audience Size</label>
                      <select
                        name="audienceSize"
                        value={formData.audienceSize}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select size</option>
                        <option value="50-100">50-100 guests</option>
                        <option value="100-250">100-250 guests</option>
                        <option value="250-500">250-500 guests</option>
                        <option value="500+">500+ guests</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Budget Range</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select budget</option>
                        <option value="25k-50k">$25,000 - $50,000</option>
                        <option value="50k-100k">$50,000 - $100,000</option>
                        <option value="100k+">$100,000+</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-foreground mb-2">Additional Details</label>
                    <textarea
                      name="details"
                      rows={4}
                      value={formData.details}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell us more about your event, any special requests, or questions..."
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivateShows;
