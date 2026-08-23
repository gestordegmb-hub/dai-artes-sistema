import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Shield, ShieldOff, UserMinus, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: async ({ context }: any) => {
    if (!context.isAdmin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Manual join because PostgREST might not infer the relation automatically in types
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
        
      if (pError) throw pError;

      const { data: roles, error: rError } = await supabase
        .from("user_roles")
        .select("user_id, role");
        
      if (rError) throw rError;

      return profiles.map(p => ({
        ...p,
        roles: roles.filter(r => r.user_id === p.id).map(r => r.role)
      }));
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const newStatus = status === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      return { id, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status atualizado!");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const toggleRole = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string, isAdmin: boolean }) => {
      if (isAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", id)
          .eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: id, role: "admin" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Privilégios atualizados!");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const sendRecovery = async (email: string | null) => {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) toast.error(error.message);
    else toast.success("E-mail de recuperação enviado!");
  };

  if (isLoading) return <div className="p-8">Carregando usuários...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl text-foreground">Administração de Usuários</h1>
        <p className="text-sm text-muted-foreground">Gerencie o acesso e permissões dos usuários do sistema.</p>
      </div>

      <div className="card-elevated overflow-hidden border border-sidebar-border">
        <Table>
          <TableHeader className="bg-sidebar/50">
            <TableRow>
              <TableHead className="font-semibold">Usuário</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-center">Privilégios</TableHead>
              <TableHead className="font-semibold">Último Acesso</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => {
              const isAdmin = u.roles.includes("admin");
              
              return (
                <TableRow key={u.id} className="hover:bg-sidebar/20">
                  <TableCell>
                    <div className="font-medium text-foreground">{u.email}</div>
                    <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">ID: {u.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={u.status === "active" ? "default" : "secondary"} className="font-normal px-2.5">
                      {u.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={isAdmin ? "destructive" : "outline"} className="font-normal px-2.5">
                      {isAdmin ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString('pt-BR') : "Nunca"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/5" title="Enviar recuperação de senha" onClick={() => sendRecovery(u.email)}>
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`h-8 w-8 ${isAdmin ? 'text-destructive border-destructive/20 hover:bg-destructive/5' : 'text-foreground'}`}
                        title={isAdmin ? "Remover admin" : "Tornar admin"}
                        onClick={() => toggleRole.mutate({ id: u.id, isAdmin })}
                      >
                        {isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        title={u.status === "active" ? "Desativar" : "Ativar"}
                        onClick={() => toggleStatus.mutate({ id: u.id, status: u.status })}
                      >
                        {u.status === "active" ? <UserMinus className="h-3.5 w-3.5 text-muted-foreground" /> : <UserPlus className="h-3.5 w-3.5 text-primary" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
