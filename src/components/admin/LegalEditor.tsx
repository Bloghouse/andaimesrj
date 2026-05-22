import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, FileText, Eye, Edit3, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { marked } from 'marked';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

interface LegalPageData {
    seo: {
        meta_title: string;
        meta_description: string;
    };
    page_header: {
        title: string;
    };
    legal_content: {
        rich_text_markdown: string;
    };
}

export default function LegalEditor() {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
    const [privacyData, setPrivacyData] = useState<LegalPageData | null>(null);
    const [termsData, setTermsData] = useState<LegalPageData | null>(null);
    const [privacySha, setPrivacySha] = useState('');
    const [termsSha, setTermsSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        const fetchLegalData = async () => {
            setLoading(true);
            setError('');
            try {
                const [privRes, termsRes] = await Promise.allSettled([
                    githubApi('read', 'src/data/pages/privacidade.json'),
                    githubApi('read', 'src/data/pages/termos.json'),
                ]);

                if (privRes.status === 'fulfilled' && privRes.value) {
                    setPrivacyData(JSON.parse(privRes.value.content || '{}'));
                    setPrivacySha(privRes.value.sha || '');
                } else {
                    console.error('Erro ao buscar privacidade:', privRes);
                }

                if (termsRes.status === 'fulfilled' && termsRes.value) {
                    setTermsData(JSON.parse(termsRes.value.content || '{}'));
                    setTermsSha(termsRes.value.sha || '');
                } else {
                    console.error('Erro ao buscar termos:', termsRes);
                }
            } catch (err: any) {
                setError('Erro ao carregar dados jurídicos. Verifique se os arquivos de produção existem.');
            } finally {
                setLoading(false);
            }
        };
        fetchLegalData();
    }, []);

    const currentData = activeTab === 'privacy' ? privacyData : termsData;

    // Renderizar a pré-visualização do Markdown ao vivo
    useEffect(() => {
        const renderMarkdown = async () => {
            if (!currentData?.legal_content?.rich_text_markdown) {
                setPreviewHtml('');
                return;
            }
            try {
                // Renderizar o Markdown de forma nativa e profissional
                const rawMarkdown = currentData.legal_content.rich_text_markdown;
                const parsed = await marked.parse(rawMarkdown);
                setPreviewHtml(parsed);
            } catch (e) {
                setPreviewHtml('<p class="text-red-500">Erro na formatação do Markdown</p>');
            }
        };
        renderMarkdown();
    }, [currentData?.legal_content?.rich_text_markdown, activeTab]);

    const handleSave = async (type: 'privacy' | 'terms') => {
        const data = type === 'privacy' ? privacyData : termsData;
        const sha = type === 'privacy' ? privacySha : termsSha;
        const path = type === 'privacy' ? 'src/data/pages/privacidade.json' : 'src/data/pages/termos.json';
        
        if (!data) return;
        setSaving(true);
        setError('');

        triggerToast(`Salvando ${type === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso'}...`, 'progress', 30);

        try {
            const contentString = JSON.stringify(data, null, 2);
            const res = await githubApi('write', path, {
                content: contentString,
                sha: sha || undefined,
                message: `CMS: Atualizando página jurídica ${type === 'privacy' ? 'privacidade.json' : 'termos.json'}`
            });

            if (type === 'privacy') {
                setPrivacySha(res.sha);
            } else {
                setTermsSha(res.sha);
            }

            triggerToast('Texto jurídico salvo com sucesso!', 'success', 100);
        } catch (err: any) {
            triggerToast(`Erro ao salvar: ${err.message}`, 'error');
            setError(`Erro ao salvar no GitHub: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (section: 'seo' | 'page_header' | 'legal_content', field: string, val: string) => {
        const setData = activeTab === 'privacy' ? setPrivacyData : setTermsData;
        const current = activeTab === 'privacy' ? privacyData : termsData;
        
        if (!current) return;

        setData({
            ...current,
            [section]: {
                ...current[section as keyof LegalPageData] as any,
                [field]: val
            }
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-500" />
            <p className="font-bold text-slate-600 animate-pulse">Carregando textos legais...</p>
            <p className="text-xs text-slate-400 mt-1">Buscando privacidade.json e termos.json</p>
        </div>
    );

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm";
    const labelClass = "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <div className="space-y-6 pb-32">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 px-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-40">
                <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 w-fit">
                    <button 
                        onClick={() => setActiveTab('privacy')} 
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'privacy' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Política de Privacidade
                    </button>
                    <button 
                        onClick={() => setActiveTab('terms')} 
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'terms' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Termos de Uso
                    </button>
                </div>
                
                <button 
                    onClick={() => handleSave(activeTab)} 
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/25 hover:-translate-y-0.5"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                    {saving ? 'Gravando...' : `Salvar ${activeTab === 'privacy' ? 'Privacidade' : 'Termos'}`}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 text-sm font-semibold rounded-r-xl flex gap-2">
                    <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            {currentData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Editor Form (Esquerda) */}
                    <div className="space-y-6">
                        {/* SEO */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-500" /> Configurações de SEO
                            </h3>
                            <div>
                                <label className={labelClass}>Título de Aba (Meta Title)</label>
                                <input 
                                    type="text" 
                                    value={currentData.seo?.meta_title || ''} 
                                    onChange={e => updateField('seo', 'meta_title', e.target.value)} 
                                    className={inputClass} 
                                    placeholder="Ex: Política de Privacidade | Andaime PRO" 
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Meta Descrição (Meta Description)</label>
                                <textarea 
                                    rows={2} 
                                    value={currentData.seo?.meta_description || ''} 
                                    onChange={e => updateField('seo', 'meta_description', e.target.value)} 
                                    className={`${inputClass} resize-none`} 
                                    placeholder="Resumo juridicamente profissional para mecanismos de busca..." 
                                />
                            </div>
                        </div>

                        {/* Corpo Jurídico */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-violet-500" /> Cabeçalho e Conteúdo do Documento
                            </h3>
                            <div>
                                <label className={labelClass}>Título Principal da Página</label>
                                <input 
                                    type="text" 
                                    value={currentData.page_header?.title || ''} 
                                    onChange={e => updateField('page_header', 'title', e.target.value)} 
                                    className={inputClass} 
                                    placeholder="Ex: Política de Privacidade" 
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Texto Jurídico (Formato Markdown)</label>
                                <div className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 p-2.5 rounded-lg mb-2 leading-relaxed">
                                    💡 <span className="text-slate-600">Dicas de Formatação:</span> Use <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">## Título</code> para criar seções e <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">**texto**</code> para dar negrito às palavras. Dê duas quebras de linha (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">Enter</code> duas vezes) para iniciar um novo parágrafo.
                                </div>
                                <textarea 
                                    rows={18} 
                                    value={currentData.legal_content?.rich_text_markdown || ''} 
                                    onChange={e => updateField('legal_content', 'rich_text_markdown', e.target.value)} 
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 text-sm leading-relaxed focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm" 
                                    placeholder="## 1. Cláusula..." 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Lado a Lado (Direita) */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-violet-500" /> Pré-visualização ao Vivo do Conteúdo
                            </h3>
                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 min-h-[480px] overflow-y-auto max-h-[640px]">
                                <h1 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">
                                    {currentData.page_header?.title || 'Sem título'}
                                </h1>
                                {previewHtml ? (
                                    <div 
                                        className="prose prose-slate max-w-none prose-headings:text-slate-950 prose-headings:font-black prose-p:text-slate-600 prose-p:font-semibold prose-p:leading-relaxed" 
                                        dangerouslySetInnerHTML={{ __html: previewHtml }} 
                                    />
                                ) : (
                                    <p className="text-xs text-slate-400 font-bold text-center py-20 italic">Escreva alguma cláusula para ver o preview aqui...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-12 text-center bg-red-50 border border-red-100 rounded-3xl text-red-700">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h4 className="text-lg font-bold">Arquivo JSON Corrompido ou Ausente</h4>
                    <p className="text-xs opacity-80 max-w-md mx-auto mt-1">Não foi possível carregar as propriedades do arquivo jurídico correspondente no repositório.</p>
                </div>
            )}
        </div>
    );
}
