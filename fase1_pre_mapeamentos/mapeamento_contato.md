# Pré-Mapeamento Anatômico: Página de Contato
**Página:** `src/pages/contato.astro`

Este arquivo documenta a estrutura da página de conversão final (Formulário de Contato e Vendas), garantindo que o CMS permita manipular a copy de vendas e as cores de interação sem quebrar as validações ou animações do CSS.

---

## 1. Hero Minimalista (Topo)

**Conteúdo Estático:**
- **Badge Superior:** "Estamos prontos para atendê-lo"
- **Título Parte 1:** "Pronto para levar sua obra ao "
- **Título Destaque (Colorido):** "próximo nível?"
- **Texto Secundário:** "Atendimento humano, consultoria técnica gratuita..."

**Design & Interatividade (Tailwind):**
- Fundo chapado em cor escura da paleta (`bg-slate-950`).
- **Luz Decorativa (Glow de Fundo):** Existe um efeito de iluminação indireta sutil atrás dos textos criado por um gradiente circular com a cor primária translúcida (`radial-gradient(circle_at_center) from-primary via-transparent`). É um efeito de ambientação vital para o design Premium que o CMS deve preservar na estrutura HTML.

---

## 2. Coluna Esquerda: Canais de Atendimento

**Conteúdo Estático:**
- **Título da Coluna:** "Canais de Atendimento" (Formato `italic uppercase`)
- **Lista de 3 Canais Horizontais:**
  - **Sede:** Ícone 📍 | Kicker "Sede Administrativa" | Dados puxados da variável global (`SITE_CONFIG.address`).
  - **Telefone:** Ícone 📞 | Kicker "Telefone e WhatsApp" | Dados globais.
  - **E-mail:** Ícone 📧 | Kicker "E-mail Consultivo" | Dados globais.
- **Card Destaque Logístico (Fundo Escuro):**
  - Título Secundário: "Unidade Logística RJ"
  - Texto Destaque: "Pronto-atendimento em toda a Região Metropolitana..."
  - Ícone de Fundo Gigante: "🏗️"

**Design & Interatividade (Tailwind):**
- **Interação dos 3 Canais (Efeito Horizontal):** A caixa de cada canal (`group`) sofre um aumento leve de escala inteira ao passar o mouse (`hover:scale-105 duration-300`). O quadrado do ícone (emoji), que é cinza-claro, preenche na cor primária e o ícone ganha cor branca brilhante (`group-hover:bg-primary group-hover:text-white transition-colors`).
- **Interação Extrema no Card Logístico:** O card escuro (`bg-slate-950`) possui uma sombra muito pesada (`shadow-2xl`). O Emoji de andaime gigante ("🏗️") fica de fundo quase invisível (`opacity-10`) e, ao colocar o mouse, ele dá um salto gigante e gira contra o próprio eixo rapidamente (`group-hover:scale-125 group-hover:-rotate-12 duration-500`). O CMS precisará ter um campo livre para edição apenas do "Emoji Decorativo".

---

## 3. Coluna Direita: Formulário Premium

**Conteúdo Estático:**
- **Linha Decorativa de Topo:** Cor primária sólida.
- **Campos do Formulário (Labels + Placeholders):**
  1. Label: "Nome do Responsável" | Placeholder: "Ex: Eng. Roberto Santos"
  2. Label: "E-mail Corporativo" | Placeholder: "sucesso@obra.com.br"
  3. Label: "WhatsApp / Telefone" | Placeholder: "(21) 90000-0000"
  4. Label: "O que você precisa?" | Placeholder: "Descreva brevemente o projeto..."
- **Botão Submit:** Texto "Enviar e Receber Cotação" | Ícone Final Foguete 🚀
- **Disclaimer Legal (Rodapé Form):** "Seus dados estão protegidos pela LGPD."

**Design & Interatividade (Tailwind):**
- **Caixa Flutuante:** O formulário inteiro habita uma caixa arredondada enorme (`rounded-[3rem]`) com contorno leve (`border-slate-100`) e sombra pesada (`shadow-2xl`) para se projetar à frente da página.
- **Comportamento dos Inputs (Campos de Digitação):** Ao serem clicados (foco), os campos sofrem uma transição suave onde a borda fica colorida e cria-se um anel (anel de glow) externo translúcido usando a cor primária com 20% de opacidade (`focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all`). É a interatividade mais fina do formulário.
- **Botão Dinâmico:** É robusto (`p-8 text-2xl font-black`), cresce suavemente no hover (`hover:scale-[1.02]`) e afunda sutilmente no clique (`active:scale-[0.98]`).

---
*(Nota de Implementação do CMS: A lógica de HTML/Tailwind do formulário deverá ficar fixa no template front-end, e o Painel Administrativo gerenciará apenas a string (texto) das Labels, do Disclaimer e do Botão.)*
