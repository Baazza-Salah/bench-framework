import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, User, ArrowRight } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        
        const result = await register(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Failed to register');
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
                        Create <span className="text-primary">Account</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-center text-sm font-medium">
                        Join SOCBench to assess solutions
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
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                <User size={18} className="transition-colors group-focus-within:text-primary" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                placeholder="Choose a username"
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
                                placeholder="Create a password"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">Confirm Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                <Key size={18} className="transition-colors group-focus-within:text-primary" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                placeholder="Repeat your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                        {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    
                    <p className="text-sm text-muted-foreground text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-foreground font-bold transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
