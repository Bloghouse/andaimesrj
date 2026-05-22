import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Image as ImageIcon, Palette, Phone, Compass, ShieldCheck, MessageSquare } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

type Tab = 'identity' | 'contact' | 'navigation' | 'whatsapp' | 'seo';

const DEFAULT_CONFIG = {
    identity: {
        company_name: '',
        logo_url: '',
        favicon_url: '',
        colors: {
            primary: '#fa4a15',
            secondary: '#1E3A8A',
            accent: '#000000'
        }
    },
    contact_info: {
        domain: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: {
            street: '',
            neighborhood: '',
            city: '',
            state: 'RJ',
            zip: ''
        },
        social: {
            instagram: '',
            facebook: ''
        }
    },
    global_seo: {
        default_meta_description: '',
        default_meta_keywords: ''
    },
    header_navigation: {
        enable_sticky_header: true,
        enable_backdrop_blur: true,
        nav_links: [] as Array<{ label: string; url: string }>,
        cta_button: {
            label: '',
            url: ''
        }
    },
    footer_section: {
        description_text: '',
        copyright_format: '© {year} ANDAIME PRO. Todos os direitos reservados.',
        nav_column_title: 'Navegação',
        contact_column_title: 'Contato',
        legal_links: [] as Array<{ label: string; url: string }>
    },
    floating_whatsapp_btn: {
        tooltip_label: 'Fale Conosco',
        whatsapp_brand_color: '#25D366',
        enable_bounce_subtle: true,
        enable_radar_ping: true
    }
};

