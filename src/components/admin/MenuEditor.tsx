import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, AlignJustify, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2, AlertCircle, LayoutList, ExternalLink } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

type MenuLink = {
    label: string;
    url: string;
};

type GlobaisConfig = {
    identity?: any;
    contact_info?: any;
    global_seo?: any;
    header_navigation: {
        enable_sticky_header: boolean;
        enable_backdrop_blur: boolean;
        nav_links: MenuLink[];
        cta_button: {
            label: string;
            url: string;
        };
    };
    footer_section: {
        description_text: string;
        copyright_format: string;
        nav_column_title: string;
        contact_column_title: string;
        nav_links: MenuLink[];
        legal_links: MenuLink[];
    };
    floating_whatsapp_btn?: any;
};

const DEFAULT_FOOTER_NAV = [
    { label: 'Equipamentos', url: '/servicos' },
    { label: 'Segurança (Blog)', url: '/blog' },
    { label: 'Orçamentos', url: '/contato' },
    { label: 'Sobre Nós', url: '/sobre' }
];

const DEFAULT_CONFIG: GlobaisConfig = {
    header_navigation: {
        enable_sticky_header: true,
        enable_backdrop_blur: true,
        nav_links: [],
        cta_button: {
            label: '',
            url: ''
        }
    },
    footer_section: {
        description_text: '',
        copyright_format: '',
        nav_column_title: 'Navegação',
        contact_column_title: 'Contato',
        nav_links: DEFAULT_FOOTER_NAV,
        legal_links: []
    }
};

type TabType = 'header' | 'footer_nav' | 'footer_legal';

