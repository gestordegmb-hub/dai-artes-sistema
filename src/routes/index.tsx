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
        <div className="whitespace-pre-wrap">
          ATENÇÃO: NÃO FAÇA MAIS UMA TENTATIVA GENÉRICA DE CORRIGIR A LOGO.

A logo oficial da Dai Artes aparece corretamente no Preview, porém continua NÃO aparecendo no sistema publicado, inclusive na tela de Login e dentro do painel.

As tentativas anteriores de corrigir o caminho da imagem não resolveram.

QUERO QUE VOCÊ PRIMEIRO DIAGNOSTIQUE A CAUSA REAL DO PROBLEMA E SÓ DEPOIS FAÇA A CORREÇÃO.

==================================================
1. DIAGNÓSTICO OBRIGATÓRIO
==================================================

Analise o projeto inteiro e descubra exatamente:

- De onde a logo está sendo carregada atualmente.
- Qual é o arquivo utilizado.
- Qual é o caminho real desse arquivo.
- Qual URL está sendo gerada pelo navegador.
- Qual componente renderiza a logo.
- Se a logo está vindo de uma URL temporária.
- Se está vindo de um asset local.
- Se está vindo do Supabase Storage.
- Se está vindo de outro serviço de armazenamento.
- Se o arquivo está sendo incluído no build.
- Se existe alguma diferença entre Preview e produção.

NÃO ALTERE O CÓDIGO AINDA.

Primeiro identifique a causa.

==================================================
2. TESTE DE PRODUÇÃO
==================================================

Analise especificamente a versão publicada.

Verifique se a requisição da imagem está retornando:

- 200 OK
- 404 Not Found
- 403 Forbidden
- outro erro

Se a imagem estiver retornando 404, descubra exatamente qual URL está causando o 404.

Se estiver retornando 403, descubra por que o arquivo não pode ser acessado.

Se estiver retornando 200 mas não estiver aparecendo, verificar:

- CSS
- tamanho
- display
- opacity
- visibility
- z-index
- object-fit
- erro de carregamento
- componente React
- renderização condicional

==================================================
3. NÃO PRESUMA QUE É UM PROBLEMA DE CAMINHO
==================================================

Não assumir automaticamente que colocar a imagem em:

/public/images/

vai resolver.

Descubra primeiro onde a logo realmente está armazenada no projeto atual.

==================================================
4. VERIFICAR SUPABASE
==================================================

Se este projeto estiver utilizando Supabase, verificar se a logo está armazenada em algum bucket.

Verificar:

- Nome do bucket.
- Se o bucket é público ou privado.
- URL pública do arquivo.
- Policies de acesso.
- Se a URL funciona fora do Preview.
- Se o arquivo realmente existe no Storage.

Se a logo estiver no Supabase Storage e o bucket for privado, corrigir a estratégia de acesso de forma segura.

NÃO criar uma URL fictícia.

==================================================
5. VERIFICAR ASSETS
==================================================

Se a logo estiver dentro do projeto, verificar se ela está realmente sendo incluída no build de produção.

Não utilizar:

blob:
localhost
URLs temporárias
URLs internas do Preview

==================================================
6. CRIAR UM COMPONENTE ÚNICO PARA A LOGO
==================================================

Depois de identificar e corrigir a origem do problema, criar um componente reutilizável:

DaiArtesLogo

Esse componente deve ser utilizado em:

- Tela de Login
- Sidebar
- Navbar
- Dashboard
- Perfil
- Configurações
- Outras áreas que exibem a logo

Evitar que cada página tenha uma implementação diferente.

==================================================
7. IMPORTANTE — NÃO SUBSTITUIR A LOGO
==================================================

NÃO utilizar:

- texto "Dai Artes"
- ícone genérico
- placeholder
- logo criada automaticamente
- emoji
- imagem temporária

Utilizar a LOGO REAL da Dai Artes que já está sendo usada no projeto.

==================================================
8. TESTE DEFINITIVO
==================================================

Depois da correção:

1. Fazer build de produção.
2. Publicar/deployar.
3. Abrir o link público.
4. Abrir a tela de Login.
5. Confirmar que a logo aparece.
6. Fazer login.
7. Confirmar que a logo aparece dentro do sistema.
8. Atualizar com Ctrl + F5.
9. Testar em janela anônima.
10. Verificar se a imagem não apresenta erro 404/403.
11. Confirmar que a imagem continua funcionando depois de recarregar a página.

==================================================
9. RELATÓRIO ANTES DE FINALIZAR
==================================================

Depois de investigar, informe claramente:

CAUSA DO PROBLEMA:
[explicar exatamente]

LOCAL DA LOGO:
[informar onde está armazenada]

URL/CAMINHO UTILIZADO:
[informar]

PROBLEMA ENCONTRADO:
[informar]

CORREÇÃO REALIZADA:
[informar]

TESTE EM PRODUÇÃO:
[confirmar se funcionou]

NÃO CONSIDERE A TAREFA CONCLUÍDA SE A LOGO FUNCIONAR SOMENTE NO PREVIEW.

==================================================
10. NÃO ALTERAR OUTRAS FUNCIONALIDADES
==================================================

Não modificar:

- Login
- Recuperação de senha
- Administração
- Dashboard
- Clientes
- Serviços
- Orçamentos
- Status
- WhatsApp
- PDF
- Relatórios

Apenas diagnosticar e corrigir definitivamente o problema da logo.
        </div>
      </div>
    </div>
  );
}
