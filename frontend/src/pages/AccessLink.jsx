import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import FileViewer from '../components/FileViewer';
import { ShieldAlert, CheckCircle, Clock, User, FileText, ArrowLeft } from 'lucide-react';

export default function AccessLink() {
    const { token } = useParams();
    const [record, setRecord] = useState(null);
    const [expiry, setExpiry] = useState(null);
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || user.role !== 'doctor') {
            setStatus('error');
            setMessage('Only doctors can access shared records. Please log in as a doctor first.');
            return;
        }

        api.get(`/access/${token}`)
            .then(res => {
                setRecord(res.data.record);
                setExpiry(res.data.expiry);
                setStatus('success');
            })
            .catch(err => {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Invalid or expired access link.');
            });
    }, [token]);

    if (status === 'loading') return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                Verifying secure access token...
            </div>
        </div>
    );

    if (status === 'error') return (
        <div className="max-w-lg mx-auto mt-16">
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-500 mb-8">{message}</p>
                <Link to="/dashboard"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>
        </div>
    );

    const timeLeft = expiry ? Math.max(0, Math.round((new Date(expiry) - Date.now()) / 1000 / 60 / 60)) : 0;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Shared Medical Record</h1>
                    <p className="text-slate-500 text-sm">Secure doctor access view</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Status Bar */}
                <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Secure Access Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Expires in ~{timeLeft}h
                    </div>
                </div>

                <div className="p-8">
                    {/* Record Meta */}
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-800">{record.title}</h2>
                            <span className="inline-block mt-1 text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">
                                {record.type}
                            </span>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Shared by Patient</p>
                            <p className="font-semibold text-slate-800">{record.patientId?.name}</p>
                            <p className="text-xs text-slate-400">{record.patientId?.email}</p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-xs text-slate-500">Uploaded</p>
                            <p className="text-sm font-medium text-slate-700">
                                {new Date(record.uploadedAt).toLocaleDateString('en-US', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* File Viewer */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" /> Document
                        </p>
                        <FileViewer url={record.fileUrl} title={record.title} mimeType={record.mimeType} recordId={record._id} />
                    </div>

                    <p className="text-xs text-slate-400 text-center mt-6">
                        This link was shared securely by the patient and will expire automatically.
                        Do not share this link with others.
                    </p>
                </div>
            </div>
        </div>
    );
}
