import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/auth" });
  },
  component: RootIndex,
});

function RootIndex() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl bg-white p-3 shadow-xl border border-primary/10 overflow-hidden">
            <img 
              src="/images/logo-dai-artes.png" 
              alt="Dai Artes Logo" 
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div>
          <h1 className="font-display text-3xl text-primary">Dai Artes</h1>
          <p className="text-muted-foreground mt-2 italic">Papelaria Personalizada</p>
        </div>
        <div className="pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Redirecionando para o sistema...
          </p>
        </div>
      </div>
    </div>
  );
}

