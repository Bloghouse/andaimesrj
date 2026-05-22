import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, LayoutTemplate, MessageSquare, PhoneCall } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

type Tab = 'hero' | 'channels' | 'form';

const ICON_LIBRARY = [
    { category: '🎯 Metas & Qualidade', icons: ['🎯', '👁️', '💎', '🤝', '🏆', '⭐', '🥇', '📈'] },
    { category: '🛠️ Construção & Segurança', icons: ['🛡️', '⛑️', '🦺', '🏗️', '🧱', '🔧', '⚙️', '🔒', '📍'] },
    { category: '⚡ Velocidade & Suporte', icons: ['⚡', '⏱️', '🚀', '🚚', '📞', '💬', '💡', '🔥', '📧'] }
];

const DEFAULT_CONFIG = {
  seo: {
    meta_title: "",
    meta_description: ""
  },
  hero_section: {
    bg_color: "bg-slate-950",
    badge_text: "",
    title: {
      text_normal_1: "",
      text_highlight: ""
    },
    description: "",
    enable_background_glow: true
  },
  channels_section: {
    column_title: "",
    items_info: {
      sede_label: "",
      sede_emoji: "📍",
      telefone_label: "",
      telefone_emoji: "📞",
      telefone_subtext: "",
      email_label: "",
      email_emoji: "📧",
      email_subtext: ""
    },
    highlight_card: {
      bg_color: "bg-slate-950",
      title: "",
      subtitle_text: "",
      decor_emoji: "🏗️",
      enable_rotate_hover: true
    }
  },
  form_section: {
    form_labels: {
      field_name: "",
      field_email: "",
      field_phone: "",
      field_message: ""
    },
    form_placeholders: {
      field_name: "",
      field_email: "",
      field_phone: "",
      field_message: ""
    },
    submit_button: {
      label_text: "",
      decor_emoji: "🚀"
    },
    footer_disclaimer: ""
  }
};

