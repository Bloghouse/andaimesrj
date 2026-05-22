# Schema JSON: Sobre Nós (sobre.astro)

Este arquivo documenta o schema de dados completo para a página institucional Sobre Nós que o CMS irá consumir para alimentar `src/pages/sobre.astro`.

```json
{
  "seo": {
    "meta_title": "Nossa História | Andaime PRO - Tradição e Segurança",
    "meta_description": "Conheça a história da Andaime PRO, nossa missão de segurança e a equipe de elite técnica que lidera nossos projetos."
  },

  "hero_section": {
    "bg_color": "bg-slate-950",
    "badge_text": "Nossa Trajetória",
    "title": {
      "text_normal_1": "Construindo as bases do ",
      "text_highlight": "progresso",
      "text_normal_2": " desde 2009."
    },
    "description": "O que começou como uma pequena operação logística tornou-se a referência máxima em acesso e segurança para os projetos mais audaciosos do país.",
    "enable_geometric_background": true
  },

  "mvv_section": {
    "bg_color": "bg-white",
    "enable_card_hover_effects": true,
    "items": [
      {
        "icon_emoji": "🎯",
        "title": "Nossa Missão",
        "description": "Prover soluções de acesso seguras e eficientes, garantindo que cada trabalhador retorne para casa com absoluta segurança ao final do dia."
      },
      {
        "icon_emoji": "👁️",
        "title": "Nossa Visão",
        "description": "Ser a primeira escolha em locação de andaimes no Brasil, reconhecida pela inovação tecnológica e excelência inabalável no suporte."
      },
      {
        "icon_emoji": "💎",
        "title": "Nossos Valores",
        "description": "Segurança inegociável, pontualidade de elite, ética absoluta nas relações e compromisso total com o sucesso do cliente."
      }
    ]
  },

  "security_section": {
    "bg_color": "bg-slate-50",
    "title": {
      "text_normal_1": "Segurança ",
      "text_highlight": "NR-18",
      "text_normal_2": " no DNA"
    },
    "intro_text": "Não apenas seguimos as normas vigentes; nós as redefinimos. Cada componente da Andaime PRO passa por um rigoroso checklist antes de cada locação.",
    "bullet_points": [
      "Manutenção preventiva sistemática em 100% do estoque.",
      "Certificação de origem e ensaios de carga periódicos.",
      "Consultoria técnica gratuita para dimensionamento de projetos."
    ],
    "illustration": {
      "image_url": "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1000",
      "enable_zoom_hover": true,
      "enable_overlay_fade_hover": true
    }
  },

  "team_section": {
    "bg_color": "bg-white",
    "title": "Elite Técnica",
    "subtitle": "Nossa equipe não é formada apenas por vendedores, mas por especialistas em engenharia e segurança que vivem o dia a dia do canteiro de obras.",
    "enable_grayscale_hover": true,
    "members": [
      {
        "photo_url": "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=400",
        "area_name": "ENGENHARIA"
      },
      {
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        "area_name": "LOGÍSTICA"
      },
      {
        "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
        "area_name": "SUPORTE TÉCNICO"
      },
      {
        "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
        "area_name": "COMERCIAL"
      }
    ]
  }
}
```
