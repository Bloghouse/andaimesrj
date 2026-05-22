# Pré-Mapeamento Anatômico: Catálogo de Equipamentos (Serviços)
**Módulo:** `src/pages/servicos/`

Como "Serviços" é um módulo dinâmico gerenciado por coleções (`content`), este mapeamento cobre 2 arquivos estruturais: A Vitrine de Catálogo (`index.astro`) e o Layout Interno do Equipamento (`[slug].astro`). Precisamos mapear os layouts base, pois os textos brutos das interfaces e os efeitos de *hover* precisam de campos fixos no CMS (Painel de Layouts).

---

## PARTE 1: A Vitrine de Catálogo (`index.astro`)

**Conteúdo Estático (Global do Layout):**
- **Badge/Kicker Superior:** "Nosso Catálogo"
- **Título Parte 1:** "Equipamentos de "
- **Título Destaque (Colorido):** "Ponta"
- **Título Parte 2:** " para sua Segurança."
- **Texto Secundário:** "Soluções certificadas para acesso, escoramento..."
- **Texto Genérico do Link do Card:** "Ver Detalhes do Produto →"

**Design & Interatividade (Tailwind):**
- Fundo leve para o fundo da página (`bg-slate-50`).
- **Efeito Hover no Card do Produto:** O card é branco puro (`bg-white p-12 rounded-[2.5rem]`). Ao passar o mouse sobre o cartão inteiro, ele avança suavemente na escala (`hover:scale-105`) e gera uma sombra profunda (`hover:shadow-2xl`).
- **Comportamentos Internos do Card (Via Group-Hover):**
  - **Ícone:** O fundo da caixa cinza torna-se Primário (`group-hover:bg-primary`) e o desenho SVG que tinha a cor primária torna-se branco brilhante (`group-hover:text-white`).
  - **Título:** O título do produto fica na cor primária (`group-hover:text-primary`).
  - **Seta Animada:** A frase estática afasta-se um pouco da seta direcional, simulando movimento (`group-hover:gap-4 transition-all`).

---

## PARTE 2: Layout Interno do Equipamento (`[slug].astro`)

O layout do produto possui a complexidade visual de um "Manual Técnico/Panfleto" moderno.

### A) Hero Estilo "Print" (Topo)
- **Design Base:** Fundo muito escuro (`bg-slate-950`). Tem uma imagem fixa vinda de um servidor Unsplash atuando como "marca d'água de projeto arquitetônico" no fundo, misturada com uma película gradiente para as bordas não ficarem cruas (`from-slate-950/60 to-slate-950`).
- **Botão Voltar:** Efeito vidro (`bg-white/10 backdrop-blur-md border-white/20`). Fica sólido e claro no hover (`hover:bg-white hover:text-slate-950`). Escala no hover/active (`hover:scale-105 active:scale-95`).
- *(Nota: Títulos e Subtítulos aqui vêm dinamicamente do banco de dados).*

### B) Visão Geral (Coluna Central)
- **Layout Físico:** Sistema de grade 12 colunas, ocupando 8.
- **Cabeçalho Fixo:** Possui um detalhe visual de barra lateral colorida (Pílula com cor primária) ao lado da palavra estática "Visão Geral" (italic).
- O texto dinâmico (Markdown/Astro Content) usa as regras da biblioteca Tipography (`prose prose-xl prose-slate`).

### C) Seções Técnicas Dinâmicas (Características e Ficha Técnica)
Se houver informações preenchidas no BD do CMS, estas seções renderizam.
- **Diferenciais:** Títulos "Diferenciais Técnicos". Os cards de checklist sofrem borda no hover (`hover:border-primary`). O ícone redondo ganha cor cheia no hover e SVG branco.
- **Ficha Técnica:** Título "Ficha Técnica". Usa uma grade rígida. Efeito simples: passar o mouse joga o valor da especificação levemente para a direita (`group-hover:translate-x-1`).

### D) Box de Garantias Estáticas (Fundo da Página Interna)
**Conteúdo Estático que precisará de campos no CMS para gestão de Layout:**
1. Garantia Esquerda: Escudo 🛡️ | Título "Segurança Total" | Texto "Equipamento certificado..."
2. Garantia Direita: Caminhão 🚛 | Título "Entrega Imediata" | Texto "Frota própria disponível..."
- **Design:** O esquerdo é fundo Negro (`bg-slate-950`). O direito tem fundo Cor Primária (`bg-primary`). Ambos possuem hover de escala (`hover:scale-105`) e ícones rodam no eixo em 12 graus no hover (`group-hover:rotate-12`).

### E) Sidebar Sticky (Barra Lateral Fixa de Vendas)
**Conteúdo Estático e Lógicas de Tracking/Estilo:**
- Fica grudada ("Sticky") na tela enquanto o usuário dá scroll para baixo lendo o manual do produto (`lg:sticky lg:top-32`).
- **Linha de Marca:** Possui uma linha decorativa fina na cor primária no topo do Box (`h-2 bg-primary absolute top-0`).
- **Textos Brutos Fixos:** "Central de Negócios", "Interessado neste equipamento?", "WhatsApp Oficial", "Ligar Agora", "Suporte 24h Especializado". Todos esses precisam ser preenchidos no CMS para esse layout base.
- **Design de Botões (Conversão Máxima):**
  - Botão Zap: Escuro e pesado (`bg-slate-950`), gera sombra grande preta no hover.
  - Botão Telefone: Botão Oco ("Fantasma") de borda escura que inverte a cor (preenche tudo) quando o mouse encosta (`hover:bg-slate-950 hover:text-white`).
- Tudo reage como os demais (`hover:scale-105 active:scale-95`).
