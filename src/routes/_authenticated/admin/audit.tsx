import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { History, User, Activity, Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  beforeLoad: async ({ context }: any) => {
    if (!context.isAdmin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data: auditData, error: aError } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
        
      if (aError) throw aError;

      const userIds = [...new Set(auditData.map(l => l.user_id).filter(Boolean))];
      
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds as string[]);
        
      if (pError) throw pError;

      return auditData.map(log => ({
        ...log,
        user_email: profiles.find(p => p.id === log.user_id)?.email || "Sistema"
      }));
    }
  });

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT': return <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Criação</Badge>;
      case 'UPDATE': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Edição</Badge>;
      case 'DELETE': return <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20">Exclusão</Badge>;
      case 'LOGIN': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Acesso</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'profiles': return <User className="h-3.5 w-3.5" />;
      case 'budgets': return <Activity className="h-3.5 w-3.5" />;
      case 'user_roles': return <Database className="h-3.5 w-3.5" />;
      default: return <Activity className="h-3.5 w-3.5" />;
    }
  };

  if (isLoading) return <div className="p-8">Carregando logs de auditoria...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl text-foreground flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          Logs de Auditoria
        </h1>
        <p className="text-sm text-muted-foreground">Histórico completo de ações realizadas no sistema.</p>
      </div>

      <div className="card-elevated overflow-hidden border border-sidebar-border">
        <Table>
          <TableHeader className="bg-sidebar/50">
            <TableRow>
              <TableHead className="font-semibold w-[180px]">Data/Hora</TableHead>
              <TableHead className="font-semibold">Usuário</TableHead>
              <TableHead className="font-semibold text-center">Ação</TableHead>
              <TableHead className="font-semibold">Recurso</TableHead>
              <TableHead className="font-semibold">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((l) => (
              <TableRow key={l.id} className="hover:bg-sidebar/20">
                <TableCell className="text-xs font-medium text-muted-foreground">
                  {formatDate(l.created_at)}
                  <div className="text-[10px] opacity-70">
                    {new Date(l.created_at).toLocaleTimeString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{l.user_email}</div>
                  {l.ip_address && <div className="text-[10px] text-muted-foreground">{l.ip_address}</div>}
                </TableCell>
                <TableCell className="text-center">
                  {getActionBadge(l.action)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    {getResourceIcon(l.resource_type)}
                    <span className="capitalize">{l.resource_type.replace('_', ' ')}</span>
                  </div>
                  {l.resource_id && <div className="text-[10px] text-muted-foreground font-mono">ID: {l.resource_id.slice(0, 8)}</div>}
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate text-xs text-muted-foreground" title={JSON.stringify(l.details)}>
                    {l.details ? JSON.stringify(l.details) : "-"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {logs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhum registro de auditoria encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
