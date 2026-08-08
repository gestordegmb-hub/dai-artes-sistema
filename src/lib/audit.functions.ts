import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const auditInput = z.object({
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().uuid().optional(),
  details: z.any().optional(),
});

export const logAuditServer = createServerFn({ method: "POST" })
  .inputValidator((data) => auditInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Use the authenticated user ID if available from context (via attachSupabaseAuth middleware)
    const userId = (context as any).userId || null;
    
    const { error } = await supabaseAdmin.rpc('log_action', {
      _action: data.action,
      _resource_type: data.resourceType,
      _resource_id: data.resourceId,
      _details: {
        ...data.details,
        user_id_override: userId // The log_action function uses auth.uid(), which service_role doesn't have.
      }
    });

    if (error) {
      console.error("[audit-server] Error calling log_action:", error);
      throw new Error(error.message);
    }
    return { success: true };
  });

