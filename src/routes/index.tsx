import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RootIndex,
});

function RootIndex() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-sm p-8 prose prose-pink max-w-none">
        <p>Corrigir o problema para que as imagens da logo apareçam corretamente no site normal após a publicação.</p>
      </div>
    </div>
  );
}
