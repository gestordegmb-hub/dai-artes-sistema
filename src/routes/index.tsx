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
        <h1>Correção dos Bugs do Sistema</h1>

        <p>Existem dois problemas críticos que precisam ser corrigidos.</p>

        <h2>Problema 1 - Geração de PDF</h2>

        <p>Ao clicar em <strong>Gerar PDF</strong>, ocorre um erro e o arquivo não é gerado.</p>

        <p>Verifique e corrija:</p>

        <ul>
          <li>Configuração completa do DomPDF.</li>
          <li>Rotas responsáveis pela geração do PDF.</li>
          <li>Controller responsável pela exportação.</li>
          <li>View Blade utilizada para o PDF.</li>
          <li>Tratamento de exceções.</li>
          <li>Garantir que todos os dados do orçamento sejam carregados corretamente.</li>
          <li>Caso exista erro, exibir uma mensagem amigável ao usuário.</li>
        </ul>

        <p>O botão "Gerar PDF" deve baixar imediatamente um PDF profissional do orçamento.</p>

        <hr />

        <h2>Problema 2 - Login</h2>

        <p>O sistema está obrigando o usuário a criar uma conta toda vez que deseja entrar.</p>

        <p>Isso não pode acontecer.</p>

        <p>Corrigir completamente o sistema de autenticação.</p>

        <p>Verificar:</p>

        <ul>
          <li>Persistência dos usuários no banco de dados.</li>
          <li>Tabela <code>users</code>.</li>
          <li>Configuração das migrations.</li>
          <li>Laravel Breeze.</li>
          <li>Middleware <code>auth</code>.</li>
          <li>Sessões.</li>
          <li>Cookies.</li>
          <li>Configuração do <code>SESSION_DRIVER</code>.</li>
          <li>Configuração do banco de dados.</li>
          <li>Configuração do <code>.env</code>.</li>
        </ul>

        <p>Após criar uma conta uma única vez, o usuário deve conseguir entrar utilizando apenas e-mail e senha, sem precisar realizar um novo cadastro ou uma nova confirmação de e-mail.</p>

        <p>Caso o e-mail já exista, o sistema deve apenas autenticar o usuário.</p>

        <hr />

        <h2>Persistência da sessão</h2>

        <p>Depois do login:</p>

        <ul>
          <li>Manter o usuário autenticado.</li>
          <li>Não desconectar ao trocar de página.</li>
          <li>Não exigir novo cadastro.</li>
          <li>Implementar corretamente a opção "Lembrar-me".</li>
        </ul>

        <hr />

        <h2>Objetivo</h2>

        <p>Entregar um sistema estável onde:</p>

        <ul>
          <li>O cadastro do usuário acontece apenas uma vez.</li>
          <li>O login funciona normalmente com e-mail e senha.</li>
          <li>A sessão permanece ativa até o logout.</li>
          <li>O botão "Gerar PDF" funciona corretamente sem apresentar erros.</li>
          <li>Todos os erros sejam tratados de forma amigável, sem exibir exceções técnicas ao usuário.</li>
        </ul>
      </div>
    </div>
  );
}


