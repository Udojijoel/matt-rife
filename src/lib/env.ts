// Validates required environment variables at app startup.
// On Vercel/Netlify you MUST add these in the host's Environment Variables UI:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
//   VITE_SUPABASE_PROJECT_ID

const REQUIRED_ENV_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

export function validateEnv(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !import.meta.env[key] || String(import.meta.env[key]).trim() === ""
  );
  return { ok: missing.length === 0, missing };
}

export function renderEnvErrorScreen(missing: string[]) {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0b1220;color:#fff;padding:24px;">
      <div style="max-width:560px;background:#111a2e;border:1px solid #1e2a44;border-radius:12px;padding:28px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#ffd166;">Configuration error</h1>
        <p style="margin:0 0 16px;color:#cbd5e1;">The app is missing required environment variables:</p>
        <ul style="margin:0 0 16px 20px;color:#fca5a5;font-family:monospace;">
          ${missing.map((m) => `<li>${m}</li>`).join("")}
        </ul>
        <p style="margin:0;color:#94a3b8;font-size:14px;">
          Add these in your hosting provider's <strong>Environment Variables</strong> settings
          (Vercel → Project Settings → Environment Variables, or Netlify → Site Settings → Environment) and redeploy.
        </p>
      </div>
    </div>
  `;
}
