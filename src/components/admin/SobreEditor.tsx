import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, LayoutTemplate, Shield, Users, Award, Eye, Compass, CheckCircle } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

type Tab = 'hero' | 'mvv' | 'security' | 'team';

const ICON_LIBRARY = [
    { category: '🎯 Metas & Qualidade', icons: ['🎯', '👁️', '💎', '🤝', '🏆', '⭐', '🥇', '📈'] },
    { category: '🛠️ Construção & Segurança', icons: ['🛡️', '⛑️', '🦺', '🏗️', '🧱', '🔧', '⚙️', '🔒'] },
    { category: '⚡ Velocidade & Suporte', icons: ['⚡', '⏱️', '🚀', '🚚', '📞', '💬', '💡', '🔥'] }
];

const DEFAULT_CONFIG = {
    seo: {
        meta_title: '',
        meta_description: ''
    },
    hero_section: {
        bg_color: 'bg-slate-950',
        badge_text: '',
        title: {
            text_normal_1: '',
            text_highlight: '',
            text_normal_2: ''
        },
        description: '',
        enable_geometric_background: true
    },
    mvv_section: {
        bg_color: 'bg-white',
        enable_card_hover_effects: true,
        items: [
            { icon_emoji: '🎯', title: '', description: '' },
            { icon_emoji: '👁️', title: '', description: '' },
            { icon_emoji: '💎', title: '', description: '' }
        ] as Array<{ icon_emoji: string; title: string; description: string }>
    },
    security_section: {
        bg_color: 'bg-slate-50',
        title: {
            text_normal_1: '',
            text_highlight: '',
            text_normal_2: ''
        },
        intro_text: '',
        bullet_points: [] as string[],
        illustration: {
            image_url: '',
            enable_zoom_hover: true,
            enable_overlay_fade_hover: true
        }
    },
    team_section: {
        bg_color: 'bg-white',
        title: '',
        subtitle: '',
        enable_grayscale_hover: true,
        members: [] as Array<{ photo_url: string; area_name: string }>
    }
};

