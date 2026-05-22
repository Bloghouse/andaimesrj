import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Image as ImageIcon, Home, Heart, Award, Users, Search, ArrowUp, ArrowDown, Plus, Trash2, Star } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

type Tab = 'hero' | 'differentials' | 'about' | 'testimonials' | 'seo_cta';

const ICON_LIBRARY = [
    { category: '🛠️ Segurança & Normas', icons: ['🛡️', '⛑️', '🦺', '🏗️', '🧱', '🔧', '⚙️', '🔒'] },
    { category: '⚡ Velocidade & Entrega', icons: ['⚡', '⏱️', '🚀', '🚚', '🏃', '📅', '🕒', '🔥'] },
    { category: '💰 Preço & Negócios', icons: ['💰', '💎', '🤝', '📈', '📉', '🏷️', '💳', '💵'] },
    { category: '📞 Suporte & Atendimento', icons: ['📞', '💬', '🛠️', '🌟', '🥇', '👑', '🎯', '💡'] }
];

const DEFAULT_CONFIG = {
    seo: {
        meta_title: '',
        meta_description: ''
    },
    hero_section: {
        bg_image_url: '',
        badge_text: '',
        title: {
            text_white_1: '',
            text_white_2: '',
            text_highlight: ''
        },
        description: '',
        primary_btn: { label: '' },
        secondary_btn: { label: '', url: '' }
    },
    differentials_section: {
        enable_icon_rotation_hover: true,
        items: [
            { icon_emoji: '⚡', title: '', description: '' },
            { icon_emoji: '🛡️', title: '', description: '' },
            { icon_emoji: '💰', title: '', description: '' },
            { icon_emoji: '📞', title: '', description: '' }
        ] as Array<{ icon_emoji: string; title: string; description: string }>
    },
    about_section: {
        bg_color: 'bg-slate-50',
        main_image_url: '',
        floating_badge: {
            visible: true,
            number: '15+',
            text: 'ANOS NO MERCADO'
        },
        title: {
            text_normal_1: '',
            text_highlight: '',
            text_normal_2: ''
        },
        description: '',
        link_cta: { label: '', url: '' }
    },
    services_preview_section: {
        title: 'Equipamentos de Ponta',
        subtitle: 'Soluções completas para acesso, escoramento e proteção coletiva.',
        top_btn: { label: 'Ver Catálogo Completo', url: '/servicos' },
        card_link_label: 'Detalhes do Produto'
    },
    testimonials_section: {
        title_highlight: 'Quem Confia',
        subtitle: 'Parcerias sólidas em cada m² construído.',
        items: [] as Array<{ quote: string; author: string; company_role: string; stars_count: number; avatar_url?: string }>
    },
    footer_cta_section: {
        title: {
            text_normal_1: '',
            text_normal_2: '',
            text_highlight: ''
        },
        description: '',
        whatsapp_btn_label: '',
        phone_btn_label_prefix: 'Ligar: '
    }
};

