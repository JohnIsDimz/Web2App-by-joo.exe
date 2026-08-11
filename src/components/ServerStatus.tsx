import React, { useEffect, useState } from 'react';
import { Server, RefreshCw, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export function ServerStatus() {
  const [serverState, setServerState] = useState<'loading' | 'online' | 'offline'>('loading');
  const [vpsMsg, setVpsMsg] = useState<string>('Memeriksa koneksi server VPS...');
  const [latency, setLatency] = useState<number | null>(null);
  const [engineType, setEngineType] = useState<string>('Standalone');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const endTime = performance.now();
      const roundTrip = Math.round(endTime - startTime);
      setLatency(roundTrip);

      if (res.ok) {
        const data = await res.json();
        setServerState('online');
        setVpsMsg(data.vpsMessage || 'Server VPS Standalone Active & Online');
        setEngineType(data.engine || 'Fast Engine');
      } else {
        setServerState('offline');
        setVpsMsg('Server VPS tidak merespon (HTTP Error)');
      }
    } catch {
      setServerState('offline');
      setVpsMsg('Koneksi ke server VPS terputus');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    checkHealth();
  };

  useEffect(() => {
    checkHealth();
    // Poll every 15 seconds for real-time VPS status
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-inner">
      <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-400 font-medium">VPS Status:</span>

      {serverState === 'loading' && (
        <span className="flex items-center gap-1.5 text-slate-400 font-mono">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          <span>Memeriksa...</span>
        </span>
      )}

      {serverState === 'online' && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold cursor-help" title={`${vpsMsg} | Latency: ${latency ? `${latency}ms` : '<10ms'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
          </span>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 hidden sm:inline-flex items-center gap-1" title={vpsMsg}>
            <Zap className="w-2.5 h-2.5 text-emerald-400" />
            {engineType}
          </span>

          {latency !== null && (
            <span className="text-[10px] font-mono text-emerald-400/80 hidden md:inline">
              {latency}ms
            </span>
          )}
        </div>
      )}

      {serverState === 'offline' && (
        <span className="flex items-center gap-1.5 text-amber-400 font-semibold cursor-help" title={vpsMsg}>
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Server Terputus</span>
        </span>
      )}

      <button
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        title="Ping & Cek Ulang Status VPS"
        className="ml-1 p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
      </button>
    </div>
  );
}


