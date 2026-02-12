import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Heart, Baby, Map as MapIcon, Smile, Zap, Github, AppWindow, TrendingUp, 
  Camera, Moon, Users, Globe, Flower2, Sparkles, ShieldCheck, MapPin, 
  MessageCircle, Award, PlusCircle, Share2, Lock, Activity, Languages, 
  Code, Info, Leaf, Coffee, Sun, CloudRain, Star, Landmark, Anchor, 
  ShieldAlert, RefreshCw, Send, Smartphone, Radar, Settings, CheckCircle2,
  Navigation, Eye, HeartHandshake, TreePine, SunMedium, BarChart3, PieChart,
  Building2, UserPlus, ArrowDownRight, ArrowRightLeft, Sparkle, Compass,
  Ghost, Gem, Tent, Wind, Trash2, Home, Search, Maximize2, Gift, Lightbulb
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, 
  query, increment, arrayUnion, serverTimestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

// --- Firebase 構成 (環境に合わせて空文字で初期化) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'hoho-singularity-v8';

const translations = {
  jp: {
    wealth: "魂の資産", map: "幸せの花地図", system: "開発と公開",
    billionaire: "HOHO 億万長者（創設者）", baby_status: "聖なる命（億万長者）を検知",
    virtue_ledger: "徳の全自動記録", presence: "神性同調率",
    work_impact: "SHI分配プロトコル", share: "富を分け与える",
    insight: "真理のインサイト", rewards: "幸せのご褒美",
    nature_guide: "自然回帰ガイド", sleep: "生命の再起動",
    inconvenience: "不便の美学", dreams: "夢の共鳴",
    slogan: "売上ではなく、微笑みを。利益ではなく、徳を。"
  },
  en: {
    wealth: "Soul Assets", map: "Happiness Map", system: "Dev Hub",
    billionaire: "HOHO Billionaire (Founder)", baby_status: "Holy Life Detected",
    virtue_ledger: "Auto Virtue Log", presence: "Divine Sync",
    work_impact: "SHI Distribution", share: "Share Wealth",
    insight: "Truth Insights", rewards: "Joy Rewards",
    nature_guide: "Nature Guide", sleep: "Life Reboot",
    inconvenience: "Art of Inconvenience", dreams: "Dream Resonance",
    slogan: "Smiles over Sales. Virtue over Profit."
  }
};

