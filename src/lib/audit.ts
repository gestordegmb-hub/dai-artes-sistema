import { logAuditServer } from "./audit.functions";

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId?: string,
  details: any = {}
) {
  try {
    await logAuditServer({
      data: {
        action,
        resourceType,
        resourceId,
        details
      }
    });
  } catch (err) {
    console.error("[audit] Falha ao registrar log via server function:", err);
  }
}
