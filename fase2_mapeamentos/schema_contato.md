# Schema JSON: Contato e Orçamento (contato.astro)

Este arquivo documenta o schema de dados da página de Contato que o CMS irá consumir para gerenciar as copys de vendas, as informações de canais e todos os rótulos e textos auxiliares do formulário.

```json
{
  "seo": {
    "meta_title": "Solicitar Orçamento | Andaime PRO - Suporte Especializado",
    "meta_description": "Entre em contato conosco e solicite um orçamento rápido de locação de andaimes certificados."
  },

  "hero_section": {
    "bg_color": "bg-slate-950",
    "badge_text": "Estamos prontos para atendê-lo",
    "title": {
      "text_normal_1": "Pronto para levar sua obra ao ",
      "text_highlight": "próximo nível?"
    },
    "description": "Atendimento humano, consultoria técnica gratuita e entrega ultra-rápida. Escolha o canal de sua preferência.",
    "enable_background_glow": true
  },

  "channels_section": {
    "column_title": "Canais de Atendimento",
    
    "items_info": {
      "sede_label": "Sede Administrativa",
      "telefone_label": "Telefone e WhatsApp",
      "telefone_subtext": "Segunda a Sexta, das 08h às 18h",
      "email_label": "E-mail Consultivo",
      "email_subtext": "Resposta em até 2 horas úteis."
    },

    "highlight_card": {
      "bg_color": "bg-slate-950",
      "title": "Unidade Logística RJ",
      "subtitle_text": "Pronto-atendimento em toda a Região Metropolitana e Baixada.",
      "decor_emoji": "🏗️",
      "enable_rotate_hover": true
    }
  },

  "form_section": {
    "form_labels": {
      "field_name": "Nome do Responsável",
      "field_email": "E-mail Corporativo",
      "field_phone": "WhatsApp / Telefone",
      "field_message": "O que você precisa?"
    },
    
    "form_placeholders": {
      "field_name": "Ex: Eng. Roberto Santos",
      "field_email": "sucesso@obra.com.br",
      "field_phone": "(21) 90000-0000",
      "field_message": "Descreva brevemente o projeto e equipamentos necessários..."
    },

    "submit_button": {
      "label_text": "Enviar e Receber Cotação",
      "decor_emoji": "🚀"
    },

    "footer_disclaimer": "Seus dados estão protegidos pela LGPD."
  }
}
```
