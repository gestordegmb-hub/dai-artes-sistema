# Dai Artes Flow

Sistema de Gestão de Orçamentos - Dai Artes

Você é um desenvolvedor Full Stack sênior especialista em Laravel, UX/UI, sistemas administrativos e dashboards modernos.

Sua missão é desenvolver um sistema web completo, moderno, responsivo e profissional para uma empresa de papelaria personalizada chamada Dai Artes.

Objetivo

Criar um sistema privado para gerenciamento de orçamentos, onde apenas usuários autorizados podem acessar através de login.

O sistema deve ser extremamente rápido, intuitivo e elegante, facilitando a criação de orçamentos em poucos segundos.

A identidade visual deve seguir a marca da Dai Artes, utilizando tons de rosa, branco e cinza claro, transmitindo delicadeza, organização e profissionalismo.

Tecnologias

Laravel (última versão)

MySQL

Tailwind CSS

Alpine.js

Laravel Breeze (autenticação)

DomPDF

Font Awesome

SweetAlert2

Arquitetura organizada seguindo boas práticas do Laravel.

Layout

Criar uma interface premium.

Menu lateral fixo.

Navbar superior.

Cards modernos.

Ícones minimalistas.

Bordas arredondadas.

Sombras suaves.

Animações discretas.

Tema claro.

Totalmente responsivo.

Login

Criar tela de login com:

Logo da Dai Artes

Email

Senha

Botão Entrar

Esqueci minha senha

Lembrar-me

Somente usuários autenticados podem acessar o sistema.

Dashboard

Após o login exibir:

Cards

Orçamentos de Hoje

Orçamentos do Mês

Valor Total Orçado

Quantidade de Clientes

Quantidade de Serviços

Abaixo exibir:

Últimos orçamentos

Tabela contendo:

Cliente

Valor

Data

Status

Botões:

Visualizar

Editar

Duplicar

PDF

WhatsApp

Excluir

Adicionar gráfico mostrando quantidade de orçamentos por mês.

Menu lateral

Dashboard

Orçamentos

Clientes

Serviços

Relatórios

Configurações

Perfil

Sair

Cadastro de Clientes

Campos

Nome

Telefone (WhatsApp)

Criado em

Atualizado em

Validação:

Nome obrigatório.

Telefone obrigatório.

Aplicar máscara de telefone durante a digitação.

Salvar apenas números no banco para facilitar integração com WhatsApp.

Permitir:

Cadastrar

Editar

Excluir

Pesquisar por nome ou telefone.

Cadastro de Serviços

Cada serviço possui:

Nome

Categoria

Descrição

Preço Base

Status

Categorias exemplo:

Topo de Bolo

Caixas Personalizadas

Convites

Lembranças

Adesivos

Canecas

Sublimação

Impressões

Outros

Permitir alterar preço posteriormente.

Novo Orçamento

Tela principal do sistema.

Fluxo:

Selecionar Cliente

Adicionar Serviço

Quantidade

Valor Unitário

Subtotal automático

Adicionar vários serviços.

Sistema calcula automaticamente:

Subtotal

Desconto

Acréscimo

Total Geral

Tudo em tempo real.

Permitir alterar o valor unitário sem alterar o preço cadastrado do serviço.

Adicionar campo:

Observações

Exemplo:

Prazo de produção

Forma de pagamento

Informações do pedido

Adicionar campo:

Data prevista de entrega.

Preview em Tempo Real

Enquanto o orçamento é criado, mostrar um painel lateral com a visualização do orçamento exatamente como ficará no PDF.

PDF

Criar um PDF moderno.

Cabeçalho:

Logo

Nome da empresa

Dai Artes

Telefone

Instagram

Linha divisória elegante

Tabela contendo:

Serviço

Quantidade

Valor Unitário

Subtotal

Subtotal Geral

Desconto

Acréscimo

Valor Final

Observações

Data

Responsável pelo orçamento

Rodapé:

Obrigado pela preferência.

Será um prazer produzir seus personalizados.

Compartilhar no WhatsApp

Adicionar botão:

Compartilhar

Ao clicar:

Abrir automaticamente uma conversa do WhatsApp utilizando o telefone cadastrado do cliente.

Gerar uma mensagem formatada automaticamente.

Exemplo:

Olá, Maria!

Segue seu orçamento da Dai Artes.

• Topo de Bolo
2 x R$35,00 = R$70,00

• Caixa Milk
20 x R$8,00 = R$160,00

Valor Total:
R$230,00

Prazo:
5 dias úteis.

Muito obrigada pela preferência!

A mensagem deve ser gerada automaticamente.

Histórico

Salvar todos os orçamentos.

Tabela contendo:

Número

Cliente

Valor

Status

Data

Botões:

Visualizar

Editar

Duplicar

PDF

WhatsApp

Excluir

Filtros:

Hoje

Semana

Mês

Ano

Cliente

Status

Página do Cliente

Ao abrir um cliente mostrar:

Nome

Telefone

Quantidade de orçamentos

Valor total orçado

Último orçamento

Botão:

Novo orçamento

Configurações

Permitir alterar:

Logo

Nome da empresa

Telefone

WhatsApp

Instagram

Mensagem padrão do WhatsApp

Rodapé do PDF

PIX

Cidade

Endereço

Prazo padrão

Relatórios

Criar uma área de relatórios contendo:

Quantidade de orçamentos por período

Valor total orçado

Serviços mais vendidos

Clientes que mais solicitaram orçamento

Exportar PDF

Banco de Dados

Criar as tabelas:

users

clients

services

budgets

budget_items

settings

Seguir os relacionamentos corretos do Laravel utilizando Eloquent.

Funcionalidades Extras

Numeração automática dos orçamentos.

Duplicar orçamento.

Pesquisa instantânea.

Paginação.

Ordenação por colunas.

Confirmações utilizando SweetAlert2.

Notificações Toast.

Máscaras de formulário.

Validações completas.

UX

Priorizar velocidade.

Poucos cliques.

Campos grandes.

Botões bem destacados.

Interface agradável.

Evitar telas poluídas.

Criar uma experiência semelhante a sistemas profissionais como Conta Azul, Tiny ERP e Bling, porém adaptada para uma papelaria personalizada.

Código

Seguir Clean Code.

Utilizar Controllers organizados.

Models.

Policies.

Form Requests.

Migrations.

Seeders.

Factories.

Componentes Blade reutilizáveis.

Comentários apenas quando realmente necessários.

Estrutura preparada para futuras funcionalidades.

Objetivo Final

Entregar um sistema premium, elegante, extremamente intuitivo e totalmente responsivo, que permita à Dai Artes criar orçamentos em menos de 1 minuto, gerar PDF profissional, compartilhar automaticamente pelo WhatsApp, gerenciar clientes e serviços e acompanhar seus orçamentos através de um dashboard moderno, deixando a base preparada para evoluir futuramente para um sistema completo de gestão de pedidos, produção, financeiro e estoque.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dai-artes-sistema.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dce95f20-e31b-4a33-9c7f-d22ce2bb8aaf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
