import { useState, useEffect, useRef, useCallback } from "react";


/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const G = "linear-gradient(135deg,#1a3a8f 0%,#2d5be3 40%,#a0197e 75%,#c0186e 100%)";
const GS = "linear-gradient(135deg,rgba(26,58,143,0.07) 0%,rgba(192,24,110,0.07) 100%)";
const BLUE="#1a3a8f", MAG="#c0186e", DARK="#0f1827", GRAY="#5a6577", BORDER="#e4e8f0", BG="#f6f8fc";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:${BG};color:${DARK};}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes progress{from{width:0%}to{width:100%}}
.fu{animation:fadeUp .38s ease both}
.fu1{animation:fadeUp .38s .07s ease both}
.fu2{animation:fadeUp .38s .14s ease both}
.si{animation:slideIn .3s ease both}
.spin{width:32px;height:32px;border:3px solid ${BORDER};border-top-color:${BLUE};border-radius:50%;animation:spin .9s linear infinite}
.card{background:#fff;border:1.5px solid ${BORDER};border-radius:16px;transition:box-shadow .2s,transform .2s}
.card-h:hover{box-shadow:0 10px 34px rgba(26,58,143,.1);transform:translateY(-3px)}
.inp{width:100%;padding:10px 13px;border:1.5px solid ${BORDER};border-radius:9px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;background:#fff;transition:border-color .18s;color:${DARK}}
.inp:focus{border-color:${BLUE}}
textarea.inp{resize:vertical;line-height:1.7}
select.inp{cursor:pointer}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .18s,transform .14s}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
.btn-p{background:${G};color:#fff;box-shadow:0 4px 14px rgba(45,91,227,.22)}
.btn-o{background:transparent;color:${BLUE};border:2px solid ${BLUE}}
.btn-o:hover{background:${BLUE};color:#fff}
.btn-ghost{background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.12)}
.btn-ghost:hover{background:rgba(255,255,255,.16);color:#fff}
.btn-danger{background:#dc2626;color:#fff}
.btn-sm{padding:6px 13px;font-size:12px;border-radius:8px}
.tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
.sidebar-btn{width:100%;display:flex;align-items:center;gap:10px;padding:10px 16px;background:transparent;border:none;border-left:3px solid transparent;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;transition:background .18s}
.sidebar-btn.active{background:rgba(45,91,227,.16);border-left-color:#2d5be3}
.sidebar-btn:hover{background:rgba(255,255,255,.05)}
.option-btn{width:100%;text-align:left;padding:13px 16px;border:2px solid ${BORDER};border-radius:11px;background:#fff;font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .18s;color:${DARK};display:flex;align-items:center;gap:10px}
.option-btn:hover:not(:disabled){border-color:${BLUE};background:rgba(26,58,143,0.04)}
.option-btn.correct{border-color:#059669;background:rgba(5,150,105,0.08);color:#065f46}
.option-btn.wrong{border-color:#dc2626;background:rgba(220,38,38,0.07);color:#b91c1c}
.option-btn.selected{border-color:${BLUE};background:rgba(26,58,143,0.06)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${BORDER};border-radius:10px}

/* ── RESPONSIVE ── */
@media(max-width:768px){
  /* Sidebar mobile — bottom nav bar */
  .sidebar-desktop{display:none!important}
  .bottom-nav{display:flex!important}
  .main-content{padding-bottom:70px!important}

  /* Dashboard grid — 1 col */
  .dash-grid{grid-template-columns:1fr!important}
  .dash-grid-4{grid-template-columns:1fr 1fr!important}

  /* Landing hero — stack */
  .hero-grid{grid-template-columns:1fr!important;gap:28px!important;padding:32px 16px 48px!important}
  .hero-sim{display:none!important}
  .hero-h1{font-size:32px!important}
  .hero-stats{gap:14px!important}

  /* Landing sections */
  .landing-section{padding:40px 16px!important}
  .modules-grid{grid-template-columns:1fr!important}
  .avantages-grid{grid-template-columns:1fr 1fr!important}
  .packs-grid{grid-template-columns:1fr!important}
  .testimonials-grid{grid-template-columns:1fr!important}
  .coming-grid{grid-template-columns:1fr!important}
  .cta-final{padding:28px 20px!important}
  .cta-final h2{font-size:22px!important}

  /* Nav landing */
  .nav-links{display:none!important}
  .nav-landing{padding:0 16px!important}

  /* Exam engine mobile */
  .exam-layout{flex-direction:column!important;height:auto!important}
  .exam-sidebar{width:100%!important;flex-direction:row!important;flex-wrap:wrap!important;border-left:none!important;border-top:1px solid rgba(255,255,255,0.08)!important;position:sticky!important;top:58px!important;z-index:10!important}
  .exam-timer-block{padding:10px 14px!important;border-bottom:none!important;border-right:1px solid rgba(255,255,255,0.08)!important;min-width:120px!important}
  .exam-timer-big{font-size:26px!important}
  .exam-progress-block{padding:10px 14px!important;border-bottom:none!important;border-right:1px solid rgba(255,255,255,0.08)!important;flex:1!important}
  .exam-nav-block{display:none!important}
  .exam-actions{flex-direction:row!important;padding:10px 14px!important;border-top:none!important;gap:8px!important;flex:1!important}
  .exam-header-sidebar{display:none!important}
  .exam-content{padding:16px!important}
  .exam-img{max-height:220px!important}

  /* Auth pages */
  .auth-card{width:100%!important;margin:0!important;border-radius:0!important;min-height:100vh!important;padding:28px 20px!important}

  /* Admin */
  .admin-layout{flex-direction:column!important}
  .admin-sidebar{width:100%!important;height:auto!important;position:relative!important;flex-direction:row!important;overflow-x:auto!important}
  .admin-nav{flex-direction:row!important;padding:6px!important;gap:4px!important}
  .admin-sidebar-bottom{display:none!important}
  .admin-content{padding:16px!important}
  .admin-kpi-grid{grid-template-columns:1fr 1fr!important}

  /* Packs admin */
  .packs-admin-grid{grid-template-columns:1fr!important}
}

@media(max-width:480px){
  .avantages-grid{grid-template-columns:1fr!important}
  .dash-grid-4{grid-template-columns:1fr 1fr!important}
  .hero-h1{font-size:26px!important}
  .hero-stats{display:none!important}
}

/* Bottom nav — hidden by default, shown on mobile */
.bottom-nav{
  display:none;
  position:fixed;bottom:0;left:0;right:0;
  background:${DARK};border-top:1px solid rgba(255,255,255,0.08);
  z-index:200;height:62px;
  align-items:stretch;
}
.bottom-nav-btn{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:3px;background:transparent;border:none;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;
  color:rgba(255,255,255,0.4);letter-spacing:.3px;text-transform:uppercase;
  border-top:2px solid transparent;transition:all .15s;
}
.bottom-nav-btn.active{color:#fff;border-top-color:#2d5be3;background:rgba(45,91,227,0.1)}
.bottom-nav-btn span:first-child{font-size:18px}
`;


/* ═══════════════════════════════════════════════════════════════
   SCORE / LEVEL SYSTEM
═══════════════════════════════════════════════════════════════ */
const TRANCHES = [
  {min:1,  max:4,  level:"A1", pts:3,  color:"#6b7280", bg:"rgba(107,114,128,0.1)"},
  {min:5,  max:10, level:"A2", pts:9,  color:"#d97706", bg:"rgba(217,119,6,0.1)"},
  {min:11, max:19, level:"B1", pts:15, color:"#f59e0b", bg:"rgba(245,158,11,0.1)"},
  {min:20, max:29, level:"B2", pts:21, color:"#3b82f6", bg:"rgba(59,130,246,0.1)"},
  {min:30, max:35, level:"C1", pts:26, color:"#1a3a8f", bg:"rgba(26,58,143,0.1)"},
  {min:36, max:39, level:"C2", pts:33, color:"#7c3aed", bg:"rgba(124,58,237,0.1)"},
];
const calcScore = (answers, questions) => {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] !== undefined && answers[i] === q.correct) correct++;
  });
  const tranche = TRANCHES.slice().reverse().find(t => correct >= t.min) || TRANCHES[0];
  const totalPts = questions.reduce((acc, q, i) => {
    if (answers[i] !== undefined && answers[i] === q.correct) {
      const t = TRANCHES.slice().reverse().find(t => (i+1) >= t.min) || TRANCHES[0];
      return acc + t.pts;
    }
    return acc;
  }, 0);
  return { correct, total: questions.length, level: tranche.level, levelColor: tranche.color, levelBg: tranche.bg, score: Math.min(totalPts, 699) };
};

/* ═══════════════════════════════════════════════════════════════
   PERSISTENCE — localStorage
═══════════════════════════════════════════════════════════════ */
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ═══════════════════════════════════════════════════════════════
   API — Backend
═══════════════════════════════════════════════════════════════ */
const API = "https://pc-backend-rr9v.onrender.com";
const authH = () => ({
  "Content-Type":"application/json",
  ...(localStorage.getItem("pc_token")?{Authorization:`Bearer ${localStorage.getItem("pc_token")}`}:{})
});
const apiGet  = (path) => fetch(`${API}${path}`,{headers:authH()}).then(r=>r.json()).catch(()=>null);
const apiPost = (path,body) => fetch(`${API}${path}`,{method:"POST",headers:authH(),body:JSON.stringify(body)}).then(r=>r.json()).catch(()=>null);
const apiPut  = (path,body) => fetch(`${API}${path}`,{method:"PUT",headers:authH(),body:JSON.stringify(body)}).then(r=>r.json()).catch(()=>null);
const apiDel  = (path) => fetch(`${API}${path}`,{method:"DELETE",headers:authH()}).then(r=>r.json()).catch(()=>null);

const ADMIN_CREDS = { email:"admin@launchpad.ca", password:"Admin2026!" };

const INIT_USERS = [];

const PAYS_LIST = [
  {code:"CA",flag:"🇨🇦",name:"Canada"},{code:"DZ",flag:"🇩🇿",name:"Algérie"},
  {code:"MA",flag:"🇲🇦",name:"Maroc"},{code:"TN",flag:"🇹🇳",name:"Tunisie"},
  {code:"FR",flag:"🇫🇷",name:"France"},{code:"SN",flag:"🇸🇳",name:"Sénégal"},
  {code:"BE",flag:"🇧🇪",name:"Belgique"},{code:"LB",flag:"🇱🇧",name:"Liban"},
];
const getPays = c => PAYS_LIST.find(p=>p.code===c)||{flag:"🌐",name:c};

// Sample series data
const SAMPLE_CE = [
  {
    id:"ce-001", type:"CE", title:"Série 1 — Lieux et commerces", premium:false,
    questions: [
      {id:1,image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Boulangerie_Julien_Paris_2011.jpg/320px-Boulangerie_Julien_Paris_2011.jpg",
       text:"Où se trouve cette personne ?",options:["Dans une pharmacie","Dans une boulangerie","Dans une épicerie","Dans une librairie"],correct:1},
      {id:2,image:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Bibliotheque_de_l%27Assemblee_Nationale_%28Lunon%29.jpg/320px-Bibliotheque_de_l%27Assemblee_Nationale_%28Lunon%29.jpg",
       text:"Quel type de lieu est représenté ?",options:["Un musée","Un restaurant","Une bibliothèque","Un cinéma"],correct:2},
      {id:3,image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
       text:"Que fait la personne sur l'image ?",options:["Elle lit un livre","Elle mange","Elle travaille","Elle court"],correct:0},
      ...Array.from({length:36},(_,i)=>({id:i+4,image:null,text:`Question ${i+4} : Lisez le texte et choisissez la bonne réponse.`,options:["Option A","Option B","Option C","Option D"],correct:Math.floor(Math.random()*4)}))
    ]
  }
];
const SAMPLE_CO = [
  {
    id:"co-001", type:"CO", title:"Série 1 — Vie quotidienne", premium:false,
    audioUrl:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    questions: [
      {id:1,image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Boulangerie_Julien_Paris_2011.jpg/320px-Boulangerie_Julien_Paris_2011.jpg",
       text:"Écoutez les 4 propositions. Quelle proposition correspond à l'image ?",isImageChoice:true,
       options:["Une femme achète du pain","Un homme prend un café","Des enfants jouent dans un parc","Une famille fait les courses"],correct:0},
      {id:2,image:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Bibliotheque_de_l%27Assemblee_Nationale_%28Lunon%29.jpg/320px-Bibliotheque_de_l%27Assemblee_Nationale_%28Lunon%29.jpg",
       text:"Écoutez les 4 propositions. Quelle proposition correspond à l'image ?",isImageChoice:true,
       options:["Un enfant lit","Un homme travaille","Une femme emprunte un livre","Des amis discutent"],correct:2},
      {id:3,image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
       text:"Écoutez les 4 propositions. Quelle proposition correspond à l'image ?",isImageChoice:true,
       options:["Un chat dort","Un chien court","Un oiseau vole","Un poisson nage"],correct:1},
      ...Array.from({length:36},(_,i)=>({id:i+4,image:null,text:`Question ${i+4} : Écoutez le document sonore et choisissez la bonne réponse.`,isImageChoice:false,options:["Option A","Option B","Option C","Option D"],correct:Math.floor(Math.random()*4)}))
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════════════════════ */
const Grad = ({children,sz}) => (
  <span style={{background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:sz||"inherit"}}>{children}</span>
);
const Spinner = ({sm}) => <div className="spin" style={sm?{width:18,height:18,borderWidth:2}:{}}/>;

const Modal = ({open,onClose,title,children,width=500}) => {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,16,30,.7)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="si" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width,maxWidth:"98%",maxHeight:"92vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 22px",borderBottom:`1px solid ${BORDER}`,position:"sticky",top:0,background:"#fff",zIndex:1,borderRadius:"18px 18px 0 0",flexShrink:0}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:900,color:DARK}}>{title}</h3>
          <button onClick={onClose} style={{background:BG,border:"none",width:27,height:27,borderRadius:"50%",cursor:"pointer",fontSize:13,color:GRAY}}>✕</button>
        </div>
        <div style={{padding:22,overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
};

const Toast = ({msg,type}) => (
  <div className="fu" style={{position:"fixed",bottom:24,right:24,zIndex:2000,background:type==="error"?"#dc2626":type==="info"?"#1a3a8f":"#059669",color:"#fff",borderRadius:11,padding:"11px 18px",fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.25)",maxWidth:320}}>
    {type==="error"?"❌":type==="info"?"ℹ️":"✅"} {msg}
  </div>
);

const useToast = () => {
  const [toast,setToast] = useState(null);
  const show = useCallback((msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3200); },[]);
  return [toast,show];
};

/* ═══════════════════════════════════════════════════════════════
   FILE UPLOAD HELPERS
═══════════════════════════════════════════════════════════════ */
const toBase64 = file => new Promise((res,rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

const ImageUpload = ({value,onChange,label="Image"}) => {
  const ref = useRef();
  const [preview,setPreview] = useState(value||"");
  const handleFile = async e => {
    const f = e.target.files[0];
    if(!f) return;
    const b64 = await toBase64(f);
    setPreview(b64);
    onChange(b64);
  };
  const handleUrl = e => { setPreview(e.target.value); onChange(e.target.value); };
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",marginBottom:6}}>
        <input className="inp" value={typeof value==="string"&&!value.startsWith("data:")?value:""} onChange={handleUrl} placeholder="https://... (URL externe)" style={{fontSize:12}}/>
        <button type="button" className="btn btn-o btn-sm" onClick={()=>ref.current.click()}>📁 Upload</button>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
      {preview && <img src={preview} alt="" style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:8,border:`1px solid ${BORDER}`}} onError={()=>setPreview("")}/>}
    </div>
  );
};

const AudioUpload = ({value,onChange,label="Audio MP3"}) => {
  const ref = useRef();
  const handleFile = async e => {
    const f = e.target.files[0];
    if(!f) return;
    const b64 = await toBase64(f);
    onChange(b64);
  };
  const handleUrl = e => onChange(e.target.value);
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",marginBottom:6}}>
        <input className="inp" value={typeof value==="string"&&!value.startsWith("data:")?value:""} onChange={handleUrl} placeholder="https://... (URL audio)" style={{fontSize:12}}/>
        <button type="button" className="btn btn-o btn-sm" onClick={()=>ref.current.click()}>📁 MP3</button>
      </div>
      <input ref={ref} type="file" accept="audio/mp3,audio/*" style={{display:"none"}} onChange={handleFile}/>
      {value && <audio controls src={value} style={{width:"100%",marginTop:4,borderRadius:8}}/>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — Version attractive
═══════════════════════════════════════════════════════════════ */
const LANDING_CSS = `
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}
.float{animation:float 4s ease-in-out infinite}
.float2{animation:float 4s 1.3s ease-in-out infinite}
.float3{animation:float 4s 2.6s ease-in-out infinite}
.hero-grad{background:linear-gradient(135deg,#060d1f 0%,#0f1e3d 40%,#1a0d2e 100%)}
.nav-blur{backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.level-pill{display:inline-flex;align-items:center;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:.3px;border:1px solid}
.pricing-card{position:relative;overflow:hidden;transition:transform .22s,box-shadow .22s}
.pricing-card:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(26,58,143,0.18)}
.testimonial{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:22px;transition:border-color .2s}
.testimonial:hover{border-color:rgba(255,255,255,0.18)}
`;


// ═══════════════════════════════════════════════════════════════
// CV QUOTAS PAR RANG
// ═══════════════════════════════════════════════════════════════
const CV_QUOTAS = { free:0, bronze:3, silver:10, gold:30, premium:30 };

// Formater secondes → "Xh Ym" ou "Y min" ou "< 1 min"
const formatTime = (sec) => {
  if (!sec || sec < 60) return sec > 0 ? "< 1 min" : "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m > 0 ? m+"m" : ""}`.trim();
  return `${m} min`;
};
const RANK_LABELS = {
  free:   {label:"Free",   color:"#6b7280", bg:"rgba(107,114,128,0.1)"},
  bronze: {label:"Bronze", color:"#cd7f32", bg:"rgba(205,127,50,0.12)"},
  silver: {label:"Silver", color:"#607080", bg:"rgba(140,155,171,0.15)"},
  gold:   {label:"Gold",   color:"#c8a227", bg:"rgba(200,162,39,0.12)"},
  premium:{label:"Premium",color:"#2d5be3", bg:"rgba(45,91,227,0.1)"},
};

// ═══════════════════════════════════════════════════════════════
// INITIAL PACKS & SITE CONFIG (stored in localStorage via admin)
// ═══════════════════════════════════════════════════════════════
const INIT_PACKS = [
  {
    id:"bronze", name:"Bronze", price:"14.99", currency:"$", acces:"7 Jours",
    color:"#cd7f32", colorDark:"#a0522d", ribbon:"Passeport Bronze", ribbonColor:"#cd7f32",
    features:[
      "40 tests CE", "40 tests CO", "Expression Orale", "Expression Écrite", "Version 2026",
    ],
    bonus:"3 générations de CV incluses",
    highlight:false,
  },
  {
    id:"silver", name:"Silver", price:"24.99", currency:"$", acces:"15 Jours",
    color:"#8c9bab", colorDark:"#607080", ribbon:"Passeport Silver", ribbonColor:"#607080",
    features:[
      "40 tests CE", "40 tests CO", "Expression Orale", "Expression Écrite", "Version 2026",
    ],
    bonus:"10 générations de CV incluses",
    highlight:true,
  },
  {
    id:"gold", name:"Gold", price:"39.99", currency:"$", acces:"30 Jours",
    color:"#c8a227", colorDark:"#9a7b0a", ribbon:"Passeport Gold", ribbonColor:"#c8a227",
    features:[
      "40 tests CE", "40 tests CO", "Expression Orale", "Expression Écrite", "Version 2026",
    ],
    bonus:"30 générations de CV incluses",
    highlight:false,
  },
];

const INIT_AVANTAGES = [
  {icon:"📈", title:"Suivi de Progression", desc:"Suivez vos performances en temps réel et identifiez vos points à améliorer."},
  {icon:"🤖", title:"Simulateur IA", desc:"Notre simulateur d'expression écrite corrige vos textes avec l'intelligence artificielle."},
  {icon:"📅", title:"Version 2026", desc:"Contenus conformes aux dernières mises à jour de l'examen TCF Canada."},
  {icon:"👥", title:"Accompagnement Personnalisé", desc:"Des formateurs expérimentés vous guident vers la réussite."},
  {icon:"🏆", title:"Conditions Réelles", desc:"Entraînez-vous dans les mêmes conditions que l'examen officiel."},
  {icon:"🕐", title:"Accès 24/7", desc:"Révisez à votre rythme, où que vous soyez, quand vous le souhaitez."},
];

const INIT_TESTIMONIALS = [
  {name:"Karim B.", pays:"🇩🇿", level:"B2→C1", text:"J'ai gagné un niveau complet en 3 semaines grâce aux séries de CE. Le scoring est identique à l'examen officiel."},
  {name:"Fatima Z.", pays:"🇲🇦", level:"B1→B2", text:"Les exercices de CO avec audio m'ont vraiment préparée. J'ai obtenu 520/699 à mon TCF Canada !"},
  {name:"Sami T.",  pays:"🇹🇳", level:"A2→B1", text:"Interface claire, corrections détaillées. Je refaisais les séries jusqu'à maîtriser chaque type de question."},
];

const INIT_SITE_CONFIG = {
  siteName: "Passeport Carrière",
  tagline: "Votre carrière commence par ici.",
  heroBadge: "🍁 Préparation officielle TCF Canada 2026",
  heroTitle1: "Obtenez le score",
  heroTitle2: "qu'il vous faut au",
  heroSubtitle: "80 séries d'entraînement, scoring officiel A1→C2, correction instantanée. La plateforme utilisée par des milliers de candidats francophones.",
  ctaPrimary: "Commencer gratuitement →",
  ctaSecondary: "J'ai déjà un compte",
  // Stats hero
  stat1Val: "80",    stat1Label: "Séries",
  stat2Val: "3 120", stat2Label: "Questions",
  stat3Val: "699",   stat3Label: "Points max",
  stat4Val: "A1→C2", stat4Label: "Niveaux",
  // Trust badges
  trust1: "✓ 3 séries gratuites",
  trust2: "✓ Correction détaillée",
  trust3: "✓ Score officiel",
  // Sections
  avantagesTitle: "Nos Avantages",
  avantagesSubtitle: "Tout ce dont vous avez besoin pour réussir votre TCF Canada",
  packsTitle: "PACKS DE RÉVISION",
  packsSubtitle: "Préparez-vous en autonomie avec nos packs complets",
  testimonialsTitle: "Ils ont réussi leur TCF Canada",
  testimonialsSubtitle: "Des résultats réels d'apprenants Passeport Carrière",
  ctaFinalTitle: "Prêt à décrocher votre visa ?",
  ctaFinalDesc: "Rejoignez des milliers d'immigrants qui se préparent avec Passeport Carrière. Inscription gratuite.",
  // Footer
  footerCopyright: "© 2026 Passeport Carrière",
  footerRight: "TCF Canada · Immigration francophone",
  // Modules labels
  ceDesc: "40 séries · 39 questions · 60 min",
  coDesc: "40 séries · 39 questions · 35 min",
  // Services coming soon
  comingSoonTitle: "De nouveaux services arrivent",
  comingSoonSubtitle: "Votre préparation ne s'arrête pas au TCF — nous construisons votre avenir complet",
  cvTitle: "Générateur de CV",
  cvDesc: "Créez un CV professionnel adapté au marché canadien en quelques minutes, avec l'aide de l'IA.",
  hiremeTitle: "HireMe — Emploi IA",
  hiremeDesc: "Offres d'emploi scorées par IA selon votre profil. Lettre de motivation générée en 1 clic.",
};


export { G, GS, BLUE, MAG, DARK, GRAY, BORDER, BG, CSS, LANDING_CSS,
  TRANCHES, calcScore, LS, API, ADMIN_CREDS, INIT_USERS, PAYS_LIST,
  SAMPLE_CE, SAMPLE_CO, Grad, Spinner, Modal, Toast, ImageUpload, AudioUpload,
  CV_QUOTAS, RANK_LABELS, INIT_PACKS, INIT_AVANTAGES, INIT_TESTIMONIALS, INIT_SITE_CONFIG,
  apiGet, apiPost, formatTime
};