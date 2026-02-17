import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowRight, Shield, Building2, Cloud, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const SolutionEntry = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        vendor: '',
        version: '',
        deploymentModel: 'SaaS',
        methodType: 'SIEM',
        licenseInfo: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get(`/api/solutions`)
                .then(res => {
                    const found = res.data.find(s => s.id === id);
                    if (found) {
                        setFormData({
                            name: found.name || '',
                            vendor: found.vendor || '',
                            version: found.version || '',
                            deploymentModel: found.deploymentModel || 'SaaS',
                            methodType: found.methodType || 'SIEM',
                            licenseInfo: found.licenseInfo || ''
                        });
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'Solution name is required';
        if (!formData.vendor?.trim()) newErrors.vendor = 'Vendor is required';
        if (!formData.version?.trim()) newErrors.version = 'Version is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            if (id) {
                await axios.put(`/api/solutions/${id}`, formData);
                navigate(`/assess/${id}`);
            } else {
                const res = await axios.post('/api/solutions', formData);
                navigate(`/assess/${res.data.id}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save solution. Please try again.');
            setLoading(false);
        }
    };

    if (loading && id) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Shield className="mx-auto text-primary mb-4 animate-pulse" size={56} />
                    <div className="text-muted-foreground text-lg">Loading solution...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">
                    {id ? 'Edit Solution' : 'Add New Solution'}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {id ? 'Update solution details and proceed to assessment' : 'Enter solution details to begin benchmarking assessment'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Card className="mb-6 shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Shield className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-foreground">Basic Information</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Solution Name */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                    Solution Name <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full bg-background border ${errors.name ? 'border-destructive' : 'border-input'} rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                                    placeholder="e.g., Microsoft Sentinel"
                                />
                                {errors.name && <p className="text-destructive text-sm mt-2">{errors.name}</p>}
                            </div>

                            {/* Vendor & Version */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                        <Building2 size={16} className="text-muted-foreground" />
                                        Vendor <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="vendor"
                                        value={formData.vendor}
                                        onChange={handleChange}
                                        className={`w-full bg-background border ${errors.vendor ? 'border-destructive' : 'border-input'} rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                                        placeholder="e.g., Microsoft"
                                    />
                                    {errors.vendor && <p className="text-destructive text-sm mt-2">{errors.vendor}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">
                                        Version <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={formData.version}
                                        onChange={handleChange}
                                        className={`w-full bg-background border ${errors.version ? 'border-destructive' : 'border-input'} rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                                        placeholder="e.g., Cloud or 2024.1"
                                    />
                                    {errors.version && <p className="text-destructive text-sm mt-2">{errors.version}</p>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deployment Details */}
                <Card className="mb-6 shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Cloud className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-foreground">Deployment & Licensing</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Deployment Model & Method Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">
                                        Deployment Model
                                    </label>
                                    <select
                                        name="deploymentModel"
                                        value={formData.deploymentModel}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="SaaS">SaaS (Cloud)</option>
                                        <option value="On-Premise">On-Premise</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">
                                        Solution Type
                                    </label>
                                    <select
                                        name="methodType"
                                        value={formData.methodType}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="SIEM">SIEM</option>
                                        <option value="SIEM/SOAR">SIEM/SOAR</option>
                                        <option value="SOC Platform">SOC Platform</option>
                                        <option value="XDR">XDR</option>
                                        <option value="Log Management">Log Management</option>
                                        <option value="CNAPP">CNAPP</option>
                                    </select>
                                </div>
                            </div>

                            {/* License Info */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                    <DollarSign size={16} className="text-muted-foreground" />
                                    Licensing Model
                                </label>
                                <select
                                    name="licenseInfo"
                                    value={formData.licenseInfo}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select licensing model...</option>
                                    <option value="Consumption">Consumption-based</option>
                                    <option value="Endpoint-based">Per-Endpoint</option>
                                    <option value="EPS-based">Events Per Second (EPS)</option>
                                    <option value="Ingest-based">Data Ingest-based</option>
                                    <option value="Employee-count">Per-Employee</option>
                                    <option value="User-based">Per-User</option>
                                    <option value="Perpetual">Perpetual License</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save & Continue
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SolutionEntry;
