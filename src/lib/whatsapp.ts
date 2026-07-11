import { currency, onlyDigits } from "./format";

type Item = { service_name: string; quantity: number; unit_price: number; subtotal: number };
type Args = {
  clientName: string;
  clientPhone: string;
  items: Item[];
  total: number;
  discount?: number;
  surcharge?: number;
  deliveryDate?: string | null;
  notes?: string | null;
  template?: string;
  companyName?: string;
};

export function buildWhatsAppMessage(a: Args) {
  const firstName = a.clientName.split(" ")[0] || a.clientName;
  const header = (a.template || "Olá, {cliente}! Segue seu orçamento da {empresa}.")
    .replace(/{cliente}/gi, firstName)
    .replace(/{empresa}/gi, a.companyName || "Dai Artes");

  const lines = a.items.map(
    (i) => `• ${i.service_name}\n  ${i.quantity} x ${currency(i.unit_price)} = ${currency(i.subtotal)}`,
  );

  const extras: string[] = [];
  if (a.discount && a.discount > 0) extras.push(`Desconto: ${currency(a.discount)}`);
  if (a.surcharge && a.surcharge > 0) extras.push(`Acréscimo: ${currency(a.surcharge)}`);

  const parts = [
    header,
    "",
    ...lines,
    "",
    ...extras,
    `*Valor total: ${currency(a.total)}*`,
  ];
  if (a.deliveryDate) parts.push("", `Entrega prevista: ${new Date(a.deliveryDate).toLocaleDateString("pt-BR")}`);
  if (a.notes) parts.push("", a.notes);
  parts.push("", "Muito obrigada pela preferência! 💗");

  return parts.join("\n");
}

export function whatsappLink(phone: string, message: string) {
  const digits = onlyDigits(phone);
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