export default function HomeEditor() {
    const [config, setConfig] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('hero');
    const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
    
    const [pendingHeroBg, setPendingHeroBg] = useState<File | null>(null);
    const [pendingAboutImg, setPendingAboutImg] = useState<File | null>(null);
    const [pendingAvatars, setPendingAvatars] = useState<Record<number, File>>({});

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result?.toString() || '').split(',')[1]);
        reader.onerror = error => reject(error);
    });

    useEffect(() => {
        githubApi('read', 'src/data/pages/home.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || "{}");
                // Deep merge robusto para evitar erros de renderização
                const merged = {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    seo: { ...DEFAULT_CONFIG.seo, ...(parsed.seo || {}) },
                    hero_section: { 
                        ...DEFAULT_CONFIG.hero_section, 
                        ...(parsed.hero_section || {}), 
                        title: { ...DEFAULT_CONFIG.hero_section.title, ...(parsed.hero_section?.title || {}) },
                        primary_btn: { ...DEFAULT_CONFIG.hero_section.primary_btn, ...(parsed.hero_section?.primary_btn || {}) },
                        secondary_btn: { ...DEFAULT_CONFIG.hero_section.secondary_btn, ...(parsed.hero_section?.secondary_btn || {}) }
                    },
                    differentials_section: { 
                        ...DEFAULT_CONFIG.differentials_section, 
                        ...(parsed.differentials_section || {}),
                        items: Array.isArray(parsed.differentials_section?.items) 
                            ? parsed.differentials_section.items 
                            : DEFAULT_CONFIG.differentials_section.items
                    },
                    about_section: { 
                        ...DEFAULT_CONFIG.about_section, 
                        ...(parsed.about_section || {}),
                        floating_badge: { ...DEFAULT_CONFIG.about_section.floating_badge, ...(parsed.about_section?.floating_badge || {}) },
                        title: { ...DEFAULT_CONFIG.about_section.title, ...(parsed.about_section?.title || {}) },
                        link_cta: { ...DEFAULT_CONFIG.about_section.link_cta, ...(parsed.about_section?.link_cta || {}) }
                    },
                    services_preview_section: { 
                        ...DEFAULT_CONFIG.services_preview_section, 
                        ...(parsed.services_preview_section || {}),
                        top_btn: { ...DEFAULT_CONFIG.services_preview_section.top_btn, ...(parsed.services_preview_section?.top_btn || {}) }
                    },
                    testimonials_section: { 
                        ...DEFAULT_CONFIG.testimonials_section, 
                        ...(parsed.testimonials_section || {}),
                        items: Array.isArray(parsed.testimonials_section?.items) 
                            ? parsed.testimonials_section.items.map((it: any) => ({
                                avatar_url: '',
                                ...it
                            }))
                            : []
                    },
                    footer_cta_section: { 
                        ...DEFAULT_CONFIG.footer_cta_section, 
                        ...(parsed.footer_cta_section || {}),
                        title: { ...DEFAULT_CONFIG.footer_cta_section.title, ...(parsed.footer_cta_section?.title || {}) }
                    }
                };
                setConfig(merged);
                setFileSha(data.sha);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        triggerToast('Salvando alterações da Página Inicial...', 'progress', 10);
        try {
            let configCopy = { ...config };

            // 1. Upload do fundo do Hero
            if (pendingHeroBg) {
                triggerToast('Enviando fundo do banner principal...', 'progress', 25);
                const base64Content = await fileToBase64(pendingHeroBg);
                const fileExt = pendingHeroBg.name.split('.').pop() || 'jpg';
                const ghPath = `public/images/hero-bg.${fileExt}`;
                
                let heroBgSha: string | undefined;
                try {
                    const existing = await githubApi('read', ghPath);
                    if (existing?.sha) heroBgSha = existing.sha;
                } catch {}

                await githubApi('write', ghPath, {
                    content: base64Content,
                    isBase64: true,
                    sha: heroBgSha,
                    message: 'CMS: Upload Hero Background'
                });
                configCopy.hero_section.bg_image_url = `/images/hero-bg.${fileExt}`;
            }

            // 2. Upload da imagem institucional
            if (pendingAboutImg) {
                triggerToast('Enviando imagem institucional...', 'progress', 45);
                const base64Content = await fileToBase64(pendingAboutImg);
                const fileExt = pendingAboutImg.name.split('.').pop() || 'jpg';
                const ghPath = `public/images/about-home.${fileExt}`;
                
                let aboutImgSha: string | undefined;
                try {
                    const existing = await githubApi('read', ghPath);
                    if (existing?.sha) aboutImgSha = existing.sha;
                } catch {}

                await githubApi('write', ghPath, {
                    content: base64Content,
                    isBase64: true,
                    sha: aboutImgSha,
                    message: 'CMS: Upload About Section Image'
                });
                configCopy.about_section.main_image_url = `/images/about-home.${fileExt}`;
            }

            // 3. Upload dos avatares pendentes dos depoimentos
            const avatarIndices = Object.keys(pendingAvatars).map(Number);
            for (const idx of avatarIndices) {
                const file = pendingAvatars[idx];
                if (file) {
                    triggerToast(`Enviando foto do depoimento ${idx + 1}...`, 'progress', 65);
                    const base64Content = await fileToBase64(file);
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const ghPath = `public/images/testimonials/avatar-${idx}.${fileExt}`;
                    
                    let avatarSha: string | undefined;
                    try {
                        const existing = await githubApi('read', ghPath);
                        if (existing?.sha) avatarSha = existing.sha;
                    } catch {}

                    await githubApi('write', ghPath, {
                        content: base64Content,
                        isBase64: true,
                        sha: avatarSha,
                        message: `CMS: Upload Testimonial Avatar ${idx + 1}`
                    });
                    
                    configCopy.testimonials_section.items[idx].avatar_url = `/images/testimonials/avatar-${idx}.${fileExt}`;
                }
            }

            // 4. Salvar arquivo home.json completo
            triggerToast('Atualizando arquivos de dados...', 'progress', 85);
            const res = await githubApi('write', 'src/data/pages/home.json', {
                content: JSON.stringify(configCopy, null, 2),
                sha: fileSha,
                message: 'CMS: Update home.json'
            });

            setFileSha(res.sha);
            setPendingHeroBg(null);
            setPendingAboutImg(null);
            setPendingAvatars({});

            // Evitar problemas com cache de imagem local exibindo URL com cache-busting
            if (pendingHeroBg) {
                configCopy.hero_section.bg_image_url = `/images/hero-bg.${pendingHeroBg.name.split('.').pop() || 'jpg'}?t=${Date.now()}`;
            }
            if (pendingAboutImg) {
                configCopy.about_section.main_image_url = `/images/about-home.${pendingAboutImg.name.split('.').pop() || 'jpg'}?t=${Date.now()}`;
            }
            // Cache-busting para avatares enviados
            avatarIndices.forEach(idx => {
                const file = pendingAvatars[idx];
                if (file && configCopy.testimonials_section.items[idx]) {
                    const ext = file.name.split('.').pop() || 'jpg';
                    configCopy.testimonials_section.items[idx].avatar_url = `/images/testimonials/avatar-${idx}.${ext}?t=${Date.now()}`;
                }
            });

            setConfig(configCopy);
            triggerToast('Homepage atualizada com sucesso!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const moveTestimonial = (index: number, direction: 'up' | 'down') => {
        const copy = [...config.testimonials_section.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= copy.length) return;
        
        // Swap items
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;
        
        // Swap pending avatars
        const updatedPending = { ...pendingAvatars };
        const tempFile = updatedPending[index];
        if (updatedPending[targetIndex]) {
            updatedPending[index] = updatedPending[targetIndex];
        } else {
            delete updatedPending[index];
        }
        if (tempFile) {
            updatedPending[targetIndex] = tempFile;
        } else {
            delete updatedPending[targetIndex];
        }
        setPendingAvatars(updatedPending);

        setConfig({
            ...config,
            testimonials_section: {
                ...config.testimonials_section,
                items: copy
            }
        });
        triggerToast('Ordem dos depoimentos atualizada!', 'success', 30);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
            <p className="font-medium animate-pulse">Conectando ao Repositório...</p>
        </div>
    );

    if (error && !config.hero_section.title.text_highlight) return (
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

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'hero', label: 'Dobra Principal (Hero)', icon: Home },
        { id: 'differentials', label: 'Diferenciais', icon: Award },
        { id: 'about', label: 'Sobre (Preview)', icon: Users },
        { id: 'testimonials', label: 'Depoimentos & Vitrine', icon: Heart },
        { id: 'seo_cta', label: 'SEO & Chamada Final', icon: Search },
    ];

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-32 max-w-3xl">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Homepage (Página Inicial)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Controla os banners, diferenciais e vitrines da página raiz do site</p>
                </div>
                <button 
                    type="submit" 
                    disabled={saving} 
                    className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-violet-600/20 transition-all"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {error && (
                <div className="p-5 bg-red-100/50 text-red-700 rounded-2xl font-bold border border-red-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tab Links */}
            <div className="flex gap-1.5 bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl w-fit flex-wrap border border-slate-200/50 shadow-inner">
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                tab === t.id
                                    ? 'bg-white text-violet-700 shadow-sm border border-slate-200/40 transform scale-102'
                                    : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50/50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content: Dobra Principal (Hero) */}
            {tab === 'hero' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Apresentação Principal</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Imagem de Fundo do Banner</label>
                                <label className="group relative border-2 border-dashed border-slate-300 hover:border-violet-500 bg-slate-50 hover:bg-violet-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center h-48">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPendingHeroBg(file);
                                                setConfig({
                                                    ...config,
                                                    hero_section: { ...config.hero_section, bg_image_url: URL.createObjectURL(file) }
                                                });
                                            }
                                        }} 
                                    />
                                    {config.hero_section.bg_image_url ? (
                                        <img src={config.hero_section.bg_image_url} alt="Fundo" className="max-h-28 w-auto rounded-lg object-contain mb-3 border shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-3 group-hover:text-violet-500 transition-colors">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">
                                        {config.hero_section.bg_image_url ? 'Substituir Imagem do Banner' : 'Enviar Imagem do Banner'}
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className={labelClass}>Badge / Selo Superior</label>
                                <input 
                                    type="text" 
                                    value={config.hero_section.badge_text} 
                                    onChange={e => setConfig({
                                        ...config,
                                        hero_section: { ...config.hero_section, badge_text: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: 🏗️ Locação de Andaimes no Rio de Janeiro"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Descrição do Banner Hero</label>
                                <textarea 
                                    rows={3} 
                                    value={config.hero_section.description} 
                                    onChange={e => setConfig({
                                        ...config,
                                        hero_section: { ...config.hero_section, description: e.target.value }
                                    })} 
                                    className={`${inputClass} resize-y`}
                                    placeholder="Texto descritivo abaixo da chamada do banner principal..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Chamada de Destaque (Título Premium)</h3>
                        <p className="text-xs text-slate-400 -mt-2">O título é dividido em 3 blocos para compor o visual premium. O bloco em Destaque assume a cor laranja da marca.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>Título Parte 1 (Branco)</label>
                                <input 
                                    type="text" 
                                    value={config.hero_section.title.text_white_1} 
                                    onChange={e => setConfig({
                                        ...config,
                                        hero_section: {
                                            ...config.hero_section,
                                            title: { ...config.hero_section.title, text_white_1: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: Segurança Absoluta"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Título Parte 2 (Branco)</label>
                                <input 
                                    type="text" 
                                    value={config.hero_section.title.text_white_2} 
                                    onChange={e => setConfig({
                                        ...config,
                                        hero_section: {
                                            ...config.hero_section,
                                            title: { ...config.hero_section.title, text_white_2: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: para atingir o"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Título Parte 3 (Em Destaque)</label>
                                <input 
                                    type="text" 
                                    value={config.hero_section.title.text_highlight} 
                                    onChange={e => setConfig({
                                        ...config,
                                        hero_section: {
                                            ...config.hero_section,
                                            title: { ...config.hero_section.title, text_highlight: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: Topo do Projeto"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Ações / Botões do Banner</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-550 uppercase tracking-widest border-l-2 border-violet-500 pl-2">Botão de Ação Principal</h4>
                                <div>
                                    <label className={labelClass}>Texto do Botão</label>
                                    <input 
                                        type="text" 
                                        value={config.hero_section.primary_btn.label} 
                                        onChange={e => setConfig({
                                            ...config,
                                            hero_section: {
                                                ...config.hero_section,
                                                primary_btn: { label: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Solicitar Orçamento Agora"
                                    />
                                    <span className="text-[10px] text-slate-400 block mt-1 ml-1">Esse botão redireciona o cliente para o WhatsApp de lead.</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-550 uppercase tracking-widest border-l-2 border-violet-500 pl-2">Botão de Ação Secundário</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className={labelClass}>Texto do Botão</label>
                                        <input 
                                            type="text" 
                                            value={config.hero_section.secondary_btn.label} 
                                            onChange={e => setConfig({
                                                ...config,
                                                hero_section: {
                                                    ...config.hero_section,
                                                    secondary_btn: { ...config.hero_section.secondary_btn, label: e.target.value }
                                                }
                                            })} 
                                            className={inputClass}
                                            placeholder="Ver Equipamentos"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link de Redirecionamento</label>
                                        <input 
                                            type="text" 
                                            value={config.hero_section.secondary_btn.url} 
                                            onChange={e => setConfig({
                                                ...config,
                                                hero_section: {
                                                    ...config.hero_section,
                                                    secondary_btn: { ...config.hero_section.secondary_btn, url: e.target.value }
                                                }
                                            })} 
                                            className={inputClass}
                                            placeholder="/servicos"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Diferenciais */}
            {tab === 'differentials' && (
                <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Diferenciais Competitivos</h3>
                    <p className="text-xs text-slate-400 -mt-2">Configure os 4 principais pilares rápidos que destacam sua empresa no canteiro de obras.</p>
                    
                    <label className="flex items-center gap-3 p-4 bg-slate-55/50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={config.differentials_section.enable_icon_rotation_hover}
                            onChange={e => setConfig({
                                ...config,
                                differentials_section: { ...config.differentials_section, enable_icon_rotation_hover: e.target.checked }
                            })}
                            className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-700">Ativar Rotação dos Ícones no Hover</p>
                            <p className="text-xs text-slate-400">Gira sutilmente os ícones ao passar o mouse em cima dos cards</p>
                        </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {config.differentials_section.items.map((item, i) => (
                            <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm relative group/card border-b-2 hover:border-b-violet-500 transition-all duration-300 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-violet-650 bg-violet-50 px-2.5 py-1 rounded-full">Diferencial {i + 1}</span>
                                    
                                    {/* Biblioteca de Ícones Premium Popover */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveIconPicker(activeIconPicker === i ? null : i)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl transition-all shadow-sm group"
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon_emoji || '⚙️'}</span>
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-violet-600">Alterar Ícone</span>
                                        </button>

                                        {activeIconPicker === i && (
                                            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Biblioteca de Ícones</h4>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setActiveIconPicker(null)}
                                                        className="text-xs font-bold text-slate-400 hover:text-slate-655"
                                                    >
                                                        Fechar
                                                    </button>
                                                </div>
                                                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                                                    {ICON_LIBRARY.map((cat, idx) => (
                                                        <div key={idx} className="space-y-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{cat.category}</span>
                                                            <div className="grid grid-cols-6 gap-2">
                                                                {cat.icons.map((ico) => (
                                                                    <button
                                                                        key={ico}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const copy = [...config.differentials_section.items];
                                                                            copy[i].icon_emoji = ico;
                                                                            setConfig({
                                                                                ...config,
                                                                                differentials_section: { ...config.differentials_section, items: copy }
                                                                            });
                                                                            setActiveIconPicker(null);
                                                                        }}
                                                                        className={`text-xl p-2 rounded-xl hover:bg-violet-50 hover:scale-110 transition-all border ${item.icon_emoji === ico ? 'border-violet-300 bg-violet-50/50' : 'border-transparent'}`}
                                                                    >
                                                                        {ico}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Título</label>
                                        <input 
                                            type="text" 
                                            value={item.title} 
                                            onChange={e => {
                                                const copy = [...config.differentials_section.items];
                                                copy[i].title = e.target.value;
                                                setConfig({
                                                    ...config,
                                                    differentials_section: { ...config.differentials_section, items: copy }
                                                });
                                            }}
                                            className={inputClass}
                                            placeholder="Ex: Entrega Rápida"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descrição</label>
                                        <textarea 
                                            rows={2} 
                                            value={item.description} 
                                            onChange={e => {
                                                const copy = [...config.differentials_section.items];
                                                copy[i].description = e.target.value;
                                                setConfig({
                                                    ...config,
                                                    differentials_section: { ...config.differentials_section, items: copy }
                                                });
                                            }}
                                            className={`${inputClass} resize-y`}
                                            placeholder="Explicativo do diferencial..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab Content: Sobre Nós (institucional) */}
            {tab === 'about' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Resumo Institucional (Homepage)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Foto Institucional Principal</label>
                                <label className="group relative border-2 border-dashed border-slate-300 hover:border-violet-500 bg-slate-50 hover:bg-violet-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center h-48">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPendingAboutImg(file);
                                                setConfig({
                                                    ...config,
                                                    about_section: { ...config.about_section, main_image_url: URL.createObjectURL(file) }
                                                });
                                            }
                                        }} 
                                    />
                                    {config.about_section.main_image_url ? (
                                        <img src={config.about_section.main_image_url} alt="Sobre" className="max-h-28 w-auto rounded-lg object-contain mb-3 border shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-3 group-hover:text-violet-500 transition-colors">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">
                                        {config.about_section.main_image_url ? 'Substituir Foto Institucional' : 'Enviar Foto Institucional'}
                                    </span>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Descrição Histórica Curta</label>
                                <textarea 
                                    rows={3} 
                                    value={config.about_section.description} 
                                    onChange={e => setConfig({
                                        ...config,
                                        about_section: { ...config.about_section, description: e.target.value }
                                    })} 
                                    className={`${inputClass} resize-y`}
                                    placeholder="Breve história institucional para a homepage..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Título Estruturado Institucional</h3>
                        <p className="text-xs text-slate-400 -mt-2">Divisão em 3 blocos para compor o título estilizado da seção sobre.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>Título Parte 1 (Normal)</label>
                                <input 
                                    type="text" 
                                    value={config.about_section.title.text_normal_1} 
                                    onChange={e => setConfig({
                                        ...config,
                                        about_section: {
                                            ...config.about_section,
                                            title: { ...config.about_section.title, text_normal_1: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: Especialistas em"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Título Parte 2 (Destaque Laranja)</label>
                                <input 
                                    type="text" 
                                    value={config.about_section.title.text_highlight} 
                                    onChange={e => setConfig({
                                        ...config,
                                        about_section: {
                                            ...config.about_section,
                                            title: { ...config.about_section.title, text_highlight: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: Segurança"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Título Parte 3 (Normal)</label>
                                <input 
                                    type="text" 
                                    value={config.about_section.title.text_normal_2} 
                                    onChange={e => setConfig({
                                        ...config,
                                        about_section: {
                                            ...config.about_section,
                                            title: { ...config.about_section.title, text_normal_2: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: e Performance"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Badge Dinâmico Flutuante (Imagem do Sobre)</h3>
                        
                        <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={config.about_section.floating_badge.visible}
                                onChange={e => setConfig({
                                    ...config,
                                    about_section: {
                                        ...config.about_section,
                                        floating_badge: { ...config.about_section.floating_badge, visible: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                            />
                            <div>
                                <p className="text-sm font-bold text-slate-700">Exibir Badge Dinâmico Flutuante</p>
                                <p className="text-xs text-slate-400">Ativa um selo flutuante de sucesso no canto da foto institucional</p>
                            </div>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Número/Texto em Destaque</label>
                                <input 
                                    type="text" 
                                    value={config.about_section.floating_badge.number} 
                                    onChange={e => setConfig({
                                        ...config,
                                        about_section: {
                                            ...config.about_section,
                                            floating_badge: { ...config.about_section.floating_badge, number: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: 15+"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Rótulo / Descrição</label>
                                <input 
                                    type="text" 
                                    value={config.about_section.floating_badge.text} 
                                    onChange={e => setConfig({
                                        ...config,
                                        about_section: {
                                            ...config.about_section,
                                            floating_badge: { ...config.about_section.floating_badge, text: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: ANOS NO MERCADO"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Testimonials & Vitrine */}
            {tab === 'testimonials' && (
                <div className="space-y-6">
                    {/* Seção da Vitrine de Equipamentos */}
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-800">Vitrine de Equipamentos (Homepage)</h3>
                            <p className="text-xs text-slate-450 mt-0.5">Edite os títulos e o botão de ação rápida da grade de andaimes da home</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Título da Vitrine</label>
                                <input 
                                    type="text" 
                                    value={config.services_preview_section.title} 
                                    onChange={e => setConfig({
                                        ...config,
                                        services_preview_section: { ...config.services_preview_section, title: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Equipamentos de Ponta"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Subtítulo da Vitrine</label>
                                <input 
                                    type="text" 
                                    value={config.services_preview_section.subtitle} 
                                    onChange={e => setConfig({
                                        ...config,
                                        services_preview_section: { ...config.services_preview_section, subtitle: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Soluções completas para escoramento e acessos"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Texto do Botão de Catálogo</label>
                                <input 
                                    type="text" 
                                    value={config.services_preview_section.top_btn.label} 
                                    onChange={e => setConfig({
                                        ...config,
                                        services_preview_section: {
                                            ...config.services_preview_section,
                                            top_btn: { ...config.services_preview_section.top_btn, label: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ver Catálogo Completo"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Link do Botão de Catálogo</label>
                                <input 
                                    type="text" 
                                    value={config.services_preview_section.top_btn.url} 
                                    onChange={e => setConfig({
                                        ...config,
                                        services_preview_section: {
                                            ...config.services_preview_section,
                                            top_btn: { ...config.services_preview_section.top_btn, url: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="/servicos"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Rótulo de Detalhes dos Cards</label>
                                <input 
                                    type="text" 
                                    value={config.services_preview_section.card_link_label} 
                                    onChange={e => setConfig({
                                        ...config,
                                        services_preview_section: { ...config.services_preview_section, card_link_label: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Detalhes do Produto"
                                />
                                <span className="text-[10px] text-slate-400 block mt-1 ml-1">Esse texto aparece no link de cada card de andaime na vitrine.</span>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Depoimentos */}
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-800">Depoimentos dos Clientes</h3>
                            <p className="text-xs text-slate-450 mt-0.5">Adicione, exclua e ordene os depoimentos que aparecem na home</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Título em Destaque</label>
                                <input 
                                    type="text" 
                                    value={config.testimonials_section.title_highlight} 
                                    onChange={e => setConfig({
                                        ...config,
                                        testimonials_section: { ...config.testimonials_section, title_highlight: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Quem Confia"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Subtítulo de Depoimentos</label>
                                <input 
                                    type="text" 
                                    value={config.testimonials_section.subtitle} 
                                    onChange={e => setConfig({
                                        ...config,
                                        testimonials_section: { ...config.testimonials_section, subtitle: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Parcerias sólidas em cada m² construído"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            {config.testimonials_section.items.map((item, i) => (
                                <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative group/card space-y-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex gap-3 items-center">
                                            {/* Avatar upload e preview circular */}
                                            <div className="relative group shrink-0">
                                                <label className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:border-violet-400 hover:ring-2 hover:ring-violet-500/20 transition-all">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setPendingAvatars({ ...pendingAvatars, [i]: file });
                                                                const copy = [...config.testimonials_section.items];
                                                                copy[i].avatar_url = URL.createObjectURL(file);
                                                                setConfig({
                                                                    ...config,
                                                                    testimonials_section: { ...config.testimonials_section, items: copy }
                                                                });
                                                            }
                                                        }} 
                                                    />
                                                    {item.avatar_url ? (
                                                        <img src={item.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-slate-350 hover:text-violet-555 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </label>
                                                <div className="absolute -bottom-0.5 -right-0.5 bg-violet-600 text-white rounded-full p-0.5 shadow-sm border border-white cursor-pointer pointer-events-none group-hover:bg-violet-750 transition-colors">
                                                    <Plus className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-xs font-bold text-violet-650 bg-violet-50 px-2 py-0.5 rounded-full">Depoimento {i + 1}</span>
                                                <div className="flex flex-wrap gap-x-2 gap-y-1 items-center mt-1">
                                                    <p className="text-[10px] text-slate-400 font-bold">Clique no avatar para enviar foto</p>
                                                    {item.avatar_url && (
                                                        <>
                                                            <span className="text-slate-300 text-[10px]">•</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedPending = { ...pendingAvatars };
                                                                    delete updatedPending[i];
                                                                    setPendingAvatars(updatedPending);
                                                                    
                                                                    const copy = [...config.testimonials_section.items];
                                                                    copy[i].avatar_url = '';
                                                                    setConfig({
                                                                        ...config,
                                                                        testimonials_section: { ...config.testimonials_section, items: copy }
                                                                    });
                                                                }}
                                                                className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                                                            >
                                                                Remover Foto
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Botões de Ação: Subir, Descer e Excluir */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={i === 0}
                                                onClick={() => moveTestimonial(i, 'up')}
                                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                                                title="Mover para cima"
                                            >
                                                <ArrowUp className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={i === config.testimonials_section.items.length - 1}
                                                onClick={() => moveTestimonial(i, 'down')}
                                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                                                title="Mover para baixo"
                                            >
                                                <ArrowDown className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const copy = config.testimonials_section.items.filter((_, idx) => idx !== i);
                                                    setConfig({
                                                        ...config,
                                                        testimonials_section: { ...config.testimonials_section, items: copy }
                                                    });
                                                    // Atualizar pendingAvatars removendo ou deslocando a chave do excluído
                                                    const updatedPending = { ...pendingAvatars };
                                                    delete updatedPending[i];
                                                    // Ajustar índices restantes
                                                    const newPending: Record<number, File> = {};
                                                    Object.keys(updatedPending).map(Number).forEach(idx => {
                                                        if (idx < i) {
                                                            newPending[idx] = updatedPending[idx];
                                                        } else if (idx > i) {
                                                            newPending[idx - 1] = updatedPending[idx];
                                                        }
                                                    });
                                                    setPendingAvatars(newPending);
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 hover:border-red-300 rounded-lg shadow-sm hover:bg-red-50 transition-colors ml-1.5"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Autor</label>
                                            <input 
                                                type="text" 
                                                value={item.author} 
                                                onChange={e => {
                                                    const copy = [...config.testimonials_section.items];
                                                    copy[i].author = e.target.value;
                                                    setConfig({
                                                        ...config,
                                                        testimonials_section: { ...config.testimonials_section, items: copy }
                                                    });
                                                }}
                                                className={inputClass}
                                                placeholder="Eng. Roberto Santos"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cargo / Empresa</label>
                                            <input 
                                                type="text" 
                                                value={item.company_role} 
                                                onChange={e => {
                                                    const copy = [...config.testimonials_section.items];
                                                    copy[i].company_role = e.target.value;
                                                    setConfig({
                                                        ...config,
                                                        testimonials_section: { ...config.testimonials_section, items: copy }
                                                    });
                                                }}
                                                className={inputClass}
                                                placeholder="Construtora Aliança"
                                            />
                                        </div>

                                        {/* Classificação por estrelas interativa */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Classificação</label>
                                            <div className="flex items-center gap-1 h-11 bg-white border border-slate-200 rounded-xl px-4 shadow-sm">
                                                {Array.from({ length: 5 }).map((_, starIdx) => {
                                                    const starNum = starIdx + 1;
                                                    const isFilled = starNum <= (item.stars_count || 5);
                                                    return (
                                                        <button
                                                            key={starIdx}
                                                            type="button"
                                                            onClick={() => {
                                                                const copy = [...config.testimonials_section.items];
                                                                copy[i].stars_count = starNum;
                                                                setConfig({
                                                                    ...config,
                                                                    testimonials_section: { ...config.testimonials_section, items: copy }
                                                                });
                                                            }}
                                                            className="focus:outline-none hover:scale-120 transition-transform"
                                                        >
                                                            <Star 
                                                                className={`w-5 h-5 ${isFilled ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} 
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mensagem do Depoimento</label>
                                            <textarea 
                                                rows={2} 
                                                value={item.quote} 
                                                onChange={e => {
                                                    const copy = [...config.testimonials_section.items];
                                                    copy[i].quote = e.target.value;
                                                    setConfig({
                                                        ...config,
                                                        testimonials_section: { ...config.testimonials_section, items: copy }
                                                    });
                                                }}
                                                className={`${inputClass} resize-y`}
                                                placeholder="Excelente locação, andaimes super seguros..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button 
                                type="button" 
                                onClick={() => {
                                    const copy = [...config.testimonials_section.items, { quote: '', author: '', company_role: '', stars_count: 5, avatar_url: '' }];
                                    setConfig({
                                        ...config,
                                        testimonials_section: { ...config.testimonials_section, items: copy }
                                    });
                                }}
                                className="w-full bg-violet-50 hover:bg-violet-100 border border-violet-200 border-dashed text-violet-750 py-4 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-300"
                            >
                                <Plus className="w-4 h-4" /> Adicionar Novo Depoimento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: SEO & Chamada Final */}
            {tab === 'seo_cta' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Configuração SEO da Homepage</h3>
                        <p className="text-xs text-slate-400 -mt-2">Define o título da aba do navegador e descrição específicos para a Homepage (Raiz `/` do domínio).</p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Título da Aba do Navegador (Homepage Title)</label>
                                <input 
                                    type="text" 
                                    value={config.seo.meta_title} 
                                    onChange={e => setConfig({
                                        ...config,
                                        seo: { ...config.seo, meta_title: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="Aluguel de Andaimes | Andaime PRO - Segurança em Altura"
                                />
                                <span className="text-[10px] text-slate-400 block mt-1.5 ml-1">Esse é o título que resolve a dúvida: ele é exibido no cabeçalho do navegador na raiz!</span>
                            </div>

                            <div>
                                <label className={labelClass}>Descrição de Busca (Meta Description - Homepage)</label>
                                <textarea 
                                    rows={3} 
                                    value={config.seo.meta_description} 
                                    onChange={e => setConfig({
                                        ...config,
                                        seo: { ...config.seo, meta_description: e.target.value }
                                    })} 
                                    className={`${inputClass} resize-y`}
                                    placeholder="Descrição da busca específica para a Homepage..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Chamada de Conversão Final (CTA Rodapé)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>CTA Parte 1 (Normal)</label>
                                <input 
                                    type="text" 
                                    value={config.footer_cta_section.title.text_normal_1} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_cta_section: {
                                            ...config.footer_cta_section,
                                            title: { ...config.footer_cta_section.title, text_normal_1: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>CTA Parte 2 (Normal)</label>
                                <input 
                                    type="text" 
                                    value={config.footer_cta_section.title.text_normal_2} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_cta_section: {
                                            ...config.footer_cta_section,
                                            title: { ...config.footer_cta_section.title, text_normal_2: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>CTA Parte 3 (Destaque Laranja)</label>
                                <input 
                                    type="text" 
                                    value={config.footer_cta_section.title.text_highlight} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_cta_section: {
                                            ...config.footer_cta_section,
                                            title: { ...config.footer_cta_section.title, text_highlight: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className={labelClass}>Descrição de Conversão</label>
                                <textarea 
                                    rows={2} 
                                    value={config.footer_cta_section.description} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_cta_section: { ...config.footer_cta_section, description: e.target.value }
                                    })} 
                                    className={`${inputClass} resize-y`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Texto do Botão WhatsApp Principal</label>
                                <input 
                                    type="text" 
                                    value={config.footer_cta_section.whatsapp_btn_label} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_cta_section: { ...config.footer_cta_section, whatsapp_btn_label: e.target.value }
                                    })} 
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Prefixo do Botão Telefone</label>
                                <input 
                                    type="text" 
                                    value={config.footer_cta_section.phone_btn_label_prefix} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_cta_section: { ...config.footer_cta_section, phone_btn_label_prefix: e.target.value }
                                    })} 
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
