import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart2, Shield, Settings, Swords } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={`
                flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 group
                ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
            `}>
                <Icon size={20} className={`mr-3 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                <span className="font-medium">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-sm" />}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-[280px] bg-card border-r border-border flex flex-col fixed h-full z-50 shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-primary p-2 rounded-lg shadow-sm">
                            <Shield className="text-primary-foreground" size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            SOC<span className="text-primary">Bench</span>
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono ml-14">v2.0.0-beta</p>
                </div>

                <nav className="flex-1 px-4 overflow-y-auto">
                    <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2">Main Menu</div>
                    <NavItem to="/" icon={Home} label="Dashboard" />
                    <NavItem to="/solution" icon={PlusCircle} label="Add Solution" />
                    <NavItem to="/criteria" icon={Settings} label="Criteria Builder" />
                    <NavItem to="/compare" icon={BarChart2} label="Comparison" />
                    <NavItem to="/battle" icon={Swords} label="Battle Mode" />
                </nav>

                <div className="mt-auto pt-6 border-t border-border">
                    <div className="px-8 pb-8">
                        <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">BS</div>
                                <div className="text-xs font-bold text-foreground">Baazza Salah</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[280px] p-8 lg:p-12 relative overflow-x-hidden bg-background">
                {/* Top Bar placeholder if needed */}
                <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
