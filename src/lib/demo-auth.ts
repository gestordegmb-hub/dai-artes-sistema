import { supabase } from "@/integrations/supabase/client";

export const DEMO_EMAIL = "demo@daiartes.local";
const DEMO_PASSWORD = "daiartes-demo-2026";

// Auto-login só roda no preview do Lovable / localhost. Em domínio publicado
// o fluxo normal de e-mail/senha continua valendo.
export function isPreviewEnv(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".lovable.app") ||
    h.endsWith(".lovable.dev") ||
    h.endsWith(".lovableproject.com")
  );
}

export function isDemoUser(email: string | null | undefined): boolean {
  return (email || "").toLowerCase() === DEMO_EMAIL;
}

let inFlight: Promise<boolean> | null = null;

/** Garante uma sessão demo quando estamos no preview. Retorna true se logou. */
export async function ensureDemoSession(): Promise<boolean> {
  if (!isPreviewEnv()) return false;
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    inFlight = null;
    if (error) {
      console.warn("[demo-auth] auto-login falhou:", error.message);
      return false;
    }
    return true;
  })();
  return inFlight;
}
