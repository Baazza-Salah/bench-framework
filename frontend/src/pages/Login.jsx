import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, User, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Failed to login');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 md:p-10 shadow-xl relative z-10 animate-scale-in">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-primary/10 p-4 rounded-2xl mb-4 relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <Shield className="w-12 h-12 text-primary relative z-10 animate-float" />
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight text-center">
                        SOC<span className="text-primary">Bench</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-center text-sm font-medium">
                        Authentication Required
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl font-medium animate-fade-in text-center">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group">
                                <User size={18} className="transition-colors group-focus-within:text-primary" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                <Key size={18} className="transition-colors group-focus-within:text-primary" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                        {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    
                    <p className="text-sm text-muted-foreground text-center mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:text-primary-foreground font-bold transition-colors">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
