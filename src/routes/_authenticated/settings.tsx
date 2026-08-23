import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/queries";
import logoAsset from "@/assets/logo-dai-artes.png.asset.json";

export const Route = createFileRoute("/_authenticated/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: SettingsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Sem configurações.</div>,
});

function SettingsPage() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(s || {});
  const [saving, setSaving] = useState(false);
  
  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);


  useEffect(() => { if (s) setForm(s); }, [s]);

  function set(k: string, v: any) { setForm((p: any) => ({ ...p, [k]: v })); }

  async function save() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("settings").upsert({ ...form, user_id: userData.user!.id });
      if (error) throw error;
      toast.success("Configurações salvas!");
      qc.invalidateQueries({ queryKey: ["settings"] });
    } catch (err: any) { toast.error(err.message); }
  async function changePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setUpdatingPassword(true);
    try {
      // Supabase auth.updateUser handles password change
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar senha.");
    } finally {
      setUpdatingPassword(false);
    }
  }


  const Field = ({ label, k, type = "text", full = false, textarea = false }: any) => (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-sm font-medium">{label}</label>
      {textarea ? (
        <textarea rows={3} value={form[k] || ""} onChange={(e) => set(k, e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
      ) : (
        <input type={type} value={form[k] ?? ""} onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)}
          className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm" />
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl">Configurações</h1>
        <p className="text-sm text-muted-foreground">Informações da empresa exibidas nos orçamentos.</p>
      </div>

      <div className="card-elevated p-6 grid grid-cols-2 gap-4">
        <Field label="Nome da empresa" k="company_name" />
        <Field label="Instagram" k="instagram" />
        <Field label="Telefone" k="phone" />
        <Field label="WhatsApp (número)" k="whatsapp" />
        <Field label="Cidade" k="city" />
        <Field label="PIX" k="pix" />
        <Field label="Endereço" k="address" full />
        <Field label="URL da logo (aparece no PDF)" k="logo_url" full />
        <div className="col-span-2 flex items-center justify-between rounded-md border border-dashed p-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <img src={form.logo_url || logoAsset.url} alt="Prévia da logo" className="h-16 w-16 rounded-md object-contain bg-white" />
            <span className="text-xs text-muted-foreground">Prévia — assim aparecerá no cabeçalho do PDF. Deixe o campo acima vazio para usar a logo padrão.</span>
          </div>
          <button
            type="button"
            onClick={() => set("logo_url", logoAsset.url)}
            className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent"
          >
            Restaurar padrão
          </button>
        </div>
        <Field label="Prazo padrão (dias)" k="default_delivery_days" type="number" />
        <div />
        <Field label="Mensagem padrão do WhatsApp" k="whatsapp_message_template" textarea full />
        <Field label="Rodapé do PDF" k="pdf_footer" textarea full />
      </div>

      <p className="text-xs text-muted-foreground">
        Dica: use <code className="text-primary">{"{cliente}"}</code> e <code className="text-primary">{"{empresa}"}</code> na mensagem padrão do WhatsApp.
      </p>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="h-11 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 shadow-[var(--shadow-soft)]">
          {saving ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
