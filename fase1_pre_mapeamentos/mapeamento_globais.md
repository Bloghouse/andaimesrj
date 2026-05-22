# Pré-Mapeamento Anatômico: Componentes Globais & Cores
**Módulo:** Header, Footer, Botão Flutuante e Arquitetura de Cores.

Estes componentes formam a casca (o "Shell") do site. Eles aparecem em absolutamente todas as páginas e garantem a unidade visual. O grande trunfo aqui é como a paleta de cores é controlada globalmente.

---

## 1. Arquitetura de Cores (`tailwind.config.mjs`)

**Como a cor é aplicada hoje:**
A identidade visual do site não é digitada em cada página. Ela é centralizada no arquivo de configuração do Tailwind, gerando as classes que vimos nos outros mapeamentos (`bg-primary`, `text-secondary`).
```javascript
colors: {
  primary: '#fa4a15ff', // Laranja Andaime (Botões principais, destaques)
  secondary: '#1E3A8A', // Azul Escuro Corporativo (Textos alternativos)
  accent: '#000000',    // Preto absoluto
}
```
**Como faremos no CMS:** 
Nós deveremos criar um Painel de "Identidade Visual". Quando você trocar a Cor Primária via Painel, nosso script no momento do "Salvar" irá injetar/alterar o valor hexadecimal dentro desse `tailwind.config.mjs`. Como resultado, **todo o site** (centenas de botões, barras de hover e ícones espalhados pelas páginas) mudará de cor automaticamente no mesmo instante.

---

## 2. O Cabeçalho (`Header.astro`)

**Conteúdo Estático:**
- Logomarca da Empresa (`/images/logo.png`).
- 4 Links de navegação base (Início, Serviços, Blog, Sobre).
- Botão "Falar com Consultor" apontando para a página de contato.

**Design & Interatividade (Tailwind):**
- **Navegação Fixa:** O cabeçalho fica preso no teto ao rolar a página (`fixed top-0`), mas usa um fundo de vidro levemente translúcido (`bg-white/95 backdrop-blur-md`).
- **Logo Híbrida:** A logo original sofre a aplicação de um filtro do CSS (`mix-blend-multiply`) que retira eventuais fundos brancos.
- **Drawer Mobile (A Gaveta Indestrutível):** 
  - Ao invés de um menu que só estica pra baixo, você programou uma gaveta preta separada (`bg-[#020617]`) que toma 100% da tela no celular e fica acima de tudo (`z-[9999]`). 
  - No celular, a logo vira obrigatoriamente branca, não importa a cor original dela, graças a um truque de filtro fotográfico genial no código: `brightness-0 invert`.
  - A gaveta abre deslizando da lateral direita com uma transição suave de 500ms (`translate-x-full transition-transform duration-500`).

---

## 3. O Rodapé (`Footer.astro`)

**Conteúdo Estático:**
- Logomarca em versão Branca (invertida via filtro de CSS como no mobile).
- Texto Descritivo: "A maior autoridade em locação..."
- Coluna "Navegação" com 4 links.
- Coluna "Contato" puxando Telefone, E-mail e Endereço globalmente.
- Textos inferiores de Direitos Autorais e Páginas Legais.

**Design & Interatividade (Tailwind):**
- Fundo escuro total (`bg-slate-950`).
- **Efeito Visual do Link:** Quando o mouse passa em cima de um link no rodapé, uma bolinha laranja (primária) surge do nada ao lado da palavra. Essa mágica acontece porque a bolinha existe invisível (`opacity-0`) e ganha opacidade 100% no hover do grupo (`group-hover:opacity-100 transition-opacity`). Isso precisará ser mantido ileso pelo CMS.

---

## 4. O Botão Flutuante (`WhatsAppBtn.astro`)

**Conteúdo Estático:**
- Balão Flutuante (Tooltip): Texto "Fale Conosco".
- Ícone SVG do WhatsApp e o link do telefone puxado da base de dados.

**Design & Interatividade (Tailwind):**
- Preso no canto inferior direito, na camada mais alta acima de tudo (`z-[9999]`).
- O botão não usa a "Cor Primária" do site, ele tem sua própria cor da marca WhatsApp travada em código (`bg-[#25D366]`). O CMS deve preservar essa paleta isolada.
- **Camada Tripla de Animação (Perfeito para conversão):**
  1. **Subtle Bounce:** O botão flutua no ar eternamente, subindo e descendo 5 pixels através da sua keyframe customizada (`animate-bounce-subtle`).
  2. **Anel de Radar:** Há um círculo embaixo do botão que pulsa eternamente (efeito sonar) com 25% de opacidade da cor do Zap (`animate-ping opacity-25`).
  3. **Tooltip Animado:** O texto "Fale Conosco" é invisível. Ao repousar o mouse no ícone, o texto ganha opacidade instantânea.
