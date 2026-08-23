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
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles(role)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return profiles;
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
        // Demote to user
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", id)
          .eq("role", "admin");
        if (error) throw error;
      } else {
        // Promote to admin
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

  const sendRecovery = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) toast.error(error.message);
    else toast.success("E-mail de recuperação enviado!");
  };

  if (isLoading) return <div className="p-8">Carregando usuários...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Administração de Usuários</h1>
        <p className="text-sm text-muted-foreground">Gerencie o acesso e permissões dos usuários do sistema.</p>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Privilégios</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => {
              const isAdmin = u.user_roles?.some((r: any) => r.role === "admin");
              const isSelf = false; // Simplified check for now
              
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.email}</div>
                    <div className="text-xs text-muted-foreground">ID: {u.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "success" : "secondary"}>
                      {u.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isAdmin ? "default" : "outline"}>
                      {isAdmin ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString('pt-BR') : "Nunca"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" title="Enviar recuperação de senha" onClick={() => sendRecovery(u.email)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title={isAdmin ? "Remover admin" : "Tornar admin"}
                      onClick={() => toggleRole.mutate({ id: u.id, isAdmin })}
                    >
                      {isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title={u.status === "active" ? "Desativar" : "Ativar"}
                      onClick={() => toggleStatus.mutate({ id: u.id, status: u.status })}
                    >
                      {u.status === "active" ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
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