export default function SobreEditor() {
    const [sobre, setSobre] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('hero');
    const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);

    const [pendingSecurityImg, setPendingSecurityImg] = useState<File | null>(null);
    const [pendingTeamPhotos, setPendingTeamPhotos] = useState<Record<number, File>>({});

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result?.toString() || '').split(',')[1]);
        reader.onerror = error => reject(error);
    });

    useEffect(() => {
        githubApi('read', 'src/data/pages/sobre.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || "{}");
                // Deep merge robusto para evitar quebras
                const merged = {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    seo: { ...DEFAULT_CONFIG.seo, ...(parsed.seo || {}) },
                    hero_section: {
                        ...DEFAULT_CONFIG.hero_section,
                        ...(parsed.hero_section || {}),
                        title: { ...DEFAULT_CONFIG.hero_section.title, ...(parsed.hero_section?.title || {}) }
                    },
                    mvv_section: {
                        ...DEFAULT_CONFIG.mvv_section,
                        ...(parsed.mvv_section || {}),
                        items: Array.isArray(parsed.mvv_section?.items)
                            ? parsed.mvv_section.items
                            : DEFAULT_CONFIG.mvv_section.items
                    },
                    security_section: {
                        ...DEFAULT_CONFIG.security_section,
                        ...(parsed.security_section || {}),
                        title: { ...DEFAULT_CONFIG.security_section.title, ...(parsed.security_section?.title || {}) },
                        bullet_points: Array.isArray(parsed.security_section?.bullet_points)
                            ? parsed.security_section.bullet_points
                            : [],
                        illustration: { ...DEFAULT_CONFIG.security_section.illustration, ...(parsed.security_section?.illustration || {}) }
                    },
                    team_section: {
                        ...DEFAULT_CONFIG.team_section,
                        ...(parsed.team_section || {}),
                        members: Array.isArray(parsed.team_section?.members)
                            ? parsed.team_section.members
                            : []
                    }
                };
                setSobre(merged);
                setFileSha(data.sha);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        triggerToast('Salvando alterações da Página Sobre...', 'progress', 10);
        try {
            let finalJson = { ...sobre };

            // 1. Upload da ilustração de segurança
            if (pendingSecurityImg) {
                triggerToast('Enviando ilustração de segurança...', 'progress', 35);
                const base64Content = await fileToBase64(pendingSecurityImg);
                const fileExt = pendingSecurityImg.name.split('.').pop() || 'jpg';
                const ghPath = `public/images/about-security.${fileExt}`;

                let securityImgSha: string | undefined;
                try {
                    const existing = await githubApi('read', ghPath);
                    if (existing?.sha) securityImgSha = existing.sha;
                } catch {}

                await githubApi('write', ghPath, {
                    content: base64Content,
                    isBase64: true,
                    sha: securityImgSha,
                    message: 'CMS: Upload Security Illustration'
                });
                finalJson.security_section.illustration.image_url = `/images/about-security.${fileExt}`;
            }

            // 2. Upload das fotos de equipe pendentes
            const teamIndices = Object.keys(pendingTeamPhotos).map(Number);
            for (const idx of teamIndices) {
                const file = pendingTeamPhotos[idx];
                if (file) {
                    triggerToast(`Enviando foto da equipe ${idx + 1}...`, 'progress', 65);
                    const base64Content = await fileToBase64(file);
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const ghPath = `public/images/team/member-${idx}.${fileExt}`;

                    let memberSha: string | undefined;
                    try {
                        const existing = await githubApi('read', ghPath);
                        if (existing?.sha) memberSha = existing.sha;
                    } catch {}

                    await githubApi('write', ghPath, {
                        content: base64Content,
                        isBase64: true,
                        sha: memberSha,
                        message: `CMS: Upload Team Photo ${idx + 1}`
                    });
                    finalJson.team_section.members[idx].photo_url = `/images/team/member-${idx}.${fileExt}`;
                }
            }

            // 3. Salvar o arquivo sobre.json final
            triggerToast('Atualizando arquivos de dados...', 'progress', 85);
            const res = await githubApi('write', 'src/data/pages/sobre.json', {
                content: JSON.stringify(finalJson, null, 2),
                sha: fileSha,
                message: 'CMS: Update sobre.json'
            });

            setFileSha(res.sha);
            setPendingSecurityImg(null);
            setPendingTeamPhotos({});

            // Atualizar cache-busting local nas imagens
            const extSec = pendingSecurityImg?.name.split('.').pop() || 'jpg';
            if (pendingSecurityImg) {
                finalJson.security_section.illustration.image_url = `/images/about-security.${extSec}?t=${Date.now()}`;
            }
            teamIndices.forEach(idx => {
                const f = pendingTeamPhotos[idx];
                if (f) {
                    const extMem = f.name.split('.').pop() || 'jpg';
                    finalJson.team_section.members[idx].photo_url = `/images/team/member-${idx}.${extMem}?t=${Date.now()}`;
                }
            });

            setSobre(finalJson);
            triggerToast('Página Sobre atualizada com sucesso!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const moveMember = (index: number, direction: 'up' | 'down') => {
        const copy = [...sobre.team_section.members];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= copy.length) return;

        // Swap
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;

        // Swap pending photos
        const updatedPending = { ...pendingTeamPhotos };
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
        setPendingTeamPhotos(updatedPending);

        setSobre({
            ...sobre,
            team_section: {
                ...sobre.team_section,
                members: copy
            }
        });
        triggerToast('Ordem dos membros atualizada!', 'success', 30);
    };

    const moveBulletPoint = (index: number, direction: 'up' | 'down') => {
        const copy = [...sobre.security_section.bullet_points];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= copy.length) return;

        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;

        setSobre({
            ...sobre,
            security_section: {
                ...sobre.security_section,
                bullet_points: copy
            }
        });
        triggerToast('Ordem dos tópicos atualizada!', 'success', 30);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
            <p className="font-medium animate-pulse">Conectando ao Repositório...</p>
        </div>
    );

    if (error && !sobre.hero_section.title.text_highlight) return (
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
        { id: 'mvv', label: 'Missão & Valores', icon: Compass },
        { id: 'security', label: 'Segurança NR-18', icon: Shield },
        { id: 'team', label: 'Elite Técnica (Equipe)', icon: Users }
    ];

    return (
        <div className="max-w-4xl space-y-0 pb-32">
            {/* Header de Ações */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 transition-all">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                        <span>Página Institucional (Sobre Nós)</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                        Gerencie a história da empresa, diretrizes de segurança NR-18 e equipe no arquivo <code className="bg-slate-50 px-1.5 py-0.5 rounded text-violet-600 border border-slate-100 font-mono">pages/sobre.json</code>
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-750 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 active:scale-95 shrink-0 cursor-pointer"
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
                                    : 'bg-white text-slate-550 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
                {/* ABA 1: HERO & GERAL */}
                {tab === 'hero' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Banner Principal (Hero)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Badge Superior</label>
                                    <input 
                                        type="text" 
                                        value={sobre.hero_section.badge_text} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            hero_section: { ...sobre.hero_section, badge_text: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="Nossa Trajetória"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Título - Bloco Normal Inicial</label>
                                    <input 
                                        type="text" 
                                        value={sobre.hero_section.title.text_normal_1} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            hero_section: {
                                                ...sobre.hero_section,
                                                title: { ...sobre.hero_section.title, text_normal_1: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Construindo as bases do "
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Título - Bloco em Destaque (Dourado/Primary)</label>
                                    <input 
                                        type="text" 
                                        value={sobre.hero_section.title.text_highlight} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            hero_section: {
                                                ...sobre.hero_section,
                                                title: { ...sobre.hero_section.title, text_highlight: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="progresso"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Título - Bloco Normal Final</label>
                                    <input 
                                        type="text" 
                                        value={sobre.hero_section.title.text_normal_2} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            hero_section: {
                                                ...sobre.hero_section,
                                                title: { ...sobre.hero_section.title, text_normal_2: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder=" desde 2009."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Descrição Longa</label>
                                    <textarea 
                                        rows={4} 
                                        value={sobre.hero_section.description} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            hero_section: { ...sobre.hero_section, description: e.target.value }
                                        })} 
                                        className={`${inputClass} resize-y`}
                                        placeholder="Descreva a história e a base de fundação da empresa..."
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Fundo Geométrico Decorativo</label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={sobre.hero_section.enable_geometric_background} 
                                            onChange={e => setSobre({
                                                ...sobre,
                                                hero_section: { ...sobre.hero_section, enable_geometric_background: e.target.checked }
                                            })} 
                                            className="w-4 h-4 text-violet-600 rounded border-slate-350 focus:ring-violet-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700">Ativar Fundo Skew Geometrico</span>
                                    </label>
                                </div>

                                <div>
                                    <label className={labelClass}>Estilo / Cor de Fundo</label>
                                    <input 
                                        type="text" 
                                        value={sobre.hero_section.bg_color} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            hero_section: { ...sobre.hero_section, bg_color: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="bg-slate-950"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Configuração SEO (Sobre Nós)</h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>Título da Aba (Title Tag)</label>
                                    <input 
                                        type="text" 
                                        value={sobre.seo.meta_title} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            seo: { ...sobre.seo, meta_title: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="Nossa História | Andaime PRO - Tradição e Segurança"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Meta Descrição (Search Snippet)</label>
                                    <textarea 
                                        rows={3} 
                                        value={sobre.seo.meta_description} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            seo: { ...sobre.seo, meta_description: e.target.value }
                                        })} 
                                        className={`${inputClass} resize-y text-xs`}
                                        placeholder="Escreva uma meta descrição persuasiva para mecanismos de busca..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 2: MISSÃO, VISÃO E VALORES (MVV) */}
                {tab === 'mvv' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Configuração Geral da Seção</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Cor de Fundo da Seção</label>
                                    <input 
                                        type="text" 
                                        value={sobre.mvv_section.bg_color} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            mvv_section: { ...sobre.mvv_section, bg_color: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="bg-white"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Efeitos Visuais de Cartões</label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={sobre.mvv_section.enable_card_hover_effects} 
                                            onChange={e => setSobre({
                                                ...sobre,
                                                mvv_section: { ...sobre.mvv_section, enable_card_hover_effects: e.target.checked }
                                            })} 
                                            className="w-4 h-4 text-violet-600 rounded border-slate-350 focus:ring-violet-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700">Ativar Efeito Zoom Hover</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                            {sobre.mvv_section.items.map((item, idx) => (
                                <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
                                    <div className="flex gap-4 items-center border-b border-slate-100 pb-3">
                                        {/* Ícone popover */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setActiveIconPicker(activeIconPicker === idx ? null : idx)}
                                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl hover:bg-violet-650 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
                                                title="Clique para escolher emoji"
                                            >
                                                {item.icon_emoji || '💎'}
                                            </button>

                                            {activeIconPicker === idx && (
                                                <div className="absolute top-14 left-0 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl z-40 w-64 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Selecione um Ícone</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setActiveIconPicker(null)} 
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
                                                                                const copy = [...sobre.mvv_section.items];
                                                                                copy[idx].icon_emoji = ic;
                                                                                setSobre({
                                                                                    ...sobre,
                                                                                    mvv_section: { ...sobre.mvv_section, items: copy }
                                                                                });
                                                                                setActiveIconPicker(null);
                                                                                triggerToast('Ícone atualizado!', 'success', 20);
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
                                            <span className="text-xs font-black text-violet-650 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded-full">Card {idx + 1}</span>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Clique no ícone para alterá-lo</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Título do Cartão</label>
                                            <input 
                                                type="text" 
                                                value={item.title} 
                                                onChange={e => {
                                                    const copy = [...sobre.mvv_section.items];
                                                    copy[idx].title = e.target.value;
                                                    setSobre({
                                                        ...sobre,
                                                        mvv_section: { ...sobre.mvv_section, items: copy }
                                                    });
                                                }}
                                                className={inputClass}
                                                placeholder="Nossa Missão"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descrição Comercial</label>
                                            <textarea 
                                                rows={2} 
                                                value={item.description} 
                                                onChange={e => {
                                                    const copy = [...sobre.mvv_section.items];
                                                    copy[idx].description = e.target.value;
                                                    setSobre({
                                                        ...sobre,
                                                        mvv_section: { ...sobre.mvv_section, items: copy }
                                                    });
                                                }}
                                                className={`${inputClass} resize-y`}
                                                placeholder="Prover soluções de acesso seguras e eficientes..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ABA 3: SEGURANÇA NR-18 */}
                {tab === 'security' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Configuração da Seção de Segurança</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Título - Bloco Normal Inicial</label>
                                    <input 
                                        type="text" 
                                        value={sobre.security_section.title.text_normal_1} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            security_section: {
                                                ...sobre.security_section,
                                                title: { ...sobre.security_section.title, text_normal_1: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="Segurança "
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Título - Bloco Destaque (Dourado/Primary)</label>
                                    <input 
                                        type="text" 
                                        value={sobre.security_section.title.text_highlight} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            security_section: {
                                                ...sobre.security_section,
                                                title: { ...sobre.security_section.title, text_highlight: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder="NR-18"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Título - Bloco Normal Final</label>
                                    <input 
                                        type="text" 
                                        value={sobre.security_section.title.text_normal_2} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            security_section: {
                                                ...sobre.security_section,
                                                title: { ...sobre.security_section.title, text_normal_2: e.target.value }
                                            }
                                        })} 
                                        className={inputClass}
                                        placeholder=" no DNA"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Texto Introdutório</label>
                                    <textarea 
                                        rows={3} 
                                        value={sobre.security_section.intro_text} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            security_section: { ...sobre.security_section, intro_text: e.target.value }
                                        })} 
                                        className={`${inputClass} resize-y`}
                                        placeholder="Checklists técnicos de controle e respeito integral às diretrizes da NR-18..."
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Cor de Fundo da Seção</label>
                                    <input 
                                        type="text" 
                                        value={sobre.security_section.bg_color} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            security_section: { ...sobre.security_section, bg_color: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bullet points dinâmicos */}
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Tópicos e Normas Técnicas</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-1">
                                    Adicione, ordene ou remova os tópicos e certificações exibidos em formato de check na seção de segurança da página.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {sobre.security_section.bullet_points.map((point, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <span className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none border border-emerald-200">
                                            ✓
                                        </span>
                                        <input 
                                            type="text" 
                                            value={point} 
                                            onChange={e => {
                                                const copy = [...sobre.security_section.bullet_points];
                                                copy[idx] = e.target.value;
                                                setSobre({
                                                    ...sobre,
                                                    security_section: { ...sobre.security_section, bullet_points: copy }
                                                });
                                            }}
                                            className={inputClass}
                                            placeholder="Ex: Manutenção preventiva em 100% dos andaimes."
                                        />
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => moveBulletPoint(idx, 'up')}
                                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 shadow-sm transition-all"
                                            title="Subir"
                                        >
                                            <ArrowUp className="w-3.5 h-3.5 text-slate-650" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={idx === sobre.security_section.bullet_points.length - 1}
                                            onClick={() => moveBulletPoint(idx, 'down')}
                                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 shadow-sm transition-all"
                                            title="Descer"
                                        >
                                            <ArrowDown className="w-3.5 h-3.5 text-slate-650" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const copy = sobre.security_section.bullet_points.filter((_, i) => i !== idx);
                                                setSobre({
                                                    ...sobre,
                                                    security_section: { ...sobre.security_section, bullet_points: copy }
                                                });
                                                triggerToast('Tópico removido', 'success', 20);
                                            }}
                                            className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm text-red-600 transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => {
                                        const copy = [...sobre.security_section.bullet_points, ''];
                                        setSobre({
                                            ...sobre,
                                            security_section: { ...sobre.security_section, bullet_points: copy }
                                        });
                                    }}
                                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed text-slate-600 py-3 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar Novo Tópico
                                </button>
                            </div>
                        </div>

                        {/* Ilustração Técnica */}
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Ilustração da Seção</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="space-y-4">
                                    <label className="relative block w-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-100 hover:border-violet-400 transition-all select-none">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setPendingSecurityImg(file);
                                                    setSobre({
                                                        ...sobre,
                                                        security_section: {
                                                            ...sobre.security_section,
                                                            illustration: {
                                                                ...sobre.security_section.illustration,
                                                                image_url: URL.createObjectURL(file)
                                                            }
                                                        }
                                                    });
                                                }
                                            }} 
                                        />
                                        <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                        <span className="block text-xs font-black text-slate-700">Enviar Nova Ilustração</span>
                                        <span className="block text-[10px] text-slate-450 mt-1 font-semibold">Tamanho recomendado: Aspecto Paisagem/Video</span>
                                    </label>

                                    {pendingSecurityImg && (
                                        <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-750 font-bold uppercase py-1.5 px-3 rounded-full flex gap-1.5 items-center w-fit shadow-sm">
                                            ⚠️ Upload pendente de gravação
                                        </span>
                                    )}

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={sobre.security_section.illustration.enable_zoom_hover} 
                                                onChange={e => setSobre({
                                                    ...sobre,
                                                    security_section: {
                                                        ...sobre.security_section,
                                                        illustration: { ...sobre.security_section.illustration, enable_zoom_hover: e.target.checked }
                                                    }
                                                })} 
                                                className="w-4 h-4 text-violet-600 rounded border-slate-350 focus:ring-violet-500"
                                            />
                                            <span className="text-xs font-bold text-slate-700">Efeito Zoom no Hover</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={sobre.security_section.illustration.enable_overlay_fade_hover} 
                                                onChange={e => setSobre({
                                                    ...sobre,
                                                    security_section: {
                                                        ...sobre.security_section,
                                                        illustration: { ...sobre.security_section.illustration, enable_overlay_fade_hover: e.target.checked }
                                                    }
                                                })} 
                                                className="w-4 h-4 text-violet-600 rounded border-slate-350 focus:ring-violet-500"
                                            />
                                            <span className="text-xs font-bold text-slate-700">Remover Filtro Escuro no Hover</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="aspect-video bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center relative">
                                    {sobre.security_section.illustration.image_url ? (
                                        <img 
                                            src={sobre.security_section.illustration.image_url} 
                                            alt="Ilustração de segurança" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-400 font-bold">Sem imagem ilustrativa</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 4: ELITE TÉCNICA (EQUIPE) */}
                {tab === 'team' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Configuração Geral da Equipe</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Título de Equipe</label>
                                    <input 
                                        type="text" 
                                        value={sobre.team_section.title} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            team_section: { ...sobre.team_section, title: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="Elite Técnica"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Subtítulo / Descrição</label>
                                    <textarea 
                                        rows={3} 
                                        value={sobre.team_section.subtitle} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            team_section: { ...sobre.team_section, subtitle: e.target.value }
                                        })} 
                                        className={`${inputClass} resize-y`}
                                        placeholder="Apresentação das divisões de engenharia e operacional de elite..."
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Efeito de Tons de Cinza (Grayscale)</label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={sobre.team_section.enable_grayscale_hover} 
                                            onChange={e => setSobre({
                                                ...sobre,
                                                team_section: { ...sobre.team_section, enable_grayscale_hover: e.target.checked }
                                            })} 
                                            className="w-4 h-4 text-violet-600 rounded border-slate-350 focus:ring-violet-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700">Filtro Preto e Branco no Hover</span>
                                    </label>
                                </div>

                                <div>
                                    <label className={labelClass}>Cor de Fundo da Seção</label>
                                    <input 
                                        type="text" 
                                        value={sobre.team_section.bg_color} 
                                        onChange={e => setSobre({
                                            ...sobre,
                                            team_section: { ...sobre.team_section, bg_color: e.target.value }
                                        })} 
                                        className={inputClass}
                                        placeholder="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Membros de Equipe dinâmicos */}
                        <div className="space-y-6 pt-2">
                            {sobre.team_section.members.map((member, idx) => (
                                <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex gap-4 items-center">
                                            {/* Photo upload e preview circular */}
                                            <div className="relative group shrink-0">
                                                <label className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:border-violet-400 hover:ring-2 hover:ring-violet-500/20 transition-all">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setPendingTeamPhotos({ ...pendingTeamPhotos, [idx]: file });
                                                                const copy = [...sobre.team_section.members];
                                                                copy[idx].photo_url = URL.createObjectURL(file);
                                                                setSobre({
                                                                    ...sobre,
                                                                    team_section: { ...sobre.team_section, members: copy }
                                                                });
                                                            }
                                                        }} 
                                                    />
                                                    {member.photo_url ? (
                                                        <img src={member.photo_url} alt="Setor" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-slate-350 hover:text-violet-555 transition-colors">
                                                            <ImageIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </label>
                                                <div className="absolute -bottom-0.5 -right-0.5 bg-violet-600 text-white rounded-full p-0.5 shadow-sm border border-white cursor-pointer pointer-events-none group-hover:bg-violet-750 transition-colors">
                                                    <Plus className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-xs font-bold text-violet-650 bg-violet-50 px-2 py-0.5 rounded-full">Setor {idx + 1}</span>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">Clique para enviar imagem do setor</p>
                                            </div>
                                        </div>

                                        {/* Botões de subir, descer e excluir */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={idx === 0}
                                                onClick={() => moveMember(idx, 'up')}
                                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                                                title="Mover para cima"
                                            >
                                                <ArrowUp className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={idx === sobre.team_section.members.length - 1}
                                                onClick={() => moveMember(idx, 'down')}
                                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                                                title="Mover para baixo"
                                            >
                                                <ArrowDown className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const copy = sobre.team_section.members.filter((_, i) => i !== idx);
                                                    setSobre({
                                                        ...sobre,
                                                        team_section: { ...sobre.team_section, members: copy }
                                                    });
                                                    // Atualizar pendentes
                                                    const updated = { ...pendingTeamPhotos };
                                                    delete updated[idx];
                                                    const nextPending: Record<number, File> = {};
                                                    Object.keys(updated).map(Number).forEach(i => {
                                                        if (i < idx) {
                                                            nextPending[i] = updated[i];
                                                        } else if (i > idx) {
                                                            nextPending[i - 1] = updated[i];
                                                        }
                                                    });
                                                    setPendingTeamPhotos(nextPending);
                                                    triggerToast('Membro/Setor removido', 'success', 20);
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 hover:border-red-300 rounded-lg shadow-sm hover:bg-red-50 transition-colors ml-1.5"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome do Setor / Área</label>
                                        <input 
                                            type="text" 
                                            value={member.area_name} 
                                            onChange={e => {
                                                const copy = [...sobre.team_section.members];
                                                copy[idx].area_name = e.target.value;
                                                setSobre({
                                                    ...sobre,
                                                    team_section: { ...sobre.team_section, members: copy }
                                                });
                                            }}
                                            className={inputClass}
                                            placeholder="Ex: ENGENHARIA"
                                        />
                                    </div>
                                </div>
                            ))}

                            <button 
                                type="button" 
                                onClick={() => {
                                    const copy = [...sobre.team_section.members, { photo_url: '', area_name: '' }];
                                    setSobre({
                                        ...sobre,
                                        team_section: { ...sobre.team_section, members: copy }
                                    });
                                }}
                                className="w-full bg-violet-50 hover:bg-violet-100 border border-violet-200 border-dashed text-violet-750 py-4 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                            >
                                <Plus className="w-4 h-4" /> Adicionar Novo Setor/Membro
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
