import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ensureDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
    const ok = await ensureDemoSession();
    if (ok) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/auth" });
  },
  component: () => null,
});

