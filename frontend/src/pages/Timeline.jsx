import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import FileViewer from '../components/FileViewer';
import { Activity, Clock, FilePlus, FileText } from 'lucide-react';

const TYPE_COLORS = {
    'Blood Report': 'bg-red-100 text-red-700',
    'Prescription': 'bg-green-100 text-green-700',
    'X-Ray / Scan': 'bg-purple-100 text-purple-700',
    'Vaccination': 'bg-yellow-100 text-yellow-700',
    'Consultation Notes': 'bg-blue-100 text-blue-700',
    'Other': 'bg-slate-100 text-slate-700',
};

export default function Timeline() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        api.get('/records')
            .then(res => setRecords(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const types = ['All', ...new Set(records.map(r => r.type))];
    const filtered = filter === 'All' ? records : records.filter(r => r.type === filter);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                Loading timeline...
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/30">
                    <Activity className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">Medical Timeline</h1>
                <p className="text-slate-500 mt-2">Your complete chronological health history.</p>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold text-lg">Your timeline is empty</p>
                    <p className="text-slate-400 text-sm mt-1 mb-6">Start by uploading your first medical record.</p>
                    <Link to="/upload"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                        <FilePlus className="w-4 h-4" /> Upload First Record
                    </Link>
                </div>
            ) : (
                <>
                    {/* Filter Tabs */}
                    <div className="flex gap-2 flex-wrap mb-8">
                        {types.map(type => (
                            <button key={type} onClick={() => setFilter(type)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    filter === type
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                                }`}>
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-10">
                        {filtered.map((record) => (
                            <div key={record._id} className="relative pl-8 group">
                                {/* Dot */}
                                <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow group-hover:scale-125 transition-transform" />

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-6">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-2 ${TYPE_COLORS[record.type] || TYPE_COLORS['Other']}`}>
                                                {record.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">{record.title}</h3>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {new Date(record.uploadedAt).toLocaleDateString('en-US', {
                                                    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <FileViewer url={record.fileUrl} title={record.title} mimeType={record.mimeType} recordId={record._id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
