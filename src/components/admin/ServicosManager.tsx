import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Loader2, Trash2, Edit3, AlertCircle, Save, ChevronUp, ChevronDown, Check, X, FileText } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

// Lista de emojis sugeridos de construção e andaimes
const PRESET_EMOJIS = ['🏗️', '🪜', '🔧', '🔨', '🏠', '🏢', '⚡', '📐', '📦', '⚠️', '🎨', '🧹'];

interface ServiceItem {
    path: string;
    sha: string;
    name: string;
    title: string;
    description: string;
    icon: string;
    heroImage: string;
    order: number;
    characteristics: string[];
    specs: Record<string, string>;
    slug: string;
    rawBody: string;
}

export default function ServicosManager() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    
    const [editingSha, setEditingSha] = useState<string | null>(null);
    const [quickEditData, setQuickEditData] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'title' | 'order'>('order');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const itemsPerPage = 20;

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, sortField, sortOrder]);

    const parseServiceMarkdown = (text: string, filename: string, path: string, sha: string): ServiceItem => {
        const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        let title = filename.replace('.md', '');
        let description = '';
        let icon = '🏗️';
        let heroImage = '';
        let order = 0;
        let characteristics: string[] = [];
        let specs: Record<string, string> = {};
        let rawBody = text;

        const slug = filename.replace('.md', '');

        if (match) {
            const fm = match[1];
            rawBody = match[2].trim();

            let currentSection: 'none' | 'characteristics' | 'specs' = 'none';
            const lines = fm.split('\n');

            for (let line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                if (trimmed.startsWith('characteristics:')) {
                    currentSection = 'characteristics';
                    continue;
                } else if (trimmed.startsWith('specs:')) {
                    currentSection = 'specs';
                    continue;
                } else if (trimmed.includes(':') && !trimmed.startsWith('-') && currentSection !== 'characteristics' && currentSection !== 'specs') {
                    currentSection = 'none';
                }

                if (currentSection === 'characteristics') {
                    if (trimmed.startsWith('-')) {
                        const val = trimmed.substring(1).trim().replace(/^["']|["']$/g, '');
                        characteristics.push(val);
                    } else if (line.indexOf(':') >= 0 && !line.startsWith(' ')) {
                        currentSection = 'none';
                    }
                } 
                
                if (currentSection === 'specs') {
                    if (trimmed.includes(':')) {
                        const colonIdx = trimmed.indexOf(':');
                        const key = trimmed.substring(0, colonIdx).trim().replace(/^["']|["']$/g, '');
                        const val = trimmed.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
                        specs[key] = val;
                    } else if (line.indexOf(':') >= 0 && !line.startsWith(' ')) {
                        currentSection = 'none';
                    }
                }

                if (currentSection === 'none') {
                    const colonIdx = line.indexOf(':');
                    if (colonIdx >= 0) {
                        const key = line.substring(0, colonIdx).trim();
                        const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
                        if (key === 'title') title = val;
                        else if (key === 'description') description = val;
                        else if (key === 'icon') icon = val;
                        else if (key === 'heroImage') heroImage = val;
                        else if (key === 'order') order = parseInt(val, 10) || 0;
                    }
                }
            }
        }

        return {
            path,
            sha,
            name: filename,
            title,
            description,
            icon,
            heroImage,
            order,
            characteristics,
            specs,
            slug,
            rawBody
        };
    };

    const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
            const listRes = await githubApi('list', 'src/content/servicos');
            const files = Array.isArray(listRes.data) ? listRes.data.filter((f: any) => f.name.endsWith('.md')) : [];
            
            const enriched: ServiceItem[] = [];
            
            // Ler cada arquivo em paralelo para performance
            await Promise.all(files.map(async (f: any) => {
                try {
                    const fileData = await githubApi('read', f.path);
                    if (fileData && fileData.content) {
                        const parsed = parseServiceMarkdown(fileData.content, f.name, f.path, fileData.sha || f.sha);
                        enriched.push(parsed);
                    }
                } catch (e) {
                    console.error(`Erro ao ler arquivo ${f.path}:`, e);
                }
            }));

            setServices(enriched);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar os serviços do repositório.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (path: string, sha: string, title: string) => {
        if (!confirm(`Tem certeza de que deseja excluir permanentemente o serviço "${title}"?`)) return;
        
        try {
            await githubApi('delete', path, { sha, message: `CMS: Excluindo serviço ${title}` });
            setServices(prev => prev.filter(s => s.sha !== sha));
            triggerToast(`Serviço "${title}" excluído com sucesso!`, 'success');
        } catch (err: any) {
            triggerToast(`Erro ao excluir: ${err.message}`, 'error');
        }
    };

    const handleQuickEdit = (item: ServiceItem) => {
        setEditingSha(item.sha);
        setQuickEditData({
            title: item.title,
            slug: item.slug,
            order: item.order,
            icon: item.icon || '🏗️',
            description: item.description,
            heroImage: item.heroImage,
            characteristics: item.characteristics,
            specs: item.specs,
            rawBody: item.rawBody,
            _oldSlug: item.slug,
            _oldPath: item.path,
            _sha: item.sha
        });
        setShowEmojiPicker(false);
    };

    const serializeServiceMarkdown = (data: any) => {
        let fmString = '---';
        fmString += `\ntitle: "${data.title.replace(/"/g, '\\"')}"`;
        fmString += `\ndescription: "${(data.description || '').replace(/"/g, '\\"')}"`;
        if (data.icon) fmString += `\nicon: "${data.icon.replace(/"/g, '\\"')}"`;
        if (data.heroImage) fmString += `\nheroImage: "${data.heroImage.replace(/"/g, '\\"')}"`;
        fmString += `\norder: ${data.order}`;
        
        if (data.characteristics && data.characteristics.length > 0) {
            fmString += `\ncharacteristics:`;
            data.characteristics.forEach((item: string) => {
                fmString += `\n  - "${item.replace(/"/g, '\\"')}"`;
            });
        }
        
        if (data.specs && Object.keys(data.specs).length > 0) {
            fmString += `\nspecs:`;
            Object.entries(data.specs).forEach(([k, v]: [string, any]) => {
                fmString += `\n  "${k.replace(/"/g, '\\"')}": "${String(v).replace(/"/g, '\\"')}"`;
            });
        }
        
        fmString += '\n---\n';
        fmString += data.rawBody;
        return fmString;
    };

    const saveQuickEdit = async () => {
        if (!quickEditData.title || !quickEditData.slug) {
            alert('O Título e o Slug (URL) são obrigatórios.');
            return;
        }

        setSaving(true);
        try {
            const finalContent = serializeServiceMarkdown(quickEditData);
            const targetPath = `src/content/servicos/${quickEditData.slug}.md`;

            if (quickEditData.slug !== quickEditData._oldSlug) {
                // Renomeando: escreve no novo caminho e exclui o antigo
                await githubApi('write', targetPath, { content: finalContent, message: `CMS: Renomeando serviço para ${quickEditData.slug}` });
                await githubApi('delete', quickEditData._oldPath, { sha: quickEditData._sha, message: `CMS: Apagando slug antigo ${quickEditData._oldSlug}` });
            } else {
                // Sobrescrevendo no mesmo caminho
                await githubApi('write', targetPath, { content: finalContent, sha: quickEditData._sha, message: `CMS: Edição rápida do serviço ${quickEditData.slug}` });
            }

            triggerToast('Serviço atualizado com sucesso!', 'success');
            setEditingSha(null);
            fetchServices();
        } catch (e: any) {
            triggerToast(`Erro ao salvar: ${e.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Filtros e ordenação
    let filtered = services.filter(s => {
        if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.slug.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    filtered = [...filtered].sort((a, b) => {
        let aVal: any = sortField === 'order' ? a.order : a.title.toLowerCase();
        let bVal: any = sortField === 'order' ? b.order : b.title.toLowerCase();
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSort = (field: 'title' | 'order') => {
        if (sortField === field) {
            setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'order' ? 'asc' : 'asc');
        }
    };

    const SortIcon = ({ field }: { field: 'title' | 'order' }) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 inline ml-1 text-violet-500" /> : <ChevronDown className="w-3.5 h-3.5 inline ml-1 text-violet-500" />;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-500" />
            <p className="font-bold text-slate-600 animate-pulse">Carregando catálogo de serviços...</p>
            <p className="text-xs text-slate-400 mt-1">Lendo arquivos Markdown no repositório</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-32">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 px-6 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Catálogo de Serviços</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{services.length} Equipamentos Cadastrados</p>
                    </div>
                </div>
                <a href="/admin/servicos/new" className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-600/25 hover:-translate-y-0.5 transition-all">
                    <Plus className="w-5 h-5" /> Novo Equipamento
                </a>
            </div>

            {error && (
                <div className="p-5 bg-red-50 text-red-700 rounded-2xl font-bold border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            {/* Filtros e Busca */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar equipamento por título ou slug..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-medium placeholder-slate-400 text-slate-700" 
                    />
                </div>
            </div>

            {/* Listagem */}
            {paginated.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                    <Package className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-1">Nenhum equipamento encontrado</h3>
                    <p className="text-sm text-slate-400 max-w-sm mb-6">Não encontramos nenhum serviço ou andaime com os termos pesquisados.</p>
                    <a href="/admin/servicos/new" className="bg-violet-600 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-violet-700 transition-colors">Criar Primeiro Equipamento</a>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/50">
                                <tr>
                                    <th className="py-4 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">Ícone</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700" onClick={() => toggleSort('title')}>Título / Descrição <SortIcon field="title" /></th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 w-28" onClick={() => toggleSort('order')}>Ordem <SortIcon field="order" /></th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-40">Características</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-40">Especificações</th>
                                    <th className="py-4 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right w-36">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map(item => (
                                    <React.Fragment key={item.sha}>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            {/* Ícone */}
                                            <td className="py-4 px-5">
                                                <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-sm">
                                                    {item.icon || '🏗️'}
                                                </span>
                                            </td>
                                            
                                            {/* Título & Slug */}
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm hover:text-violet-600 transition-colors">{item.title}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">/servicos/{item.slug}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{item.description}</p>
                                                </div>
                                            </td>
                                            
                                            {/* Ordem */}
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-mono">
                                                    Ordem: {item.order}
                                                </span>
                                            </td>

                                            {/* Características */}
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100/70 border border-slate-200/50 px-2 py-1 rounded-md">
                                                    {item.characteristics?.length || 0} itens
                                                </span>
                                            </td>

                                            {/* Especificações */}
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100/70 border border-slate-200/50 px-2 py-1 rounded-md">
                                                    {Object.keys(item.specs || {}).length} specs
                                                </span>
                                            </td>

                                            {/* Ações */}
                                            <td className="py-4 px-5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => handleQuickEdit(item)} 
                                                        title="Edição Rápida" 
                                                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <a 
                                                        href={`/admin/servicos/edit?file=${encodeURIComponent(item.path)}&type=service`} 
                                                        title="Editor Completo" 
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </a>
                                                    <button 
                                                        onClick={() => handleDelete(item.path, item.sha, item.title)} 
                                                        title="Excluir" 
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Quick Edit Row */}
                                        {editingSha === item.sha && quickEditData && (
                                            <tr className="bg-violet-50/50">
                                                <td colSpan={6} className="px-6 py-5 border-l-2 border-violet-500">
                                                    <div className="bg-white p-5 rounded-2xl border border-violet-100/80 shadow-sm space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                            {/* Título */}
                                                            <div className="md:col-span-2">
                                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Título do Serviço</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={quickEditData.title} 
                                                                    onChange={e => setQuickEditData({ ...quickEditData, title: e.target.value, slug: quickEditData.slug === item.slug ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : quickEditData.slug })} 
                                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" 
                                                                />
                                                            </div>

                                                            {/* Slug */}
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Slug (URL)</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={quickEditData.slug} 
                                                                    onChange={e => setQuickEditData({ ...quickEditData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} 
                                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" 
                                                                />
                                                            </div>

                                                            {/* Ordem */}
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Ordem de Exibição</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={quickEditData.order} 
                                                                    onChange={e => setQuickEditData({ ...quickEditData, order: parseInt(e.target.value, 10) || 0 })} 
                                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" 
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                                            {/* Ícone Emoji Popover */}
                                                            <div className="relative">
                                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Ícone (Emoji)</label>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                                        className="w-12 h-11 bg-slate-50 border border-slate-200 hover:border-violet-400 rounded-xl flex items-center justify-center text-xl transition-all shadow-sm"
                                                                    >
                                                                        {quickEditData.icon}
                                                                    </button>
                                                                    <input 
                                                                        type="text" 
                                                                        maxLength={4}
                                                                        value={quickEditData.icon} 
                                                                        onChange={e => setQuickEditData({ ...quickEditData, icon: e.target.value })} 
                                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold focus:outline-none focus:border-violet-500" 
                                                                        placeholder="🏗️" 
                                                                    />
                                                                </div>

                                                                {showEmojiPicker && (
                                                                    <div className="absolute left-0 mt-2 bg-white border border-slate-200 rounded-xl p-3 shadow-xl z-50 grid grid-cols-6 gap-1.5 w-60">
                                                                        {PRESET_EMOJIS.map(emoji => (
                                                                            <button 
                                                                                key={emoji}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setQuickEditData({ ...quickEditData, icon: emoji });
                                                                                    setShowEmojiPicker(false);
                                                                                }}
                                                                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-lg transition-colors"
                                                                            >
                                                                                {emoji}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Descrição Curta */}
                                                            <div className="md:col-span-3">
                                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Descrição Curta (SEO & Resumo)</label>
                                                                <textarea 
                                                                    rows={1}
                                                                    value={quickEditData.description} 
                                                                    onChange={e => setQuickEditData({ ...quickEditData, description: e.target.value })} 
                                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 resize-none" 
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Ações */}
                                                        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                                                            <button 
                                                                onClick={() => { setEditingSha(null); setShowEmojiPicker(false); }} 
                                                                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                                            >
                                                                <X className="w-4 h-4" /> Cancelar
                                                            </button>
                                                            <button 
                                                                onClick={saveQuickEdit} 
                                                                disabled={saving} 
                                                                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/25 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                                                            >
                                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button 
                            key={p} 
                            onClick={() => setCurrentPage(p)} 
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${currentPage === p ? 'bg-violet-600 text-white shadow-violet-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
