
import React, { useState } from 'react';
import { TerminalButton } from './ui/TerminalButton';
import { RefreshCw, Copy, Check } from 'lucide-react';

interface PasswordGeneratorProps {
  onGenerate: (pw: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onGenerate }) => {
  const [length, setLength] = useState(24);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" + (includeSymbols ? "!@#$%^&*()_+~`|}{[]:;?><,./-=" : "");
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setGenerated(retVal);
    onGenerate(retVal);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/50 border border-emerald-500/30 p-6 rounded-lg backdrop-blur-sm">
      <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-emerald-500 animate-pulse"></span>
        GEN_KEY_MODULE
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-emerald-500/60 block mb-1">KEY_LENGTH: {length}</label>
          <input 
            type="range" 
            min="8" 
            max="64" 
            value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="symbols" 
            checked={includeSymbols} 
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          <label htmlFor="symbols" className="text-xs text-emerald-500/80">INCL_SYMBOLS_EXT</label>
        </div>

        <div className="flex items-center gap-2 bg-black border border-emerald-900/50 p-3 rounded overflow-hidden">
          <code className="text-emerald-400 break-all flex-1 text-sm">
            {generated || "AWAITING_GENERATION..."}
          </code>
          {generated && (
            <button onClick={copyToClipboard} className="text-emerald-500 hover:text-emerald-300">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>

        <TerminalButton onClick={generate} className="w-full">
          <RefreshCw size={16} /> REGENERATE_KEY
        </TerminalButton>
      </div>
    </div>
  );
};
