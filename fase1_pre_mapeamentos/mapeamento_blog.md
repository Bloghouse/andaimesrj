# Pré-Mapeamento Anatômico: Blog (Artigos Técnicos)
**Módulo:** `src/pages/blog/`

O módulo de blog gerencia tanto a "Home do Blog" quanto a leitura de cada "Post". Mapearemos aqui todo o texto hardcoded (fixo) e as classes Tailwind que formam a "casca" onde o texto de Markdown irá nascer.

---

## PARTE 1: A Vitrine de Postagens (`index.astro`)

**Conteúdo Estático (Global do Layout):**
- **Badge/Kicker Superior:** "Conhecimento Técnico"
- **Título Parte 1:** "Conteúdo para uma "
- **Título Destaque (Colorido):** "Obra Segura"
- **Título Parte 2:** "."
- **Subtítulo Descritivo:** "Artigos técnicos, normas atualizadas e as melhores práticas..."
- **Botão Fixo de Leitura:** "Ler Artigo Completo"

**Design & Interatividade (Tailwind):**
- Fundo geral da página é o cinza off-white (`bg-slate-50`).
- **Animação Cinemática do Card:**
  - O container da imagem do post possui proporção de tela de vídeo (`aspect-video`) e uma "película" escura de 20% sobre a foto (`bg-slate-950/20`).
  - Ao passar o mouse sobre o post (Card/Article), a película Some Instantaneamente (`group-hover:bg-transparent`), e a foto sofre um zoom gigantesco em *slow motion* (transição lenta de 700 milissegundos usando `group-hover:scale-110 duration-700`).
- **Interação de Título:** O título do post ganha a cor primária no hover.
- **Interação do Botão Ler:** O texto fixo distancia-se suavemente da Seta Colorida "→" (`group-hover:gap-4`).

---

## PARTE 2: Layout Interno do Artigo (`[slug].astro`)

O esqueleto de leitura tem forte apelo visual no cabeçalho e na call-to-action final (CTA).

### A) Header Escuro (Hero do Post)
- Fundo muito escuro (`bg-slate-900`) e texto branco centralizado.
- **Badge Categoria (Fixo na Página):** "Segurança e Dicas" (Sempre na cor primária `text-primary`). O ideal é que o CMS permita a edição desta Badge fixada ou crie um campo real de "Categoria" para injetar no lugar.
- **Data e Autor:** Prefixado com a *String*: "Por Equipe Andaime PRO • [Data]". O CMS precisa de um input para mapear o "Autor".
- **Grafismo de Fundo:** Existe um overlay gigante e invisível usando 5% da cor primária misturado com opacidade 20% para não deixar o escuro chapado (`bg-primary/5 opacity-20`).

### B) Container de Leitura (Corpo do Artigo)
- Usa Grid 4 Colunas (3 para Texto, 1 para Sidebar).
- **Tipografia Markdown:** Os textos vêm do CMS, mas são "esticados" e ganham cores no Frontend através das regras do plugin `@tailwindcss/typography`. Classes essenciais mapeadas: Títulos escuros pesados (`prose-headings:text-slate-900`), negritos pintados na cor Secundária (`prose-strong:text-secondary`) e imagens forçadas a bordas arredondadas grossas (`prose-img:rounded-3xl`).

### C) Call-to-Action Fixo (Fim da Leitura)
**Conteúdo Estático que o CMS deve gerenciar (Formulário do Layout):**
- Ícone Gigante: "💡"
- Título do CTA: "Leve este conhecimento para sua obra"
- Subtítulo do CTA: "Precisa de equipamentos que sigam todas as normas..."
- Texto do Botão (Link para `/contato`): "Pedir Orçamento Agora →"

**Design:** Fica em uma caixa cinza (`bg-slate-50`) com ícone flutuando no lado esquerdo. O botão de contato sofre um deslocamento horizontal puro (a frase inteira anda para o lado) quando há hover (`hover:translate-x-2`).

### D) Sidebar Sticky (Barra Lateral Direita)
- Fica grudada rolando junto com a tela (`sticky top-32`).
- **Título Estático:** "Posts Relacionados" com um sublinhado espesso usando a borda colorida primária (`border-b-4 border-primary inline-block`).
- Exibe até 2 cards com hover de zoom rápido nas miniaturas das fotos (`group-hover:scale-105`). O Título dos posts relacionados muda para a **Cor Secundária** no hover (`group-hover:text-secondary`), diferente dos demais locais do site que mudam para a primária. Essa particularidade visual deve ser intocada pelo CMS.
