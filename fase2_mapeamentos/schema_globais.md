# Schema JSON: Configurações Globais & Design (globais.json)

Este arquivo define a base de dados mestre que controla elementos compartilhados por todas as páginas, como dados cadastrais de contato, o Cabeçalho, o Rodapé, o Botão do WhatsApp e a paleta oficial de Cores do site.

```json
{
  "identity": {
    "company_name": "Andaime PRO - Locação de Andaimes no Rio de Janeiro",
    "logo_url": "/images/logo.png",
    "colors": {
      "primary": "#fa4a15ff",
      "secondary": "#1E3A8A",
      "accent": "#000000"
    }
  },

  "contact_info": {
    "domain": "https://andaimesrj.com.br",
    "email": "contato@andaimesrj.com.br",
    "phone": "(21) 97894-6985",
    "whatsapp": "5521978946985",
    "address": {
      "street": "Av. Pres. Vargas, 4443",
      "neighborhood": "Centro",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "zip": "20210-030"
    },
    "social": {
      "instagram": "https://instagram.com/andaimepro",
      "facebook": "https://facebook.com/andaimepro"
    }
  },

  "global_seo": {
    "default_meta_description": "Líder em locação de andaimes no Rio de Janeiro. Equipamentos certificados NR-18, entrega rápida e suporte técnico especializado para sua obra.",
    "default_meta_keywords": "aluguel de andaimes rj, locação de andaimes rio de janeiro, andaime pro, segurança em obras, nr-18"
  },

  "header_navigation": {
    "enable_sticky_header": true,
    "enable_backdrop_blur": true,
    "nav_links": [
      { "label": "Início", "url": "/" },
      { "label": "Serviços", "url": "/servicos" },
      { "label": "Blog", "url": "/blog" },
      { "label": "Sobre", "url": "/sobre" }
    ],
    "cta_button": {
      "label": "Falar com Consultor",
      "url": "/contato"
    }
  },

  "footer_section": {
    "description_text": "A maior autoridade em locação de equipamentos para trabalho em altura. Segurança certificada e logística de elite para sua obra.",
    "copyright_format": "© {year} ANDAIME PRO. Todos os direitos reservados.",
    "nav_column_title": "Navegação",
    "contact_column_title": "Contato",
    "legal_links": [
      { "label": "Privacidade", "url": "/privacidade" },
      { "label": "Termos de Uso", "url": "/termos" }
    ]
  },

  "floating_whatsapp_btn": {
    "tooltip_label": "Fale Conosco",
    "whatsapp_brand_color": "#25D366",
    "enable_bounce_subtle": true,
    "enable_radar_ping": true
  }
}
```
