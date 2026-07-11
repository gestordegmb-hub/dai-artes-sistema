import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Printer, MessageCircle, Copy, Trash2, ArrowLeft, Sparkles, Download, Eye, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { budgetDetailQuery, settingsQuery } from "@/lib/queries";
import { currency, formatDate, formatPhone } from "@/lib/format";
import { buildWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/_authenticated/budgets/$id")({
  loader: ({ context, params }) => Promise.all([
    context.queryClient.ensureQueryData(budgetDetailQuery(params.id)),
    context.queryClient.ensureQueryData(settingsQuery),
  ]),
  component: BudgetDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Orçamento não encontrado.</div>,
});

function BudgetDetail() {
  const { id } = Route.useParams();
  const { data: budget } = useSuspenseQuery(budgetDetailQuery(id));
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pdfFilename() {
    return `orcamento-${String(budget.number).padStart(4, "0")}-${budget.client.name.replace(/\s+/g, "_")}.pdf`;
  }

  function pdfWorker() {
    return import("html2pdf.js").then(({ default: html2pdf }) =>
      html2pdf()
        .set({
          margin: 0,
          filename: pdfFilename(),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: 794 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        } as any)
        .from(pdfRef.current!),
    );
  }

  async function downloadPdf() {
    if (!pdfRef.current) return;
    try {
      const worker = await pdfWorker();
      await worker.save();
      toast.success("PDF baixado.");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF: " + (e?.message ?? ""));
    }
  }

  async function openPreview() {
    if (!pdfRef.current) return;
    cancelledRef.current = false;
    setPreviewLoading(true);
    setPreviewError(null);
    const t = toast.loading("Gerando pré-visualização do PDF…");
    try {
      const worker = await pdfWorker();
      const blob: Blob = await worker.outputPdf("blob");
      if (cancelledRef.current) {
        toast.dismiss(t);
        return;
      }
      if (!blob || blob.size === 0) throw new Error("PDF gerado está vazio.");
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      toast.success("Pré-visualização pronta.", { id: t });
    } catch (e: any) {
      if (cancelledRef.current) {
        toast.dismiss(t);
        return;
      }
      const msg = e?.message ?? "Falha desconhecida ao gerar o PDF.";
      setPreviewError(msg);
      toast.error("Erro ao gerar pré-visualização: " + msg, { id: t });
    } finally {
      setPreviewLoading(false);
    }
  }

  function cancelPreview() {
    cancelledRef.current = true;
    setPreviewLoading(false);
    setPreviewError(null);
    toast.message("Pré-visualização cancelada.");
  }


  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  async function updateStatus(status: string) {
    const { error } = await supabase.from("budgets").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado.");
    qc.invalidateQueries();
  }

  async function remove() {
    if (!confirm("Excluir este orçamento?")) return;
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído.");
    navigate({ to: "/budgets" });
  }

  async function duplicate() {
    const { data: userData } = await supabase.auth.getUser();
    const { data: newB, error } = await supabase.from("budgets").insert({
      user_id: userData.user!.id,
      client_id: budget.client_id,
      subtotal: budget.subtotal, discount: budget.discount, surcharge: budget.surcharge, total: budget.total,
      notes: budget.notes, delivery_date: budget.delivery_date, status: "pendente", number: 0,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("budget_items").insert(
      (budget.items as any[]).map((it) => ({
        budget_id: newB.id, service_id: it.service_id, service_name: it.service_name,
        quantity: it.quantity, unit_price: it.unit_price, subtotal: it.subtotal, position: it.position,
      })),
    );
    toast.success("Orçamento duplicado.");
    qc.invalidateQueries({ queryKey: ["budgets"] });
    navigate({ to: "/budgets/$id", params: { id: newB.id } });
  }

  function share() {
    const msg = buildWhatsAppMessage({
      clientName: budget.client.name,
      clientPhone: budget.client.phone,
      items: (budget.items as any[]).map((i) => ({ service_name: i.service_name, quantity: Number(i.quantity), unit_price: Number(i.unit_price), subtotal: Number(i.subtotal) })),
      total: Number(budget.total),
      discount: Number(budget.discount),
      surcharge: Number(budget.surcharge),
      deliveryDate: budget.delivery_date,
      notes: budget.notes,
      template: settings?.whatsapp_message_template,
      companyName: settings?.company_name,
    });
    window.open(whatsappLink(budget.client.phone, msg), "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between flex-wrap gap-3">
        <Link to="/budgets" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Orçamentos</Link>
        <div className="flex flex-wrap gap-2">
          <select value={budget.status} onChange={(e) => updateStatus(e.target.value)} className="h-10 rounded-md border border-input bg-card px-3 text-sm">
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="concluido">Concluído</option>
            <option value="recusado">Recusado</option>
          </select>
          <button onClick={openPreview} disabled={previewLoading} className="inline-flex items-center gap-2 h-10 px-4 rounded-md border text-sm hover:bg-accent disabled:opacity-60">{previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Pré-visualizar</button>
          <button onClick={downloadPdf} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"><Download className="h-4 w-4" /> Baixar PDF</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-10 px-4 rounded-md border text-sm hover:bg-accent"><Printer className="h-4 w-4" /> Imprimir</button>
          <button onClick={share} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90"><MessageCircle className="h-4 w-4" /> WhatsApp</button>
          <button onClick={duplicate} className="inline-flex items-center gap-2 h-10 px-3 rounded-md border text-sm hover:bg-accent" title="Duplicar"><Copy className="h-4 w-4" /></button>
          <button onClick={remove} className="inline-flex items-center gap-2 h-10 px-3 rounded-md border text-destructive hover:bg-destructive/10" title="Excluir"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      {previewError && !previewLoading && !previewUrl && (
        <div className="no-print rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm flex items-center justify-between gap-3">
          <span>Não foi possível gerar o PDF: {previewError}</span>
          <button onClick={openPreview} className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-destructive/40 hover:bg-destructive/20 text-xs font-medium">Tentar novamente</button>
        </div>
      )}

      <div className="flex justify-center">
        <div ref={pdfRef} className="pdf-page shadow-[var(--shadow-card)]">
          {/* Decorative corner */}
          <div aria-hidden className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-20 pdf-band" />
          <div aria-hidden className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full opacity-10 pdf-band" />

          {/* HEADER BAND */}
          <div className="pdf-band px-12 py-8 flex items-start justify-between relative">
            <div className="flex items-center gap-4">
              {settings?.logo_url ? (
                <div className="h-20 w-20 rounded-2xl bg-white p-2 shadow-lg">
                  <img src={settings.logo_url} alt={settings?.company_name || "Logo"} crossOrigin="anonymous" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-white/15 backdrop-blur grid place-items-center border border-white/25">
                  <Sparkles className="h-9 w-9 text-white" />
                </div>
              )}
              <div>
                <div className="font-display text-4xl leading-tight tracking-tight">{settings?.company_name || "Dai Artes"}</div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/80 mt-1">Papelaria personalizada</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/75">Orçamento nº</div>
              <div className="font-display text-4xl mt-1">#{String(budget.number).padStart(4, "0")}</div>
              <div className="text-xs text-white/85 mt-2">Emitido em {formatDate(budget.created_at)}</div>
            </div>
          </div>

          {/* CONTACT STRIP */}
          <div className="pdf-soft-bg border-b pdf-hairline px-12 py-3 grid grid-cols-4 gap-3 text-[11px]">
            {settings?.phone && (
              <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground">Telefone</div><div className="font-medium">{formatPhone(settings.phone)}</div></div>
            )}
            {settings?.whatsapp && (
              <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground">WhatsApp</div><div className="font-medium">{formatPhone(settings.whatsapp)}</div></div>
            )}
            {settings?.instagram && (
              <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground">Instagram</div><div className="font-medium">{settings.instagram}</div></div>
            )}
            {settings?.city && (
              <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground">Localização</div><div className="font-medium">{settings.city}</div></div>
            )}
          </div>

          {/* BODY */}
          <div className="px-12 py-8 relative">
            {/* Client + delivery */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl border pdf-hairline pdf-soft-bg p-5">
                <div className="text-[9px] uppercase tracking-[0.25em] pdf-accent font-semibold">Cliente</div>
                <div className="font-display text-2xl mt-2">{budget.client.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{formatPhone(budget.client.phone)}</div>
                {(budget.client as any).email && <div className="text-sm text-muted-foreground">{(budget.client as any).email}</div>}
              </div>
              <div className="rounded-xl border pdf-hairline p-5 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.25em] pdf-accent font-semibold">Status</div>
                  <div className="font-medium capitalize mt-1">{budget.status}</div>
                </div>
                {budget.delivery_date && (
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.25em] pdf-accent font-semibold">Entrega prevista</div>
                    <div className="font-medium mt-1">{formatDate(budget.delivery_date)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <div className="text-[9px] uppercase tracking-[0.25em] pdf-accent font-semibold mb-2">Itens do orçamento</div>
              <table className="w-full text-sm pdf-table rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4">Serviço</th>
                    <th className="text-center py-3 px-2 w-16">Qtd</th>
                    <th className="text-right py-3 px-2 w-28">Valor unit.</th>
                    <th className="text-right py-3 px-4 w-32">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(budget.items as any[]).map((it) => (
                    <tr key={it.id}>
                      <td className="py-3 px-4">{it.service_name}</td>
                      <td className="py-3 px-2 text-center">{Number(it.quantity)}</td>
                      <td className="py-3 px-2 text-right">{currency(it.unit_price)}</td>
                      <td className="py-3 px-4 text-right font-medium">{currency(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals + Pix */}
            <div className="grid grid-cols-5 gap-6 mb-8">
              <div className="col-span-3">
                {settings?.pix && (
                  <div className="rounded-xl border pdf-hairline p-5 pdf-soft-bg h-full">
                    <div className="text-[9px] uppercase tracking-[0.25em] pdf-accent font-semibold">Pagamento via PIX</div>
                    <div className="font-medium mt-2 break-all">{settings.pix}</div>
                    <div className="text-xs text-muted-foreground mt-2">Envie o comprovante pelo WhatsApp para confirmarmos o pedido.</div>
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <div className="rounded-xl border pdf-hairline overflow-hidden">
                  <div className="px-5 py-2 pdf-soft-bg text-[10px] uppercase tracking-widest text-muted-foreground">Resumo</div>
                  <div className="p-5 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currency(budget.subtotal)}</span></div>
                    {Number(budget.discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span>- {currency(budget.discount)}</span></div>}
                    {Number(budget.surcharge) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Acréscimo</span><span>+ {currency(budget.surcharge)}</span></div>}
                    <div className="pdf-band -mx-5 -mb-5 mt-3 px-5 py-3 flex justify-between items-baseline">
                      <span className="text-xs uppercase tracking-widest text-white/80">Total</span>
                      <span className="font-display text-2xl">{currency(budget.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {budget.notes && (
              <div className="rounded-xl border pdf-hairline p-5 mb-6">
                <div className="text-[9px] uppercase tracking-[0.25em] pdf-accent font-semibold mb-2">Observações</div>
                <div className="text-sm whitespace-pre-line leading-relaxed">{budget.notes}</div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="absolute bottom-0 left-0 right-0">
            {settings?.address && (
              <div className="text-center text-[10px] text-muted-foreground pb-2 px-12">{settings.address}{settings.city ? ` — ${settings.city}` : ""}</div>
            )}
            <div className="pdf-band px-12 py-4 flex items-center justify-between text-xs">
              <div className="italic text-white/90">
                {settings?.pdf_footer || "Obrigado pela preferência. Será um prazer produzir seus personalizados."}
              </div>
              <div className="text-white/80">
                {settings?.instagram || "@daiartes"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewUrl && (
        <div className="no-print fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-4 py-3 bg-card/95 border-b">
            <div className="text-sm font-medium">Pré-visualização — Orçamento #{String(budget.number).padStart(4, "0")}</div>
            <div className="flex items-center gap-2">
              <button onClick={downloadPdf} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"><Download className="h-4 w-4" /> Baixar</button>
              <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-accent"><Printer className="h-4 w-4" /> Abrir e imprimir</a>
              <button onClick={closePreview} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-accent"><X className="h-4 w-4" /> Fechar</button>
            </div>
          </div>
          <iframe title="Pré-visualização do PDF" src={previewUrl} className="flex-1 w-full bg-neutral-800" />
        </div>
      )}

      {previewLoading && !previewUrl && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" role="status" aria-live="polite">
          <div className="bg-card rounded-xl shadow-xl px-8 py-6 flex flex-col items-center gap-3 min-w-[260px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Gerando pré-visualização…</div>
            <div className="text-xs text-muted-foreground text-center">Renderizando o orçamento em PDF. Isso leva alguns segundos.</div>
            <button onClick={cancelPreview} className="mt-2 inline-flex items-center gap-2 h-9 px-4 rounded-md border text-sm hover:bg-accent"><X className="h-4 w-4" /> Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
