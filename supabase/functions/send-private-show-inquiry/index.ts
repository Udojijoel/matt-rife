import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PrivateShowInquiry {
  name: string;
  email: string;
  phone: string;
  company: string;
  eventType: string;
  eventDate: string;
  location: string;
  audienceSize: string;
  budget: string;
  details: string;
}

const getEventTypeLabel = (id: string): string => {
  const types: Record<string, string> = {
    corporate: "Corporate Event",
    private: "Private Party",
    wedding: "Wedding",
    other: "Other",
  };
  return types[id] || id;
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inquiry: PrivateShowInquiry = await req.json();

    console.log("Received private show inquiry:", {
      name: inquiry.name,
      email: inquiry.email,
      eventType: inquiry.eventType,
      eventDate: inquiry.eventDate,
    });

    // Input validation
    if (!inquiry.name || !inquiry.email || !inquiry.eventType || !inquiry.eventDate || !inquiry.location) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Save inquiry to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("private_show_inquiries")
      .insert({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone || null,
        company: inquiry.company || null,
        event_type: inquiry.eventType,
        event_date: inquiry.eventDate,
        location: inquiry.location,
        audience_size: inquiry.audienceSize || null,
        budget: inquiry.budget || null,
        details: inquiry.details || null,
      });

    if (dbError) {
      console.error("Error saving inquiry to database:", dbError);
    } else {
      console.log("Inquiry saved to database successfully");
    }

    // Send email to management
    const emailResponse = await resend.emails.send({
      from: "Matt Rife Bookings <onboarding@resend.dev>",
      to: ["msrmanagement.team@gmail.com"],
      subject: `Private Show Inquiry: ${getEventTypeLabel(inquiry.eventType)} - ${escapeHtml(inquiry.name)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">
            New Private Show Inquiry
          </h1>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #334155; margin-top: 0;">Contact Information</h2>
            <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p>
            <p><strong>Phone:</strong> ${inquiry.phone ? escapeHtml(inquiry.phone) : "Not provided"}</p>
            <p><strong>Company:</strong> ${inquiry.company ? escapeHtml(inquiry.company) : "Not provided"}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #334155; margin-top: 0;">Event Details</h2>
            <p><strong>Event Type:</strong> ${escapeHtml(getEventTypeLabel(inquiry.eventType))}</p>
            <p><strong>Date:</strong> ${escapeHtml(inquiry.eventDate)}</p>
            <p><strong>Location:</strong> ${escapeHtml(inquiry.location)}</p>
            <p><strong>Audience Size:</strong> ${inquiry.audienceSize ? escapeHtml(inquiry.audienceSize) : "Not specified"}</p>
            <p><strong>Budget Range:</strong> ${inquiry.budget ? escapeHtml(inquiry.budget) : "Not specified"}</p>
          </div>

          ${inquiry.details ? `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #334155; margin-top: 0;">Additional Details</h2>
            <p style="white-space: pre-wrap;">${escapeHtml(inquiry.details)}</p>
          </div>
          ` : ""}

          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            This inquiry was submitted through the Matt Rife website.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to the client
    await resend.emails.send({
      from: "Matt Rife Team <onboarding@resend.dev>",
      to: [inquiry.email],
      subject: "We received your private show inquiry!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">Thank You, ${escapeHtml(inquiry.name)}!</h1>
          
          <p>We've received your inquiry for a private show and are excited about the possibility of working with you!</p>
          
          <p>Here's a summary of your request:</p>
          <ul>
            <li><strong>Event Type:</strong> ${escapeHtml(getEventTypeLabel(inquiry.eventType))}</li>
            <li><strong>Date:</strong> ${escapeHtml(inquiry.eventDate)}</li>
            <li><strong>Location:</strong> ${escapeHtml(inquiry.location)}</li>
          </ul>
          
          <p>Our team typically responds within 48 hours. For urgent inquiries, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>The Matt Rife Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-private-show-inquiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
