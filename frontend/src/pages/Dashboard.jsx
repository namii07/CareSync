import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import FileViewer from '../components/FileViewer';
import {
    FilePlus, Clock, Share2, Activity, UserRound,
    ArrowRight, FileText, CheckCircle, AlertCircle, Link2, Copy
} from 'lucide-react';

export default function Dashboard() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareStatus, setShareStatus] = useState({});
    const [generatedLinks, setGeneratedLinks] = useState({});
    const [accessInput, setAccessInput] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        if (user.role === 'patient') fetchRecords();
        else setLoading(false);
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/records');
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        // Fallback for HTTP (localhost)
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(el);
        return ok;
    };

    const generateAccessLink = async (recordId) => {
        setShareStatus(prev => ({ ...prev, [recordId]: 'loading' }));
        try {
            const res = await api.post('/access/generate', { recordId, expiresInHours: 24 });
            const link = `${window.location.origin}/access/${res.data.token}`;

            // Store the link to show in UI regardless of clipboard success
            setGeneratedLinks(prev => ({ ...prev, [recordId]: link }));

            try {
                await copyToClipboard(link);
                setShareStatus(prev => ({ ...prev, [recordId]: 'copied' }));
            } catch {
                // Clipboard failed but link is shown in UI
                setShareStatus(prev => ({ ...prev, [recordId]: 'shown' }));
            }
        } catch (err) {
            console.error('Share error:', err);
            setShareStatus(prev => ({ ...prev, [recordId]: 'error' }));
            setTimeout(() => setShareStatus(prev => ({ ...prev, [recordId]: null })), 3000);
        }
    };

    const handleAccessLink = (e) => {
        e.preventDefault();
        const input = accessInput.trim();
        if (!input) return;
        const token = input.includes('/access/') ? input.split('/access/').pop() : input;
        navigate(`/access/${token}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <p>Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                <Activity className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-blue-200 text-sm font-medium mb-1 uppercase tracking-wider">
                            {user.role === 'patient' ? 'Patient Portal' : 'Doctor Portal'}
                        </p>
                        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
                        <p className="text-blue-100 max-w-lg">
                            {user.role === 'patient'
                                ? 'Manage your health records, view your medical timeline, and share securely with your doctor.'
                                : 'Access patient records shared with you via secure access links.'}
                        </p>
                    </div>
                    {user.role === 'patient' && (
                        <div className="flex gap-3 flex-shrink-0">
                            <Link to="/upload"
                                className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors shadow-sm">
                                <FilePlus className="w-4 h-4" /> Upload Record
                            </Link>
                            <Link to="/timeline"
                                className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/40 text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors">
                                <Clock className="w-4 h-4" /> Timeline
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserRound className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{user.name}</p>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {user.role}
                        </span>
                        <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
                    </div>
                </div>

                {user.role === 'patient' && (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <FileText className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-800">{records.length}</p>
                                <p className="text-sm text-slate-500">Total Records</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <Share2 className="w-7 h-7 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-800">
                                    {new Set(records.map(r => r.type)).size}
                                </p>
                                <p className="text-sm text-slate-500">Record Types</p>
                            </div>
                        </div>
                    </>
                )}

                {user.role === 'doctor' && (
                    <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-blue-600" /> Enter Patient Access Link
                        </p>
                        <form onSubmit={handleAccessLink} className="flex gap-2">
                            <input
                                type="text"
                                value={accessInput}
                                onChange={e => setAccessInput(e.target.value)}
                                placeholder="Paste access link or token here..."
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
                                Access
                            </button>
                        </form>
                        <p className="text-xs text-slate-400 mt-2">
                            Ask your patient to share their record link with you.
                        </p>
                    </div>
                )}
            </div>

            {/* Patient Records */}
            {user.role === 'patient' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> Recent Records
                        </h2>
                        <Link to="/timeline" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {records.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No records yet</p>
                            <p className="text-slate-400 text-sm mt-1 mb-6">Upload your first medical record to get started.</p>
                            <Link to="/upload"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                                <FilePlus className="w-4 h-4" /> Upload Record
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {records.slice(0, 6).map(record => (
                                <div key={record._id}
                                    className="p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50">

                                    {/* Record Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                                                {record.type}
                                            </span>
                                            <h3 className="font-semibold text-slate-800 mt-2 line-clamp-1">{record.title}</h3>
                                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(record.uploadedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Share Button */}
                                        <button
                                            onClick={() => generateAccessLink(record._id)}
                                            disabled={shareStatus[record._id] === 'loading'}
                                            title="Generate & share access link with doctor"
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ml-2 ${
                                                shareStatus[record._id] === 'copied' ? 'bg-green-100 text-green-700' :
                                                shareStatus[record._id] === 'shown'  ? 'bg-blue-100 text-blue-700' :
                                                shareStatus[record._id] === 'error'  ? 'bg-red-100 text-red-600' :
                                                shareStatus[record._id] === 'loading'? 'bg-slate-100 text-slate-400' :
                                                'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                                            }`}>
                                            {shareStatus[record._id] === 'loading' && <span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />}
                                            {shareStatus[record._id] === 'copied'  && <CheckCircle className="w-3 h-3" />}
                                            {shareStatus[record._id] === 'shown'   && <Copy className="w-3 h-3" />}
                                            {shareStatus[record._id] === 'error'   && <AlertCircle className="w-3 h-3" />}
                                            {!shareStatus[record._id]              && <Share2 className="w-3 h-3" />}
                                            {shareStatus[record._id] === 'copied'  ? 'Copied!' :
                                             shareStatus[record._id] === 'shown'   ? 'Link Ready' :
                                             shareStatus[record._id] === 'error'   ? 'Failed' :
                                             shareStatus[record._id] === 'loading' ? 'Generating...' : 'Share'}
                                        </button>
                                    </div>

                                    {/* Generated Link Box — shown when clipboard fails or as confirmation */}
                                    {generatedLinks[record._id] && (shareStatus[record._id] === 'copied' || shareStatus[record._id] === 'shown') && (
                                        <div className="mb-3 p-3 bg-white border border-blue-200 rounded-xl">
                                            <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                                                <Link2 className="w-3 h-3 text-blue-600" />
                                                Doctor Access Link (valid 24h)
                                            </p>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    readOnly
                                                    value={generatedLinks[record._id]}
                                                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 outline-none"
                                                    onFocus={e => e.target.select()}
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(generatedLinks[record._id]).then(() => setShareStatus(prev => ({ ...prev, [record._id]: 'copied' })))}
                                                    className="flex-shrink-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                    title="Copy link"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1.5">Copy this link and send it to your doctor.</p>
                                        </div>
                                    )}

                                    {/* File Viewer */}
                                    <FileViewer url={record.fileUrl} title={record.title} mimeType={record.mimeType} recordId={record._id} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Doctor Panel */}
            {user.role === 'doctor' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { step: '1', title: 'Patient Uploads', desc: 'Patient uploads their medical record to CareSync securely.' },
                            { step: '2', title: 'Patient Shares', desc: 'Patient clicks the Share button on their record and copies the link.' },
                            { step: '3', title: 'Doctor Views', desc: 'Paste the link in the box above or click it directly to view the record.' },
                        ].map(item => (
                            <div key={item.step} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        <strong>Note:</strong> Access links expire after 24 hours. Ask the patient to generate a new link if yours has expired.
                    </div>
                </div>
            )}
        </div>
    );
}