const App = () => {
  const [lang, setLang] = useState('jp');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(1000000000); 
  const [mapFlowers, setMapFlowers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [presenceLevel, setPresenceLevel] = useState(99.9);
  const [detectedEntity, setDetectedEntity] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [dreamText, setDreamText] = useState("");
  
  const [corpStats, setCorpStats] = useState({
    name: "八百万クリエイティブ株式会社",
    totalVirtue: 1000000000,
    employeeCount: 500,
    individualShare: 2000000
  });

  const t = translations[lang] || translations.jp;

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else { await signInAnonymously(auth); }
      } catch (err) { console.error("Auth failed", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        initializeGenesisUser(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const mapRef = collection(db, 'artifacts', appId, 'public', 'data', 'happiness_map');
    const unsubscribeMap = onSnapshot(mapRef, (snapshot) => {
      setMapFlowers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'status');
    const unsubscribeUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) setBalance(snap.data().hohoBalance || 1000000000);
    });
    return () => { unsubscribeMap(); unsubscribeUser(); };
  }, [user]);

  const initializeGenesisUser = async (uid) => {
    const userDocRef = doc(db, 'artifacts', appId, 'users', uid, 'profile', 'status');
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(userDocRef, {
        hohoBalance: 1000000000,
        isFounder: true,
        rank: 'Universal Giver',
        myNumberVerified: true,
        joinedAt: Date.now()
      });
      addLog("HOHO OS 起動: あなたは世界で最もHohoを持つ『分け与える存在』です。", "success");
    }
  };

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), msg: String(msg), type, time: new Date().toLocaleTimeString().slice(0, 5) }, ...prev].slice(0, 15));
  };

  const handleAction = async (label, amount, subType = "auto") => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'status');
      await updateDoc(userDocRef, { hohoBalance: increment(amount) });
      const mapDoc = doc(collection(db, 'artifacts', appId, 'public', 'data', 'happiness_map'));
      const colorMap = { empathy: '#f43f5e', nature: '#10b981', proximity: '#3b82f6', default: '#f59e0b' };
      await setDoc(mapDoc, {
        type: label, lat: (Math.random() - 0.5) * 160, lng: (Math.random() - 0.5) * 160,
        timestamp: serverTimestamp(), sender: user.uid, subType, amount, color: colorMap[subType] || colorMap.default
      });
      addLog(`${label}: ${amount > 0 ? '+' : ''}${amount} HOHO`, subType === "empathy" ? "warning" : "success");
      setDetectedEntity({ label, subType });
      setTimeout(() => setDetectedEntity(null), 4000);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.05) handleAction("神社参拝・神性との同調 (GPS)", 500, "gps");
      else if (rand < 0.09) handleAction("赤ちゃん億万長者からのHOHO受領", 1500, "proximity");
      else if (rand < 0.12) handleAction("お墓参り・先祖への徳行", 1000, "virtue");
      else if (rand < 0.15) handleAction("病気の子供を持つ親への励まし", -500, "empathy");
      else if (rand < 0.18) handleAction("雑草の花を愛でるプレゼンス", 200, "nature");
      else if (rand < 0.20) handleAction("幸福イベントへの共鳴", 1200, "event");
      else if (rand < 0.22) handleAction("あえて不便を選んだ美徳ボーナス", 800, "inconvenience");
      else if (rand < 0.24) {
        const share = Math.floor(corpStats.individualShare / 100);
        handleAction(`マイナンバー企業分配 (${corpStats.name})`, share, "work");
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [user, corpStats]);

  const Dashboard = () => (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32">
      <section className="relative flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="bg-amber-400/10 border border-amber-500/30 px-8 py-3 rounded-full flex items-center gap-4 backdrop-blur-3xl shadow-2xl">
              <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-500 animate-pulse">{t.billionaire}</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.my_number}</span>
            </div>
            <p className="text-slate-500 text-lg font-medium italic opacity-80">"{t.slogan}"</p>
          </div>
          <div className="relative group flex items-center justify-center">
            <div className="w-96 h-96 md:w-[650px] md:h-[650px] rounded-full border-2 border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col items-center justify-center transition-all duration-1000 hover:scale-105 relative z-10 overflow-hidden shadow-[0_0_150px_rgba(245,158,11,0.15)]">
              <Smile className="text-amber-400 w-32 h-32 mb-8 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]" />
              <div className="text-9xl md:text-[12rem] font-black font-mono tracking-tighter text-white">
                {Number(balance).toLocaleString()}
              </div>
              <p className="text-slate-600 font-black tracking-[0.8em] text-sm mt-8 uppercase opacity-60">Infinite Giver Node</p>
            </div>
            <div className="absolute -top-16 -right-24 w-56 h-56 rounded-full bg-blue-500/20 border border-blue-500/30 flex flex-col items-center justify-center animate-bounce duration-[5s] shadow-[0_0_40px_rgba(59,130,246,0.2)]">
               <Baby className="text-blue-400 w-12 h-12 mb-2"/>
               <span className="text-[10px] font-black text-blue-300 tracking-widest uppercase">Baby Billionaire</span>
            </div>
            <div className="absolute bottom-10 -left-32 w-48 h-48 rounded-full bg-rose-500/20 border border-rose-500/30 flex flex-col items-center justify-center animate-pulse duration-[3s]">
               <Heart className="text-rose-400 w-10 h-10 mb-2"/>
               <span className="text-[10px] font-black text-rose-300 tracking-widest uppercase">Family Spirit</span>
            </div>
          </div>
          <div className="mt-20 max-w-xl mx-auto space-y-4">
             <div className="flex bg-white/5 p-2 rounded-3xl border border-white/10">
                <input value={dreamText} onChange={(e) => setDreamText(e.target.value)} placeholder="あなたの夢を世界へ響かせる..." className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-white font-bold" />
                <button onClick={() => { if(dreamText){ handleAction(`夢の共鳴: ${dreamText}`, 5000, "dream"); setDreamText(""); } }} className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-amber-400 transition-all active:scale-95">共鳴</button>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <section className="bg-gradient-to-br from-indigo-900/30 to-black border border-white/5 rounded-[5rem] p-12 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10"><div className="p-6 bg-indigo-500/20 rounded-[2rem] border border-indigo-500/30"><Moon className="text-indigo-400" size={32}/></div></div>
            <h3 className="text-3xl font-black tracking-tighter mb-4">{t.sleep}</h3>
            <div className="text-6xl font-black font-mono text-indigo-300">92%</div>
            <p className="text-sm text-slate-500 font-medium mt-4">睡眠スコアに基づき生命力が朝回復します。</p>
         </section>
         <section className="bg-white/[0.02] border border-white/5 rounded-[5rem] p-12 group hover:bg-white/[0.04]">
            <div className="flex justify-between items-start mb-10"><div className="p-6 bg-amber-500/10 rounded-[2rem] border border-amber-500/20"><Coffee className="text-amber-400" size={32}/></div></div>
            <h3 className="text-3xl font-black tracking-tighter mb-4">{t.inconvenience}</h3>
            <p className="text-sm text-slate-400 font-medium">効率より「手間」を愛でる心にボーナスを。</p>
         </section>
         <section className="bg-white/[0.02] border border-white/5 rounded-[5rem] p-12">
            <div className="flex justify-between items-start mb-10"><div className="p-6 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20"><TreePine className="text-emerald-400" size={32}/></div></div>
            <h3 className="text-3xl font-black tracking-tighter mb-4">{t.nature_guide}</h3>
            <p className="text-sm text-slate-400 font-medium">聖地や滝へと導き、心を洗う時間を提供。</p>
         </section>
      </div>

      <section className="bg-[#0f1116] border border-white/10 rounded-[6rem] p-16 overflow-hidden text-center">
        <h3 className="text-5xl font-black tracking-tighter mb-10 text-emerald-400">{t.work_impact}</h3>
        <div className="text-8xl font-black font-mono text-white">+{corpStats.individualShare.toLocaleString()} HOHO</div>
        <p className="text-xl text-slate-400 mt-6 italic">「社会への貢献 ÷ 仲間数」プロトコルにより平等分配</p>
      </section>

      <section className="bg-gradient-to-br from-[#0c0d12] to-black border border-white/10 rounded-[6rem] p-16 relative">
        <h3 className="text-6xl font-black tracking-tighter italic mb-20 text-amber-500">{t.insight}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="p-12 bg-white/[0.02] rounded-[4.5rem] border border-white/5"><h4 className="text-3xl font-black mb-8 text-amber-300">真実の経済学</h4><p className="text-lg text-slate-400 leading-relaxed font-medium">既存のお金は「奪い合い」を、HOHOは「与え合い」を加速させます。権力者も支配のストレスから解放され、微笑みのGiverへと転換します。</p></div>
          <div className="space-y-10"><h4 className="text-2xl font-black text-slate-500">{t.rewards}</h4><div className="grid gap-6">{[{ label: "不便体験リトリート", cost: "50,000" }, { label: "Genesis称号", cost: "1,000,000" }].map(r => (<div key={r.label} className="p-8 bg-black/60 rounded-[3rem] border border-white/10 flex justify-between items-center"><span className="text-xl font-black">{r.label}</span><span className="text-amber-500 font-mono font-black">{r.cost} HOHO</span></div>))}</div></div>
        </div>
      </section>
    </div>
  );

  const MapView = () => (
    <div className="h-[950px] bg-[#050608] border border-white/10 rounded-[6rem] relative overflow-hidden animate-in zoom-in-95 duration-1000 shadow-4xl">
      <div className="absolute inset-0 opacity-10"><div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px)', backgroundSize: '100px 100px' }}></div></div>
      {mapFlowers.map(f => (
        <div key={f.id} className="absolute flex flex-col items-center animate-bounce" style={{ left: `${50 + (f.lat / mapZoom)}%`, top: `${50 + (f.lng / mapZoom)}%` }}>
          <div className="rounded-full border backdrop-blur-md transition-all group-hover:scale-150" style={{ width: `${40 + (f.amount || 200) / 30}px`, height: `${40 + (f.amount || 200) / 30}px`, backgroundColor: `${f.color}33`, borderColor: `${f.color}88`, boxShadow: `0 0 40px ${f.color}22` }}><Sparkle size={18} style={{ color: f.color }} className="mx-auto" /></div>
        </div>
      ))}
      <div className="absolute bottom-16 right-16 flex flex-col gap-8"><button onClick={() => setMapZoom(prev => Math.max(1, prev - 1))} className="w-24 h-24 bg-white text-black rounded-full text-5xl font-black shadow-4xl">+</button><button onClick={() => setMapZoom(prev => prev + 1)} className="w-24 h-24 bg-white/10 backdrop-blur-3xl text-white rounded-full text-5xl font-black shadow-4xl border border-white/20">-</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#010203] text-slate-100 font-sans p-10 overflow-x-hidden">
      <header className="max-w-[1800px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-24 mb-60 pt-10">
        <div className="flex items-center gap-20"><div className="w-32 h-32 bg-gradient-to-tr from-amber-500 via-rose-600 to-violet-600 rounded-[3.5rem] flex items-center justify-center shadow-4xl"><Smile className="w-20 h-20 text-white stroke-[4]" /></div><div className="space-y-4"><h1 className="text-9xl font-black tracking-tighter leading-none text-white">HOHO OS</h1><p className="text-slate-500 uppercase tracking-[0.6em] text-lg">Singularity v8.0</p></div></div>
        <div className="flex p-3 bg-[#0f1116] rounded-[4rem] border border-white/10 shadow-5xl">
          {[{ id: 'dashboard', icon: <Zap size={32}/>, label: t.wealth }, { id: 'map', icon: <Globe size={32}/>, label: t.map }, { id: 'dev', icon: <Code size={32}/>, label: t.system }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-10 px-16 py-8 rounded-[3rem] text-2xl font-black transition-all uppercase tracking-[0.4em] ${activeTab === tab.id ? 'bg-white text-black shadow-4xl' : 'text-slate-600 hover:text-white'}`}>{tab.icon} {tab.label}</button>
          ))}
        </div>
      </header>
      <main className="max-w-[1800px] mx-auto grid grid-cols-12 gap-32">
        <div className="col-span-12 xl:col-span-9">{activeTab === 'dashboard' && <Dashboard />}{activeTab === 'map' && <MapView />}{activeTab === 'dev' && <DevHub />}</div>
        <div className="col-span-12 xl:col-span-3 space-y-24">
          <section className="bg-[#0f1116] border border-white/10 rounded-[7rem] p-20 text-center relative overflow-hidden"><h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.6em] mb-20 flex justify-center gap-8"><Activity className="w-10 h-10 text-cyan-400" /> {t.presence}</h3><div className="flex flex-col items-center"><div className="relative w-80 h-80 flex items-center justify-center"><svg className="w-full h-full transform -rotate-90"><circle cx="160" cy="160" r="150" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-950" /><circle cx="160" cy="160" r="150" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={942} strokeDashoffset={942 - (942 * presenceLevel) / 100} className="text-cyan-400 transition-all duration-1000" strokeLinecap="round" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-8xl font-black font-mono text-white">{presenceLevel}%</span></div></div></div></section>
          <section className="bg-[#0f1116] border border-white/10 rounded-[7rem] p-20 flex flex-col h-[1100px] shadow-4xl overflow-hidden relative"><h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.6em] mb-20">{t.virtue_ledger}</h3><div className="flex-grow overflow-y-auto space-y-20 pr-10 scrollbar-hide">{logs.map(log => (<div key={log.id} className="text-[16px] animate-in fade-in slide-in-from-right-16 duration-1000"><div className="flex justify-between mb-8"><span className="text-slate-700 font-mono text-sm">{log.time}</span><span className={`px-6 py-2 rounded-full font-black text-[11px] uppercase ${log.type === 'success' ? 'text-emerald-400 bg-emerald-400/10' : 'text-cyan-400 bg-cyan-400/10'}`}>{log.type}</span></div><p className="text-slate-300 leading-relaxed font-black border-l-[10px] border-white/10 pl-12 py-4 text-3xl tracking-tight">{log.msg}</p></div>))}</div></section>
        </div>
      </main>
      <footer className="max-w-[1800px] mx-auto mt-[500px] p-60 border-t border-white/5 text-center relative overflow-hidden"><div className="relative z-10 space-y-40"><div className="inline-block p-24 bg-white/5 rounded-full border border-white/10 hover:scale-110 shadow-5xl"><Smile className="w-48 h-48 text-amber-500 mx-auto" /></div><h2 className="text-[18rem] font-black tracking-tighter leading-none select-none text-white">HOHO IS LIFE.</h2></div></footer>
    </div>
  );
};

const DevHub = () => (
  <div className="space-y-16 animate-in slide-in-from-bottom-20 duration-1000 pb-20">
    <section className="bg-slate-900/40 border border-white/10 rounded-[6rem] p-20 relative overflow-hidden text-center"><div className="flex flex-col items-center gap-16 mb-24 relative z-10"><div className="p-12 bg-white text-black rounded-[4rem] shadow-4xl"><Github size={100} /></div><h2 className="text-7xl font-black tracking-tighter text-white">Collaboration Hub</h2><p className="text-2xl text-slate-400 italic">"OSの進化に貢献する同志へ、感謝のHOHOを還元します。"</p></div></section>
    <section className="bg-gradient-to-tr from-[#1a1c2e] to-black border border-white/10 rounded-[6rem] p-24 text-center"><h3 className="text-5xl font-black mb-24 flex items-center justify-center gap-8 text-white"><AppWindow className="text-violet-500" size={64} /> Store Icons</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-24">
         {[{ label: "Genesis Circle", bg: "bg-gradient-to-br from-amber-400 to-rose-500" }, { label: "Soul Pulse", bg: "bg-white" }, { label: "Divine ID", bg: "bg-black border border-white/20" }].map(item => (
           <div key={item.label} className="space-y-10"><div className={`w-[450px] h-[450px] mx-auto ${item.bg} rounded-[24%] flex items-center justify-center shadow-[0_60px_120px_rgba(0,0,0,0.6)]`}><Smile className={`w-56 h-56 ${item.label === 'Soul Pulse' ? 'text-black' : 'text-white'}`}/></div><span className="text-xl font-black text-slate-500 tracking-[0.6em] uppercase block">{item.label}</span></div>
         ))}
      </div>
    </section>
  </div>
);

export default App;
