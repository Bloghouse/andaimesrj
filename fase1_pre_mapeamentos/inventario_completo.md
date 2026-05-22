# Fase 1: Pré-Mapeamento e Inventário do Site (Esqueleto)

Esta é a listagem cirúrgica de todos os elementos visuais presentes no código-fonte atual do `SITE MENTORIA`. O objetivo deste documento é servirmos de checklist para que, na Fase 2 (criação dos JSONs do CMS), absolutamente nada seja esquecido.

## User Review Required

> [!IMPORTANT]
> Revise este inventário. Passamos um "pente fino" no código fonte. Existe alguma outra página, pop-up oculto, ou seção que você pretendia adicionar e que eu deva incluir neste inventário oficial antes de partirmos para a Fase 2 (Geração do Banco de Dados JSON)?

---

## 1. COMPONENTES GLOBAIS (Presentes em todo o site)

Estes elementos são controlados globalmente (alterou no CMS, muda no site inteiro).

- **Header (Cabeçalho Desktop & Mobile)**
  - Logo (Imagem PNG invertida/normal)
  - Menu Links Desktop (Início, Serviços, Blog, Sobre)
  - Botão de CTA Desktop (Texto + Link)
  - Menu Mobile (Drawer) com estilos e cores próprias
  - CTA WhatsApp dentro do Menu Mobile
  - Texto de "Suporte 24h" + Telefone no rodapé do mobile
- **Footer (Rodapé)**
  - Logo do Rodapé
  - Textos de descrição da empresa
  - Colunas de Links (Navegação, Legal, etc)
  - Textos de Copyright
- **Configurações Globais (Data Base)**
  - Nome da Empresa, Telefone, WhatsApp, E-mail, CEP, Endereço Completo, Links de Redes Sociais.
- **Botão Flutuante (WhatsAppBtn)**
  - Ícone, cor de fundo, mensagem padrão de envio, número do WhatsApp.
- **SEO & Metadados**
  - Título global, Descrição Global, Keywords Globais.

---

## 2. PÁGINA: HOME (`index.astro`)

A principal página de conversão, dividida em 6 blocos estruturais.

*   **Seção 1: Hero Principal (Topo)**
    *   Imagem/Vídeo de fundo escurecido.
    *   Badge de topo (texto: "🏗️ Locação de Andaimes...").
    *   Título H1 dividido em duas partes (Parte Branca + Parte Colorida em destaque).
    *   Subtítulo descritivo.
    *   Botão Primário (Orçamento / Cor Primária).
    *   Botão Secundário (Ver Equipamentos / Borda Branca).
*   **Seção 2: Diferenciais (Grid de 4 Cards)**
    *   Cor de fundo da seção.
    *   Para cada Card: Ícone, Título forte, Texto descritivo.
*   **Seção 3: Sobre Nós (Institucional)**
    *   Imagem principal quadrada.
    *   Selo Flutuante (ex: "15+ ANOS NO MERCADO").
    *   Título com destaque em cor primária ("Segurança e Performance").
    *   Texto descritivo da história.
    *   Link estilo Seta ("Conheça nossa História").
*   **Seção 4: Serviços/Equipamentos**
    *   Título da seção ("Equipamentos de Ponta") e Subtítulo.
    *   Botão geral ("Ver Catálogo Completo").
    *   *Grid Dinâmico:* Os cards aqui vêm puxados da coleção `servicos`, mas a estrutura visual (ícones SVG, textos estáticos do card como "Detalhes do Produto") também devem ser mapeáveis.
*   **Seção 5: Depoimentos (Quem Confia)**
    *   Título e Subtítulo.
    *   Cor das estrelinhas.
    *   Para cada Card: Quantidade de estrelas, Texto do depoimento, Nome do Autor, Cargo/Empresa do autor.
*   **Seção 6: Call To Action Final (Rodapé da Home)**
    *   Grafismo de Fundo.
    *   Título gigante.
    *   Parágrafo descritivo.
    *   Botão WhatsApp (com ícone específico).
    *   Botão Telefone (com ícone específico).

---

## 3. PÁGINA: SOBRE NÓS (`sobre.astro`)

A página de história e autoridade da empresa.

*   **Seção 1: Hero Institucional**
    *   Badge/Kicker ("Nossa Trajetória").
    *   Título Gigante.
    *   Texto descritivo de resumo histórico.
    *   Grafismos de fundo.
*   **Seção 2: Missão, Visão e Valores (Cards)**
    *   Para cada um dos 3 blocos: Ícone/Emoji, Título (ex: Missão), Texto base.
*   **Seção 3: Segurança NR-18 (Diferencial Técnico)**
    *   Título e parágrafo base.
    *   Lista de "Checkmarks" (Bullet points estilizados). Para cada item: ícone, texto.
    *   Imagem de inspeção de segurança.
*   **Seção 4: Elite Técnica (Nossa Equipe)**
    *   Título central ("Elite Técnica") e Subtítulo descritivo.
    *   Grade de 4 áreas (Engenharia, Logística, Suporte, Comercial).
    *   Para cada área: Imagem (com efeito preto e branco) e Título da Área.

---

## 4. PÁGINA: CONTATO (`contato.astro`)

A página para fechamento de orçamentos (Formulário + Infos).

*   **Seção 1: Hero Minimalista**
    *   Badge ("Estamos prontos...").
    *   Título gigante e parágrafo base.
*   **Seção 2: Grid Dividido (Informações vs Formulário)**
    *   **Coluna 1 (Infos de Contato)**:
        *   Título ("Canais de Atendimento").
        *   Bloco Sede: Ícone, Título Sede, Endereço dinâmico.
        *   Bloco Telefone: Ícone, Título, Horário de Atendimento.
        *   Bloco E-mail: Ícone, E-mail, SLA de Resposta.
        *   Caixa de Destaque Logístico ("Unidade Logística RJ" e ícone 🏗️).
    *   **Coluna 2 (Formulário Premium)**:
        *   Rótulos (Labels) dos 4 campos (Nome, E-mail, Telefone, Descrição).
        *   Placeholders dos campos.
        *   Botão de Submit (Texto e Ícone 🚀).
        *   Disclaimer LGPD no rodapé.

---

## 5. PÁGINAS LEGAIS (`privacidade.astro` e `termos.astro`)

*   **Estrutura Padrão Legal**: Título H1 simples, e um corpo de texto longo em Rich Text formatado com Markdown.

---

## 6. SISTEMAS DINÂMICOS (Coleções do Astro)

Para que o site funcione perfeitamente via CMS, estas áreas precisam de atenção especial no Painel.

*   **Blog (`src/pages/blog`)**: Layout de listagem e layout interno (`[slug]`). Textos das interfaces estáticas (como "Leia Mais", "Voltar") precisam de mapeamento global.
*   **Serviços (`src/pages/servicos`)**: Layout de grid e layout interno. Além dos dados do serviço em si (título, foto), os textos da interface estática (como botões de CTA internos de cada serviço).

---

> Próximo Passo: Se este inventário visual de todas as seções cobrir o site por inteiro, me dê a ordem de prosseguir. A próxima fase será desenhar os "JSONs" para as páginas listadas acima (Fase 2).
