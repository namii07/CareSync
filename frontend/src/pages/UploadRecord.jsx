import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { UploadCloud, FileText, Image, X, CheckCircle, ArrowLeft } from 'lucide-react';

const RECORD_TYPES = ['Blood Report', 'Prescription', 'X-Ray / Scan', 'Vaccination', 'Consultation Notes', 'Other'];

export default function UploadRecord() {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Blood Report');
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const handleFile = (f) => {
        if (!f) return;
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(f.type)) { setError('Only PDF and image files are allowed.'); return; }
        if (f.size > 10 * 1024 * 1024) { setError('File size must be under 10 MB.'); return; }
        setError('');
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Please select a file to upload.'); return; }
        if (!title.trim()) { setError('Please enter a document title.'); return; }

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('type', type);
        formData.append('file', file);

        setLoading(true);
        setError('');
        try {
            await api.post('/records/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="max-w-md mx-auto mt-20 text-center bg-white rounded-2xl border border-slate-100 shadow-xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Successful!</h2>
            <p className="text-slate-500">Your record has been securely stored. Redirecting to dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Upload Medical Record</h1>
                    <p className="text-slate-500 text-sm">Securely store your health document</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Title <span className="text-red-500">*</span></label>
                        <input type="text" required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400"
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Annual Blood Test – June 2025" />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Type <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-2">
                            {RECORD_TYPES.map(t => (
                                <button key={t} type="button" onClick={() => setType(t)}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all text-left ${
                                        type === t
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                    }`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Drop Zone */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">File <span className="text-red-500">*</span></label>
                        <div
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                dragOver ? 'border-blue-500 bg-blue-50' :
                                file ? 'border-green-400 bg-green-50' :
                                'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}>
                            <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden"
                                onChange={e => handleFile(e.target.files[0])} />

                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {file.type === 'application/pdf'
                                            ? <FileText className="w-5 h-5 text-green-600" />
                                            : <Image className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{file.name}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                                        className="ml-auto p-1 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-600">
                                        Drag & drop or <span className="text-blue-600">browse files</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, WEBP — max 10 MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2">
                        {loading ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading securely...</>
                        ) : (
                            <><UploadCloud className="w-5 h-5" /> Upload Record</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
