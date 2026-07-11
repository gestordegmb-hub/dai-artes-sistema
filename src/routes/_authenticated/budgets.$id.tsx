import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Printer, MessageCircle, Copy, Trash2, ArrowLeft, Sparkles, Download } from "lucide-react";
import { useRef } from "react";
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

  async function downloadPdf() {
    if (!pdfRef.current) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const filename = `orcamento-${String(budget.number).padStart(4, "0")}-${budget.client.name.replace(/\s+/g, "_")}.pdf`;
    try {
      await html2pdf()
        .set({
          margin: 10,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(pdfRef.current)
        .save();
      toast.success("PDF baixado.");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF: " + (e?.message ?? ""));
    }
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
          <button onClick={downloadPdf} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"><Download className="h-4 w-4" /> Baixar PDF</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-10 px-4 rounded-md border text-sm hover:bg-accent"><Printer className="h-4 w-4" /> Imprimir</button>
          <button onClick={share} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90"><MessageCircle className="h-4 w-4" /> WhatsApp</button>
          <button onClick={duplicate} className="inline-flex items-center gap-2 h-10 px-3 rounded-md border text-sm hover:bg-accent" title="Duplicar"><Copy className="h-4 w-4" /></button>
          <button onClick={remove} className="inline-flex items-center gap-2 h-10 px-3 rounded-md border text-destructive hover:bg-destructive/10" title="Excluir"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="card-elevated p-10 print-page max-w-3xl mx-auto">
        <div className="flex items-start justify-between border-b pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl grid place-items-center gradient-hero">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-3xl text-primary">{settings?.company_name || "Dai Artes"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {settings?.phone && <>{formatPhone(settings.phone)} · </>}
                {settings?.instagram || "@daiartes"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Orçamento</div>
            <div className="font-display text-2xl">#{String(budget.number).padStart(4, "0")}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatDate(budget.created_at)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Cliente</div>
            <div className="font-medium">{budget.client.name}</div>
            <div className="text-sm text-muted-foreground">{formatPhone(budget.client.phone)}</div>
          </div>
          {budget.delivery_date && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Entrega prevista</div>
              <div className="font-medium">{formatDate(budget.delivery_date)}</div>
            </div>
          )}
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
              <th className="py-2">Serviço</th>
              <th className="py-2 text-center w-20">Qtd</th>
              <th className="py-2 text-right w-28">Unit.</th>
              <th className="py-2 text-right w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(budget.items as any[]).map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="py-3">{it.service_name}</td>
                <td className="py-3 text-center">{Number(it.quantity)}</td>
                <td className="py-3 text-right">{currency(it.unit_price)}</td>
                <td className="py-3 text-right font-medium">{currency(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currency(budget.subtotal)}</span></div>
          {Number(budget.discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span>- {currency(budget.discount)}</span></div>}
          {Number(budget.surcharge) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Acréscimo</span><span>+ {currency(budget.surcharge)}</span></div>}
          <div className="flex justify-between border-t pt-2 mt-2 font-display text-xl">
            <span>Total</span><span className="text-primary">{currency(budget.total)}</span>
          </div>
        </div>

        {budget.notes && (
          <div className="mt-8 border-t pt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Observações</div>
            <div className="text-sm whitespace-pre-line">{budget.notes}</div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t text-center text-sm italic text-muted-foreground">
          {settings?.pdf_footer || "Obrigado pela preferência. Será um prazer produzir seus personalizados."}
        </div>
      </div>
    </div>
  );
}
