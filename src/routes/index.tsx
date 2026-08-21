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
        <h1>Correção da Categoria "Outros"</h1>

        <p>A categoria <strong>"Outros"</strong> ainda continua aparecendo no formulário de criação de serviços.</p>

        <p>Não quero apenas alterar o texto visual. Quero remover completamente essa categoria do sistema.</p>

        <h2>Faça uma busca em todo o projeto</h2>

        <p>Localize onde a lista de categorias está sendo definida, podendo estar em:</p>

        <ul>
          <li>Enum</li>
          <li>Array</li>
          <li>Seeders</li>
          <li>Migration</li>
          <li>Model</li>
          <li>Controller</li>
          <li>Componente React</li>
          <li>Select do formulário</li>
          <li>Constantes</li>
          <li>Banco de dados</li>
        </ul>

        <p>Remova completamente a categoria:</p>

        <p><strong>Outros</strong></p>

        <p>e substitua por:</p>

        <p><strong>Papelaria</strong></p>

        <h2>Resultado esperado</h2>

        <p>A lista de categorias deve ficar exatamente assim:</p>

        <ul>
          <li>Topo de Bolo</li>
          <li>Caixas Personalizadas</li>
          <li>Convites</li>
          <li>Lembranças</li>
          <li>Adesivos</li>
          <li>Canecas</li>
          <li>Sublimação</li>
          <li>Impressões</li>
          <li>Papelaria</li>
        </ul>

        <hr />

        <h2>Banco de dados</h2>

        <p>Se existir algum serviço cadastrado com a categoria <strong>Outros</strong>, executar uma migração ou atualização automática para alterar esses registros para <strong>Papelaria</strong>, preservando todos os dados.</p>

        <hr />

        <h2>Interface</h2>

        <p>Após a alteração:</p>

        <ul>
          <li>O formulário <strong>Novo Serviço</strong> deve exibir apenas <strong>Papelaria</strong>.</li>
          <li>A categoria <strong>Outros</strong> não deve aparecer em nenhum formulário, filtro, tabela ou tela do sistema.</li>
          <li>Todos os filtros, pesquisas e listagens devem reconhecer a nova categoria <strong>Papelaria</strong>.</li>
        </ul>

        <hr />

        <h2>Objetivo</h2>

        <p>Garantir que <strong>Papelaria</strong> substitua completamente <strong>Outros</strong> em toda a aplicação, tanto na interface quanto no banco de dados, eliminando qualquer referência antiga à categoria "Outros".</p>
      </div>
    </div>
  );
}


