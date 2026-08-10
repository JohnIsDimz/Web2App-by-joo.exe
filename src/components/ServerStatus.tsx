import React, { useEffect, useState } from 'react';
import { Server, RefreshCw, AlertTriangle } from 'lucide-react';

export function ServerStatus() {
  const [serverState, setServerState] = useState<'loading' | 'online' | 'offline'>('loading');
  const [vpsMsg, setVpsMsg] = useState<string>('Memeriksa koneksi server VPS...');

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerState('online');
        setVpsMsg(data.vpsMessage || data.pterodactylMessage || 'Server VPS Standalone Active & Online');
      } else {
        setServerState('offline');
        setVpsMsg('Koneksi ke server VPS terputus');
      }
    } catch {
      setServerState('offline');
      setVpsMsg('Koneksi ke server VPS terputus');
    }
  };

  useEffect(() => {
    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
      <Server className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-slate-400 font-medium">VPS Build Server:</span>

      {serverState === 'loading' && (
        <span className="flex items-center gap-1.5 text-slate-400">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          <span>Memeriksa...</span>
        </span>
      )}

      {serverState === 'online' && (
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold cursor-help" title={vpsMsg}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>VPS Standalone Active</span>
        </span>
      )}

      {serverState === 'offline' && (
        <span className="flex items-center gap-1.5 text-amber-400 font-semibold cursor-help" title={vpsMsg}>
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Server Terputus</span>
        </span>
      )}
    </div>
  );
}


