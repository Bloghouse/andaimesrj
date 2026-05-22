# Schema JSON: Catálogo de Equipamentos (Serviços)

Este arquivo documenta exclusivamente o schema de dados estáticos e de layout do módulo de Serviços (Vitrine e Interna) que o CMS irá consumir para alimentar `src/pages/servicos/index.astro` e `src/pages/servicos/[slug].astro`.

```json
{
  "index_page": {
    "seo": {
      "meta_title": "Nossos Equipamentos | Andaime PRO - Catálogo Completo",
      "meta_description": "Confira nossa linha completa de andaimes e equipamentos certificados NR-18 para locação."
    },
    
    "hero_section": {
      "bg_color": "bg-slate-50",
      "badge_text": "Nosso Catálogo",
      "title": {
        "text_normal_1": "Equipamentos de ",
        "text_highlight": "Ponta",
        "text_normal_2": " para sua Segurança."
      },
      "subtitle": "Soluções certificadas para acesso, escoramento e proteção coletiva em obras de todos os portes."
    },

    "layout_cards": {
      "enable_card_hover_scale": true,
      "enable_icon_bg_hover": true,
      "card_link_label": "Ver Detalhes do Produto"
    }
  },

  "slug_page": {
    "hero_section": {
      "bg_image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5...",
      "back_btn_label": "Voltar para Galeria",
      "enable_btn_glass_effect": true
    },

    "overview_section": {
      "badge_text": "Visão Geral"
    },

    "characteristics_section": {
      "title": "Diferenciais Técnicos",
      "enable_item_border_hover": true
    },

    "specs_section": {
      "title": "Ficha Técnica",
      "enable_value_translate_hover": true
    },

    "warranties_section": {
      "enable_hover_scale": true,
      "enable_icon_rotation_hover": true,
      "warranty_left": {
        "bg_color": "bg-slate-950",
        "icon_emoji": "🛡️",
        "title": "Segurança Total",
        "description": "Equipamento certificado e revisado em conformidade com a NR-18."
      },
      "warranty_right": {
        "bg_color": "bg-primary",
        "icon_emoji": "🚛",
        "title": "Entrega Imediata",
        "description": "Frota própria disponível para atendimento em tempo recorde (até 2h)."
      }
    },

    "sidebar_sticky": {
      "kicker_text": "Central de Negócios",
      "title": "Interessado neste equipamento?",
      "whatsapp_btn": {
        "label": "WhatsApp Oficial",
        "action_type": "whatsapp_global"
      },
      "phone_btn": {
        "label": "Ligar Agora",
        "action_type": "phone_global"
      },
      "support_footer": {
        "kicker": "Suporte 24h Especializado"
      }
    }
  }
}
```
