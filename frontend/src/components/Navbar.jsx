import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Activity, LayoutDashboard, Clock, UploadCloud } from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
                <Link to={token ? '/dashboard' : '/'} className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    CareSync
                </Link>

                {token && user ? (
                    <div className="flex items-center gap-1">
                        <Link to="/dashboard"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>

                        {user.role === 'patient' && (
                            <>
                                <Link to="/timeline"
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/timeline') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    <Clock className="w-4 h-4" /> Timeline
                                </Link>
                                <Link to="/upload"
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/upload') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    <UploadCloud className="w-4 h-4" /> Upload
                                </Link>
                            </>
                        )}

                        <div className="ml-3 pl-3 border-l border-slate-200 flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5 capitalize">{user.role}</p>
                            </div>
                            <button onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
                        <Link to="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
