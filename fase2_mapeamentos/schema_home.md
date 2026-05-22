# Schema JSON: Home Page (index.astro)

Este arquivo documenta exclusivamente o schema de dados da página inicial que o CMS irá consumir. 

```json
{
  "seo": {
    "meta_title": "Aluguel de Andaimes | Andaime PRO - Segurança em Altura",
    "meta_description": ""
  },
  
  "hero_section": {
    "bg_image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5...",
    "badge_text": "🏗️ Locação de Andaimes no Rio de Janeiro",
    "title": {
      "text_white_1": "Segurança Absoluta",
      "text_white_2": "para atingir o",
      "text_highlight": "Topo do Projeto"
    },
    "description": "Sua obra no RJ merece equipamentos certificados NR-18 e logística de elite. Entrega garantida em até 2 horas...",
    "primary_btn": {
      "label": "Solicitar Orçamento Agora",
      "action_type": "whatsapp_global"
    },
    "secondary_btn": {
      "label": "Ver Equipamentos",
      "action_type": "internal_link",
      "link_url": "/servicos"
    }
  },

  "differentials_section": {
    "bg_color": "bg-white",
    "enable_icon_rotation_hover": true,
    "items": [
      {
        "icon_emoji": "⚡",
        "title": "Entrega em 2h",
        "description": "Logística própria ultra-rápida. Sua obra não pode e não vai parar."
      },
      {
        "icon_emoji": "🛡️",
        "title": "NR-18 Certificada",
        "description": "Equipamentos rigorosamente revisados seguindo todas as normas vigentes."
      },
      {
        "icon_emoji": "💰",
        "title": "Preço Justo",
        "description": "Condições agressivas para locações de longa duração e grandes projetos."
      },
      {
        "icon_emoji": "📞",
        "title": "Plantão 24h",
        "description": "Equipe técnica pronta para orientar a montagem em qualquer horário."
      }
    ]
  },

  "about_section": {
    "bg_color": "bg-slate-50",
    "main_image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd...",
    "enable_image_hover_tilt": true,
    "floating_badge": {
      "visible": true,
      "number": "15+",
      "text": "ANOS NO MERCADO"
    },
    "title": {
      "text_normal_1": "Especialistas em",
      "text_highlight": "Segurança",
      "text_normal_2": "e Performance"
    },
    "description": "Desde 2009, somos o alicerce de grandes construções. Não apenas alugamos equipamentos...",
    "link_cta": {
      "label": "Conheça nossa História",
      "url": "/sobre"
    }
  },

  "services_preview_section": {
    "title": "Equipamentos de Ponta",
    "subtitle": "Soluções completas para acesso, escoramento e proteção coletiva.",
    "top_btn": {
      "label": "Ver Catálogo Completo",
      "url": "/servicos"
    },
    "card_link_label": "Detalhes do Produto"
  },

  "testimonials_section": {
    "title_highlight": "Quem Confia",
    "subtitle": "Parcerias sólidas em cada m² construído.",
    "items": [
      {
        "quote": "A entrega em 2h salvou nosso cronograma. Equipamentos novos e suporte técnico nota 10.",
        "author": "Eng. Ricardo Martins",
        "company_role": "Construtora Aliança",
        "stars_count": 5
      },
      {
        "quote": "Locação de andaimes fachadeiros por 4 meses e atendimento excelente. Segurança total na obra.",
        "author": "Ana Júlia Santos",
        "company_role": "Diretora de Operações",
        "stars_count": 5
      },
      {
        "quote": "Melhor custo-benefício de SP. Andaimes em perfeito estado, prontos para uso imediato.",
        "author": "Marcos Paulo",
        "company_role": "Mestre de Obras",
        "stars_count": 5
      }
    ]
  },

  "footer_cta_section": {
    "title": {
      "text_normal_1": "Vamos subir o nível",
      "text_normal_2": "da sua",
      "text_highlight": "construção?"
    },
    "description": "Orçamentos imediatos, entrega rápida e os melhores equipamentos do mercado nacional.",
    "whatsapp_btn_label": "Falar Agora no WhatsApp",
    "phone_btn_label_prefix": "Ligar: "
  }
}
```
