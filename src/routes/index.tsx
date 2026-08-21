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
        <h1>Implementação do Sistema de Status dos Orçamentos</h1>

        <p>Adicionar ao sistema um controle de status dos orçamentos para facilitar o acompanhamento de cada orçamento criado.</p>

        <h2>Status Inicial</h2>

        <p>Sempre que um novo orçamento for criado e salvo, ele deve receber automaticamente o status:</p>

        <p><strong>🟡 Pendente</strong></p>

        <p>Este será o status padrão de todos os novos orçamentos.</p>

        <hr />

        <h2>Mudança Automática de Status</h2>

        <p>Quando qualquer uma das ações abaixo for realizada pela primeira vez:</p>

        <ul>
          <li>Compartilhar no WhatsApp</li>
          <li>Gerar PDF</li>
          <li>Imprimir orçamento</li>
        </ul>

        <p>O sistema deve alterar automaticamente o status do orçamento para:</p>

        <p><strong>🟢 Aprovado</strong></p>

        <p>Essa alteração deve ocorrer automaticamente, sem necessidade de confirmação do usuário.</p>

        <hr />

        <h2>Regras</h2>

        <ul>
          <li>Todo novo orçamento inicia como <strong>Pendente</strong>.</li>
          <li>Após gerar PDF, o status muda para <strong>Aprovado</strong>.</li>
          <li>Após imprimir, o status muda para <strong>Aprovado</strong>.</li>
          <li>Após compartilhar pelo WhatsApp, o status muda para <strong>Aprovado</strong>.</li>
          <li>Se o orçamento já estiver como <strong>Aprovado</strong>, nenhuma alteração adicional deve ser feita.</li>
          <li>Registrar a data e hora em que o status foi alterado.</li>
        </ul>

        <hr />

        <h2>Banco de Dados</h2>

        <p>Adicionar na tabela <code>budgets</code> os seguintes campos:</p>

        <ul>
          <li><code>status</code></li>
          <li><code>status_changed_at</code></li>
        </ul>

        <p>Valor padrão do campo <code>status</code>:</p>

        <pre><code>pending</code></pre>

        <p>Valores permitidos:</p>

        <pre><code>pending
approved</code></pre>

        <hr />

        <h2>Interface</h2>

        <p>Na tabela de orçamentos, exibir um badge colorido indicando o status.</p>

        <h3>Pendente</h3>

        <ul>
          <li>Cor: Amarelo</li>
          <li>Ícone: ⏳</li>
        </ul>

        <p>Texto:</p>

        <p><strong>Pendente</strong></p>

        <h3>Aprovado</h3>

        <ul>
          <li>Cor: Verde</li>
          <li>Ícone: ✔</li>
        </ul>

        <p>Texto:</p>

        <p><strong>Aprovado</strong></p>

        <hr />

        <h2>Dashboard</h2>

        <p>Adicionar dois novos cards:</p>

        <p>🟡 Orçamentos Pendentes</p>

        <p>🟢 Orçamentos Aprovados</p>

        <p>Os números devem ser atualizados automaticamente.</p>

        <hr />

        <h2>Filtros</h2>

        <p>Na página de Orçamentos, adicionar filtro por status:</p>

        <ul>
          <li>Todos</li>
          <li>Pendentes</li>
          <li>Aprovados</li>
        </ul>

        <p>Também permitir pesquisar combinando:</p>

        <ul>
          <li>Cliente</li>
          <li>Data</li>
          <li>Status</li>
        </ul>

        <hr />

        <h2>Histórico</h2>

        <p>Ao visualizar um orçamento, exibir:</p>

        <ul>
          <li>Data de criação</li>
          <li>Status atual</li>
          <li>Data da última alteração de status</li>
          <li>Usuário responsável pelo orçamento</li>
        </ul>

        <hr />

        <h2>Objetivo</h2>

        <p>Criar um fluxo automático e inteligente, onde todos os orçamentos começam como <strong>Pendente</strong> e passam para <strong>Aprovado</strong> assim que forem efetivamente enviados ao cliente (WhatsApp), gerados em PDF ou impressos, permitindo um controle visual simples, profissional e eficiente de todos os orçamentos.</p>
      </div>
    </div>
  );
}


