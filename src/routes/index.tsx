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
        <h1>Atualização da Categoria de Serviços</h1>

        <p>Na tela <strong>Serviços</strong>, ao clicar em <strong>Novo Serviço</strong>, alterar a lista de categorias disponíveis.</p>

        <h2>Alteração</h2>

        <p>Substituir a categoria:</p>

        <p><strong>Outros</strong></p>

        <p>por</p>

        <p><strong>Papelaria</strong></p>

        <hr />

        <h2>Lista de Categorias Atualizada</h2>

        <p>As categorias devem ficar assim:</p>

        <ul>
          <li>Topo de Bolo</li>
          <li>Caixas Personalizadas</li>
          <li>Convites</li>
          <li>Lembranças</li>
          <li>Adesivos</li>
          <li>Canecas</li>
          <li>Sublimação</li>
          <li>Impressões</li>
          <li><strong>Papelaria</strong></li>
        </ul>

        <p>Remover completamente a categoria <strong>Outros</strong> do sistema.</p>

        <hr />

        <h2>Compatibilidade</h2>

        <p>Caso já existam serviços cadastrados na categoria <strong>Outros</strong>, eles devem ser migrados automaticamente para a categoria <strong>Papelaria</strong>, sem perda de dados.</p>

        <hr />

        <h2>Objetivo</h2>

        <p>Como este sistema foi desenvolvido exclusivamente para a <strong>Dai Artes</strong>, uma empresa especializada em papelaria personalizada, a categoria <strong>Papelaria</strong> representa melhor os serviços oferecidos e deixa o sistema mais organizado e alinhado com o negócio.</p>
      </div>
    </div>
  );
}


