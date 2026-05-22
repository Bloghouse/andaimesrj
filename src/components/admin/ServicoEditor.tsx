import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, ArrowLeft, Image as ImageIcon, Eye, Edit3, Plus, Trash2, ArrowUp, ArrowDown, ChevronRight, Check, Sparkles, Settings, List, TableProperties, FileEdit } from 'lucide-react';
import { marked } from 'marked';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';
import SEOScoreWidget from '../../plugins/seo/SEOScoreWidget';

// Preset de emojis de construção e andaimes
const PRESET_EMOJIS = ['🏗️', '🪜', '🔧', '🔨', '🏠', '🏢', '⚡', '📐', '📦', '⚠️', '🎨', '🧹', '🧱', '🚦', '🛑', '👷'];

interface ServicoEditorProps {
    filePath: string | null; // null = novo serviço
}

interface SpecItem {
    id: string;
    key: string;
    value: string;
}

export default function ServicoEditor({ filePath }: ServicoEditorProps) {
    const isEditing = !!filePath;
    const [activeTab, setActiveTab] = useState<'geral' | 'characteristics' | 'specs' | 'body'>('geral');
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fileSha, setFileSha] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [pendingUploads, setPendingUploads] = useState<Record<string, File>>({});
    const [QuillEditor, setQuillEditor] = useState<any>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [originalSlug, setOriginalSlug] = useState('');
    
    // State principal
    const [post, setPost] = useState({
        title: '',
        slug: '',
        description: '',
        icon: '🏗️',
        heroImage: '',
        order: 0,
        characteristics: [] as string[],
        content: '' // HTML do Quill
    });
    
    // State local para ficha técnica (specs) para facilitar inputs bidirecionais
    const [specsList, setSpecsList] = useState<SpecItem[]>([]);

    // Carregar Quill dinamicamente para não quebrar no build SSR do Astro
    useEffect(() => {
        import('react-quill-new').then(mod => setQuillEditor(() => mod.default));
        import('react-quill-new/dist/quill.snow.css' as any);
    }, []);

    useEffect(() => {
        const loadServiceData = async () => {
            if (!isEditing || !filePath) return;
            setLoading(true);
            setError('');
            try {
                const fileData = await githubApi('read', filePath);
                setFileSha(fileData.sha);
                const text = fileData.content || '';
                
                // Separar Frontmatter e corpo
                const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
                
                let title = '';
                let description = '';
                let icon = '🏗️';
                let heroImage = '';
                let order = 0;
                let characteristics: string[] = [];
                let parsedSpecs: Record<string, string> = {};
                let bodyMarkdown = text;

                if (match) {
                    const fm = match[1];
                    bodyMarkdown = match[2].trim();

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
                                parsedSpecs[key] = val;
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

                const parsedHtml = await marked.parse(bodyMarkdown);
                
                const loadedSlug = filePath.split('/').pop()?.replace('.md', '') || '';
                setOriginalSlug(loadedSlug);
                
                setPost({
                    title,
                    slug: loadedSlug,
                    description,
                    icon: icon || '🏗️',
                    heroImage,
                    order,
                    characteristics,
                    content: parsedHtml
                });

                // Setar specs list no state local
                const specItems: SpecItem[] = Object.entries(parsedSpecs).map(([key, value]) => ({
                    id: Math.random().toString(36).substring(7),
                    key,
                    value: String(value)
                }));
                setSpecsList(specItems);

            } catch (err: any) {
                setError(err.message || 'Erro ao carregar o serviço.');
            } finally {
                setLoading(false);
            }
        };

        loadServiceData();
    }, [filePath, isEditing]);

    const handleTitleChange = (val: string) => {
        setPost(p => ({
            ...p,
            title: val,
            slug: isEditing ? p.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }));
    };

    // Upload de Imagens
    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingUploads(prev => ({ ...prev, [key]: file }));
        if (key === 'heroImage') setPost(p => ({ ...p, heroImage: URL.createObjectURL(file) }));
        e.target.value = '';
    };

    const extractAndUploadInlineImages = async (html: string) => {
        const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
        let modifiedHtml = html;
        const matches = [...html.matchAll(imgRegex)];
        for (const m of matches) {
            const ext = m[1]; 
            const base64Content = m[2];
            const ghPath = `public/uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            await githubApi('write', ghPath, { content: base64Content, isBase64: true, message: `Upload imagem inline ${ghPath}` });
            modifiedHtml = modifiedHtml.replace(`data:image/${ext};base64,${base64Content}`, ghPath.replace('public', ''));
        }
        return modifiedHtml;
    };

    // Ações de Características
    const handleAddCharacteristic = () => {
        setPost(p => ({ ...p, characteristics: [...p.characteristics, ''] }));
    };

    const handleUpdateCharacteristic = (index: number, val: string) => {
        setPost(p => {
            const copy = [...p.characteristics];
            copy[index] = val;
            return { ...p, characteristics: copy };
        });
    };

    const handleRemoveCharacteristic = (index: number) => {
        setPost(p => ({ ...p, characteristics: p.characteristics.filter((_, i) => i !== index) }));
    };

    const handleMoveCharacteristic = (index: number, direction: 'up' | 'down') => {
        setPost(p => {
            const copy = [...p.characteristics];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= copy.length) return p;
            
            // Swap
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            
            return { ...p, characteristics: copy };
        });
    };

    // Ações de Especificações
    const handleAddSpec = () => {
        setSpecsList(prev => [...prev, { id: Math.random().toString(36).substring(7), key: '', value: '' }]);
    };

    const handleUpdateSpec = (id: string, field: 'key' | 'value', val: string) => {
        setSpecsList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const handleRemoveSpec = (id: string) => {
        setSpecsList(prev => prev.filter(item => item.id !== id));
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!post.title || !post.slug) {
            setError('O Título e o Slug (URL) são campos obrigatórios.');
            setActiveTab('geral');
            return;
        }

        setSaving(true);
        setError('');
        triggerToast('Processando e salvando equipamento...', 'progress', 20);
        
        try {
            // 1. Upload de Imagem Hero
            let finalHeroImage = post.heroImage;
            if (pendingUploads['heroImage']) {
                const fileObj = pendingUploads['heroImage'];
                const base64Content = await fileToBase64(fileObj);
                const fileExt = fileObj.name.split('.').pop() || 'jpg';
                const ghPath = `public/uploads/${Date.now()}-servico-cover.${fileExt}`;
                await githubApi('write', ghPath, { content: base64Content, isBase64: true, message: `Upload capa servico ${ghPath}` });
                finalHeroImage = ghPath.replace('public', '');
            }

            // 2. Upload de Imagens Inline do Editor
            const cleanedContent = post.content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
            const finalHtmlContent = await extractAndUploadInlineImages(cleanedContent);

            // 3. Montar specs como Record chave-valor limpo
            const finalSpecs: Record<string, string> = {};
            specsList.forEach(item => {
                if (item.key.trim()) {
                    finalSpecs[item.key.trim()] = item.value.trim();
                }
            });

            // 4. Montar o Frontmatter YAML
            let fmString = '---';
            fmString += `\ntitle: "${post.title.replace(/"/g, '\\"')}"`;
            fmString += `\ndescription: "${post.description.replace(/"/g, '\\"')}"`;
            if (post.icon) fmString += `\nicon: "${post.icon.replace(/"/g, '\\"')}"`;
            if (finalHeroImage) fmString += `\nheroImage: "${finalHeroImage.replace(/"/g, '\\"')}"`;
            fmString += `\norder: ${post.order}`;
            
            // Características
            const validChars = post.characteristics.filter(c => c.trim() !== '');
            if (validChars.length > 0) {
                fmString += `\ncharacteristics:`;
                validChars.forEach(c => {
                    fmString += `\n  - "${c.replace(/"/g, '\\"')}"`;
                });
            }

            // Especificações técnicas
            if (Object.keys(finalSpecs).length > 0) {
                fmString += `\nspecs:`;
                Object.entries(finalSpecs).forEach(([key, val]) => {
                    fmString += `\n  "${key.replace(/"/g, '\\"')}": "${val.replace(/"/g, '\\"')}"`;
                });
            }

            fmString += '\n---\n';
            fmString += finalHtmlContent;

            // 5. Salvar arquivo final
            const targetPath = `src/content/servicos/${post.slug}.md`;
            
            if (isEditing && post.slug !== originalSlug) {
                // Renomeando: escreve no novo caminho e exclui o antigo
                await githubApi('write', targetPath, {
                    content: fmString,
                    message: `CMS: Renomeando serviço de ${originalSlug} para ${post.slug}`
                });
                
                if (filePath) {
                    await githubApi('delete', filePath, {
                        sha: fileSha,
                        message: `CMS: Apagando slug antigo ${originalSlug} após renomeação`
                    });
                }
                
                triggerToast('Equipamento renomeado e salvo com sucesso!', 'success', 100);
                setPendingUploads({});
                
                setTimeout(() => {
                    window.location.href = `/admin/servicos/edit?file=${encodeURIComponent(targetPath)}&type=service`;
                }, 1500);
            } else {
                // Sobrescrevendo no mesmo caminho ou criando novo
                const writeRes = await githubApi('write', targetPath, {
                    content: fmString,
                    sha: fileSha || undefined,
                    message: `CMS: ${isEditing ? 'Edição' : 'Criação'} do equipamento ${post.slug}`
                });

                if (writeRes.sha) setFileSha(writeRes.sha);
                setPendingUploads({});
                triggerToast('Equipamento salvo com sucesso!', 'success', 100);

                if (!isEditing) {
                    setTimeout(() => {
                        window.location.href = '/admin/servicos';
                    }, 1500);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido ao salvar o arquivo.');
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-500" />
            <p className="font-bold text-slate-600 animate-pulse">Carregando editor completo...</p>
        </div>
    );

    const tabClass = (tab: typeof activeTab) => `
        flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap
        ${activeTab === tab 
            ? 'border-violet-600 text-violet-600 bg-violet-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
    `;

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm";
    const labelClass = "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <div className="max-w-6xl pb-32">
            {/* Header bar fixo */}
            <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                    <a href="/admin/servicos" className="text-slate-400 hover:text-violet-600 transition-colors p-2 rounded-xl hover:bg-violet-50">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}</h2>
                        {post.slug && <p className="text-[11px] font-mono text-slate-400 mt-0.5">/servicos/{post.slug}</p>}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={() => setIsPreview(!isPreview)} 
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreview ? 'Voltar ao Editor' : 'Visualizar Layout'}
                    </button>
                    
                    <button 
                        onClick={handleSave} 
                        disabled={saving} 
                        className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-violet-600/20 hover:-translate-y-0.5"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Salvar Equipamento' : 'Publicar no Catálogo'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 text-sm font-semibold mb-6 rounded-r-xl flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            {/* Menu de Abas */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex mb-6">
                <button onClick={() => setActiveTab('geral')} className={tabClass('geral')}>
                    <Settings className="w-4 h-4" /> Configurações Gerais
                </button>
                <button onClick={() => setActiveTab('characteristics')} className={tabClass('characteristics')}>
                    <List className="w-4 h-4" /> Características ({post.characteristics.length})
                </button>
                <button onClick={() => setActiveTab('specs')} className={tabClass('specs')}>
                    <TableProperties className="w-4 h-4" /> Ficha Técnica ({specsList.length})
                </button>
                <button onClick={() => setActiveTab('body')} className={tabClass('body')}>
                    <FileEdit className="w-4 h-4" /> Descrição Detalhada (Corpo)
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Form Area Principal */}
                <div className="flex-1 min-w-0 w-full space-y-6">
                    {activeTab === 'geral' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-violet-500" /> Metadados Básicos do Equipamento
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Título */}
                                <div>
                                    <label className={labelClass}>Título do Equipamento / Serviço *</label>
                                    <input 
                                        type="text" 
                                        value={post.title} 
                                        onChange={e => handleTitleChange(e.target.value)} 
                                        className={inputClass} 
                                        placeholder="Ex: Aluguel de Andaime de 2 Metros" 
                                    />
                                </div>
                                
                                {/* Slug */}
                                <div>
                                    <label className={labelClass}>Slug (URL do Equipamento) *</label>
                                    <input 
                                        type="text" 
                                        value={post.slug} 
                                        onChange={e => setPost(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} 
                                        className={`${inputClass} font-mono`} 
                                        placeholder="andaime-2-metros" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Ordem */}
                                <div>
                                    <label className={labelClass}>Ordem de Exibição (Número)</label>
                                    <input 
                                        type="number" 
                                        value={post.order} 
                                        onChange={e => setPost(p => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))} 
                                        className={`${inputClass} font-bold font-mono`} 
                                    />
                                </div>

                                {/* Emoji Ícone */}
                                <div className="md:col-span-2 relative">
                                    <label className={labelClass}>Emoji / Ícone Decorativo</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                                            className="w-14 h-12 bg-slate-50 border border-slate-200 hover:border-violet-400 rounded-xl flex items-center justify-center text-2xl transition-all shadow-sm shrink-0"
                                        >
                                            {post.icon || '🏗️'}
                                        </button>
                                        <input 
                                            type="text" 
                                            value={post.icon} 
                                            maxLength={4}
                                            onChange={e => setPost(p => ({ ...p, icon: e.target.value }))} 
                                            className={inputClass} 
                                            placeholder="🏗️" 
                                        />
                                    </div>
                                    
                                    {showEmojiPicker && (
                                        <div className="absolute left-0 mt-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-50 grid grid-cols-5 gap-1.5 w-60">
                                            {PRESET_EMOJIS.map(emoji => (
                                                <button 
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => {
                                                        setPost(p => ({ ...p, icon: emoji }));
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xl transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Descrição Curta */}
                            <div>
                                <label className={labelClass}>Descrição / Resumo Rápido (SEO)</label>
                                <textarea 
                                    rows={3} 
                                    value={post.description} 
                                    onChange={e => setPost(p => ({ ...p, description: e.target.value }))} 
                                    className={`${inputClass} resize-none`} 
                                    placeholder="Escreva um breve parágrafo comercial ou descritivo..." 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'characteristics' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <List className="w-4 h-4 text-violet-500" /> Lista de Características
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={handleAddCharacteristic} 
                                    className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar
                                </button>
                            </div>

                            {post.characteristics.length === 0 ? (
                                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                                    <List className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-slate-500">Nenhuma característica adicionada</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Adicione pontos fortes como "Montagem Rápida" ou "Super Resistente".</p>
                                    <button 
                                        type="button" 
                                        onClick={handleAddCharacteristic} 
                                        className="mt-4 bg-white border border-slate-200 hover:border-violet-300 text-xs font-bold text-slate-600 px-4 py-2 rounded-xl shadow-sm transition-all"
                                    >
                                        Adicionar Item
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {post.characteristics.map((char, index) => (
                                        <div key={index} className="flex gap-2 items-center bg-slate-50/50 p-2.5 px-3 rounded-xl border border-slate-100">
                                            {/* Input */}
                                            <input 
                                                type="text" 
                                                value={char} 
                                                onChange={e => handleUpdateCharacteristic(index, e.target.value)} 
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-violet-500"
                                                placeholder={`Característica #${index + 1}`} 
                                            />

                                            {/* Reordenador & Excluir */}
                                            <div className="flex gap-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleMoveCharacteristic(index, 'up')} 
                                                    disabled={index === 0}
                                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 rounded-lg transition-colors"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleMoveCharacteristic(index, 'down')} 
                                                    disabled={index === post.characteristics.length - 1}
                                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 rounded-lg transition-colors"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveCharacteristic(index)} 
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'specs' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <TableProperties className="w-4 h-4 text-violet-500" /> Ficha Técnica & Especificações
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={handleAddSpec} 
                                    className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar Campo
                                </button>
                            </div>

                            {specsList.length === 0 ? (
                                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                                    <TableProperties className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-slate-500">Nenhuma especificação cadastrada</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Cadastre itens como "Carga Máxima", "Peso do Conjunto" ou "Material".</p>
                                    <button 
                                        type="button" 
                                        onClick={handleAddSpec} 
                                        className="mt-4 bg-white border border-slate-200 hover:border-violet-300 text-xs font-bold text-slate-600 px-4 py-2 rounded-xl shadow-sm transition-all"
                                    >
                                        Adicionar Item
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {specsList.map(item => (
                                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center bg-slate-50/50 p-2.5 px-3 rounded-xl border border-slate-100 relative pr-12">
                                            {/* Chave (Nome da Spec) */}
                                            <div>
                                                <input 
                                                    type="text" 
                                                    value={item.key} 
                                                    onChange={e => handleUpdateSpec(item.id, 'key', e.target.value)} 
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500"
                                                    placeholder="Ex: Carga Máxima" 
                                                />
                                            </div>

                                            {/* Valor */}
                                            <div>
                                                <input 
                                                    type="text" 
                                                    value={item.value} 
                                                    onChange={e => handleUpdateSpec(item.id, 'value', e.target.value)} 
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 focus:outline-none focus:border-violet-500"
                                                    placeholder="Ex: 150kg" 
                                                />
                                            </div>

                                            {/* Excluir (Fixado à direita) */}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSpec(item.id)} 
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'body' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <FileEdit className="w-4 h-4 text-violet-500" /> Descrição Completa e Comercial (Quill Editor)
                            </h3>
                            
                            {isPreview ? (
                                <div 
                                    className="prose prose-slate max-w-none border border-slate-200 rounded-2xl p-6 min-h-[350px] bg-slate-50/50" 
                                    dangerouslySetInnerHTML={{ __html: post.content }} 
                                />
                            ) : QuillEditor ? (
                                <div className="quill-editor-wrapper">
                                    <QuillEditor
                                        theme="snow"
                                        value={post.content}
                                        onChange={(val: string) => setPost(p => ({ ...p, content: val }))}
                                        style={{ minHeight: '350px' }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-24 text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    <span>Carregando o editor Quill...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Administrativa */}
                <div className="w-full lg:w-80 shrink-0 space-y-4 lg:sticky lg:top-4">
                    {/* Imagem de Capa */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 text-xs border-b border-slate-100 pb-3 mb-4">Imagem de Capa (Hero Image)</h3>
                        <label className="group relative border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50 hover:bg-violet-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all text-center overflow-hidden" style={{ minHeight: '140px' }}>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => handleFileSelect(e, 'heroImage')} 
                            />
                            {post.heroImage ? (
                                <>
                                    <img src={post.heroImage} alt="Capa do Serviço" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/30 backdrop-blur-[2px]">
                                        <ImageIcon className="w-8 h-8 text-slate-800" />
                                        <span className="text-xs font-bold text-slate-900 mt-1">Substituir Imagem</span>
                                    </div>
                                </>
                            ) : (
                                <div className="py-6 flex flex-col items-center text-slate-400 group-hover:text-violet-500 transition-colors">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold">Enviar Capa JPG/PNG</span>
                                </div>
                            )}
                        </label>
                        {pendingUploads['heroImage'] && (
                            <span className="text-[10px] text-amber-600 font-bold block mt-2 animate-pulse">
                                Upload pendente — será efetuado ao salvar
                            </span>
                        )}
                    </div>

                    {/* SEO Score Widget */}
                    <SEOScoreWidget 
                        title={post.title}
                        description={post.description}
                        heroImage={post.heroImage}
                        content={post.content}
                    />
                </div>
            </div>
        </div>
    );
}
