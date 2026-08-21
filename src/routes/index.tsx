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
        <h1>Correção da Logo da Dai Artes na Versão Publicada</h1>

        <p>Existe um problema na aplicação.</p>

        <p>No ambiente de <strong>Preview</strong> a logo da Dai Artes aparece normalmente.</p>

        <p>Porém, ao acessar o sistema pelo link público (Deploy), a logo não é exibida.</p>

        <p>Corrigir esse problema.</p>

        <h2>Verificar</h2>

        <ul>
          <li>O caminho (URL) da imagem da logo.</li>
          <li>Se a imagem está sendo salva na pasta pública correta.</li>
          <li>Se a imagem está sendo incluída no processo de build.</li>
          <li>Se existe diferença entre Preview e Deploy.</li>
          <li>Se o componente da logo está utilizando caminhos temporários (<code>blob:</code>, <code>localhost</code> ou URLs de preview).</li>
        </ul>

        <h2>Implementação</h2>

        <p>A logo deve ser carregada através de um caminho permanente e público.</p>

        <p>Caso seja utilizada uma pasta de assets, garantir que ela esteja disponível após o deploy.</p>

        <p>Se a logo estiver armazenada no banco de dados, verificar se a URL gerada é válida também na versão publicada.</p>

        <h2>Responsividade</h2>

        <p>A logo deve aparecer corretamente em:</p>

        <ul>
          <li>Tela de Login</li>
          <li>Sidebar</li>
          <li>Navbar</li>
          <li>PDF (quando existir)</li>
          <li>Impressão</li>
          <li>Todas as páginas do sistema</li>
        </ul>

        <h2>Tratamento de Erros</h2>

        <p>Caso a imagem não seja encontrada, exibir automaticamente uma logo padrão (placeholder) em vez de deixar um espaço vazio ou uma imagem quebrada.</p>

        <h2>Objetivo</h2>

        <p>Garantir que a identidade visual da Dai Artes seja exibida corretamente tanto no Preview quanto na versão publicada, utilizando uma URL permanente e válida após o deploy.</p>
      </div>
    </div>
  );
}


