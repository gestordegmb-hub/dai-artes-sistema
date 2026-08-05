import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEMO_EMAIL } from "./demo-auth";
import { z } from "zod";

export const cleanupDemoData = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string() }).parse(data))
  .handler(async ({ data }) => {
    if (data.email.toLowerCase() !== DEMO_EMAIL.toLowerCase()) {
      return { success: false, message: "Not a demo user" };
    }

    // Get user ID first
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;
    
    const demoUser = userData.users.find(u => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase());
    if (!demoUser) return { success: false, message: "Demo user not found" };

    const userId = demoUser.id;

    // Delete in order due to FKs: budget_items -> budgets -> clients/services
    // We use supabaseAdmin to bypass RLS since we're cleaning up specifically for this user
    
    // 1. Budget items
    await supabaseAdmin
      .from('budget_items')
      .delete()
      .in('budget_id', (
        await supabaseAdmin.from('budgets').select('id').eq('user_id', userId)
      ).data?.map(b => b.id) || []);

    // 2. Budgets
    await supabaseAdmin.from('budgets').delete().eq('user_id', userId);

    // 3. Clients
    await supabaseAdmin.from('clients').delete().eq('user_id', userId);

    // 4. Services
    await supabaseAdmin.from('services').delete().eq('user_id', userId);

    return { success: true };
  });