export default function ContatoEditor() {
    const [contato, setContato] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('hero');
    const [activeEmojiPicker, setActiveEmojiPicker] = useState<'highlight' | 'submit' | 'sede' | 'telefone' | 'email' | null>(null);

    useEffect(() => {
        githubApi('read', 'src/data/pages/contato.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || "{}");
                const merged = {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    seo: { ...DEFAULT_CONFIG.seo, ...(parsed.seo || {}) },
                    hero_section: { 
                        ...DEFAULT_CONFIG.hero_section, 
                        ...(parsed.hero_section || {}),
                        title: { ...DEFAULT_CONFIG.hero_section.title, ...(parsed.hero_section?.title || {}) }
                    },
                    channels_section: {
                        ...DEFAULT_CONFIG.channels_section,
                        ...(parsed.channels_section || {}),
                        items_info: { ...DEFAULT_CONFIG.channels_section.items_info, ...(parsed.channels_section?.items_info || {}) },
                        highlight_card: { ...DEFAULT_CONFIG.channels_section.highlight_card, ...(parsed.channels_section?.highlight_card || {}) }
                    },
                    form_section: {
                        ...DEFAULT_CONFIG.form_section,
                        ...(parsed.form_section || {}),
                        form_labels: { ...DEFAULT_CONFIG.form_section.form_labels, ...(parsed.form_section?.form_labels || {}) },
                        form_placeholders: { ...DEFAULT_CONFIG.form_section.form_placeholders, ...(parsed.form_section?.form_placeholders || {}) },
                        submit_button: { ...DEFAULT_CONFIG.form_section.submit_button, ...(parsed.form_section?.submit_button || {}) }
                    }
                };
                setContato(merged);
                setFileSha(data.sha);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true); 
        setError('');
        triggerToast('Sincronizando Página de Contato...', 'progress', 20);
        try {
            const res = await githubApi('write', 'src/data/pages/contato.json', { 
                content: JSON.stringify(contato, null, 2), 
                sha: fileSha, 
                message: 'CMS: Customização da Página Contato' 
            });
            setFileSha(res.sha); 
            triggerToast('Página de Contato atualizada!', 'success', 100);
        } catch (err: any) {
            setError(err.message); 
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally { 
            setSaving(false); 
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
            <p className="font-medium animate-pulse text-slate-600">Buscando dados de contato...</p>
        </div>
    );

    if (error && !contato.hero_section.title.text_highlight) return (
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-200 flex gap-4 items-start">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <div>
                <h3 className="text-xl font-bold mb-2">Erro de Leitura</h3>
                <p>{error}</p>
            </div>
        </div>
    );

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm text-slate-800 font-semibold";
    const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1";

    const tabsList: Array<{ id: Tab; label: string; icon: any }> = [
        { id: 'hero', label: 'Geral & Hero', icon: LayoutTemplate },
        { id: 'channels', label: 'Canais & Logística', icon: PhoneCall },
        { id: 'form', label: 'Formulário de Cotação', icon: MessageSquare }
    ];

    return (
        <div className="max-w-4xl space-y-0 pb-32">
            {/* Header de Ações */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 transition-all">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                        <span>Página de Contato</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                        Gerencie os rótulos de atendimento, unidade logística e o formulário em <code className="bg-slate-50 px-1.5 py-0.5 rounded text-violet-600 border border-slate-100 font-mono">pages/contato.json</code>
                    </p>
                </div>
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 active:scale-95 shrink-0 cursor-pointer"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Sincronizando...' : 'Sincronizar no GitHub'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-800 border border-red-100 rounded-2xl text-xs font-bold mb-6 flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Menu Premium de Abas */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar border-b border-slate-100">
                {tabsList.map(t => {
                    const Icon = t.icon;
                    const isActive = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all border cursor-pointer ${
                                isActive 
                                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/10' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
                {/* ABA 1: GERAL & HERO */}
                {tab === 'hero' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Banner Principal (Hero Section)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Badge Superior</label>
                                    <input 
                                        type="text" 
                                        value={contato.hero_section.badge_text} 
                                        onChange={e => setContato({
                                            ...contato,
                                            hero_section: { ...contato.hero_section, badge_text: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Estamos prontos para atendê-lo"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Título - Bloco Normal</label>
                                    <input 
                                        type="text" 
                                        value={contato.hero_section.title.text_normal_1} 
                                        onChange={e => setContato({
                                            ...contato,
                                            hero_section: {
                                                ...contato.hero_section,
                                                title: { ...contato.hero_section.title, text_normal_1: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Pronto para levar sua obra ao "
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Título - Bloco em Destaque (Colorido)</label>
                                    <input 
                                        type="text" 
                                        value={contato.hero_section.title.text_highlight} 
                                        onChange={e => setContato({
                                            ...contato,
                                            hero_section: {
                                                ...contato.hero_section,
                                                title: { ...contato.hero_section.title, text_highlight: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: próximo nível?"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Descrição Comercial</label>
                                    <textarea 
                                        rows={3} 
                                        value={contato.hero_section.description} 
                                        onChange={e => setContato({
                                            ...contato,
                                            hero_section: { ...contato.hero_section, description: e.target.value }
                                        })} 
                                        className={`${inputClass} resize-y`}
                                        placeholder="Descreva brevemente o tom do atendimento..."
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Brilho no Fundo</label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={contato.hero_section.enable_background_glow} 
                                            onChange={e => setContato({
                                                ...contato,
                                                hero_section: { ...contato.hero_section, enable_background_glow: e.target.checked }
                                            })} 
                                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700">Ativar Efeito Radial Glow</span>
                                    </label>
                                </div>

                                <div>
                                    <label className={labelClass}>Classe / Cor do Fundo</label>
                                    <input 
                                        type="text" 
                                        value={contato.hero_section.bg_color} 
                                        onChange={e => setContato({
                                            ...contato,
                                            hero_section: { ...contato.hero_section, bg_color: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="bg-slate-950"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Configuração SEO</h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>Título da Aba (Title Tag)</label>
                                    <input 
                                        type="text" 
                                        value={contato.seo.meta_title} 
                                        onChange={e => setContato({
                                            ...contato,
                                            seo: { ...contato.seo, meta_title: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="Contato | Andaime PRO"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Meta Descrição</label>
                                    <textarea 
                                        rows={3} 
                                        value={contato.seo.meta_description} 
                                        onChange={e => setContato({
                                            ...contato,
                                            seo: { ...contato.seo, meta_description: e.target.value }
                                        })} 
                                        className={`${inputClass} resize-y text-xs`}
                                        placeholder="Escreva a descrição para o Google..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 2: CANAIS & LOGÍSTICA */}
                {tab === 'channels' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Canais de Atendimento (Rótulos e Emojis)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Título da Seção de Canais</label>
                                    <input 
                                        type="text" 
                                        value={contato.channels_section.column_title} 
                                        onChange={e => setContato({
                                            ...contato,
                                            channels_section: { ...contato.channels_section, column_title: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="Canais de Atendimento"
                                    />
                                </div>

                                {/* Sede Administrativa */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Sede Administrativa (Rótulo e Ícone)</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setActiveEmojiPicker(activeEmojiPicker === 'sede' ? null : 'sede')}
                                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl hover:bg-violet-650 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer shrink-0"
                                                title="Escolher emoji da Sede"
                                            >
                                                {contato.channels_section.items_info.sede_emoji || '📍'}
                                            </button>

                                            {activeEmojiPicker === 'sede' && (
                                                <div className="absolute top-14 left-0 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl z-45 w-64 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Escolher Emoji</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setActiveEmojiPicker(null)} 
                                                            className="text-[10px] text-red-500 font-bold hover:underline"
                                                        >
                                                            Fechar
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                                        {ICON_LIBRARY.map((cat, catIdx) => (
                                                            <div key={catIdx} className="space-y-1">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.category}</span>
                                                                <div className="grid grid-cols-5 gap-1">
                                                                    {cat.icons.map((ic, icIdx) => (
                                                                        <button
                                                                            key={icIdx}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setContato({
                                                                                    ...contato,
                                                                                    channels_section: {
                                                                                        ...contato.channels_section,
                                                                                        items_info: { ...contato.channels_section.items_info, sede_emoji: ic }
                                                                                    }
                                                                                });
                                                                                setActiveEmojiPicker(null);
                                                                                triggerToast('Emoji da Sede atualizado!', 'success', 20);
                                                                            }}
                                                                            className="w-8 h-8 text-lg rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                                                                        >
                                                                            {ic}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={contato.channels_section.items_info.sede_label} 
                                            onChange={e => setContato({
                                                ...contato,
                                                channels_section: {
                                                    ...contato.channels_section,
                                                    items_info: { ...contato.channels_section.items_info, sede_label: e.target.value }
                                                }
                                            })} 
                                            className={inputClass}
                                            placeholder="Sede Administrativa"
                                        />
                                    </div>
                                </div>

                                {/* Telefone */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Telefone e WhatsApp (Rótulo e Ícone)</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setActiveEmojiPicker(activeEmojiPicker === 'telefone' ? null : 'telefone')}
                                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl hover:bg-violet-650 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer shrink-0"
                                                title="Escolher emoji do Telefone"
                                            >
                                                {contato.channels_section.items_info.telefone_emoji || '📞'}
                                            </button>

                                            {activeEmojiPicker === 'telefone' && (
                                                <div className="absolute top-14 left-0 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl z-45 w-64 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Escolher Emoji</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setActiveEmojiPicker(null)} 
                                                            className="text-[10px] text-red-500 font-bold hover:underline"
                                                        >
                                                            Fechar
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                                        {ICON_LIBRARY.map((cat, catIdx) => (
                                                            <div key={catIdx} className="space-y-1">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.category}</span>
                                                                <div className="grid grid-cols-5 gap-1">
                                                                    {cat.icons.map((ic, icIdx) => (
                                                                        <button
                                                                            key={icIdx}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setContato({
                                                                                    ...contato,
                                                                                    channels_section: {
                                                                                        ...contato.channels_section,
                                                                                        items_info: { ...contato.channels_section.items_info, telefone_emoji: ic }
                                                                                    }
                                                                                });
                                                                                setActiveEmojiPicker(null);
                                                                                triggerToast('Emoji do Telefone atualizado!', 'success', 20);
                                                                            }}
                                                                            className="w-8 h-8 text-lg rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                                                                        >
                                                                            {ic}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={contato.channels_section.items_info.telefone_label} 
                                            onChange={e => setContato({
                                                ...contato,
                                                channels_section: {
                                                    ...contato.channels_section,
                                                    items_info: { ...contato.channels_section.items_info, telefone_label: e.target.value }
                                                }
                                            })} 
                                            className={inputClass}
                                            placeholder="Telefone e WhatsApp"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Subtexto do Telefone</label>
                                    <input 
                                        type="text" 
                                        value={contato.channels_section.items_info.telefone_subtext} 
                                        onChange={e => setContato({
                                            ...contato,
                                            channels_section: {
                                                ...contato.channels_section,
                                                items_info: { ...contato.channels_section.items_info, telefone_subtext: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Horário de funcionamento"
                                    />
                                </div>

                                {/* E-mail */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>E-mail Consultivo (Rótulo e Ícone)</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setActiveEmojiPicker(activeEmojiPicker === 'email' ? null : 'email')}
                                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl hover:bg-violet-650 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer shrink-0"
                                                title="Escolher emoji do E-mail"
                                            >
                                                {contato.channels_section.items_info.email_emoji || '📧'}
                                            </button>

                                            {activeEmojiPicker === 'email' && (
                                                <div className="absolute top-14 left-0 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl z-45 w-64 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Escolher Emoji</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setActiveEmojiPicker(null)} 
                                                            className="text-[10px] text-red-500 font-bold hover:underline"
                                                        >
                                                            Fechar
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                                        {ICON_LIBRARY.map((cat, catIdx) => (
                                                            <div key={catIdx} className="space-y-1">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.category}</span>
                                                                <div className="grid grid-cols-5 gap-1">
                                                                    {cat.icons.map((ic, icIdx) => (
                                                                        <button
                                                                            key={icIdx}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setContato({
                                                                                    ...contato,
                                                                                    channels_section: {
                                                                                        ...contato.channels_section,
                                                                                        items_info: { ...contato.channels_section.items_info, email_emoji: ic }
                                                                                    }
                                                                                });
                                                                                setActiveEmojiPicker(null);
                                                                                triggerToast('Emoji do E-mail atualizado!', 'success', 20);
                                                                            }}
                                                                            className="w-8 h-8 text-lg rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                                                                        >
                                                                            {ic}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={contato.channels_section.items_info.email_label} 
                                            onChange={e => setContato({
                                                ...contato,
                                                channels_section: {
                                                    ...contato.channels_section,
                                                    items_info: { ...contato.channels_section.items_info, email_label: e.target.value }
                                                }
                                            })} 
                                            className={inputClass}
                                            placeholder="E-mail Consultivo"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Subtexto do E-mail</label>
                                    <input 
                                        type="text" 
                                        value={contato.channels_section.items_info.email_subtext} 
                                        onChange={e => setContato({
                                            ...contato,
                                            channels_section: {
                                                ...contato.channels_section,
                                                items_info: { ...contato.channels_section.items_info, email_subtext: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Tempo médio de resposta"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Destaque: Unidade Logística</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 flex gap-4 items-center border-b border-slate-100 pb-4">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveEmojiPicker(activeEmojiPicker === 'highlight' ? null : 'highlight')}
                                            className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl hover:bg-violet-650 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
                                            title="Escolher emoji decorativo"
                                        >
                                            {contato.channels_section.highlight_card.decor_emoji || '🏗️'}
                                        </button>

                                        {activeEmojiPicker === 'highlight' && (
                                            <div className="absolute top-14 left-0 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl z-45 w-64 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Escolher Emoji</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setActiveEmojiPicker(null)} 
                                                        className="text-[10px] text-red-500 font-bold hover:underline"
                                                    >
                                                        Fechar
                                                    </button>
                                                </div>
                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                                    {ICON_LIBRARY.map((cat, catIdx) => (
                                                        <div key={catIdx} className="space-y-1">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.category}</span>
                                                            <div className="grid grid-cols-5 gap-1">
                                                                {cat.icons.map((ic, icIdx) => (
                                                                    <button
                                                                        key={icIdx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setContato({
                                                                                ...contato,
                                                                                channels_section: {
                                                                                    ...contato.channels_section,
                                                                                    highlight_card: { ...contato.channels_section.highlight_card, decor_emoji: ic }
                                                                                }
                                                                            });
                                                                            setActiveEmojiPicker(null);
                                                                            triggerToast('Emoji da Unidade atualizado!', 'success', 20);
                                                                        }}
                                                                        className="w-8 h-8 text-lg rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                                                                    >
                                                                        {ic}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-violet-650 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded-full">Emoji Decorativo</span>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Clique no bloco preto para mudar o emoji</p>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Título do Card</label>
                                    <input 
                                        type="text" 
                                        value={contato.channels_section.highlight_card.title} 
                                        onChange={e => setContato({
                                            ...contato,
                                            channels_section: {
                                                ...contato.channels_section,
                                                highlight_card: { ...contato.channels_section.highlight_card, title: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Unidade Logística RJ"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Subtexto do Card</label>
                                    <input 
                                        type="text" 
                                        value={contato.channels_section.highlight_card.subtitle_text} 
                                        onChange={e => setContato({
                                            ...contato,
                                            channels_section: {
                                                ...contato.channels_section,
                                                highlight_card: { ...contato.channels_section.highlight_card, subtitle_text: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Pronto-atendimento em toda a Região..."
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Efeito de Rotação (Hover)</label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={contato.channels_section.highlight_card.enable_rotate_hover} 
                                            onChange={e => setContato({
                                                ...contato,
                                                channels_section: {
                                                    ...contato.channels_section,
                                                    highlight_card: { ...contato.channels_section.highlight_card, enable_rotate_hover: e.target.checked }
                                                }
                                            })} 
                                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700">Ativar Giro no Emoji ao passar o mouse</span>
                                    </label>
                                </div>

                                <div>
                                    <label className={labelClass}>Estilo / Fundo do Card</label>
                                    <input 
                                        type="text" 
                                        value={contato.channels_section.highlight_card.bg_color} 
                                        onChange={e => setContato({
                                            ...contato,
                                            channels_section: {
                                                ...contato.channels_section,
                                                highlight_card: { ...contato.channels_section.highlight_card, bg_color: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="bg-slate-950"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 3: FORMULÁRIO DE COTAÇÃO */}
                {tab === 'form' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Rótulos do Formulário (Labels)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Campo: Nome</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_labels.field_name} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_labels: { ...contato.form_section.form_labels, field_name: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Nome do Responsável"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Campo: E-mail</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_labels.field_email} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_labels: { ...contato.form_section.form_labels, field_email: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="E-mail Corporativo"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Campo: Telefone / WhatsApp</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_labels.field_phone} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_labels: { ...contato.form_section.form_labels, field_phone: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="WhatsApp / Telefone"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Campo: Mensagem</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_labels.field_message} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_labels: { ...contato.form_section.form_labels, field_message: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="O que você precisa?"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Textos Internos (Placeholders)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Sugestão: Nome</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_placeholders.field_name} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_placeholders: { ...contato.form_section.form_placeholders, field_name: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Eng. Roberto Santos"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Sugestão: E-mail</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_placeholders.field_email} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_placeholders: { ...contato.form_section.form_placeholders, field_email: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="sucesso@obra.com.br"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Sugestão: Telefone</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_placeholders.field_phone} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_placeholders: { ...contato.form_section.form_placeholders, field_phone: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="(21) 90000-0000"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Sugestão: Mensagem</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.form_placeholders.field_message} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                form_placeholders: { ...contato.form_section.form_placeholders, field_message: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Descreva o projeto..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Ação e Proteção Legal</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 flex gap-4 items-center border-b border-slate-100 pb-4">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveEmojiPicker(activeEmojiPicker === 'submit' ? null : 'submit')}
                                            className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl hover:bg-violet-650 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
                                            title="Escolher emoji do botão"
                                        >
                                            {contato.form_section.submit_button.decor_emoji || '🚀'}
                                        </button>

                                        {activeEmojiPicker === 'submit' && (
                                            <div className="absolute top-14 left-0 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl z-45 w-64 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Escolher Emoji</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setActiveEmojiPicker(null)} 
                                                        className="text-[10px] text-red-500 font-bold hover:underline"
                                                    >
                                                        Fechar
                                                    </button>
                                                </div>
                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                                    {ICON_LIBRARY.map((cat, catIdx) => (
                                                        <div key={catIdx} className="space-y-1">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.category}</span>
                                                            <div className="grid grid-cols-5 gap-1">
                                                                {cat.icons.map((ic, icIdx) => (
                                                                    <button
                                                                        key={icIdx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setContato({
                                                                                ...contato,
                                                                                form_section: {
                                                                                    ...contato.form_section,
                                                                                    submit_button: { ...contato.form_section.submit_button, decor_emoji: ic }
                                                                                }
                                                                            });
                                                                            setActiveEmojiPicker(null);
                                                                            triggerToast('Emoji do botão atualizado!', 'success', 20);
                                                                        }}
                                                                        className="w-8 h-8 text-lg rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                                                                    >
                                                                        {ic}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-violet-650 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded-full">Emoji do Botão</span>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Clique no bloco preto para escolher o emoji decorativo</p>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Texto do Botão</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.submit_button.label_text} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                submit_button: { ...contato.form_section.submit_button, label_text: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Enviar e Receber Cotação"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Disclaimer de Privacidade (LGPD)</label>
                                    <input 
                                        type="text" 
                                        value={contato.form_section.footer_disclaimer} 
                                        onChange={e => setContato({
                                            ...contato,
                                            form_section: {
                                                ...contato.form_section,
                                                footer_disclaimer: e.target.value
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Ex: Seus dados estão protegidos pela LGPD."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
