import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const clientsQuery = queryOptions({
  queryKey: ["clients"],
  queryFn: async () => {
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const budgetsQuery = queryOptions({
  queryKey: ["budgets"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*, client:clients(id,name,phone)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("settings").select("*").maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const budgetDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["budget", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*, client:clients(*), items:budget_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      // Sort items by position
      if (data?.items) data.items.sort((a: any, b: any) => a.position - b.position);
      return data;
    },
  });

export const clientDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["client", id],
    queryFn: async () => {
      const [clientRes, budgetsRes] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        supabase.from("budgets").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      ]);
      if (clientRes.error) throw clientRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      return { client: clientRes.data, budgets: budgetsRes.data ?? [] };
    },
  });

