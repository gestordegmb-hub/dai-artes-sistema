import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/auth" });
  },
  component: RootIndex,
});

function RootIndex() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-card border rounded-xl shadow-sm p-8 prose prose-pink">
        corrija o problema de login, conta criada e da erro de email ou senha. adiciona salvamento de login registrado
      </div>
    </div>
  );
}
