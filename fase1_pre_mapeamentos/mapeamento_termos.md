# Pré-Mapeamento Anatômico: Termos de Uso
**Página:** `src/pages/termos.astro`

Assim como a Política de Privacidade, a página de Termos de Uso possui um layout estrito e funcional para documentos legais. A ausência de elementos cinemáticos no Tailwind tem a função de não distrair o leitor. O mapeamento abaixo visa garantir que o renderizador de Rich Text do CMS não quebre esse design.

---

## Estrutura da Página Legal

**Conteúdo Estático (Layout Base):**
- **Título da Página (H1):** "Termos de Uso"
- **Corpo do Texto:** O corpo está inserido manualmente no HTML e é segmentado por intertítulos:
  - Subtítulo: "1. Termos" | Texto Base...
  - Subtítulo: "2. Uso de Licença" | Texto Base...
  - Subtítulo: "3. Responsabilidades" | Texto Base...
- *O ideal é que toda essa área interna seja convertida em um único campo visual no CMS (Markdown/Editor Rico), permitindo colar um documento do Word direto ali, e o Tailwind fará a "mágica" de dar os espaços e formatos adequados.*

**Design & Interatividade (Tailwind):**
- **Container Limpo:** Restringe a largura horizontal máxima para uma leitura agradável e centraliza na tela (`max-w-4xl mx-auto`).
- **Título Principal (H1):** É um título grande e ultra espesso (`text-4xl md:text-6xl font-black text-slate-900`) com espaçamento de linha travado (`leading-tight`).
- **Comportamento Automático de Parágrafos:** O container mestre aplica um distanciamento vertical entre todos os parágrafos (`space-y-8`), com fonte ligeiramente maior que o normal (`text-lg`) em cor cinza-chumbo (`text-slate-600`) e entrelinhas confortáveis (`leading-relaxed`). 
- **Comportamento dos Subtítulos (H2):** Sempre que houver um subtítulo no documento legal, o Tailwind assegurará um salto duplo de linha no topo (`mt-12`) e pouco no rodapé (`mb-4`), na cor preta e negrito forte (`text-2xl font-bold text-slate-900`). O renderizador do nosso futuro CMS deverá estar configurado para traduzir `## Titulo` do Markdown para esse exato conjunto de classes H2 do Tailwind.