export default function MenuEditor() {
    const [config, setConfig] = useState<GlobaisConfig>(DEFAULT_CONFIG);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('header');

    useEffect(() => {
        githubApi('read', 'src/data/pages/globais.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || "{}");
                const merged = {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    header_navigation: {
                        ...DEFAULT_CONFIG.header_navigation,
                        ...(parsed.header_navigation || {}),
                        nav_links: Array.isArray(parsed.header_navigation?.nav_links) ? parsed.header_navigation.nav_links : []
                    },
                    footer_section: {
                        ...DEFAULT_CONFIG.footer_section,
                        ...(parsed.footer_section || {}),
                        nav_links: Array.isArray(parsed.footer_section?.nav_links) 
                            ? parsed.footer_section.nav_links 
                            : (parsed.footer_section?.nav_links === undefined ? DEFAULT_FOOTER_NAV : []),
                        legal_links: Array.isArray(parsed.footer_section?.legal_links) ? parsed.footer_section.legal_links : []
                    }
                };
                setConfig(merged);
                setFileSha(data.sha);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleSave() {
        setSaving(true);
        setError('');
        triggerToast('Salvando menus...', 'progress', 40);
        try {
            const res = await githubApi('write', 'src/data/pages/globais.json', {
                content: JSON.stringify(config, null, 2),
                sha: fileSha,
                message: 'CMS: Update menus inside globais.json'
            });
            setFileSha(res.sha);
            triggerToast('Menus salvos com sucesso!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    }

    const currentLinks = activeTab === 'header' 
        ? config.header_navigation.nav_links 
        : (activeTab === 'footer_nav' ? config.footer_section.nav_links : config.footer_section.legal_links);

    function updateLinks(newLinks: MenuLink[]) {
        if (activeTab === 'header') {
            setConfig(prev => ({
                ...prev,
                header_navigation: {
                    ...prev.header_navigation,
                    nav_links: newLinks
                }
            }));
        } else if (activeTab === 'footer_nav') {
            setConfig(prev => ({
                ...prev,
                footer_section: {
                    ...prev.footer_section,
                    nav_links: newLinks
                }
            }));
        } else {
            setConfig(prev => ({
                ...prev,
                footer_section: {
                    ...prev.footer_section,
                    legal_links: newLinks
                }
            }));
        }
    }

    function handleAddLink() {
        const newLinks = [...currentLinks, { label: 'Novo Item', url: '/' }];
        updateLinks(newLinks);
    }

    function handleRemoveLink(idx: number) {
        const newLinks = currentLinks.filter((_, i) => i !== idx);
        updateLinks(newLinks);
    }

    function handleMoveLink(idx: number, direction: 'up' | 'down') {
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === currentLinks.length - 1) return;

        const newLinks = [...currentLinks];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        [newLinks[idx], newLinks[swapIdx]] = [newLinks[swapIdx], newLinks[idx]];
        updateLinks(newLinks);
    }

    function handleLinkChange(idx: number, field: keyof MenuLink, value: string) {
        const newLinks = [...currentLinks];
        newLinks[idx] = { ...newLinks[idx], [field]: value };
        updateLinks(newLinks);
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
            <p className="font-medium animate-pulse">Conectando ao Repositório...</p>
        </div>
    );

    if (error && !config.header_navigation) return (
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-200 flex gap-4 items-start">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <div>
                <h3 className="text-xl font-bold mb-2">Erro ao carregar menus</h3>
                <p>{error}</p>
            </div>
        </div>
    );

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm text-slate-800 font-semibold";
    const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <div className="space-y-8 pb-32 max-w-3xl">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Gerenciador de Menus</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Customize de forma visual os menus de navegação do site</p>
                </div>
                <button 
                    onClick={handleSave}
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
            <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/50 shadow-inner flex-wrap">
                <button
                    type="button"
                    onClick={() => setActiveTab('header')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === 'header'
                            ? 'bg-white text-violet-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Compass className="w-4 h-4" />
                    Cabeçalho (Header)
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('footer_nav')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === 'footer_nav'
                            ? 'bg-white text-violet-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <AlignJustify className="w-4 h-4" />
                    Navegação do Rodapé
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('footer_legal')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === 'footer_legal'
                            ? 'bg-white text-violet-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Políticas (Footer Legal)
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-violet-50/60 border border-violet-100/80 rounded-2xl p-5 text-sm text-violet-850 shadow-sm">
                <p className="font-bold text-violet-900 mb-1.5 flex items-center gap-1.5">💡 Dicas de Configuração</p>
                <ul className="space-y-1 text-violet-800/90 text-xs font-semibold">
                    <li>• Para caminhos internos do site, use caminhos relativos (ex: <code className="bg-violet-100/80 px-1.5 py-0.5 rounded font-mono">/servicos</code> ou <code className="bg-violet-100/80 px-1.5 py-0.5 rounded font-mono">/sobre</code>).</li>
                    <li>• Para direcionamentos externos (ex: link direto do WhatsApp), forneça a URL completa contendo <code className="bg-violet-100/80 px-1.5 py-0.5 rounded font-mono">https://</code>.</li>
                    <li>• Você pode arrastar/ordenar os itens usando os botões de subir e descer. As mudanças refletirão no site imediatamente após salvar.</li>
                </ul>
            </div>

            {/* Links Editor Box */}
            <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {activeTab === 'header' && 'Links do Menu Principal (Header)'}
                            {activeTab === 'footer_nav' && 'Links de Navegação do Rodapé (Footer)'}
                            {activeTab === 'footer_legal' && 'Links de Políticas e Termos Legais'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {activeTab === 'header' && 'Estes links aparecerão no cabeçalho superior do site'}
                            {activeTab === 'footer_nav' && 'Estes links aparecerão na coluna de Navegação do Rodapé'}
                            {activeTab === 'footer_legal' && 'Estes links de legalidade aparecerão no canto inferior do rodapé'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddLink}
                        className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-violet-200/50 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Link
                    </button>
                </div>

                <div className="space-y-4">
                    {currentLinks.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <LayoutList className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-400 font-bold italic">Nenhum link configurado neste menu.</p>
                            <p className="text-xs text-slate-400 mt-1">Clique no botão "Adicionar Link" acima para começar.</p>
                        </div>
                    ) : (
                        currentLinks.map((link, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 shadow-sm relative group hover:bg-slate-50 hover:border-slate-350 transition-all">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Rótulo do Link (Texto)</label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={e => handleLinkChange(idx, 'label', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ex: Sobre Nós"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>URL de Destino</label>
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={e => handleLinkChange(idx, 'url', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ex: /sobre"
                                        />
                                    </div>
                                </div>

                                <div className="flex sm:flex-col gap-1 items-center justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-3 sm:pt-0 sm:pl-4 shrink-0">
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => handleMoveLink(idx, 'up')}
                                            className="p-2.5 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm"
                                            title="Mover para Cima"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={idx === currentLinks.length - 1}
                                            onClick={() => handleMoveLink(idx, 'down')}
                                            className="p-2.5 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm"
                                            title="Mover para Baixo"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLink(idx)}
                                            className="p-2.5 bg-white hover:bg-red-50 hover:border-red-200 text-red-500 hover:text-red-650 rounded-xl transition-all border border-slate-200 shadow-sm"
                                            title="Excluir Link"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Help */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>As edições são seguras e não afetarão as demais configurações de identidade visual ou SEO do painel.</span>
            </div>
        </div>
    );
}
