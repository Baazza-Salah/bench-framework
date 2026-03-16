import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, User, Filter, RefreshCw, Layers, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [expandedLogs, setExpandedLogs] = useState(new Set());
    
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/logs');
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = filter === 'All' 
        ? logs 
        : logs.filter(log => log.action === filter);

    const getActionColor = (action) => {
        switch(action) {
            case 'CREATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'UPDATE': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-secondary text-foreground border-border';
        }
    };

    const toggleExpand = (logId) => {
        setExpandedLogs(prev => {
            const next = new Set(prev);
            if (next.has(logId)) {
                next.delete(logId);
            } else {
                next.add(logId);
            }
            return next;
        });
    };

    const formatChangeValue = (val) => {
        if (val === null || val === undefined) return <span className="text-muted-foreground italic">empty</span>;
        if (typeof val === 'object') return <span className="font-mono text-xs">{JSON.stringify(val)}</span>;
        return <span className="font-medium font-mono text-foreground text-xs">{String(val)}</span>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                        <Activity className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">System Logs</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Track team activity and system changes
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-secondary/50 border border-border rounded-xl p-1 flex items-center">
                        {['All', 'CREATE', 'UPDATE', 'DELETE'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors border border-border"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Layers size={16} />
                        Recent Activity
                    </div>
                    <div className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {filteredLogs.length} Events
                    </div>
                </div>
                
                {loading && logs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                        <RefreshCw className="animate-spin mb-4 text-primary w-8 h-8" />
                        Loading activity logs...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Filter className="text-muted-foreground" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No logs found</h3>
                        <p className="text-muted-foreground mt-1">No activity matches the current filter.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50 max-h-[70vh] overflow-y-auto">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-4 md:p-5 hover:bg-secondary/20 transition-colors flex flex-col md:flex-row gap-4 md:items-center">
                                {/* Action Badge */}
                                <div className="flex-shrink-0 w-24">
                                    <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded border flex justify-center ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User size={14} className="text-muted-foreground" />
                                        <span className="font-bold text-foreground truncate">{log.username}</span>
                                        <span className="text-muted-foreground text-sm mx-1">modified</span>
                                        <span className="font-bold text-foreground text-sm">{log.target}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-muted-foreground truncate font-medium">
                                            {log.details}
                                        </p>
                                        {log.changes && (
                                            <button 
                                                onClick={() => toggleExpand(log.id)}
                                                className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-0.5 rounded-md transition-colors font-bold"
                                            >
                                                {expandedLogs.has(log.id) ? (
                                                    <><ChevronUp size={14} /> Hide Details</>
                                                ) : (
                                                    <><ChevronDown size={14} /> View Changes</>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Expanded Changes Section */}
                                    {log.changes && expandedLogs.has(log.id) && (
                                        <div className="mt-4 p-4 bg-background border border-border rounded-xl shadow-inner animate-in fade-in slide-in-from-top-2">
                                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">Exact Modifications</h4>
                                            
                                            {log.target === 'Scores' && log.changes?.scores ? (
                                                <div className="space-y-4">
                                                    {Object.entries(log.changes.scores).map(([critId, critDiff]) => (
                                                        <div key={critId} className="space-y-2">
                                                            <div className="text-xs font-bold text-primary">Criterion ID: {critId}</div>
                                                            {Object.entries(critDiff).map(([field, vals]) => {
                                                                if (field === 'old' || field === 'new') return null; // Edge case
                                                                if (vals && vals.old !== undefined && vals.new !== undefined) {
                                                                    return (
                                                                        <div key={field} className="flex items-center gap-3 text-sm bg-secondary/30 p-2 rounded-lg ml-2">
                                                                            <span className="font-bold text-muted-foreground w-20 truncate" title={field}>{field}</span>
                                                                            {formatChangeValue(vals.old)}
                                                                            <ArrowRight size={14} className="text-muted-foreground mx-1 flex-shrink-0" />
                                                                            {formatChangeValue(vals.new)}
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {Object.entries(log.changes).map(([field, vals]) => (
                                                        <div key={field} className="flex items-center gap-3 text-sm bg-secondary/30 p-2.5 rounded-lg">
                                                            <span className="font-bold text-muted-foreground w-28 truncate" title={field}>{field}</span>
                                                            <div className="flex-1 flex flex-wrap items-center gap-2">
                                                                {formatChangeValue(vals.old)}
                                                                <ArrowRight size={14} className="text-muted-foreground mx-2 flex-shrink-0" />
                                                                <div className="bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                                                                    {formatChangeValue(vals.new)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Timestamp */}
                                <div className="flex-shrink-0 flex self-start md:self-auto items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                                    <Clock size={12} />
                                    {formatDate(log.timestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logs;
