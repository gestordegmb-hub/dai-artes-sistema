import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/auth" });
  },
  component: RootIndex,
});

function RootIndex() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-card border rounded-xl shadow-sm p-8 prose prose-pink">
        <h1 className="text-3xl font-bold text-primary mb-6">Criar Área Administrativa e Controle de Usuários</h1>
        
        <p className="lead">Adicionar ao sistema da <strong>Dai Artes</strong> uma área administrativa completa para gerenciamento de usuários e permissões.</p>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6 text-amber-900">
          <p className="font-bold uppercase tracking-wide text-xs mb-1">Importante:</p>
          <p className="m-0">O sistema é privado. Não deve existir cadastro público de usuários para qualquer pessoa criar uma conta livremente.</p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Sistema de permissões</h2>
        <p>Criar dois níveis de acesso:</p>

        <h3 className="text-xl font-medium mt-4">Administrador</h3>
        <p>Permissões:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Acessar a área administrativa.</li>
          <li>Criar usuários.</li>
          <li>Editar usuários.</li>
          <li>Ativar usuários.</li>
          <li>Desativar usuários.</li>
          <li>Excluir usuários.</li>
          <li>Tornar um usuário administrador.</li>
          <li>Remover permissão de administrador.</li>
          <li>Visualizar todos os usuários.</li>
          <li>Visualizar status das contas.</li>
          <li>Visualizar data de criação da conta.</li>
          <li>Visualizar último acesso.</li>
        </ul>

        <h3 className="text-xl font-medium mt-6">Usuário</h3>
        <p>Permissões:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Acessar Dashboard.</li>
          <li>Gerenciar clientes.</li>
          <li>Gerenciar serviços.</li>
          <li>Criar e gerenciar orçamentos.</li>
          <li>Gerar PDF.</li>
          <li>Imprimir orçamento.</li>
          <li>Compartilhar orçamento pelo WhatsApp.</li>
          <li>Alterar seus próprios dados.</li>
          <li>Alterar sua própria senha.</li>
        </ul>
        <p className="mt-4 font-semibold text-destructive">Usuários comuns NÃO podem acessar a área administrativa.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Área Administrativa</h2>
        <p>Adicionar no menu lateral, somente para administradores: <strong>Administração</strong></p>
        <p>Criar uma página: <strong>Gerenciamento de Usuários</strong></p>
        <p>Exibir uma tabela com:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nome</li>
          <li>E-mail</li>
          <li>Função (Administrador, Usuário)</li>
          <li>Status (Ativo, Inativo)</li>
          <li>Data de criação</li>
          <li>Último acesso</li>
          <li>Ações</li>
        </ul>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Dashboard Administrativo</h2>
        <p>No topo da área administrativa, criar cards:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Total de usuários:</strong> Quantidade total de contas.</li>
          <li><strong>Usuários ativos:</strong> Quantidade de contas ativas.</li>
          <li><strong>Usuários inativos:</strong> Quantidade de contas desativadas.</li>
          <li><strong>Administradores:</strong> Quantidade de administradores.</li>
        </ul>
        <p className="mt-4">Abaixo, mostrar a lista dos usuários mais recentes.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Criar usuário</h2>
        <p>Adicionar botão: <strong>+ Novo usuário</strong></p>
        <p>Abrir formulário: Nome, E-mail, Função (Usuário, Administrador), Status (Ativo, Inativo).</p>
        <p className="mt-2 italic">Não permitir que o administrador defina uma senha diretamente para outra pessoa.</p>
        <p>Após criar o usuário, enviar um e-mail de convite para o endereço cadastrado.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Convite por e-mail</h2>
        <p>O novo usuário deve receber um e-mail profissional da Dai Artes.</p>
        <p>Assunto: <strong>Convite para acessar o sistema Dai Artes</strong></p>
        <p>Mensagem informando que uma conta foi criada para ele e disponibilizando um botão: <strong>Criar minha senha</strong></p>
        <p>O link deve ser seguro e temporário. Ao clicar, o usuário deverá criar sua própria senha.</p>
        <p className="text-sm font-semibold text-destructive">Não enviar senhas por e-mail.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Ativar e desativar usuário</h2>
        <p>O administrador deve poder alterar o status para <strong>Ativo</strong> ou <strong>Inativo</strong>.</p>
        <p>Quando uma conta estiver inativa: o usuário não poderá fazer login; se tentar acessar, mostrar uma mensagem informando que a conta está desativada.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Excluir usuário</h2>
        <p>Adicionar ação: <strong>Excluir usuário</strong> com confirmação visual (SweetAlert2).</p>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 text-amber-900">
          <p className="font-bold">IMPORTANTE:</p>
          <p>A exclusão de um usuário não deve apagar automaticamente clientes, orçamentos ou outros dados importantes criados por ele.</p>
        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Proteção dos administradores</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Um usuário comum nunca pode acessar rotas administrativas ou alterar sua função.</li>
          <li>Apenas administradores podem gerenciar permissões.</li>
        </ul>
        <div className="bg-rose-50 border-l-4 border-rose-400 p-4 my-4 text-rose-900">
          <p className="font-bold">PROTEÇÃO DO ÚLTIMO ADMINISTRADOR:</p>
          <p>O último administrador existente NÃO pode ser excluído, desativado ou perder o acesso administrativo.</p>
        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">9 & 10. Gestão de Privilégios</h2>
        <p>Permitir <strong>Tornar administrador</strong> ou <strong>Remover administrador</strong> com as devidas confirmações e respeitando a regra do último administrador.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">11 & 12. Perfil e Registro de Acesso</h2>
        <p>Página de <strong>Perfil</strong> para visualização de dados e alteração de nome/senha. Registrar automaticamente <code>last_login_at</code> em cada login bem-sucedido.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">13 & 14. Backend e Middleware</h2>
        <p>Utilizar tabela <code>users</code> com campos <code>role</code>, <code>status</code> e <code>last_login_at</code>. Criar middleware de administrador para validação de acesso no backend.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">15-18. Segurança, Interface e Menu</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Implementar validações robustas em ambos frontend e backend.</li>
          <li>Seguir a identidade visual rosa/branco/cinza da Dai Artes.</li>
          <li>Ocultar menu <strong>Administração</strong> para usuários comuns.</li>
        </ul>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">19 & 20. Integridade e Testes</h2>
        <p>Não quebrar funcionalidades existentes (Dashboard, Orçamentos, PDF, etc). Testar fluxos de criação, convite, promoção, desativação e exclusão.</p>

        <h2 className="text-2xl font-semibold mt-12 mb-6 text-center border-t pt-8 text-primary">Objetivo final</h2>
        <p className="text-center italic">Criar um sistema privado e profissional de gerenciamento de usuários para a Dai Artes, com controle real de permissões no backend, permitindo que administradores gerenciem as contas de acesso sem comprometer a segurança ou os dados do sistema.</p>
      </div>
    </div>
  );
}
