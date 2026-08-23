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
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-muted-foreground break-all">
          pablooliveirasantos184@gmail.com
          <br />
          adiciona essa conta como administrador para ter acesso a area de admin do sistema
          <br />
          <br />
          usuarios desativados são excluidos automaticamente do acesso e da memoria de conta do sistema
        </p>
      </div>
    </div>
  );
}

