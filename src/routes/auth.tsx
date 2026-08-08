import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo-dai-artes.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const preview = false;

  useEffect(() => { document.title = "Entrar — Dai Artes"; }, []);

  async function enterDemo() {
    // Demo disabled
  }


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vinda de volta!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 gradient-hero">
        <div className="flex items-center gap-2 text-primary-foreground">
          <img src={logoAsset.url} alt="Dai Artes" className="h-8 w-8 object-contain rounded-md bg-white p-0.5" />
          <span className="font-semibold tracking-wide">DAI ARTES</span>
        </div>
        <div>
          <h1 className="font-display text-5xl leading-tight text-primary-foreground">
            Orçamentos com<br/>elegância e leveza.
          </h1>
          <p className="mt-4 text-primary-foreground/90 max-w-md">
            Crie, envie pelo WhatsApp e acompanhe todos os seus orçamentos em um só lugar.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} Dai Artes · Papelaria Personalizada</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-6 flex items-center gap-2 text-primary">
            <img src={logoAsset.url} alt="Dai Artes" className="h-8 w-8 object-contain rounded-md bg-white p-0.5 border border-primary/10" /><span className="font-semibold">DAI ARTES</span>
          </div>
          <h2 className="font-display text-3xl text-foreground">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Acesse sua conta para gerenciar orçamentos." : "Comece a organizar seus orçamentos agora."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 shadow-[var(--shadow-soft)]">
              {loading ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>Ainda não tem conta?{" "}
                <button className="text-primary font-medium hover:underline" onClick={() => setMode("signup")}>Criar conta</button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button className="text-primary font-medium hover:underline" onClick={() => setMode("signin")}>Entrar</button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

