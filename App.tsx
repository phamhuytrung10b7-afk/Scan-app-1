
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Barcode, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  Settings,
  History
} from 'lucide-react';
import { ScanRecord, ScanStatus } from './types';

// Utility for formatting dates as yyyy-MM-dd HH:mm:ss
const formatTimestamp = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const App: React.FC = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context for Beeps
  const playSound = (type: 'success' | 'error') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  // Keep input focused at all times for keyboard emulation scanners
  useEffect(() => {
    const keepFocus = () => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'BUTTON') {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', keepFocus);
    const interval = setInterval(keepFocus, 1000);
    return () => {
      document.removeEventListener('mousedown', keepFocus);
      clearInterval(interval);
    };
  }, []);

  const handleScan = useCallback((code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    const isDuplicate = scans.some(s => s.code === trimmedCode && s.status === ScanStatus.VALID);
    const timestamp = formatTimestamp(new Date());
    
    const newRecord: ScanRecord = {
      id: crypto.randomUUID(),
      code: trimmedCode,
      timestamp,
      status: isDuplicate ? ScanStatus.DUPLICATE : ScanStatus.VALID,
      index: scans.length + 1
    };

    if (isDuplicate) {
      playSound('error');
      setShowDuplicateWarning(true);
      setTimeout(() => setShowDuplicateWarning(false), 2000);
    } else {
      playSound('success');
      setScans(prev => [newRecord, ...prev]);
    }

    setLastScan(newRecord);
    setInputValue('');
  }, [scans]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScan(inputValue);
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all scan history? This action cannot be undone.')) {
      setScans([]);
      setLastScan(null);
    }
  };

  const exportCSV = () => {
    if (scans.length === 0) return;
    const headers = ['No.', 'Scanned Code', 'Scan Date & Time', 'Status'];
    const rows = scans.map(s => [s.index, s.code, s.timestamp, s.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `warehouse_scans_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Barcode size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Industrial Scan Manager</h1>
            <p className="text-xs text-slate-400 font-medium">Warehouse Entry & Factory Logistics v1.0</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={exportCSV}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors border border-slate-700"
          >
            <Download size={18} />
            <span className="font-semibold">Export CSV</span>
          </button>
          <button 
            onClick={clearAll}
            className="flex items-center space-x-2 bg-red-900/40 hover:bg-red-800 text-red-200 px-4 py-2 rounded-md transition-colors border border-red-800/50"
          >
            <Trash2 size={18} />
            <span className="font-semibold">Reset Session</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
        
        {/* Left Column: Input and Status */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 h-full">
          {/* Input Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ready to Scan</label>
            <div className="relative">
              <input 
                ref={inputRef}
                type="text"
                autoFocus
                placeholder="Scan code here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                className="w-full bg-slate-100 border-2 border-slate-300 rounded-xl px-4 py-6 text-3xl font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 mono"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Maximize2 size={24} />
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">Manual entry enabled. Scanners emulate keyboard input automatically.</p>
          </div>

          {/* Last Scan Status Display */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-xl border-4 transition-all duration-300 shadow-inner ${
            lastScan?.status === ScanStatus.VALID 
              ? 'bg-green-50 border-green-200' 
              : lastScan?.status === ScanStatus.DUPLICATE
              ? 'bg-orange-50 border-orange-200'
              : 'bg-white border-slate-100'
          }`}>
            {!lastScan ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Barcode className="text-slate-300" size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-400">Waiting for first scan</h2>
              </div>
            ) : (
              <div className="text-center w-full">
                {lastScan.status === ScanStatus.VALID ? (
                  <>
                    <CheckCircle2 className="text-green-500 mx-auto mb-4" size={80} />
                    <h3 className="text-2xl font-black text-green-700 uppercase tracking-tighter">SUCCESSFUL SCAN</h3>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="text-orange-500 mx-auto mb-4 animate-pulse" size={80} />
                    <h3 className="text-2xl font-black text-orange-700 uppercase tracking-tighter">DUPLICATE DETECTED</h3>
                    <p className="text-orange-600 font-bold mt-2">Code already exists in this session</p>
                  </>
                )}
                
                <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Scanned Value</p>
                  <p className="text-3xl font-black text-slate-800 break-all mono">{lastScan.code}</p>
                  <div className="h-px bg-slate-100 my-4" />
                  <p className="text-sm font-semibold text-slate-500">{lastScan.timestamp}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scan History Table */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <History className="text-slate-400" size={20} />
              <h2 className="font-bold text-slate-700">Scan Session History</h2>
            </div>
            <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">
              {scans.length} Records
            </div>
          </div>

          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-slate-100 w-20">No.</th>
                  <th className="px-6 py-4 border-b border-slate-100">Scanned Code</th>
                  <th className="px-6 py-4 border-b border-slate-100">Scan Date & Time</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {scans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No records to display. Use your scanner to begin.
                    </td>
                  </tr>
                ) : (
                  scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-400 mono">#{scan.index}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 mono text-lg">{scan.code}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{scan.timestamp}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          scan.status === ScanStatus.VALID 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer / Shortcut Guide */}
      <footer className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex space-x-6">
          <span className="flex items-center gap-1"><Settings size={12}/> System Active</span>
          <span className="flex items-center gap-1"><Maximize2 size={12}/> Auto-Focus On</span>
        </div>
        <div className="flex space-x-4">
          <span>Enter: Confirm Scan</span>
          <span>F5: Refresh App</span>
        </div>
      </footer>

      {/* Overlay Alert for Duplicates (Industrial Style) */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="bg-red-600 text-white px-12 py-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce border-8 border-red-500">
            <AlertTriangle size={64} className="mb-4" />
            <h2 className="text-4xl font-black">DUPLICATE!</h2>
            <p className="text-xl font-bold opacity-90 mt-2">Code already scanned in this session.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
