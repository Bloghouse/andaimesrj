# Guia Arquitetural da Integração: Astro Frontend + CMS Core

Este documento explica o mecanismo por trás do "Git-Based CMS" e como os esquemas JSON (como o `schema_home.md`) criados na Fase 2 serão vitalizados na Fase 3 para se transformarem em um painel administrativo funcional que atualiza o código estático do Astro.

---

## O Fluxo de Dados: A Ponte de 3 Vias

A integração entre o Painel do CMS e o Site ao vivo obedece a um ciclo rígido de 3 pontas:

1. **O Banco de Dados Físico (JSON no GitHub)**
2. **O Editor (Painel React no CMS Core)**
3. **O Consumidor (Frontend Astro)**

### 1. O Banco de Dados Físico (Repositório)
Ao contrário de CMSs tradicionais como o WordPress (que usam banco de dados SQL baseados em servidor), nossa arquitetura usa arquivos físicos salvos dentro do próprio repositório no GitHub.

Os esquemas JSON que desenhamos não ficam no ar, eles se tornarão arquivos reais. Por exemplo:
- `src/data/pages/home.json`
- `src/data/pages/sobre.json`

Sempre que o usuário alterar algo, este arquivo é sobrescrito no GitHub. O provedor de hospedagem (Vercel) reconhecerá o "Commit" no arquivo e fará um novo deploy automático das páginas estáticas do site (`npm run build`), o que torna o site super seguro e rápido.

---

## 2. O Painel do CMS (A Engrenagem)
O `cms-core` consiste em telas React construídas para permitir a edição humana (sem código). Como o painel entende o que deve exibir? Através do mapeamento.

Para uma chave documentada no JSON, como:
`"enable_icon_rotation_hover": true`

A engrenagem do CMS interpretará e renderizará no painel:
- **Um Componente Toggle (Switch).**
- O usuário ao clicar, mudará o estado de `true` para `false` no componente React do CMS.

Quando o usuário clicar no botão "SALVAR ALTERAÇÕES" do Painel CMS:
1. O CMS junta todos os campos que ele editou num objeto JSON gigante.
2. Faz uma requisição `POST` para a API do GitHub (ex: `api.github.com/repos/user/repo/contents/src/data/pages/home.json`).
3. O GitHub atualiza o arquivo físico com os novos dados.

---

## 3. O Consumidor (O site Astro)
Atualmente, as páginas do projeto `SITE MENTORIA` (como a `index.astro`) são **Hardcoded** (digitadas na unha). Para conectar, a Fase 3 envolverá refatorar a marcação Astro para remover os textos fixos e consumir os JSONs.

**Antes da Integração (Hardcoded):**
```astro
<!-- index.astro atual -->
<div class="differentials-card hover:scale-105 group">
  <div class="group-hover:rotate-12"> ⚡ </div>
  <h3 class="text-2xl">Entrega em 2h</h3>
</div>
```

**Depois da Integração (Dinâmico):**
```astro
---
// index.astro refatorado
import homeData from '../data/pages/home.json';
---

<!-- Um loop renderizará cada Diferencial dinamicamente lendo o array de itens do JSON -->
{homeData.differentials_section.items.map((item) => (
  <div class="differentials-card hover:scale-105 group">
    
    <!-- A regra CSS animada obedece à chave condicional ativada/desativada no CMS -->
    <div class={ homeData.differentials_section.enable_icon_rotation_hover ? "group-hover:rotate-12" : "" }>
      {item.icon_emoji}
    </div>
    
    <h3 class="text-2xl">{item.title}</h3>
    <p>{item.description}</p>
    
  </div>
))}
```

### Por que mapear as "Classes Tailwind"?
Como demonstrado acima, o mapeamento não é apenas sobre os textos "Entrega em 2h". Se não tivéssemos dissecado as animações da Fase 1, não saberíamos que a classe `group-hover:rotate-12` é o que gera a mágica do ícone giratório. 

Com o mapeamento feito, o usuário terá uma experiência "Headless" completa: editando desde o texto bruto até a física/dinâmica da página através do painel do CMS.
