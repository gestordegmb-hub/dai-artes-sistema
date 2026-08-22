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
      <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-sm p-8 prose prose-pink max-w-none">
        <p>Validar se a logo aparece corretamente no Login, Sidebar e Navbar após atualizar e recarregar a página no ambiente publicado.</p>
      </div>
    </div>
  );
}
