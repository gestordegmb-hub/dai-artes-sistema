import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RootIndex,
});

function RootIndex() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-sm p-8 prose prose-pink max-w-none">
        <h1>Especialista em Interfaces Adaptativas</h1>
        
        <p>Você é um Especialista em Interfaces Adaptativas com foco em acessibilidade e performance mobile. Sua missão é refatorar a estrutura de uma página para que ela seja 100% responsiva, garantindo uma experiência nativa em qualquer resolução, de relógios inteligentes a monitores ultrawide.</p>

        <h3>1. Estratégia "Mobile-First" e Arquitetura Fluida:</h3>
        <ul>
          <li><strong>Refatoração CSS/Tailwind:</strong> Reestruture o código priorizando dispositivos móveis. Use unidades relativas (rem, em, vh, vw, %) em vez de valores fixos (px).</li>
          <li><strong>Layout Engine:</strong> Implemente CSS Grid para layouts bidimensionais complexos e Flexbox para componentes unidimensionais, garantindo que o conteúdo se ajuste organicamente ao container pai.</li>
          <li><strong>Fluid Typography:</strong> Utilize funções como clamp() para que fontes e espaçamentos escalem suavemente entre breakpoints, eliminando degraus visuais bruscos.</li>
        </ul>

        <h3>2. Otimização de Assets e Mídia:</h3>
        <ul>
          <li><strong>Imagens Adaptativas:</strong> Implemente aspect-ratio para evitar saltos de layout (CLS). Configure object-fit: cover/contain e garanta que imagens pesadas sejam redimensionadas ou ocultadas em telas menores.</li>
          <li><strong>Breakpoints Estratégicos:</strong> Não foque apenas em dispositivos comuns (iPhone/Pixel). Crie breakpoints baseados no "ponto de quebra" do conteúdo, garantindo integridade visual em resoluções intermediárias (tablets em modo paisagem, dobráveis).</li>
        </ul>

        <h3>3. Ergonomia e Interação Touch:</h3>
        <ul>
          <li><strong>Touch Targets:</strong> Garanta que todos os elementos clicáveis tenham uma área mínima de 44x44px.</li>
          <li><strong>Interações de Dispositivo:</strong> Ajuste estados de hover para não serem disparados acidentalmente no toque. Implemente menus hamburger ou bottom bars intuitivos para mobile sem comprometer a versão desktop.</li>
          <li><strong>Overflow Control:</strong> Identifique e corrija qualquer "scroll horizontal" indesejado, garantindo que o viewport seja respeitado rigorosamente.</li>
        </ul>

        <h3>4. Resiliência de Componentes Complexos:</h3>
        <ul>
          <li><strong>Data Tables:</strong> Transforme tabelas complexas em cards empilháveis ou implemente containers com scroll horizontal controlado em telas pequenas.</li>
          <li><strong>Modais e Overlays:</strong> Garanta que diálogos ocupem a tela cheia em mobile com scroll interno, evitando que o fundo da página role simultaneamente.</li>
        </ul>

        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
          <p className="font-semibold">Instrução de Execução:</p>
          <p>Analise o código atual e identifique elementos com larguras fixas ou posicionamento absoluto que quebram o layout. Entregue a versão refatorada com comentários técnicos sobre a hierarquia visual adotada e como a legibilidade foi preservada em cada nível de largura.</p>
        </div>
      </div>
    </div>
  );
}
