import { useState } from 'react';
import { ExternalLink, FileText, Image, X, Eye } from 'lucide-react';
import { getFileUrl, getProxyUrl, isPdf, isImage } from '../utils/fileUtils';

export default function FileViewer({ url, title, mimeType, recordId }) {
    const [open, setOpen] = useState(false);
    const [viewerLoaded, setViewerLoaded] = useState(false);

    const fixedUrl  = getFileUrl(url);
    const pdf       = isPdf(url, mimeType);
    const img       = isImage(url, mimeType);

    // Use backend proxy for PDFs (streams with correct headers → browser renders inline)
    // Use direct Cloudinary URL for images (no CORS issue for <img> tags)
    const viewSrc = pdf && recordId ? getProxyUrl(recordId) : fixedUrl;

    if (!url) return null;

    return (
        <>
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => { setOpen(true); setViewerLoaded(false); }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    {pdf ? 'View PDF' : img ? 'View Image' : 'View File'}
                </button>
                <a
                    href={fixedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                </a>
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl"
                        style={{ height: '90vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-2 text-slate-800 font-semibold truncate pr-4">
                                {pdf
                                    ? <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    : <Image className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                }
                                <span className="truncate">{title}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <a
                                    href={fixedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="w-4 h-4" /> Full screen
                                </a>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-hidden rounded-b-2xl relative bg-slate-50">
                            {!viewerLoaded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 bg-slate-50">
                                    <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Loading document...</p>
                                </div>
                            )}

                            {pdf && (
                                <iframe
                                    src={viewSrc}
                                    title={title}
                                    className="w-full h-full"
                                    style={{ border: 'none' }}
                                    onLoad={() => setViewerLoaded(true)}
                                />
                            )}

                            {img && (
                                <div className="flex items-center justify-center h-full p-6">
                                    <img
                                        src={fixedUrl}
                                        alt={title}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                        onLoad={() => setViewerLoaded(true)}
                                    />
                                </div>
                            )}

                            {!pdf && !img && (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <FileText className="w-16 h-16 text-slate-300" />
                                    <p className="text-slate-500 text-sm">Preview not available.</p>
                                    <a
                                        href={fixedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Open File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
