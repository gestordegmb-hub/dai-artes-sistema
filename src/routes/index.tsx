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
      <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-sm p-8 prose prose-pink max-w-none">
        <h1 className="text-3xl font-bold text-destructive mb-6">CORREÇÃO DEFINITIVA — LOGO DAI ARTES NÃO APARECE NO SISTEMA PUBLICADO</h1>
        
        <p className="lead">Existe um problema crítico com a logo da <strong>Dai Artes</strong>.</p>
        <p>A logo aparece corretamente no <strong>Preview do Lovable</strong>, porém NÃO aparece quando acesso o sistema pelo link publicado.</p>
        
        <p>O problema acontece em:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Tela de Login</li>
          <li>Sidebar/Menu do sistema</li>
          <li>Navbar/área interna</li>
          <li>Qualquer outro local onde a logo seja utilizada</li>
        </ul>

        <div className="bg-destructive/10 border-l-4 border-destructive p-4 my-6 text-destructive-foreground">
          <p className="font-bold uppercase tracking-wide text-xs mb-1 text-destructive">Importante:</p>
          <p className="m-0 text-destructive">Não quero apenas esconder o erro ou adicionar um placeholder. Quero descobrir e corrigir a causa real do problema.</p>
        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. INVESTIGAR A ORIGEM DO PROBLEMA</h2>
        <p>Antes de alterar qualquer código, analise como a logo está sendo carregada atualmente. Verifique:</p>
        <ul className="list-disc pl-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <li>Onde o arquivo da logo está armazenado.</li>
          <li>Qual é o nome e extensão real do arquivo.</li>
          <li>Qual componente está exibindo a logo.</li>
          <li>Qual caminho/URL está sendo utilizado.</li>
          <li>Se o caminho funciona somente no ambiente de Preview.</li>
          <li>Se existe referência a <code>blob:</code> ou <code>localhost</code>.</li>
          <li>Se existe URL temporária do Lovable.</li>
          <li>Se a imagem está dentro de <code>src/assets</code> ou <code>public</code>.</li>
          <li>Se o arquivo está incluído no build de produção.</li>
          <li>Se o caminho é case-sensitive.</li>
        </ul>
        <p className="mt-4 font-semibold text-destructive">NÃO assumir que o problema é apenas CSS.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. CORRIGIR O ARMAZENAMENTO DA LOGO</h2>
        <p>A logo precisa utilizar um arquivo estático permanente que funcione tanto no Preview quanto no sistema publicado.</p>
        <p>Preferencialmente em: <code>public/images/logo-dai-artes.png</code></p>
        <p>Não criar uma imagem genérica. Utilizar a logo real da Dai Artes que já está sendo utilizada no Preview.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. UTILIZAR CAMINHO DE PRODUÇÃO CORRETO</h2>
        <p>O componente da logo deve utilizar uma referência que funcione após o build e deploy. Exemplo: <code>/images/logo-dai-artes.png</code></p>
        <p className="font-semibold text-destructive">NÃO utilizar blob, localhost, caminhos temporários ou URLs internas do Preview.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. VERIFICAR TODOS OS COMPONENTES</h2>
        <p>Localizar todas as ocorrências da logo no projeto (Login, Sidebar, Navbar, Dashboard, Perfil, Configurações, PDF, Impressão). Todos devem utilizar a mesma fonte oficial.</p>
        <p className="mt-2">Criar, se necessário, um componente reutilizável <code>DaiArtesLogo</code> e utilizar esse componente em todo o sistema.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. VERIFICAÇÃO NO BUILD</h2>
        <p>Após a correção, executar o build, confirmar a presença do arquivo no resultado final, garantir que a URL não retorne 404 e que a imagem apareça na versão publicada.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">6-8. PLACEHOLDER, CACHE E RESPONSIVIDADE</h2>
        <p>Não utilizar placeholders. Garantir que o navegador não use referências antigas (cache-busting). A logo deve ser responsiva em Desktop, Tablet e Mobile sem distorção.</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4">9 & 10. PDF, IMPRESSÃO E INTEGRIDADE</h2>
        <p>Verificar a implementação em PDF e impressão. Não modificar desnecessariamente outras funcionalidades (Dashboard, Clientes, Banco de Dados, etc).</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-destructive">11. TESTE FINAL OBRIGATÓRIO</h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Abrir tela de login no Preview e no link publicado.</li>
          <li>Confirmar a logo em ambos.</li>
          <li>Verificar dentro do sistema após o login.</li>
          <li>Testar com <code>Ctrl + F5</code> e janela anônima.</li>
          <li>Garantir que não existe erro 404 no console.</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-12 mb-6 text-center border-t pt-8 text-primary uppercase tracking-widest">Objetivo</h2>
        <p className="text-center italic">Corrigir definitivamente o problema de carregamento da logo oficial da <strong>Dai Artes</strong>, garantindo que o mesmo arquivo seja utilizado de forma permanente e confiável no Preview, build de produção e sistema publicado.</p>
      </div>
    </div>
  );
}
