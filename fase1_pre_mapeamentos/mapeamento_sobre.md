# Pré-Mapeamento Anatômico: Sobre Nós
**Página:** `src/pages/sobre.astro`

Este arquivo documenta as variáveis de texto e as complexas lógicas de design/Tailwind presentes na página institucional, para mapeamento no banco de dados do CMS.

---

## 1. Hero Institucional (Topo)

**Conteúdo Estático:**
- **Badge/Kicker Superior:** "Nossa Trajetória"
- **Título Parte 1:** "Construindo as bases do "
- **Título Destaque (Colorido):** "progresso"
- **Título Parte 2:** " desde 2009."
- **Texto Descritivo:** "O que começou como uma pequena operação logística..."

**Design & Interatividade (Tailwind):**
- Fundo escuro absoluto (`bg-slate-950`).
- **Grafismo Geométrico:** No canto inferior direito, há uma forma invisível decorativa (um polígono inclinado com a classe `-skew-x-12 translate-x-32` e cor de fundo usando 5% da cor primária `bg-primary/5`). No CMS, poderíamos mapear a visibilidade ou a cor desse elemento decorativo.
- Título principal possui um espaçamento de linha denso e tracking negativo (`leading-[1.1] tracking-tighter`).

---

## 2. Missão, Visão e Valores (Grid 3 Cards)

**Conteúdo Estático:**
1. **Missão:** Ícone 🎯 | Texto base sobre segurança.
2. **Visão:** Ícone 👁️ | Texto base sobre liderança.
3. **Valores:** Ícone 💎 | Texto base sobre compromisso.

**Design & Interatividade (Tailwind):**
- Fundo da seção branco.
- **Efeito Master nos Cards:** Cor `bg-slate-50`. Ao passar o mouse, a borda muda, o card inteiro cresce suavemente e ganha uma sombra ampla (`hover:border-primary hover:scale-105 shadow-xl shadow-slate-200/50`).
- **Comportamento do Ícone (Topo do Card):** A caixa do ícone nasce escura (`bg-slate-950 text-white`) e transiciona para a cor Primária no hover do card (`group-hover:bg-primary transition-colors`).

---

## 3. Segurança NR-18 (Conteúdo + Checkmarks)

**Conteúdo Estático:**
- **Título Parte 1:** "Segurança"
- **Título Destaque (Colorido):** "NR-18"
- **Título Parte 2:** "no DNA"
- **Parágrafo Introdutório:** "Não apenas seguimos as normas..."
- **Tópicos da Lista (Bullet Points):** 3 itens (Manutenção, Certificação, Consultoria) com o caractere especial "✓".
- **Imagem Ilustrativa:** URL da imagem de inspeção (Unsplash).

**Design & Interatividade (Tailwind):**
- **Efeito de Interação na Lista (Checkmarks):** Ao passar o mouse na linha de texto do tópico (classe `group`), apenas o círculo com a letra "✓" sofre zoom, destacando a leitura (`group-hover:scale-110 shadow-lg shadow-primary/20`).
- **Efeito Cinemático na Imagem:** 
  - A imagem fica num container arredondado máximo (`rounded-[3rem]`) com formato widescreen (`aspect-video`).
  - No estado neutro, a imagem possui uma película levemente escurecida por cima (`bg-slate-950/20`).
  - No hover, a imagem cresce em slow motion (transição muito lenta de 700ms `group-hover:scale-110 duration-700`) e a "película/overlay" escura desaparece, revelando o brilho total da foto (`group-hover:bg-transparent`). O CMS deve prever essas propriedades na aba de Design da Seção.

---

## 4. Elite Técnica (Nossa Equipe)

**Conteúdo Estático:**
- **Título Central:** "Elite Técnica"
- **Subtítulo:** "Nossa equipe não é formada apenas por vendedores..."
- **Grade 4 Integrantes/Áreas:**
  - Área 1: Foto | Título: "ENGENHARIA"
  - Área 2: Foto | Título: "LOGÍSTICA"
  - Área 3: Foto | Título: "SUPORTE TÉCNICO"
  - Área 4: Foto | Título: "COMERCIAL"

**Design & Interatividade (Tailwind):**
- **Efeito Fotográfico (Grayscale):** As imagens da equipe nascem originalmente "Preto e Branco" por causa da classe `grayscale` (filtro fotográfico do Tailwind).
- **Interação de Cor:** Ao passar o mouse, o filtro grayscale é zerado instantaneamente (`group-hover:grayscale-0 transition-all`), colorindo a foto e trazendo o card para a frente com um leve zoom (`group-hover:scale-105`) e sombra colorida `group-hover:shadow-primary/10`. Este é um efeito visual crucial que deve ser preservado/mapeado no JSON final.
