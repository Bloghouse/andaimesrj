# Pré-Mapeamento Anatômico: Política de Privacidade
**Página:** `src/pages/privacidade.astro`

Por se tratar de uma "Página Legal", o design é utilitário, ou seja, desprovido de animações, hovers cinemáticos ou cores de fundo para privilegiar 100% o tempo de leitura do usuário. 

Este mapeamento aponta a estrutura tipográfica que o CMS precisará renderizar ao inserir o conteúdo da política para não destoar da identidade do site.

---

## Estrutura da Página Legal

**Conteúdo Estático (Layout Base):**
- **Título da Página (H1):** "Política de Privacidade"
- **Corpo do Texto:** Atualmente, os textos estão hardcoded (fixos no HTML), como "A sua privacidade é importante para nós. É política da **Andaime PRO** respeitar a sua privacidade...". 
- *Quando conectarmos o CMS, esse corpo inteiro deverá virar um campo único de "Rich Text" (Texto Rico ou Markdown) para você colar a política fornecida pelo jurídico.*

**Design & Interatividade (Tailwind):**
- **Container Centralizado:** O texto fica restrito a uma largura máxima agradável para a leitura, não encostando nas bordas da tela (`max-w-4xl mx-auto`).
- **Comportamento do Título Principal:** Preto chapado com peso máximo (`font-black text-slate-900 mb-16 leading-tight`).
- **Comportamento do Texto Base:** 
  - Todos os parágrafos são grandes e com espaçamento longo nas entrelinhas para não cansar a visão (`text-lg leading-relaxed text-slate-600`).
  - O recuo entre um parágrafo e outro é gerido automaticamente pelo container pai (`space-y-8`), o que significa que o CMS não precisa se preocupar em colocar margem no final de cada frase; o Tailwind faz isso sozinho.
- **Títulos Secundários (H2):** Se houver subtítulos dentro da política de privacidade (ex: "Coleta de Dados"), a regra estipulada pelo site é peso menor (bold em vez de black), texto preto, e espaçamento diferenciado (mais margem no topo do que no rodapé: `text-2xl font-bold text-slate-900 mt-12 mb-4`).
