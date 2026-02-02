
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, Lock, Unlock, Plus, Search, Settings, ShieldAlert, 
  Cpu, Activity, Eye, EyeOff, Trash2, TrendingUp, Fingerprint, 
  UserPlus, LogIn, AlertTriangle, Key, Database
} from 'lucide-react';
import { PasswordEntry, SecurityAuditResult } from './types';
import { PasswordGenerator } from './components/PasswordGenerator';
import { TerminalButton } from './components/ui/TerminalButton';
import { getSecurityAudit, getGlobalSecurityBriefing } from './services/geminiService';

type AuthView = 'LOGIN' | 'SIGNUP' | 'MASTER_UNLOCK' | 'VAULT';

const App: React.FC = () => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '', masterKey: '' });
  const [currentUser, setCurrentUser] = useState<{username: string} | null>(null);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ site: '', username: '', password: '', category: 'Personal' });
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [securityBriefing, setSecurityBriefing] = useState('Initializing security protocols...');
  const [activeAudit, setActiveAudit] = useState<{ id: string, result: SecurityAuditResult } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Performance optimized data fetching
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const brief = await getGlobalSecurityBriefing();
      if (isMounted) setSecurityBriefing(brief);
    };
    init();

    const session = sessionStorage.getItem('cyphervault_session');
    if (session) {
      const user = JSON.parse(session);
      setCurrentUser(user);
      setView('MASTER_UNLOCK');
      const saved = localStorage.getItem(`vault_${user.username}`);
      if (saved) setPasswords(JSON.parse(saved));
    }
    return () => { isMounted = false; };
  }, []);

  const saveVaultData = useCallback((data: PasswordEntry[]) => {
    if (currentUser) {
      localStorage.setItem(`vault_${currentUser.username}`, JSON.stringify(data));
    }
  }, [currentUser]);

  const handleSignup = () => {
    if (!authForm.username || !authForm.password || !authForm.masterKey) {
      setError('ALL_FIELDS_REQUIRED');
      return;
    }
    if (authForm.password !== authForm.confirmPassword) {
      setError('PASSWORD_MISMATCH');
      return;
    }

    const users = JSON.parse(localStorage.getItem('cyphervault_users') || '{}');
    if (users[authForm.username]) {
      setError('USER_EXISTS');
      return;
    }

    users[authForm.username] = { 
      password: authForm.password,
      masterKey: authForm.masterKey 
    };
    localStorage.setItem('cyphervault_users', JSON.stringify(users));
    setError('');
    setView('LOGIN');
    setAuthForm({ username: '', password: '', confirmPassword: '', masterKey: '' });
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('cyphervault_users') || '{}');
    const user = users[authForm.username];

    if (user && user.password === authForm.password) {
      const userData = { username: authForm.username };
      setCurrentUser(userData);
      sessionStorage.setItem('cyphervault_session', JSON.stringify(userData));
      const saved = localStorage.getItem(`vault_${authForm.username}`);
      setPasswords(saved ? JSON.parse(saved) : []);
      setView('MASTER_UNLOCK');
      setError('');
    } else {
      setError('INVALID_CREDENTIALS');
    }
  };

  const handleMasterUnlock = () => {
    const users = JSON.parse(localStorage.getItem('cyphervault_users') || '{}');
    if (currentUser && users[currentUser.username].masterKey === masterKeyInput) {
      setView('VAULT');
      setError('');
    } else {
      setError('DECRYPTION_FAILED');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cyphervault_session');
    setCurrentUser(null);
    setPasswords([]);
    setView('LOGIN');
    setMasterKeyInput('');
    setAuthForm({ username: '', password: '', confirmPassword: '', masterKey: '' });
    setError('');
  };

  const handleAddEntry = () => {
    const entry: PasswordEntry = {
      id: Math.random().toString(36).substr(2, 9),
      site: newEntry.site,
      username: newEntry.username,
      passwordHash: newEntry.password,
      category: newEntry.category,
      createdAt: Date.now(),
      strength: newEntry.password.length > 16 ? 'ultra' : newEntry.password.length > 12 ? 'strong' : 'medium'
    };
    const updated = [...passwords, entry];
    setPasswords(updated);
    saveVaultData(updated);
    setNewEntry({ site: '', username: '', password: '', category: 'Personal' });
    setIsAdding(false);
  };

  const togglePasswordVisibility = (id: string) => {
    const next = new Set(visiblePasswords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisiblePasswords(next);
  };

  const deleteEntry = (id: string) => {
    const updated = passwords.filter(p => p.id !== id);
    setPasswords(updated);
    saveVaultData(updated);
  };

  const runAudit = async (entry: PasswordEntry) => {
    setIsAuditing(true);
    const result = await getSecurityAudit(entry.site, entry.username);
    setActiveAudit({ id: entry.id, result });
    setIsAuditing(false);
  };

  const filteredPasswords = useMemo(() => passwords.filter(p => 
    p.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  ), [passwords, searchQuery]);

  // Auth Views optimized for smoothness
  if (view === 'LOGIN' || view === 'SIGNUP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 gpu-accel overflow-hidden">
        <div className="max-w-md w-full border border-emerald-500/20 p-8 rounded-lg bg-slate-900/60 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center mb-8">
            <Shield className="text-emerald-500 w-10 h-10 mb-4" />
            <h1 className="text-2xl font-black text-emerald-500 tracking-[0.25em]">CYPHER_VAULT</h1>
            <p className="text-emerald-500/40 text-[9px] mt-2 uppercase tracking-[0.4em] font-bold">
              {view === 'LOGIN' ? 'ACCESS_TERMINAL' : 'SECURE_PROVISIONING'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/5 border border-red-500/20 rounded flex items-center gap-3 text-red-500 text-[10px] font-black tracking-widest uppercase">
              <AlertTriangle size={14} /> {error.replace(/_/g, ' ')}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-emerald-500/60 font-black tracking-widest ml-1">Identity_ID</label>
              <input 
                type="text" 
                value={authForm.username}
                onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                className="w-full bg-black/40 border border-emerald-500/10 rounded py-2.5 px-4 text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all text-sm font-mono"
                placeholder="USER_X"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase text-emerald-500/60 font-black tracking-widest ml-1">Access_Key</label>
              <input 
                type="password" 
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-black/40 border border-emerald-500/10 rounded py-2.5 px-4 text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all text-sm font-mono"
                placeholder="••••••••"
              />
            </div>

            {view === 'SIGNUP' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-emerald-500/60 font-black tracking-widest ml-1">Confirm_Key</label>
                  <input 
                    type="password" 
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="w-full bg-black/40 border border-emerald-500/10 rounded py-2.5 px-4 text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all text-sm font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-amber-500/80 font-black tracking-widest ml-1">Master_Decryption_Key</label>
                  <input 
                    type="password" 
                    value={authForm.masterKey}
                    onChange={(e) => setAuthForm({...authForm, masterKey: e.target.value})}
                    className="w-full bg-black/40 border border-amber-500/20 rounded py-2.5 px-4 text-amber-500 focus:outline-none focus:border-amber-500 transition-all text-sm font-mono"
                    placeholder="REQUIRED_FOR_VAULT"
                  />
                </div>
              </div>
            )}

            <TerminalButton 
              onClick={view === 'LOGIN' ? handleLogin : handleSignup} 
              className={`w-full py-3 mt-4 ${view === 'SIGNUP' ? 'border-amber-500 text-amber-500' : ''}`}
            >
              {view === 'LOGIN' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {view === 'LOGIN' ? 'INITIALIZE_AUTH' : 'GENERATE_VAULT'}
            </TerminalButton>

            <button 
              onClick={() => { setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); }}
              className="w-full text-[9px] text-emerald-500/30 hover:text-emerald-500 uppercase tracking-widest transition-colors font-black py-4"
            >
              {view === 'LOGIN' ? 'REGISTER_NEW_NODE' : 'BACK_TO_LOGIN'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'MASTER_UNLOCK') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 gpu-accel">
        <div className="max-w-md w-full border border-emerald-500/30 p-10 rounded-lg bg-black/60 shadow-[0_0_80px_rgba(16,185,129,0.1)] relative z-10 animate-in zoom-in duration-300">
          <div className="flex flex-col items-center mb-8">
            <Lock className="text-emerald-500 w-12 h-12 mb-4" />
            <h1 className="text-lg font-black text-emerald-500 tracking-[0.2em] uppercase">VAULT_LOCKDOWN</h1>
            <p className="text-emerald-500/40 text-[9px] mt-1 uppercase tracking-widest font-bold">Node: {currentUser?.username}</p>
          </div>

          <div className="space-y-6">
            <input 
              type="password" 
              value={masterKeyInput}
              onChange={(e) => setMasterKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMasterUnlock()}
              className="w-full bg-black/80 border-2 border-emerald-500/20 rounded-lg py-4 text-center text-2xl tracking-[0.5em] text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all font-bold"
              autoFocus
              placeholder="••••"
            />
            {error && <p className="text-center text-red-500 text-[9px] font-black uppercase">{error}</p>}
            <TerminalButton onClick={handleMasterUnlock} className="w-full py-5 text-lg">
              <Database size={22} /> DECRYPT_VAULT
            </TerminalButton>
            <div className="flex justify-center gap-4">
               <button onClick={handleLogout} className="text-[9px] text-red-500/30 hover:text-red-500 uppercase font-black">LOGOUT</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500 font-mono selection:bg-emerald-500/30 gpu-accel">
      {/* Sidebar Navigation */}
      <nav className="fixed top-0 left-0 h-full w-16 border-r border-emerald-500/10 bg-slate-900/40 z-40 hidden md:flex flex-col items-center py-8 space-y-6">
        <Shield className="w-8 h-8 mb-4 text-emerald-500" />
        <button className="p-3 text-emerald-500/40 hover:text-emerald-500"><Cpu size={20} /></button>
        <button className="p-3 text-emerald-500/40 hover:text-emerald-500"><Activity size={20} /></button>
        <div className="flex-1" />
        <button onClick={() => setView('MASTER_UNLOCK')} className="p-3 text-amber-500/40 hover:text-amber-500"><Lock size={20} /></button>
        <button onClick={handleLogout} className="p-3 text-red-500/40 hover:text-red-500"><Trash2 size={20} /></button>
      </nav>

      <main className="md:ml-16 p-4 md:p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-emerald-500/5 pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">CYPHER_VAULT</h1>
            <p className="text-[10px] text-emerald-500/40 mt-1 uppercase tracking-widest truncate max-w-lg">
              <span className="text-emerald-500 font-black">INTEL:</span> {securityBriefing}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-emerald-500/10 rounded-full py-2 pl-10 pr-6 text-[10px] focus:outline-none focus:border-emerald-500/50 w-full md:w-64 tracking-widest"
              />
            </div>
            <TerminalButton onClick={() => setIsAdding(true)} className="text-xs">
              <Plus size={16} /> ADD_SECRET
            </TerminalButton>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {isAdding && (
              <div className="border border-emerald-500/20 p-6 rounded-lg bg-slate-900/60 relative animate-in zoom-in duration-200">
                <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-emerald-500/30 hover:text-emerald-500">×</button>
                <h3 className="font-black mb-6 uppercase text-sm tracking-widest">NEW_VAULT_ENTRY</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="SERVICE" className="bg-black/40 border border-emerald-500/10 p-3 rounded text-xs focus:outline-none" value={newEntry.site} onChange={e => setNewEntry({...newEntry, site: e.target.value})} />
                  <input placeholder="IDENTITY" className="bg-black/40 border border-emerald-500/10 p-3 rounded text-xs focus:outline-none" value={newEntry.username} onChange={e => setNewEntry({...newEntry, username: e.target.value})} />
                  <input placeholder="SECRET" type="password" className="bg-black/40 border border-emerald-500/10 p-3 rounded text-xs focus:outline-none" value={newEntry.password} onChange={e => setNewEntry({...newEntry, password: e.target.value})} />
                  <select className="bg-black/40 border border-emerald-500/10 p-3 rounded text-[10px] focus:outline-none" value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})}>
                    <option>PERSONAL</option><option>FINANCIAL</option><option>SYSTEM</option>
                  </select>
                </div>
                <TerminalButton onClick={handleAddEntry} className="w-full mt-6 py-3 text-xs">COMMIT_ENCRYPTION</TerminalButton>
              </div>
            )}

            <div className="space-y-3">
              {filteredPasswords.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-emerald-500/5 rounded-lg">
                  <p className="text-emerald-500/20 text-[10px] uppercase font-black tracking-[0.5em]">Sector Empty</p>
                </div>
              ) : (
                filteredPasswords.map(entry => (
                  <div key={entry.id} className="border border-emerald-500/10 p-4 rounded-lg bg-slate-900/20 hover:bg-slate-900/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Fingerprint className="text-emerald-500/20" size={20} />
                        <div>
                          <h4 className="font-black uppercase text-xs tracking-wider text-emerald-400">{entry.site}</h4>
                          <p className="text-[9px] text-emerald-500/30 font-bold uppercase">{entry.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-black/40 px-3 py-1.5 rounded border border-emerald-500/5 min-w-[140px] flex justify-between">
                          <code className="text-[10px] tracking-widest">{visiblePasswords.has(entry.id) ? entry.passwordHash : "••••••••"}</code>
                          <button onClick={() => togglePasswordVisibility(entry.id)} className="text-emerald-500/20 hover:text-emerald-500 transition-colors">
                            {visiblePasswords.has(entry.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => runAudit(entry)} className="p-2 text-emerald-500/20 hover:text-emerald-500"><ShieldAlert size={16} /></button>
                          <button onClick={() => deleteEntry(entry.id)} className="p-2 text-red-500/20 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                    {activeAudit?.id === entry.id && (
                      <div className="mt-4 pt-4 border-t border-emerald-500/5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded">
                          <p className="text-[8px] font-black text-red-400 uppercase mb-2">Threats</p>
                          <ul className="text-[9px] text-red-400/60 list-disc list-inside">
                            {activeAudit.result.vulnerabilities.map((v, i) => <li key={i}>{v}</li>)}
                          </ul>
                        </div>
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded">
                          <p className="text-[8px] font-black text-emerald-400 uppercase mb-2">Defense</p>
                          <ul className="text-[9px] text-emerald-400/60 list-disc list-inside">
                            {activeAudit.result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PasswordGenerator onGenerate={pw => isAdding && setNewEntry({...newEntry, password: pw})} />
            <div className="bg-slate-900/40 border border-emerald-500/10 p-6 rounded-lg">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={14} /> SYSTEM_INFO
              </h3>
              <div className="space-y-3 text-[9px] font-bold">
                <div className="flex justify-between border-b border-emerald-500/5 pb-2">
                  <span className="text-emerald-500/40 uppercase">NODE_OWNER</span>
                  <span>{currentUser?.username.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-500/5 pb-2">
                  <span className="text-emerald-500/40 uppercase">CRYPTO_VER</span>
                  <span className="text-emerald-400">AES-GCM-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-500/40 uppercase">INTEGRITY</span>
                  <span className="text-emerald-400 animate-pulse">100% SECURE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-black/95 border-t border-emerald-500/5 py-1.5 px-6 text-[8px] flex justify-between items-center z-50">
        <div className="flex items-center gap-4 text-emerald-500/30">
          <span className="flex items-center gap-1 font-black text-emerald-500"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> STABLE</span>
          <span>CYPHER_CORE v4.1.0</span>
        </div>
        <div className="text-emerald-500/20 font-black tracking-widest uppercase">
           End-to-End Encryption Verified
        </div>
      </footer>

      {isAuditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-in fade-in duration-300">
          <div className="text-center">
            <Cpu className="w-12 h-12 text-emerald-500 animate-spin mx-auto opacity-50 mb-4" />
            <p className="text-lg font-black text-emerald-500 tracking-[0.4em] animate-pulse">AI_SCANNING</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