export default function ConfigEditor() {
    const [config, setConfig] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('identity');
    const [pendingLogo, setPendingLogo] = useState<File | null>(null);
    const [pendingFavicon, setPendingFavicon] = useState<File | null>(null);

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result?.toString() || '').split(',')[1]);
        reader.onerror = error => reject(error);
    });

    useEffect(() => {
        githubApi('read', 'src/data/pages/globais.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || "{}");
                // Deep merge para evitar quebras por propriedades faltantes
                const merged = {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    identity: { 
                        ...DEFAULT_CONFIG.identity, 
                        ...(parsed.identity || {}), 
                        colors: { ...DEFAULT_CONFIG.identity.colors, ...(parsed.identity?.colors || {}) } 
                    },
                    contact_info: { 
                        ...DEFAULT_CONFIG.contact_info, 
                        ...(parsed.contact_info || {}), 
                        address: { ...DEFAULT_CONFIG.contact_info.address, ...(parsed.contact_info?.address || {}) }, 
                        social: { ...DEFAULT_CONFIG.contact_info.social, ...(parsed.contact_info?.social || {}) } 
                    },
                    global_seo: { ...DEFAULT_CONFIG.global_seo, ...(parsed.global_seo || {}) },
                    header_navigation: { ...DEFAULT_CONFIG.header_navigation, ...(parsed.header_navigation || {}), cta_button: { ...DEFAULT_CONFIG.header_navigation.cta_button, ...(parsed.header_navigation?.cta_button || {}) } },
                    footer_section: { ...DEFAULT_CONFIG.footer_section, ...(parsed.footer_section || {}) },
                    floating_whatsapp_btn: { ...DEFAULT_CONFIG.floating_whatsapp_btn, ...(parsed.floating_whatsapp_btn || {}) }
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
        triggerToast('Sincronizando configurações...', 'progress', 20);
        try {
            let configCopy = { ...config };
            
            if (pendingLogo) {
                triggerToast('Enviando novo logo...', 'progress', 40);
                const base64Content = await fileToBase64(pendingLogo);
                const fileExt = pendingLogo.name.split('.').pop() || 'png';
                const ghPath = `public/images/logo.${fileExt}`;
                
                let logoSha: string | undefined;
                try {
                    const existing = await githubApi('read', ghPath);
                    if (existing?.sha) logoSha = existing.sha;
                } catch {}

                await githubApi('write', ghPath, {
                    content: base64Content,
                    isBase64: true,
                    sha: logoSha,
                    message: 'CMS: Upload Logo'
                });
                configCopy.identity.logo_url = `/images/logo.${fileExt}`;
            }

            if (pendingFavicon) {
                triggerToast('Enviando favicon...', 'progress', 60);
                const base64Content = await fileToBase64(pendingFavicon);
                const fileExt = pendingFavicon.name.split('.').pop() || 'png';
                const ghPath = `public/images/favicon.${fileExt}`;
                
                let faviconSha: string | undefined;
                try {
                    const existing = await githubApi('read', ghPath);
                    if (existing?.sha) faviconSha = existing.sha;
                } catch {}

                await githubApi('write', ghPath, {
                    content: base64Content,
                    isBase64: true,
                    sha: faviconSha,
                    message: 'CMS: Upload Favicon'
                });
                configCopy.identity.favicon_url = `/images/favicon.${fileExt}`;
            }

            const res = await githubApi('write', 'src/data/pages/globais.json', {
                content: JSON.stringify(configCopy, null, 2),
                sha: fileSha,
                message: 'CMS: Update globais.json'
            });

            setFileSha(res.sha);
            setPendingLogo(null);
            setPendingFavicon(null);
            
            // Força a atualização dos caminhos locais com cache-busting
            if (pendingLogo) {
                configCopy.identity.logo_url = `/images/logo.${pendingLogo.name.split('.').pop() || 'png'}?t=${Date.now()}`;
            }
            if (pendingFavicon) {
                configCopy.identity.favicon_url = `/images/favicon.${pendingFavicon.name.split('.').pop() || 'png'}?t=${Date.now()}`;
            }
            setConfig(configCopy);

            triggerToast('Configurações salvas com sucesso!', 'success', 100);
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
            <p className="font-medium animate-pulse">Conectando ao Repositório...</p>
        </div>
    );

    if (error && !config.identity.company_name) return (
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
        { id: 'identity', label: 'Identidade Visual', icon: Palette },
        { id: 'contact', label: 'Canais de Contato', icon: Phone },
        { id: 'navigation', label: 'Navegação & Header', icon: Compass },
        { id: 'whatsapp', label: 'Zap Flutuante', icon: MessageSquare },
        { id: 'seo', label: 'SEO Global', icon: ShieldCheck },
    ];

    const presetPalettes = [
        { name: 'Laranja Obra (Original)', primary: '#fa4a15', secondary: '#1E3A8A', accent: '#000000' },
        { name: 'Amarelo Segurança',       primary: '#f59e0b', secondary: '#111827', accent: '#10b981' },
        { name: 'Azul Industrial',          primary: '#2563eb', secondary: '#0f172a', accent: '#d97706' },
        { name: 'Vermelho Alerta',          primary: '#dc2626', secondary: '#1f2937', accent: '#4b5563' },
        { name: 'Verde Sustentável',        primary: '#16a34a', secondary: '#14532d', accent: '#f59e0b' },
    ];

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-32 max-w-3xl">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Configurações Globais</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Controla a identidade, contatos e menus globais do site</p>
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
            <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap border border-slate-200/50 shadow-inner">
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                tab === t.id
                                    ? 'bg-white text-violet-700 shadow-sm border border-slate-200/30'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content: Identidade Visual */}
            {tab === 'identity' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-8">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Marca e Imagens</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Logo Principal do Site</label>
                                <label className="group relative border-2 border-dashed border-slate-300 hover:border-violet-500 bg-slate-50 hover:bg-violet-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center h-48">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPendingLogo(file);
                                                setConfig({
                                                    ...config,
                                                    identity: { ...config.identity, logo_url: URL.createObjectURL(file) }
                                                });
                                            }
                                        }} 
                                    />
                                    {config.identity.logo_url ? (
                                        <img src={config.identity.logo_url} alt="Logo" className="max-h-24 w-auto object-contain mb-4 group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-3 group-hover:text-violet-500 transition-colors">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">
                                        {config.identity.logo_url ? 'Substituir Logo' : 'Enviar Logo (PNG/SVG)'}
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className={labelClass}>Favicon (Ícone do Navegador)</label>
                                <label className="group relative border-2 border-dashed border-slate-300 hover:border-violet-500 bg-slate-50 hover:bg-violet-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center h-48">
                                    <input 
                                        type="file" 
                                        accept="image/png,image/x-icon,image/svg+xml" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPendingFavicon(file);
                                                // Exibe um preview blob local temporário
                                                setConfig({
                                                    ...config,
                                                    identity: { ...config.identity, favicon_url: URL.createObjectURL(file) }
                                                });
                                            }
                                        }} 
                                    />
                                    {config.identity.favicon_url ? (
                                        <div className="flex flex-col items-center justify-center mb-2">
                                            <img src={config.identity.favicon_url} alt="Favicon" className="w-12 h-12 object-contain mb-3 bg-white rounded-lg shadow-sm border p-1" />
                                            {pendingFavicon && (
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mb-1">Upload Pendente</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 bg-white rounded-2xl border flex items-center justify-center text-slate-300 shadow-sm mb-3 group-hover:text-violet-550 transition-colors text-2xl">⚡</div>
                                    )}
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">
                                        {config.identity.favicon_url ? 'Substituir Favicon' : 'Enviar Favicon'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1">PNG, SVG ou ICO</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className={labelClass}>Nome Oficial da Empresa</label>
                                    <span className="text-[10px] text-slate-400 font-medium">* Aparece nos textos do site, rodapé e menus</span>
                                </div>
                                <input 
                                    type="text" 
                                    value={config.identity.company_name} 
                                    onChange={e => setConfig({
                                        ...config,
                                        identity: { ...config.identity, company_name: e.target.value }
                                    })} 
                                    className={inputClass} 
                                    placeholder="Ex: Andaime PRO"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Paleta de Cores</h3>
                        
                        {/* Preset Themes / Combinações de Cores Fixas */}
                        <div className="space-y-3">
                            <label className={labelClass}>Combinações de Cores Rápidas (Padrão Obra)</label>
                            <div className="flex flex-wrap gap-2.5">
                                {presetPalettes.map(preset => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => setConfig({
                                            ...config,
                                            identity: {
                                                ...config.identity,
                                                colors: {
                                                    primary: preset.primary,
                                                    secondary: preset.secondary,
                                                    accent: preset.accent
                                                }
                                            }
                                        })}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-xs font-semibold text-slate-700"
                                    >
                                        <span className="flex gap-0.5">
                                            <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ background: preset.primary }} />
                                            <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ background: preset.secondary }} />
                                        </span>
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                            {[
                                { key: 'primary', label: 'Cor Primária (Marca)' },
                                { key: 'secondary', label: 'Cor Secundária (Fundo Escuro)' },
                                { key: 'accent', label: 'Cor de Destaque' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className={labelClass}>{f.label}</label>
                                    <div className="flex gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                        <input 
                                            type="color" 
                                            value={config.identity.colors[f.key as keyof typeof config.identity.colors] || '#fa4a15'} 
                                            onChange={e => setConfig({
                                                ...config,
                                                identity: {
                                                    ...config.identity,
                                                    colors: { ...config.identity.colors, [f.key]: e.target.value }
                                                }
                                            })} 
                                            className="h-10 w-14 p-0 border-0 rounded-lg cursor-pointer bg-transparent" 
                                        />
                                        <input 
                                            type="text" 
                                            value={config.identity.colors[f.key as keyof typeof config.identity.colors] || ''} 
                                            onChange={e => setConfig({
                                                ...config,
                                                identity: {
                                                    ...config.identity,
                                                    colors: { ...config.identity.colors, [f.key]: e.target.value }
                                                }
                                            })} 
                                            className="flex-1 bg-transparent border-none focus:outline-none font-mono text-slate-700 font-bold uppercase text-xs" 
                                            maxLength={9}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Live Color Strip */}
                        <div className="space-y-2 pt-2">
                            <label className={labelClass}>Visualização da Paleta Aplicada</label>
                            <div className="grid grid-cols-3 h-10 rounded-xl overflow-hidden shadow-sm border">
                                <div style={{ background: config.identity.colors.primary }} className="flex items-center justify-center text-[10px] font-bold text-white uppercase drop-shadow">{config.identity.colors.primary}</div>
                                <div style={{ background: config.identity.colors.secondary }} className="flex items-center justify-center text-[10px] font-bold text-white uppercase drop-shadow">{config.identity.colors.secondary}</div>
                                <div style={{ background: config.identity.colors.accent }} className="flex items-center justify-center text-[10px] font-bold text-white uppercase drop-shadow">{config.identity.colors.accent}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Canais de Contato */}
            {tab === 'contact' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Canais Digitais e Atendimento</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            <div>
                                <label className={labelClass}>E-mail Comercial</label>
                                <input 
                                    type="email" 
                                    value={config.contact_info.email} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: { ...config.contact_info, email: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="contato@empresa.com.br"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Telefone Principal (Exibição)</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.phone} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: { ...config.contact_info, phone: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="(21) 97894-6985"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Número do WhatsApp (Apenas Números com DDI)</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.whatsapp} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: { ...config.contact_info, whatsapp: e.target.value.replace(/\D/g, '') }
                                    })} 
                                    className={`${inputClass} font-mono`}
                                    placeholder="Ex: 5521978946985"
                                />
                                <span className="text-[10px] text-slate-400 block mt-1.5 ml-1">Deve conter DDI do Brasil (55), o DDD e o número completo.</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Endereço Estruturado (Rodapé / Contato)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Logradouro / Rua e Número</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.address.street} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            address: { ...config.contact_info.address, street: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Avenida Rio Branco, 100"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Bairro</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.address.neighborhood} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            address: { ...config.contact_info.address, neighborhood: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Centro"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Cidade</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.address.city} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            address: { ...config.contact_info.address, city: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Rio de Janeiro"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Estado</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.address.state} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            address: { ...config.contact_info.address, state: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="RJ"
                                    maxLength={2}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>CEP</label>
                                <input 
                                    type="text" 
                                    value={config.contact_info.address.zip} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            address: { ...config.contact_info.address, zip: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="20000-000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Redes Sociais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Perfil no Instagram</label>
                                <input 
                                    type="url" 
                                    value={config.contact_info.social.instagram} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            social: { ...config.contact_info.social, instagram: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="https://instagram.com/perfil"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Página no Facebook</label>
                                <input 
                                    type="url" 
                                    value={config.contact_info.social.facebook} 
                                    onChange={e => setConfig({
                                        ...config,
                                        contact_info: {
                                            ...config.contact_info,
                                            social: { ...config.contact_info.social, facebook: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="https://facebook.com/pagina"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Navegação & Header */}
            {tab === 'navigation' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Layout do Cabeçalho</h3>
                        
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={config.header_navigation.enable_sticky_header}
                                    onChange={e => setConfig({
                                        ...config,
                                        header_navigation: { ...config.header_navigation, enable_sticky_header: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                                />
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Ativar Cabeçalho Fixo (Sticky)</p>
                                    <p className="text-xs text-slate-400">O menu superior acompanhará a rolagem da página pública</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Botão CTA do Cabeçalho (Ação Rápida)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Texto do Botão</label>
                                <input 
                                    type="text" 
                                    value={config.header_navigation.cta_button.label} 
                                    onChange={e => setConfig({
                                        ...config,
                                        header_navigation: {
                                            ...config.header_navigation,
                                            cta_button: { ...config.header_navigation.cta_button, label: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: Falar com Consultor"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>URL de Destino</label>
                                <input 
                                    type="text" 
                                    value={config.header_navigation.cta_button.url} 
                                    onChange={e => setConfig({
                                        ...config,
                                        header_navigation: {
                                            ...config.header_navigation,
                                            cta_button: { ...config.header_navigation.cta_button, url: e.target.value }
                                        }
                                    })} 
                                    className={inputClass}
                                    placeholder="Ex: /contato"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Informações do Rodapé</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Descrição Geral no Rodapé</label>
                                <textarea 
                                    rows={3} 
                                    value={config.footer_section.description_text} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_section: { ...config.footer_section, description_text: e.target.value }
                                    })} 
                                    className={`${inputClass} resize-y`}
                                    placeholder="Texto breve que resume a atuação de segurança da marca no rodapé."
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Texto de Copyright</label>
                                <input 
                                    type="text" 
                                    value={config.footer_section.copyright_format} 
                                    onChange={e => setConfig({
                                        ...config,
                                        footer_section: { ...config.footer_section, copyright_format: e.target.value }
                                    })} 
                                    className={inputClass}
                                    placeholder="© {year} ANDAIME PRO. Todos os direitos reservados."
                                />
                                <span className="text-[10px] text-slate-400 block mt-1.5 ml-1">Use a tag <code className="bg-slate-100 px-1 rounded font-mono font-bold text-[9px]">{`{year}`}</code> para renderizar o ano corrente dinamicamente.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Zap Flutuante */}
            {tab === 'whatsapp' && (
                <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Botão do WhatsApp Flutuante</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                        <div>
                            <label className={labelClass}>Texto do Balão de Ajuda (Tooltip)</label>
                            <input 
                                type="text" 
                                value={config.floating_whatsapp_btn.tooltip_label} 
                                onChange={e => setConfig({
                                    ...config,
                                    floating_whatsapp_btn: { ...config.floating_whatsapp_btn, tooltip_label: e.target.value }
                                })} 
                                className={inputClass}
                                placeholder="Ex: Fale Conosco"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Cor do Botão WhatsApp</label>
                            <div className="flex gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <input 
                                    type="color" 
                                    value={config.floating_whatsapp_btn.whatsapp_brand_color} 
                                    onChange={e => setConfig({
                                        ...config,
                                        floating_whatsapp_btn: { ...config.floating_whatsapp_btn, whatsapp_brand_color: e.target.value }
                                    })} 
                                    className="h-10 w-14 p-0 border-0 rounded-lg cursor-pointer bg-transparent" 
                                />
                                <input 
                                    type="text" 
                                    value={config.floating_whatsapp_btn.whatsapp_brand_color} 
                                    onChange={e => setConfig({
                                        ...config,
                                        floating_whatsapp_btn: { ...config.floating_whatsapp_btn, whatsapp_brand_color: e.target.value }
                                    })} 
                                    className="flex-1 bg-transparent border-none focus:outline-none font-mono text-slate-700 font-bold uppercase text-xs" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className={labelClass}>Efeitos de Animação e Chamar Atenção</label>
                        
                        <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={config.floating_whatsapp_btn.enable_bounce_subtle}
                                onChange={e => setConfig({
                                    ...config,
                                    floating_whatsapp_btn: { ...config.floating_whatsapp_btn, enable_bounce_subtle: e.target.checked }
                                })}
                                className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                            />
                            <div>
                                <p className="text-sm font-bold text-slate-700">Pulo Sutil Automático (Bounce Effect)</p>
                                <p className="text-xs text-slate-400">O ícone do WhatsApp pulará levemente em intervalos definidos para engajamento</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={config.floating_whatsapp_btn.enable_radar_ping}
                                onChange={e => setConfig({
                                    ...config,
                                    floating_whatsapp_btn: { ...config.floating_whatsapp_btn, enable_radar_ping: e.target.checked }
                                })}
                                className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                            />
                            <div>
                                <p className="text-sm font-bold text-slate-700">Efeito Radar Circular (Pulse Effect)</p>
                                <p className="text-xs text-slate-400">Exibe uma onda circular pulsante e transparente ao redor do botão</p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab Content: SEO Global */}
            {tab === 'seo' && (
                <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Otimização de Mecanismos de Busca (SEO)</h3>
                    <p className="text-xs text-slate-400 -mt-2">Configure os metadados de busca que o Google lerá para o indexamento padrão de todo o domínio</p>
                    
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Descrição de Busca Padrão (Meta Description)</label>
                            <textarea 
                                rows={3} 
                                value={config.global_seo.default_meta_description} 
                                onChange={e => setConfig({
                                    ...config,
                                    global_seo: { ...config.global_seo, default_meta_description: e.target.value }
                                })} 
                                className={`${inputClass} resize-y`}
                                placeholder="Líder em locação de andaimes no Rio de Janeiro. Equipamentos certificados..."
                            />
                            <span className="text-[10px] text-slate-400 block mt-1.5 ml-1">Ideal: Entre 120 e 160 caracteres.</span>
                        </div>

                        <div>
                            <label className={labelClass}>Palavras-chave Padrão (Meta Keywords)</label>
                            <input 
                                type="text" 
                                value={config.global_seo.default_meta_keywords} 
                                onChange={e => setConfig({
                                    ...config,
                                    global_seo: { ...config.global_seo, default_meta_keywords: e.target.value }
                                })} 
                                className={inputClass}
                                placeholder="aluguel de andaimes rj, andaime pro, locação de andaimes rj"
                            />
                            <span className="text-[10px] text-slate-400 block mt-1.5 ml-1">Separe cada termo utilizando vírgulas.</span>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
