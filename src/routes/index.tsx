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
        <h1 className="text-3xl font-bold text-primary mb-6">Implementar Recuperação e Alteração de Senha</h1>
        
        <p className="lead">Adicionar ao sistema de autenticação da <strong>Dai Artes</strong> um sistema completo e seguro de recuperação e alteração de senha.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Esqueci minha senha</h2>
        <p>Na tela de login, adicionar abaixo do campo de senha:</p>
        <p><strong>Esqueci minha senha</strong></p>
        <p>Ao clicar, abrir uma página:</p>
        <h3 className="text-xl font-medium mt-4">Recuperar senha</h3>
        <blockquote className="border-l-4 border-pink-200 pl-4 italic my-4">
          Digite o e-mail cadastrado na sua conta. Enviaremos um link para você criar uma nova senha.
        </blockquote>
        <p>Campo: <strong>E-mail</strong></p>
        <p>Botão: <strong>Enviar link de recuperação</strong></p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Envio do e-mail</h2>
        <p>Utilizar o sistema nativo de recuperação de senha do Laravel.</p>
        <p>Não criar uma nova conta.</p>
        <p>O sistema deve:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Verificar se o e-mail existe na tabela <code>users</code>.</li>
          <li>Gerar um token seguro e temporário.</li>
          <li>Enviar o link de recuperação para o e-mail cadastrado.</li>
          <li>O link deve expirar após um período seguro.</li>
          <li>O token deve ser de uso único.</li>
          <li>Nunca enviar ou exibir a senha atual do usuário.</li>
        </ol>
        <p className="mt-4">Utilizar o mecanismo padrão de Password Reset do Laravel sempre que possível.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. E-mail de recuperação</h2>
        <p>Criar um e-mail profissional com a identidade visual da Dai Artes.</p>
        <p>Assunto: <strong>Redefinição de senha - Dai Artes</strong></p>
        <blockquote className="border-l-4 border-pink-200 pl-4 italic my-4">
          Olá!<br /><br />
          Recebemos uma solicitação para redefinir a senha da sua conta no sistema Dai Artes.<br /><br />
          Clique no botão abaixo para criar uma nova senha.<br /><br />
          <strong>Redefinir minha senha</strong><br /><br />
          Se você não solicitou essa alteração, pode ignorar este e-mail.<br /><br />
          Dai Artes - Papelaria Personalizada
        </blockquote>
        <p>O botão deve abrir a página segura de redefinição de senha.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Página de redefinição</h2>
        <p>Depois de clicar no link recebido por e-mail, abrir:</p>
        <h3 className="text-xl font-medium mt-4">Criar nova senha</h3>
        <p>Campos: <strong>Nova senha</strong>, <strong>Confirmar nova senha</strong></p>
        <p>Botão: <strong>Redefinir senha</strong></p>
        <p>Validar:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Senha obrigatória.</li>
          <li>Senha com no mínimo 8 caracteres.</li>
          <li>Confirmação deve ser igual à nova senha.</li>
          <li>Token válido.</li>
          <li>Token não expirado.</li>
          <li>E-mail correspondente ao token.</li>
        </ul>
        <p className="mt-4">Após redefinir: <em>Senha alterada com sucesso!</em></p>
        <p>Depois disponibilizar o botão: <strong>Voltar para o login</strong></p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Trocar senha dentro do sistema</h2>
        <p>Adicionar no menu: <strong>Perfil</strong></p>
        <p>Dentro da página de perfil:</p>
        <h3 className="text-xl font-medium mt-4">Segurança</h3>
        <p>Campos: <strong>Senha atual</strong>, <strong>Nova senha</strong>, <strong>Confirmar nova senha</strong></p>
        <p>Botão: <strong>Alterar senha</strong></p>
        <p>O sistema deve exigir a senha atual antes de permitir a alteração.</p>
        <p className="mt-4">Após a alteração: <em>Senha alterada com sucesso!</em></p>
        <p>Não desconectar o usuário automaticamente após uma alteração bem-sucedida, a menos que isso seja necessário por segurança.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Segurança</h2>
        <p>Implementar corretamente:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hash seguro das senhas utilizando o mecanismo padrão do Laravel.</li>
          <li>Tokens de recuperação seguros.</li>
          <li>Expiração dos tokens.</li>
          <li>Token de uso único.</li>
          <li>Proteção contra reutilização de tokens.</li>
          <li>Validação server-side.</li>
          <li>Proteção CSRF.</li>
          <li>Rate limiting para solicitações de recuperação.</li>
          <li>Não revelar se determinado e-mail existe ou não no sistema através de mensagens diferentes.</li>
        </ul>
        <p className="mt-4">Na tela "Esqueci minha senha", sempre utilizar uma resposta genérica como:</p>
        <blockquote className="border-l-4 border-pink-200 pl-4 italic my-4">
          Se o e-mail estiver cadastrado, enviaremos um link para recuperação da senha.
        </blockquote>
        <p>Isso evita expor quais e-mails possuem contas no sistema.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Configuração de e-mail</h2>
        <p>Verificar toda a configuração necessária do Laravel para envio de e-mails.</p>
        <p>Não utilizar e-mail fictício ou apenas simular o envio.</p>
        <p>Preparar corretamente:</p>
        <ul className="list-disc pl-6 space-y-1 font-mono text-sm">
          <li>MAIL_MAILER</li>
          <li>MAIL_HOST</li>
          <li>MAIL_PORT</li>
          <li>MAIL_USERNAME</li>
          <li>MAIL_PASSWORD</li>
          <li>MAIL_ENCRYPTION</li>
          <li>MAIL_FROM_ADDRESS</li>
          <li>MAIL_FROM_NAME</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">As credenciais devem permanecer no .env e nunca serem expostas no código ou na interface.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Verificar o problema atual de autenticação</h2>
        <p>Antes de implementar a recuperação de senha, corrigir o problema existente no sistema em que o usuário precisa criar uma conta novamente toda vez que acessa.</p>
        <p>Verificar:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Persistência da tabela <code>users</code>.</li>
          <li>Conexão com o banco de dados.</li>
          <li>Autenticação Laravel.</li>
          <li>Sessões, Cookies, SESSION_DRIVER, SESSION_DOMAIN.</li>
          <li>Middleware auth.</li>
          <li>Laravel Breeze ou sistema de autenticação atualmente utilizado.</li>
          <li>Persistência do usuário após logout/login.</li>
          <li>Configuração de produção/deploy.</li>
        </ul>
        <p className="mt-4">O cadastro de usuário deve acontecer apenas uma vez.</p>
        <p>Depois disso: <strong>Cadastrar → confirmar e-mail → fazer login normalmente</strong></p>
        <p>Não exigir novo cadastro a cada acesso.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Não quebrar funcionalidades existentes</h2>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 text-amber-900">
          <p className="font-bold">IMPORTANTE:</p>
          <p>Não modificar desnecessariamente nenhuma outra funcionalidade do sistema (Dashboard, Orçamentos, Clientes, Serviços, PDF, WhatsApp, Status, Identidade Visual, Layout).</p>
        </div>
        <p>Apenas integrar e corrigir o sistema de autenticação e adicionar as funcionalidades de recuperação e alteração de senha.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Testes obrigatórios</h2>
        <p>Depois da implementação, testar o fluxo completo: Criar conta, sair, entrar novamente, esqueci senha, recuperação, link e-mail, nova senha, login com nova senha, perfil segurança alteração senha.</p>
        <p className="mt-4 font-bold">Resultado esperado:</p>
        <p>Todas as funcionalidades devem funcionar sem criar usuários duplicados e sem perder a sessão.</p>

        <h2 className="text-2xl font-semibold mt-12 mb-6 text-center border-t pt-8">Objetivo final</h2>
        <p className="text-center italic">Entregar um sistema de autenticação profissional, persistente e seguro para a Dai Artes, com login funcionando corretamente, recuperação de senha por e-mail e alteração de senha dentro do painel administrativo.</p>
      </div>
    </div>
  );
}
