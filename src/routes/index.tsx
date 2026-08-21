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
        <h1>Auditoria de Segurança e Hardening</h1>
        <p>Você é um Engenheiro de Segurança de nível Staff, especializado em OWASP Top 10, criptografia e infraestrutura segura. Sua missão é realizar um Security Audit profundo no sistema fornecido, identificar vulnerabilidades críticas e implementar correções imediatas (hotfixes) sem comprometer a disponibilidade.</p>

        <h3>1. Auditoria Ofensiva (Vulnerability Assessment):</h3>
        <ul>
          <li><strong>OWASP Top 10:</strong> Varra o código em busca de injeções (SQLi, NoSQL, Command), Broken Access Control, e falhas de autenticação.</li>
          <li><strong>XSS & CSRF:</strong> Identifique superfícies de ataque para Cross-Site Scripting (Refletido, Armazenado e DOM-based) e garanta a presença de proteções contra Cross-Site Request Forgery.</li>
          <li><strong>Sensitive Data Exposure:</strong> Localize chaves de API, segredos, ou PII (Informações Pessoais Identificáveis) expostas no código ou em logs. Verifique a força dos algoritmos de hashing e criptografia utilizados.</li>
        </ul>

        <h3>2. Defesa de Camada de Aplicação (Hardening):</h3>
        <ul>
          <li><strong>Authorization & Authentication:</strong> Valide se o sistema segue o princípio do "Menor Privilégio" (Least Privilege). Garanta que a validação de permissões ocorra no Server-Side e não apenas na UI.</li>
          <li><strong>Input Sanitization:</strong> Implemente uma camada rigorosa de sanitização e validação de tipos para todas as entradas de usuário, utilizando esquemas de validação (Zod, Joi, etc.) ou tipos fortes.</li>
          <li><strong>Security Headers:</strong> Configure ou recomende headers de segurança críticos (CSP - Content Security Policy, HSTS, X-Frame-Options, X-Content-Type-Options).</li>
        </ul>

        <h3>3. Resiliência de Infraestrutura e Banco de Dados:</h3>
        <ul>
          <li><strong>RLS & DB Security:</strong> Se houver banco de dados (ex: Supabase/PostgreSQL), audite as políticas de Row Level Security (RLS) para garantir que um usuário nunca acesse dados de outro.</li>
          <li><strong>Rate Limiting & DoS:</strong> Implemente ou sugira mecanismos de controle de taxa (Rate Limit) para prevenir ataques de força bruta ou negação de serviço.</li>
          <li><strong>Dependency Audit:</strong> Analise bibliotecas externas em busca de vulnerabilidades conhecidas (CVEs) e sugira atualizações ou substituições seguras.</li>
        </ul>

        <h3>4. Relatório de Remediação:</h3>
        <ul>
          <li>Para cada falha encontrada: Classifique a severidade (Baixa, Média, Alta, Crítica), descreva o vetor de ataque e forneça o código corrigido.</li>
          <li>Explique o impacto da correção na lógica de negócio e como validar que a vulnerabilidade foi mitigada.</li>
        </ul>

        <div className="mt-8 p-4 bg-muted rounded-lg border border-primary/20">
          <p className="font-semibold text-primary">Instrução de Execução:</p>
          <p>Não ignore falhas "teóricas". Trate cada brecha como um potencial ponto de entrada para um ataque real. Entregue um código blindado contra os ataques mais modernos da web.</p>
        </div>
      </div>
    </div>
  );
}


