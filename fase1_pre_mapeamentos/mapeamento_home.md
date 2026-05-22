# Pré-Mapeamento Anatômico: Página Inicial (Home)
**Página:** `src/pages/index.astro`

Este documento lista minuciosamente todos os elementos que compõem a Home Page, separando o conteúdo bruto (textos e mídias) da camada de interatividade (animações, hovers, cores). O objetivo é garantir que o painel CMS permita o controle total sobre ambos.

---

## 1. Hero Section (Bloco de Topo)

**Conteúdo Estático:**
- **Imagem de Fundo:** URL fixa da imagem de uma obra (Unsplash).
- **Badge (Etiqueta superior):** "🏗️ Locação de Andaimes no Rio de Janeiro"
- **Título Parte 1 (Branco):** "Segurança Absoluta \n para atingir o "
- **Título Parte 2 (Colorido):** "Topo do Projeto"
- **Subtítulo:** "Sua obra no RJ merece equipamentos certificados NR-18..."
- **Botão Primário (Orçamento):** Texto "Solicitar Orçamento Agora". O link puxa o WhatsApp Global do sistema.
- **Botão Secundário:** Texto "Ver Equipamentos" com link para `/servicos`.

**Design & Interatividade (Tailwind):**
- O fundo possui um overlay: Gradiente escuro (`from-slate-950 via-slate-950/80`) misturado com a imagem em 30% de opacidade (`opacity-30`).
- Título principal possui classe `italic`. A parte colorida do título é forçada a pular linha no mobile e ficar na mesma linha no desktop (`block md:inline`).
- O Badge usa borda de 30% da cor primária (`border-primary/30`).
- **Animação nos Botões:** Ambos sobem ao passar o mouse (`hover:scale-105`) e "afundam" no clique (`active:scale-95`). O primário tem sombra colorida (`shadow-primary/30`). O botão secundário possui efeito vidro transparente que preenche na cor branca ao passar o mouse (`hover:bg-white hover:text-secondary backdrop-blur-sm`).

---

## 2. Diferenciais (4 Cards)

**Conteúdo Estático:**
1. ⚡ **Título:** Entrega em 2h | **Texto:** Logística própria ultra-rápida...
2. 🛡️ **Título:** NR-18 Certificada | **Texto:** Equipamentos rigorosamente revisados...
3. 💰 **Título:** Preço Justo | **Texto:** Condições agressivas para locações...
4. 📞 **Título:** Plantão 24h | **Texto:** Equipe técnica pronta para orientar...

**Design & Interatividade (Tailwind):**
- **Efeito Hover no Card:** Quando o mouse passa por cima do card inteiro (classe `group`), a borda muda para cor primária e o card salta na tela (`hover:border-primary hover:scale-105 transition-all`).
- **Animação do Ícone:** A magia está no ícone: ao passar o mouse *no card*, o ícone rotaciona levemente em 12 graus (`group-hover:rotate-12 transition-transform`). O CMS precisará de um toggle (ligar/desligar animação de rotação do ícone).

---

## 3. Sobre a Empresa

**Conteúdo Estático:**
- **Imagem Principal:** Foto quadrada do canteiro de obras (Unsplash).
- **Badge Flutuante:** Número ("15+") e Texto ("ANOS NO MERCADO").
- **Título Parte 1:** "Especialistas em"
- **Título Parte 2 (Cor Primária):** "Segurança"
- **Título Parte 3:** "e Performance"
- **Texto:** "Desde 2009, somos o alicerce de grandes construções..."
- **Botão Seta:** Texto "Conheça nossa História".

**Design & Interatividade (Tailwind):**
- **Efeito Imagem Base:** Ao passar o mouse, a imagem inteira rotaciona inversamente -2 graus (`group-hover:-rotate-2 duration-500`).
- **Animação Contínua (Badge):** O quadradão de "15+ ANOS" flutua para cima e para baixo infinitamente usando uma animação customizada do arquivo global CSS (`animate-bounce-slow`).
- **Efeito Link-Seta:** A palavra se distancia da seta quando hover (`hover:gap-6`), e a seta em si se desloca para a direita (`group-hover:translate-x-2`).

---

## 4. Equipamentos (Cards de Serviços)

**Conteúdo Estático:**
- **Cabeçalho Título:** "Equipamentos de Ponta"
- **Cabeçalho Subtítulo:** "Soluções completas para acesso..."
- **Botão Superior:** "Ver Catálogo Completo"
- *Lista de Cards:* Títulos, Ícones e Textos são puxados dinamicamente da Coleção de Serviços (Astro Content).
- **Label Genérico do Card:** Texto "Detalhes do Produto" + Seta "→"

**Design & Interatividade (Tailwind):**
- **Efeito no Botão Superior:** Cor base `bg-slate-950` com efeito 3D no clique (`active:scale-95`).
- **Efeito Master nos Cards:** Efeito de Zoom pesado com sombra forte (`hover:scale-[1.03] hover:shadow-2xl`).
- **Animação Interna do Ícone:** Ao passar o mouse no card, a caixa do ícone que era branca passa a ser da cor primária, e o ícone (SVG) que era colorido fica branco puro (`group-hover:bg-primary group-hover:text-white transition-colors`).
- **Animação da Seta Interna:** O espaço entre a palavra "Detalhes" e a "Seta" aumenta dinamicamente ao passar o mouse no card (`group-hover:gap-4`).

---

## 5. Depoimentos (Quem Confia)

**Conteúdo Estático:**
- **Título Central:** "Quem Confia" (Toda na cor primária `text-primary`).
- **Subtítulo:** "Parcerias sólidas em cada m² construído." (Formato Itálico).
- **Cards (3 depoimentos genéricos):** Cada um tem a Frase, Nome ("Eng. Ricardo", etc) e a Empresa/Cargo. 

**Design & Interatividade (Tailwind):**
- Fundo escuro base (`bg-slate-950`).
- **Card Translúcido:** Os cards são transparentes em branco (`bg-white/5`) e ganham um preenchimento um pouco mais denso no hover (`hover:bg-white/10`).
- **Efeito de Foco no Texto:** O texto do depoimento começa opaco e ganha branco total brilhante ao passar o mouse no card (`group-hover:text-white transition-colors`).

---

## 6. CTA Final (Rodapé da Home)

**Conteúdo Estático:**
- **Título Parte 1:** "Vamos subir o nível \n da sua"
- **Título Destaque:** "construção?" (Com preenchimento branco invertido).
- **Subtítulo:** "Orçamentos imediatos, entrega rápida..."
- **Botão WhatsApp:** Texto ("Falar Agora no WhatsApp"). Link usa global config. Ícone SVG WhatsApp.
- **Botão Ligação:** O texto puxa do Global Config (telefone). Ícone SVG de Telefone.

**Design & Interatividade (Tailwind):**
- Fundo totalmente preenchido na Cor Primária (`bg-primary`).
- Possui um círculo com Blur Gigante (Efeito de brilho "Glass") escondido no lado direito (`bg-white/10 blur-3xl`).
- **Seleção de Texto:** A palavra em destaque altera a cor do marcador de texto do navegador para Escuro (`selection:bg-slate-900 selection:text-white`).
- **Efeito Ícone WhatsApp:** O ícone do Whatsapp fica na cor Primária quando há hover no botão preto (`group-hover:text-primary transition-colors`).
- Ambos os botões possuem escala de ressalto na pressão (`hover:scale-105 active:scale-95`).
