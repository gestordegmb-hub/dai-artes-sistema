import { supabase } from "@/integrations/supabase/client";

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId?: string,
  details: any = {}
) {
  try {
    const { error } = await supabase.rpc('log_action', {
      _action: action,
      _resource_type: resourceType,
      _resource_id: resourceId,
      _details: details
    });
    
    if (error) {
      console.error("[audit] Erro ao registrar log:", error.message);
    }
  } catch (err) {
    console.error("[audit] Falha crítica no log:", err);
  }
}
