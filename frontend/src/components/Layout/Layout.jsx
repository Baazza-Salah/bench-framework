import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, BarChart2, Shield, Settings, Swords, BookOpen, Sun, Moon, Menu, X, Activity, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { darkMode, setDarkMode } = useTheme();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label, onClick }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                onClick={onClick}
                className={`
                    flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 group
                    ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                `}
            >
                <Icon
                    size={20}
                    className={`mr-3 transition-all duration-200
                        ${isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5'
                        }`}
                />
                <span className="font-medium transition-all duration-200 group-hover:translate-x-0.5">{label}</span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-sm animate-glow-pulse" />
                )}
            </Link>
        );
    };

    const closeSidebar = () => setSidebarOpen(false);

    const SidebarContent = () => (
        <>
            <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-1 animate-slide-in-left stagger-1">
                    <div className="bg-primary p-2 rounded-lg shadow-sm">
                        <Shield className="text-primary-foreground animate-float" size={24} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                        SOC<span className="text-primary">Bench</span>
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2">Main Menu</div>
                <NavItem to="/" icon={Home} label="Dashboard" onClick={closeSidebar} />
                <NavItem to="/solution" icon={PlusCircle} label="Manage Solutions" onClick={closeSidebar} />
                <NavItem to="/criteria" icon={Settings} label="Manage Criteria" onClick={closeSidebar} />
                <NavItem to="/compare" icon={BarChart2} label="Comparison" onClick={closeSidebar} />
                <NavItem to="/battle" icon={Swords} label="Battle Mode" onClick={closeSidebar} />
                <NavItem to="/logs" icon={Activity} label="System Logs" onClick={closeSidebar} />

                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">Resources</div>
                <NavItem to="/about" icon={BookOpen} label="Methodology" onClick={closeSidebar} />
            </nav>

            <div className="mt-auto pt-6 border-t border-border">
                <div className="px-6 pb-6 md:px-8 md:pb-8">
                    <div className="bg-secondary/50 rounded-2xl p-4 border border-border animate-scale-in stagger-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {user?.username?.substring(0, 2) || 'US'}
                            </div>
                            <div className="text-xs font-bold text-foreground truncate max-w-[100px]">{user?.username || 'User'}</div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/30">

            {/* ── Mobile overlay backdrop ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* ── Sidebar (desktop: always visible | mobile: slide-in drawer) ── */}
            <aside className={`
                w-[280px] bg-card border-r border-border flex flex-col fixed h-full z-50 shadow-sm
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <SidebarContent />
            </aside>

            {/* ── Mobile top bar ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border flex items-center px-4 h-14 shadow-sm">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors mr-3"
                    aria-label="Open menu"
                >
                    <Menu size={20} className="text-foreground" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-md">
                        <Shield className="text-primary-foreground" size={16} />
                    </div>
                    <span className="font-black text-base tracking-tight">SOC<span className="text-primary">Bench</span></span>
                </div>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="ml-auto p-2 rounded-full hover:bg-secondary transition-colors"
                >
                    {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                </button>
            </div>

            {/* ── Mobile sidebar close button ── */}
            {sidebarOpen && (
                <button
                    onClick={closeSidebar}
                    className="fixed top-4 left-[240px] z-[60] p-1.5 bg-card rounded-full border border-border shadow md:hidden"
                >
                    <X size={16} />
                </button>
            )}

            {/* ── Desktop theme toggle ── */}
            <div className="hidden md:block fixed bottom-6 left-[210px] z-[60]">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full bg-card border border-border shadow-md hover:bg-secondary text-foreground transition-colors"
                    title="Toggle Theme"
                >
                    {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                </button>
            </div>

            {/* ── Main content ── */}
            <main className="flex-1 md:ml-[280px] pt-14 md:pt-0 p-4 md:p-8 lg:p-12 relative overflow-x-hidden bg-background">
                <div
                    key={location.pathname}
                    className="max-w-[1600px] mx-auto animate-fade-up"
                >
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
