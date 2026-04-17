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
// INITIAL PACKS & SITE CONFIG (stored in localStorage via admin)
// ═══════════════════════════════════════════════════════════════
const INIT_PACKS = [
  {
    id:"bronze", name:"Bronze", price:"14.99", currency:"$", acces:"5 Jours",
    color:"#cd7f32", colorDark:"#a0522d", ribbon:"Passeport Bronze", ribbonColor:"#cd7f32",
    features:[
      "Compréhension Écrite : 40 tests d'entraînement (simulation réelle)",
      "Compréhension Orale : 40 tests d'entraînement (simulation réelle)",
      "Expression Orale : Sujets d'Actualité et Corrections",
      "Expression Écrite : Sujets d'Actualité et Corrections",
      "Version 2026 : Contenus conformes aux dernières mises à jour de l'examen",
    ],
    bonus:"Accès au simulateur d'expression écrite : 3 essais inclus",
    highlight:false,
  },
  {
    id:"silver", name:"Silver", price:"29.99", currency:"$", acces:"1 Mois",
    color:"#8c9bab", colorDark:"#607080", ribbon:"Passeport Silver", ribbonColor:"#8c9bab",
    features:[
      "Compréhension Écrite : 40 tests d'entraînement (simulation réelle)",
      "Compréhension Orale : 40 tests d'entraînement (simulation réelle)",
      "Expression Orale : Sujets d'Actualité et Corrections",
      "Expression Écrite : Sujets d'Actualité et Corrections",
      "Version 2026 : Contenus conformes aux dernières mises à jour de l'examen",
    ],
    bonus:"Accès au simulateur d'expression écrite : 8 essais inclus",
    highlight:true,
  },
  {
    id:"gold", name:"Gold", price:"49.99", currency:"$", acces:"2 Mois",
    color:"#c8a227", colorDark:"#9a7b0a", ribbon:"Passeport Gold", ribbonColor:"#c8a227",
    features:[
      "Compréhension Écrite : 40 tests d'entraînement (simulation réelle)",
      "Compréhension Orale : 40 tests d'entraînement (simulation réelle)",
      "Expression Orale : Sujets d'Actualité et Corrections",
      "Expression Écrite : Sujets d'Actualité et Corrections",
      "Version 2026 : Contenus conformes aux dernières mises à jour de l'examen",
    ],
    bonus:"Accès au simulateur d'expression écrite : 15 essais inclus",
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

function LandingPage({onLogin,onRegister,siteConfig,packs,avantages,testimonials,registerSuccess,onCloseSuccess}) {
  const [activeLevel,setActiveLevel] = useState("B2");
  const cfg = siteConfig || INIT_SITE_CONFIG;
  const packData = packs || INIT_PACKS;
  const avantagesData = avantages || INIT_AVANTAGES;
  const testimonialsData = testimonials || INIT_TESTIMONIALS;

  // ── BARÈME EXACT ──
  // Chaque tranche a ses propres points/question
  // Le score MIN du niveau = 1 bonne réponse dans cette tranche = pts de la tranche précédente cumulés + 1×pts_actuel
  // Le score MAX = toutes questions jusqu'à qMax correctes (cumul de toutes les tranches inférieures + cette tranche)
  const BAREME = [
    {l:"A1",color:"#6b7280",qMin:1, qMax:4,  pts:3},
    {l:"A2",color:"#d97706",qMin:5, qMax:10, pts:9},
    {l:"B1",color:"#f59e0b",qMin:11,qMax:19, pts:15},
    {l:"B2",color:"#3b82f6",qMin:20,qMax:29, pts:21},
    {l:"C1",color:"#1a3a8f",qMin:30,qMax:35, pts:26},
    {l:"C2",color:"#7c3aed",qMin:36,qMax:39, pts:33},
  ];

  // Score cumulé pour N bonnes réponses (les tranches se cumulent)
  const calcScore = (nCorrect) => {
    let total = 0;
    BAREME.forEach(t => {
      if(nCorrect >= t.qMin) {
        const qDansTrancheRepondues = Math.min(nCorrect, t.qMax) - t.qMin + 1;
        total += qDansTrancheRepondues * t.pts;
      }
    });
    return Math.min(total, 699);
  };

  const sel = BAREME.find(l=>l.l===activeLevel);
  // Score MIN : obtenir exactement qMin bonnes réponses (seulement cette q au seuil)
  const scoreMin = sel ? calcScore(sel.qMin) : 0;
  // Score MAX : obtenir qMax bonnes réponses (cumul toutes tranches jusqu'à qMax)
  const scoreMax = sel ? calcScore(sel.qMax) : 0;
  const barPct   = sel ? Math.round((sel.qMax/39)*100) : 0;

  const modules = [
    {icon:"📖",color:"#1a3a8f",bg:"rgba(26,58,143,0.1)",border:"rgba(26,58,143,0.25)",t:"Compréhension Écrite",d:cfg.ceDesc,chips:["Image + Question","4 choix A/B/C/D","Barème officiel"],active:true},
    {icon:"🎧",color:"#a0197e",bg:"rgba(160,25,126,0.1)",border:"rgba(160,25,126,0.25)",t:"Compréhension Orale",d:cfg.coDesc,chips:["Audio MP3","Image 3 premières Q","4 propositions"],active:true},
    {icon:"✍️",color:GRAY,bg:BG,border:BORDER,t:"Expression Écrite",d:"Production de textes guidée",chips:["Bientôt disponible"],active:false},
    {icon:"🗣️",color:GRAY,bg:BG,border:BORDER,t:"Expression Orale",d:"Simulation d'entretien",chips:["Bientôt disponible"],active:false},
  ];

  // Icon map for avantages (emoji fallback)
  const iconStyle = {width:52,height:52,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:"0 4px 14px rgba(45,91,227,0.25)"};

  return (
    <div style={{minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",background:"#060d1f"}}>
      <style>{LANDING_CSS}</style>

      {/* ── BANNIÈRE SUCCÈS INSCRIPTION ── */}
      {registerSuccess&&(
        <div style={{position:"fixed",top:58,left:0,right:0,zIndex:150,background:"#059669",padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:"#fff",fontSize:14,fontWeight:600}}>✅ Inscription réussie ! Veuillez vous connecter pour accéder à votre espace.</span>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={onLogin} style={{background:"#fff",color:"#059669",border:"none",borderRadius:8,padding:"7px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Se connecter →</button>
            <button onClick={onCloseSuccess} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.7)",fontSize:18,cursor:"pointer"}}>✕</button>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav className="nav-blur" style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:58,background:"rgba(6,13,31,0.85)",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:11,fontFamily:"'Playfair Display',serif",boxShadow:"0 4px 12px rgba(45,91,227,0.4)"}}>PC</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#fff",letterSpacing:"-.2px"}}>Passeport <Grad>Carrière</Grad></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          {["Modules","Avantages","Tarifs","Témoignages"].map(l=>(
            <span key={l} style={{fontSize:13,color:"rgba(255,255,255,0.45)",cursor:"pointer",transition:"color .18s"}} onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.45)"}>{l}</span>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-ghost" onClick={onLogin} style={{fontSize:12,padding:"8px 16px"}}>Connexion</button>
          <button className="btn btn-p" onClick={onRegister} style={{fontSize:12,padding:"8px 18px"}}>Commencer →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero-grad" style={{minHeight:"100vh",paddingTop:58,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"10%",left:"-5%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(45,91,227,0.15) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"5%",right:"-8%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(192,24,110,0.12) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>

        <div className="hero-grid" style={{maxWidth:1100,margin:"0 auto",padding:"60px 40px 80px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",position:"relative"}}>
          {/* LEFT */}
          <div>
            <div className="fu" style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(45,91,227,0.12)",border:"1px solid rgba(45,91,227,0.25)",borderRadius:100,padding:"5px 14px",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:22,letterSpacing:.5}}>
              {cfg.heroBadge}
            </div>
            <h1 className="fu1 hero-h1" style={{fontFamily:"'Playfair Display',serif",fontSize:50,fontWeight:900,color:"#fff",lineHeight:1.08,marginBottom:14}}>
              {cfg.heroTitle1}<br/>{cfg.heroTitle2}<br/><Grad sz={50}>{cfg.tagline}</Grad>
            </h1>
            <p className="fu2" style={{fontSize:15,color:"rgba(255,255,255,0.48)",lineHeight:1.85,marginBottom:32,fontWeight:300,maxWidth:460}}>
              {cfg.heroSubtitle}
            </p>
            <div className="fu2 hero-stats" style={{display:"flex",gap:22,marginBottom:36}}>
              {[[cfg.stat1Val,cfg.stat1Label],[cfg.stat2Val,cfg.stat2Label],[cfg.stat3Val,cfg.stat3Label],[cfg.stat4Val,cfg.stat4Label]].map(([n,l])=>(
                <div key={n} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#fff",lineHeight:1}}>{n}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:3,letterSpacing:.5,textTransform:"uppercase"}}>{l}</div>
                </div>
              ))}
            </div>
            <div className="fu2" style={{display:"flex",gap:10}}>
              <button className="btn btn-p" onClick={onRegister} style={{fontSize:14,padding:"13px 28px",boxShadow:"0 6px 24px rgba(45,91,227,0.4)"}}>{cfg.ctaPrimary}</button>
              <button className="btn btn-ghost" onClick={onLogin} style={{fontSize:13,padding:"13px 20px"}}>{cfg.ctaSecondary}</button>
            </div>
            <div style={{display:"flex",gap:16,marginTop:22,flexWrap:"wrap"}}>
              {[cfg.trust1,cfg.trust2,cfg.trust3].map(t=>(
                <span key={t} style={{fontSize:11,color:"rgba(255,255,255,0.35)",display:"flex",alignItems:"center",gap:4}}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — Score simulator CORRIGÉ */}
          <div className="fu1 float hero-sim" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:22,padding:28,backdropFilter:"blur(12px)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Barème officiel TCF Canada</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {BAREME.map(b=>(
                <button key={b.l} onClick={()=>setActiveLevel(b.l)} style={{padding:"5px 12px",borderRadius:100,fontSize:12,fontWeight:700,border:`2px solid ${activeLevel===b.l?b.color:"rgba(255,255,255,0.1)"}`,background:activeLevel===b.l?`${b.color}22`:"transparent",color:activeLevel===b.l?b.color:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .18s"}}>{b.l}</button>
              ))}
            </div>

            {sel&&(
              <div key={sel.l} style={{animation:"countUp .3s ease both"}}>
                <div style={{background:`${sel.color}18`,border:`1px solid ${sel.color}44`,borderRadius:14,padding:"20px 22px",marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:900,color:sel.color,lineHeight:1}}>{sel.l}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:3}}>{sel.pts} pts / question</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:3}}>Questions correctes</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:"#fff"}}>
                        {sel.qMin === sel.qMax ? sel.qMin : `${sel.qMin} – ${sel.qMax}`} / 39
                      </div>
                    </div>
                  </div>
                  {/* Barre de progression jusqu'à qMax */}
                  <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden",marginBottom:4}}>
                    <div style={{height:"100%",background:`linear-gradient(90deg,${sel.color},${sel.color}aa)`,width:`${barPct}%`,borderRadius:3,transition:"width .4s ease"}}/>
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginBottom:0}}>Seuil de {sel.qMin} à {sel.qMax} bonnes réponses</div>
                </div>

                {/* Score MIN / MAX corrigés */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  {[["Score minimum",`${scoreMin} pts`,"(à partir de "+sel.qMin+" bonne"+(sel.qMin>1?"s":"")+")"],["Score maximum",`${scoreMax} pts`,"(avec "+sel.qMax+" bonnes)"]].map(([label,val,hint])=>(
                    <div key={label} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${sel.color}33`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{label}</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:sel.color}}>{val}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:3}}>{hint}</div>
                    </div>
                  ))}
                </div>

                {/* Détail cumulatif court */}
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,padding:"10px 12px",fontSize:11,color:"rgba(255,255,255,0.35)",lineHeight:1.6}}>
                  📐 Calcul cumulatif : A1(×3) + A2(×9) + B1(×15)… jusqu'au palier {sel.l} (×{sel.pts} pts/Q)
                </div>
              </div>
            )}
            <div style={{marginTop:12,padding:"10px 12px",background:"rgba(45,91,227,0.1)",border:"1px solid rgba(45,91,227,0.2)",borderRadius:10,fontSize:11,color:"rgba(255,255,255,0.45)"}}>
              💡 Cliquez sur un niveau pour voir le barème détaillé
            </div>
          </div>
        </div>

        <svg viewBox="0 0 1440 52" style={{display:"block",marginBottom:-2,marginTop:-2}}>
          <path d="M0,26 C360,52 1080,0 1440,26 L1440,52 L0,52 Z" fill={BG}/>
        </svg>
      </div>

      {/* ── MODULES ── */}
      <div style={{background:BG,padding:"64px 40px"}}>
        <div style={{maxWidth:1060,margin:"0 auto"}}>
          <div className="fu" style={{textAlign:"center",marginBottom:48}}>
            <span style={{display:"inline-flex",alignItems:"center",padding:"4px 14px",borderRadius:100,background:GS,border:`1px solid rgba(26,58,143,0.15)`,fontSize:11,fontWeight:700,color:BLUE,letterSpacing:.5,marginBottom:14}}>4 MODULES TCF CANADA</span>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:DARK,marginBottom:10}}>Une préparation complète<br/>et structurée</h2>
            <p style={{fontSize:14,color:GRAY,maxWidth:480,margin:"0 auto"}}>Chaque module reproduit fidèlement les conditions de l'examen officiel TCF Canada.</p>
          </div>
          <div className="modules-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18,marginBottom:52}}>
            {modules.map((m,i)=>(
              <div key={i} className="card fu" style={{animationDelay:`${i*.08}s`,padding:26,position:"relative",overflow:"hidden",opacity:m.active?1:.55,border:`1.5px solid ${m.active?m.border:BORDER}`}}>
                {m.active&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:G}}/>}
                {!m.active&&<div style={{position:"absolute",top:14,right:14,fontSize:16,opacity:.6}}>🔒</div>}
                <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
                  <div style={{width:48,height:48,borderRadius:13,background:m.bg,border:`1.5px solid ${m.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.icon}</div>
                  <div><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:m.active?DARK:GRAY,marginBottom:4}}>{m.t}</h3><p style={{fontSize:12,color:GRAY}}>{m.d}</p></div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {m.chips.map(c=><span key={c} style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:m.active?m.bg:BG,color:m.active?m.color:GRAY,fontWeight:600,border:`1px solid ${m.active?m.border:BORDER}`}}>{c}</span>)}
                </div>
                {!m.active&&<div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:GRAY,fontWeight:600}}>🚀 Coming Soon</div>}
              </div>
            ))}
          </div>

          {/* ── 2 SERVICES COMING SOON ── */}
          <div style={{marginBottom:40}}>
            <div style={{textAlign:"center",marginBottom:22}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:100,background:"rgba(90,101,119,0.1)",border:`1px solid ${BORDER}`,fontSize:11,fontWeight:700,color:GRAY,letterSpacing:.5}}>🚀 PROCHAINEMENT</span>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:DARK,marginTop:10,marginBottom:6}}>{cfg.comingSoonTitle}</h3>
              <p style={{fontSize:13,color:GRAY}}>{cfg.comingSoonSubtitle}</p>
            </div>
            <div className="coming-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              {[
                {icon:"📄",color:"#a0197e",bg:"rgba(160,25,126,0.06)",border:"rgba(160,25,126,0.2)",t:cfg.cvTitle,d:cfg.cvDesc,chips:["IA Rédactrice","4 formats","ATS optimisé"]},
                {icon:"💼",color:"#059669",bg:"rgba(5,150,105,0.06)",border:"rgba(5,150,105,0.2)",t:cfg.hiremeTitle,d:cfg.hiremeDesc,chips:["Score compatibilité","Lettre IA","Matching intelligent"]},
              ].map((s,i)=>(
                <div key={i} style={{background:"#fff",border:`1.5px dashed ${s.border}`,borderRadius:16,padding:26,position:"relative",overflow:"hidden",opacity:.8}}>
                  <div style={{position:"absolute",top:12,right:14,background:"rgba(90,101,119,0.1)",borderRadius:100,padding:"3px 10px",fontSize:10,fontWeight:700,color:GRAY}}>🔒 Coming Soon</div>
                  <div style={{width:48,height:48,borderRadius:13,background:s.bg,border:`1.5px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14}}>{s.icon}</div>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:DARK,marginBottom:6}}>{s.t}</h3>
                  <p style={{fontSize:12,color:GRAY,lineHeight:1.7,marginBottom:12}}>{s.d}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {s.chips.map(c=><span key={c} style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:s.bg,color:s.color,fontWeight:600,border:`1px solid ${s.border}`}}>{c}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── NOS AVANTAGES (depuis image 1) ── */}
          <div style={{background:"linear-gradient(135deg,#0f1827 0%,#1a2744 100%)",borderRadius:20,padding:"52px 48px",marginBottom:0,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-60,right:-40,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(45,91,227,0.12) 0%,transparent 65%)"}}/>
            <div style={{textAlign:"center",marginBottom:44,position:"relative"}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"#fff",marginBottom:10}}>{cfg.avantagesTitle}</h2>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.4)"}}>{cfg.avantagesSubtitle}</p>
            </div>
            <div className="avantages-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32,position:"relative"}}>
              {avantagesData.map((av,i)=>(
                <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                  <div style={iconStyle}>{av.icon}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:6}}>{av.title}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.7}}>{av.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PACKS DE RÉVISION (3 packs depuis image 2) ── */}
      <div style={{background:"#fff",padding:"68px 40px"}}>
        <div style={{maxWidth:1060,margin:"0 auto"}}>
          <div className="fu" style={{textAlign:"center",marginBottom:48}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:DARK,marginBottom:8}}>
              {cfg.packsTitle.split(" DE ")[0]} <span style={{color:BLUE}}>DE {cfg.packsTitle.split(" DE ")[1]||"RÉVISION"}</span>
            </h2>
            <p style={{fontSize:14,color:GRAY}}>{cfg.packsSubtitle}</p>
          </div>

          <div className="packs-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
            {packData.map((pack,i)=>(
              <div key={pack.id} className="pricing-card" style={{
                background:pack.highlight?"linear-gradient(135deg,#1a3a8f,#2d5be3)":"#fff",
                border:`2px solid ${pack.highlight?"#2d5be3":BORDER}`,
                borderRadius:16,padding:"0 0 26px",
                position:"relative",overflow:"hidden",
                boxShadow:pack.highlight?"0 16px 48px rgba(26,58,143,0.22)":"none",
              }}>
                {/* Ribbon diagonale */}
                <div style={{position:"absolute",top:16,right:-28,width:120,height:28,background:pack.ribbonColor,transform:"rotate(35deg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff",letterSpacing:.5,zIndex:2,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>{pack.ribbon}</div>

                {/* Header */}
                <div style={{background:pack.highlight?`rgba(255,255,255,0.12)`:`${pack.color}15`,borderBottom:`1px solid ${pack.highlight?"rgba(255,255,255,0.15)":BORDER}`,padding:"22px 24px 18px",marginBottom:0}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:pack.highlight?"#fff":pack.colorDark,marginBottom:10}}>{pack.name}</h3>
                  <div style={{display:"flex",alignItems:"baseline",gap:2}}>
                    <span style={{fontSize:16,fontWeight:700,color:pack.highlight?"rgba(255,255,255,0.7)":DARK}}>{pack.currency}</span>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:900,color:pack.highlight?"#fff":DARK,lineHeight:1}}>{pack.price.split(".")[0]}</span>
                    <span style={{fontSize:16,fontWeight:700,color:pack.highlight?"rgba(255,255,255,0.6)":GRAY}}>.{pack.price.split(".")[1]||"99"}</span>
                  </div>
                </div>

                {/* Features */}
                <div style={{padding:"18px 24px 0"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                    {pack.features.map((f,fi)=>(
                      <div key={fi} style={{display:"flex",gap:8,fontSize:12,color:pack.highlight?"rgba(255,255,255,0.85)":DARK,lineHeight:1.5}}>
                        <span style={{color:pack.highlight?"rgba(255,255,255,0.6)":pack.color,flexShrink:0,marginTop:1}}>✓</span>
                        <span dangerouslySetInnerHTML={{__html:f.replace(/40/g,`<strong style="color:${pack.highlight?"#93c5fd":pack.color}">40</strong>`).replace(/2026/g,`<strong style="color:${pack.highlight?"#93c5fd":pack.color}">2026</strong>`)}}/>
                      </div>
                    ))}
                  </div>

                  {/* Bonus */}
                  {pack.bonus&&(
                    <div style={{background:pack.highlight?"rgba(255,255,255,0.1)":"rgba(5,150,105,0.07)",border:`1px solid ${pack.highlight?"rgba(255,255,255,0.15)":"rgba(5,150,105,0.2)"}`,borderRadius:9,padding:"10px 12px",marginBottom:16}}>
                      <div style={{fontSize:9,fontWeight:900,color:pack.highlight?"#86efac":"#059669",letterSpacing:1,marginBottom:5}}>BONUS</div>
                      <div style={{fontSize:12,color:pack.highlight?"rgba(255,255,255,0.8)":DARK}}>{pack.bonus}</div>
                    </div>
                  )}

                  {/* Accès */}
                  <div style={{textAlign:"center",fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:pack.highlight?"#fff":DARK,marginBottom:16}}>
                    Accès : {pack.acces}
                  </div>

                  <button className="btn" onClick={onRegister} style={{
                    width:"100%",fontSize:13,fontWeight:700,padding:"12px",
                    background:pack.highlight?"#fff":pack.color,
                    color:pack.highlight?BLUE:"#fff",
                    borderRadius:10,
                    boxShadow:pack.highlight?"0 4px 14px rgba(255,255,255,0.2)":`0 4px 14px ${pack.color}44`,
                  }}>S'ABONNER</button>

                  <div style={{textAlign:"center",marginTop:10,fontSize:12,color:pack.highlight?"rgba(255,255,255,0.5)":GRAY,cursor:"pointer",textDecoration:"underline"}}>En savoir plus</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TÉMOIGNAGES ── */}
      <div style={{background:"#060d1f",padding:"64px 40px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div className="fu" style={{textAlign:"center",marginBottom:40}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:900,color:"#fff",marginBottom:8}}>{cfg.testimonialsTitle}</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>{cfg.testimonialsSubtitle}</p>
          </div>
          <div className="testimonials-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {testimonialsData.map((t,i)=>(
              <div key={i} className="testimonial fu" style={{animationDelay:`${i*.1}s`}}>
                <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:14}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{t.name} {t.pays}</div>
                    <span style={{fontSize:10,background:"rgba(45,91,227,0.2)",color:"rgba(255,255,255,0.65)",borderRadius:100,padding:"2px 8px",fontWeight:700}}>{t.level}</span>
                  </div>
                </div>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.75,fontStyle:"italic"}}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{background:"#060d1f",padding:"0 40px 60px"}}>
        <div style={{maxWidth:800,margin:"0 auto",background:G,borderRadius:20,padding:"44px 48px",textAlign:"center",position:"relative",overflow:"hidden",boxShadow:"0 20px 60px rgba(45,91,227,0.3)"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"#fff",marginBottom:10}}>{cfg.ctaFinalTitle}</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.65)",marginBottom:28,lineHeight:1.7}}>{cfg.ctaFinalDesc}</p>
          <button className="btn" onClick={onRegister} style={{background:"#fff",color:BLUE,fontSize:15,fontWeight:700,padding:"13px 32px",boxShadow:"0 6px 20px rgba(0,0,0,0.2)"}}>Créer mon compte gratuit →</button>
        </div>
      </div>

      <div style={{background:"#040a18",padding:"20px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:"rgba(255,255,255,0.2)"}}>
        <span>{cfg.footerCopyright}</span>
        <span>{cfg.footerRight}</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   AUTH PAGES
═══════════════════════════════════════════════════════════════ */
function LoginPage({onSuccess,onAdminLogin,onRegister,users,successMsg}) {
  const [email,setEmail]=useState(""); const [pwd,setPwd]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit = async () => {
    setErr("");
    if(!email||!pwd) return setErr("Email et mot de passe requis.");
    setLoading(true);
    // Admin local
    // Admin — récupère un token depuis le backend
    if(email===ADMIN_CREDS.email&&pwd===ADMIN_CREDS.password){
      try {
        const res = await fetch("https://pc-backend-rr9v.onrender.com/api/auth/login",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({email,password:pwd})
        });
        const data = await res.json();
        if(data.token){
          localStorage.setItem("pc_token", data.token);
          // Recharger les users maintenant qu'on a le token
          fetch("https://pc-backend-rr9v.onrender.com/api/users",{
            headers:{"Content-Type":"application/json","Authorization":`Bearer ${data.token}`}
          }).then(r=>r.json()).then(d=>{if(Array.isArray(d))setUsers(d);}).catch(()=>{});
          // Recharger les séries
          fetch("https://pc-backend-rr9v.onrender.com/api/series",{
            headers:{"Content-Type":"application/json","Authorization":`Bearer ${data.token}`}
          }).then(r=>r.json()).then(d=>{if(Array.isArray(d)&&d.length>0)setSeries(d);}).catch(()=>{});
        }
      } catch {}
      setLoading(false);
      return onAdminLogin();
    }
    try {
      const res = await fetch("https://pc-backend-rr9v.onrender.com/api/auth/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email, password:pwd})
      });
      const data = await res.json();
      if(!res.ok) { setLoading(false); return setErr(data.error||"Identifiants incorrects."); }
      localStorage.setItem("pc_token", data.token);
      setLoading(false);
      onSuccess(data.user);
    } catch(e) {
      setLoading(false);
      setErr("Impossible de contacter le serveur.");
    }
  };
  return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div className="fu" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,width:440,padding:"40px 36px",boxShadow:"0 24px 70px rgba(0,0,0,0.5)"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{width:44,height:44,borderRadius:11,background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16,fontFamily:"'Playfair Display',serif",margin:"0 auto 14px"}}>LP</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#fff",marginBottom:4}}>Connexion</h2>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>LaunchPad TCF Canada</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 13px",marginBottom:18,fontSize:11,color:"rgba(255,255,255,0.45)"}}>
          <strong style={{color:"rgba(255,255,255,0.6)"}}>Démo :</strong> mourad@email.com / Test1234! &nbsp;|&nbsp; Admin : admin@launchpad.ca / Admin2026!
        </div>
        {err&&<div style={{background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.25)",color:"#fca5a5",borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:14}}>{err}</div>}
        {[["Email","email","email",email,setEmail],["Mot de passe","password","password",pwd,setPwd]].map(([l,t,p,v,s])=>(
          <div key={l} style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{l}</label>
            <input className="inp" type={t} placeholder={p==="email"?"votre@email.com":"••••••••"} value={v} onChange={e=>{s(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&submit()}
              style={{background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.1)",color:"#fff"}}/>
          </div>
        ))}
        <button className="btn btn-p" onClick={submit} disabled={loading} style={{width:"100%",marginTop:6,fontSize:14,padding:"12px"}}>
          {loading?<><Spinner sm/> Connexion…</>:"Se connecter →"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:18}}>
          Pas de compte ?{" "}<span onClick={onRegister} style={{color:"rgba(255,255,255,0.6)",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>S'inscrire gratuitement</span>
        </p>
      </div>
    </div>
  );
}

function RegisterPage({onSuccess,onLogin,users,setUsers}) {
  const [nom,setNom]=useState(""); const [email,setEmail]=useState("");
  const [pays,setPays]=useState("CA"); const [pwd,setPwd]=useState(""); const [pwd2,setPwd2]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit = async () => {
    setErr("");
    if(!nom||!email||!pwd) return setErr("Champs obligatoires manquants.");
    if(pwd.length<8) return setErr("Mot de passe : 8 caractères minimum.");
    if(pwd!==pwd2) return setErr("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      const res = await fetch("https://pc-backend-rr9v.onrender.com/api/auth/register", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({nom, email, password:pwd, pays})
      });
      let data;
      try { data = await res.json(); } catch { data = {}; }
      if(!res.ok) {
        setLoading(false);
        return setErr(data.error||`Erreur ${res.status} — vérifiez les logs Render.`);
      }
      if(!data.token || !data.user) {
        setLoading(false);
        return setErr("Réponse inattendue du serveur.");
      }
      localStorage.setItem("pc_token", data.token);
      setLoading(false);
      onSuccess(data.user);
    } catch(e) {
      setLoading(false);
      setErr("Impossible de contacter le serveur : " + e.message);
    }
  };
  return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div className="fu" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,width:480,padding:"36px",boxShadow:"0 24px 70px rgba(0,0,0,0.5)",overflowY:"auto",maxHeight:"96vh"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:40,height:40,borderRadius:10,background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:14,fontFamily:"'Playfair Display',serif",margin:"0 auto 12px"}}>PC</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#fff",marginBottom:3}}>Créer mon compte</h2>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>Passeport Carrière · Accès gratuit</p>
        </div>
        {err&&<div style={{background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.25)",color:"#fca5a5",borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:14}}>{err}</div>}
        {[["Nom complet","text",nom,setNom,"Mourad Benali"],["Email","email",email,setEmail,"votre@email.com"],["Mot de passe","password",pwd,setPwd,"8+ caractères"],["Confirmer","password",pwd2,setPwd2,"Répéter"]].map(([l,t,v,s,ph])=>(
          <div key={l} style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{l}</label>
            <input className="inp" type={t} placeholder={ph} value={v} onChange={e=>{s(e.target.value);setErr("");}} style={{background:"rgba(255,255,255,0.06)",border:`1.5px solid ${v&&t==="password"&&l==="Confirmer"&&v!==pwd?"#dc2626":"rgba(255,255,255,0.1)"}`,color:"#fff"}}/>
          </div>
        ))}
        <div style={{marginBottom:18}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Pays</label>
          <select className="inp" value={pays} onChange={e=>setPays(e.target.value)} style={{background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.1)",color:"#fff"}}>
            {PAYS_LIST.map(p=><option key={p.code} value={p.code} style={{background:DARK}}>{p.flag} {p.name}</option>)}
          </select>
        </div>
        <button className="btn btn-p" onClick={submit} disabled={loading} style={{width:"100%",fontSize:13,padding:"12px",marginBottom:14}}>
          {loading?<><Spinner sm/> Création…</>:"Créer mon compte →"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.3)"}}>
          Déjà inscrit ?{" "}<span onClick={onLogin} style={{color:"rgba(255,255,255,0.6)",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>Se connecter</span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERIES LIST — shared component
═══════════════════════════════════════════════════════════════ */
function SeriesList({type,series,isPremium,attempts,onStart}) {
  const typeLabel = type==="CE"?"Compréhension Écrite":"Compréhension Orale";
  const typeIcon  = type==="CE"?"📖":"🎧";
  const timeLimit = type==="CE"?60:35;
  const freeSeries = series.filter(s=>!s.premium).slice(0,3);
  const today = new Date().toDateString();

  return (
    <div>
      <div style={{marginBottom:22}}>
        <span className="tag" style={{background:type==="CE"?"rgba(26,58,143,0.08)":"rgba(160,25,126,0.08)",color:type==="CE"?BLUE:MAG,marginBottom:10}}>{typeIcon} {typeLabel}</span>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:DARK,marginTop:8,marginBottom:4}}>{series.length} Séries disponibles</h2>
        <p style={{fontSize:13,color:GRAY}}>39 questions · {timeLimit} min · Barème officiel A1→C2 · 699 pts max</p>
      </div>

      {/* Free badge */}
      <div style={{background:"rgba(5,150,105,0.08)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:13,color:"#065f46"}}>
        <strong>✅ {freeSeries.length} séries gratuites</strong> incluses · Les séries Premium nécessitent un abonnement
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {series.map((serie,idx)=>{
          const att = attempts[serie.id];
          const isLocked = serie.premium && !isPremium;
          const doneToday = false; // désactivé temporairement
          const canRetry = true;   // désactivé temporairement
          const levelInfo = att ? TRANCHES.slice().reverse().find(t=>att.correct>=t.min)||TRANCHES[0] : null;

          return (
            <div key={serie.id} className="card" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14,opacity:isLocked?0.7:1}}>
              {/* Index */}
              <div style={{width:38,height:38,borderRadius:10,background:isLocked?BG:GS,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:isLocked?20:14,fontWeight:700,color:isLocked?GRAY:BLUE}}>
                {isLocked?"🔒":idx+1}
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:700,color:isLocked?GRAY:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{serie.title}</span>
                  {serie.premium&&<span className="tag" style={{background:isPremium?G:"rgba(90,101,119,0.1)",color:isPremium?"#fff":GRAY,fontSize:9,flexShrink:0}}>{isPremium?"⭐":"🔒"} Premium</span>}
                </div>
                <div style={{display:"flex",gap:10,fontSize:11,color:GRAY}}>
                  <span>39 questions</span><span>{timeLimit} min</span><span>699 pts</span>
                  {att&&<span style={{color:levelInfo?.color,fontWeight:700}}>Dernier : {att.score}pts — {levelInfo?.level}</span>}
                </div>
              </div>

              {/* Action */}
              <div style={{flexShrink:0}}>
                {isLocked ? (
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:10,color:GRAY,marginBottom:4}}>Accès Premium</div>
                    <button className="btn btn-p btn-sm" style={{fontSize:11}}>⭐ Débloquer</button>
                  </div>
                ) : doneToday ? (
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:10,color:GRAY,marginBottom:4}}>Disponible demain</div>
                    <span className="tag" style={{background:"rgba(217,119,6,0.1)",color:"#d97706"}}>⏳ 24h</span>
                  </div>
                ) : (
                  <button className="btn btn-p btn-sm" onClick={()=>onStart(serie)}>
                    {att?"↻ Recommencer":"▶ Commencer"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXAM ENGINE
═══════════════════════════════════════════════════════════════ */
function ExamEngine({serie,isPremium,onFinish,onAbort}) {
  const timeLimit = serie.type==="CE"?60*60:35*60; // seconds
  const [current,setCurrent]  = useState(0);
  const [answers, setAnswers]  = useState({});
  const [timeLeft,setTimeLeft] = useState(timeLimit);
  const [finished,setFinished] = useState(false);
  const [showResults,setShowResults] = useState(false);
  const [showDetail,setShowDetail] = useState(false);
  const audioRef = useRef(null);

  const questions = serie.questions || [];
  const q = questions[current];

  // Timer
  useEffect(()=>{
    if(finished) return;
    const t = setInterval(()=>setTimeLeft(tl=>{ if(tl<=1){clearInterval(t);handleFinish(answers);return 0;} return tl-1; }),1000);
    return ()=>clearInterval(t);
  },[finished]);

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = Math.round(timeLeft/timeLimit*100);

  const select = idx => {
    if(finished) return;
    setAnswers(a=>({...a,[current]:idx}));
  };

  const handleFinish = useCallback((ans=answers)=>{
    setFinished(true);
    const res = calcScore(ans, questions);
    onFinish(serie.id, res, ans);
    setShowResults(true);
  },[answers,questions,serie.id,onFinish]);

  const result = finished ? calcScore(answers,questions) : null;

  // Audio for CO
  useEffect(()=>{
    if(serie.type==="CO"&&serie.audioUrl&&audioRef.current) {
      audioRef.current.src = serie.audioUrl;
    }
  },[serie]);

  if(showResults && result) {
    return (
      <div style={{maxWidth:700,margin:"0 auto",padding:"36px 24px"}}>
        <div className="fu card" style={{padding:32,textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:12}}>
            {result.level==="C2"?"🏆":result.level==="C1"?"🌟":result.level==="B2"?"🎯":"📊"}
          </div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:DARK,marginBottom:8}}>Série terminée !</h2>
          <div style={{display:"flex",justify:"center",gap:20,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:900,color:result.levelColor}}>{result.score}</div>
              <div style={{fontSize:12,color:GRAY}}>/ 699 points</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:900,color:result.levelColor}}>{result.correct}</div>
              <div style={{fontSize:12,color:GRAY}}>/ {result.total} bonnes réponses</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:900,color:result.levelColor}}>{result.level}</div>
              <div style={{fontSize:12,color:GRAY}}>Niveau estimé</div>
            </div>
          </div>
          {/* Level bar */}
          <div style={{background:BG,borderRadius:10,padding:"12px 16px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              {TRANCHES.map(t=>(
                <div key={t.level} style={{textAlign:"center",flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:t.level===result.level?t.color:GRAY,marginBottom:3}}>{t.level}</div>
                  <div style={{height:6,background:t.level===result.level?t.color:BORDER,borderRadius:3,margin:"0 2px"}}/>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-o" onClick={()=>setShowDetail(s=>!s)}>{showDetail?"Masquer":"Voir"} les réponses</button>
            <button className="btn btn-p" onClick={onAbort}>Retour aux séries</button>
          </div>
        </div>

        {showDetail&&(
          <div className="fu card" style={{padding:22}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:DARK,marginBottom:16}}>Détail des réponses</h3>
            {questions.map((q,i)=>{
              const user = answers[i]; const ok = user===q.correct;
              return(
                <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${BORDER}`,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:ok?"rgba(5,150,105,0.12)":"rgba(220,38,38,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{ok?"✓":"✗"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:DARK,marginBottom:4}}>Q{i+1}. {q.text}</div>
                    <div style={{fontSize:11,color:ok?"#059669":"#dc2626"}}>Votre réponse : {user!==undefined?q.options[user]:"(non répondu)"}</div>
                    {!ok&&<div style={{fontSize:11,color:"#059669"}}>Bonne réponse : {q.options[q.correct]}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if(!q) return null;

  const answered = Object.keys(answers).length;
  const isUrgent = timeLeft < 300;

  return (
    <div className="exam-layout" style={{display:"flex",height:"calc(100vh - 58px)",fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>

      {/* ── GAUCHE : Zone question ── */}
      <div className="exam-content" style={{flex:1,overflowY:"auto",padding:"28px 32px",background:BG}}>

        {/* Audio CO */}
        {serie.type==="CO"&&serie.audioUrl&&(
          <div style={{background:"#fff",border:`1.5px solid ${BORDER}`,borderRadius:12,padding:"12px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(160,25,126,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎧</div>
            <audio ref={audioRef} controls src={serie.audioUrl} style={{flex:1,height:36}}/>
          </div>
        )}

        {/* Numéro question */}
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:18}}>
          <div style={{background:G,borderRadius:100,padding:"4px 16px",fontSize:13,fontWeight:700,color:"#fff",boxShadow:"0 2px 10px rgba(45,91,227,0.25)"}}>
            Question {current+1} / {questions.length}
          </div>
          {serie.type==="CO"&&(
            <span style={{background:"rgba(160,25,126,0.09)",color:MAG,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700}}>
              {q.isImageChoice?"🖼️ Image + 4 propositions":"🎧 Document sonore"}
            </span>
          )}
        </div>

        {/* Image — grande zone agrandie */}
        {q.image&&(
          <div style={{marginBottom:16,borderRadius:14,overflow:"hidden",border:`1.5px solid ${BORDER}`,background:"#fff",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <img
              src={q.image} alt="question"
              style={{width:"100%",maxHeight:420,objectFit:"contain",display:"block",background:"#fafafa"}}
              onError={e=>e.target.style.display="none"}
            />
          </div>
        )}

        {/* Texte question */}
        <h2 style={{fontSize:17,fontWeight:700,color:DARK,marginBottom:14,lineHeight:1.55,fontFamily:"'Playfair Display',serif"}}>
          {q.text}
        </h2>

        {/* Options — plus compactes */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {q.options.map((opt,i)=>{
            const letter=["A","B","C","D"][i];
            const isSel=answers[current]===i;
            return(
              <button key={i} onClick={()=>select(i)} style={{
                display:"flex",alignItems:"center",gap:12,
                padding:"11px 16px",
                border:`2px solid ${isSel?BLUE:BORDER}`,
                borderRadius:10,
                background:isSel?"rgba(26,58,143,0.06)":"#fff",
                cursor:"pointer",fontSize:13,color:DARK,
                fontFamily:"'DM Sans',sans-serif",
                textAlign:"left",
                transition:"all .18s",
                boxShadow:isSel?"0 2px 12px rgba(26,58,143,0.15)":"none",
              }}>
                <span style={{
                  width:28,height:28,borderRadius:"50%",flexShrink:0,
                  background:isSel?G:BG,
                  color:isSel?"#fff":GRAY,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:12,fontWeight:700,
                }}>{letter}</span>
                <span style={{fontWeight:isSel?600:400}}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Nav bas */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
          <button className="btn btn-o" onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0} style={{padding:"10px 22px"}}>← Précédent</button>
          {current<questions.length-1
            ?<button className="btn btn-p" onClick={()=>setCurrent(c=>c+1)} style={{padding:"10px 22px"}}>Suivant →</button>
            :<button className="btn btn-danger" onClick={()=>handleFinish()} style={{padding:"10px 22px"}}>Terminer ✓</button>
          }
        </div>
      </div>

      {/* ── DROITE : Timer + Navigation ── */}
      <div className="exam-sidebar" style={{width:280,background:DARK,display:"flex",flexDirection:"column",borderLeft:"1px solid rgba(255,255,255,0.07)",flexShrink:0,overflowY:"auto"}}>

        {/* Header sidebar */}
        <div className="exam-header-sidebar" style={{padding:"16px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={{width:22,height:22,borderRadius:6,background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff"}}>PC</div>
            <span style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Playfair Display',serif"}}>Passeport Carrière</span>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{serie.title}</div>
        </div>

        {/* Timer */}
        <div className="exam-timer-block" style={{padding:"20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>⏱ Temps restant</div>
          <div className="exam-timer-big" style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:38,fontWeight:900,
            color:isUrgent?"#f87171":"#fff",
            lineHeight:1,marginBottom:10,
            transition:"color .5s",
          }}>{formatTime(timeLeft)}</div>
          <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
            <div style={{
              height:"100%",
              width:`${pct}%`,
              background:isUrgent?"#ef4444":G,
              borderRadius:3,transition:"width 1s, background .5s"
            }}/>
          </div>
          {isUrgent&&<div style={{fontSize:10,color:"#f87171",marginTop:6,fontWeight:600}}>⚠️ Moins de 5 minutes !</div>}
        </div>

        {/* Progression */}
        <div className="exam-progress-block" style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>📊 Progression</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Répondues</span>
            <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{answered} / {questions.length}</span>
          </div>
          <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(answered/questions.length)*100}%`,background:"#22c55e",borderRadius:3,transition:"width .4s"}}/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:10}}>
            {[["●","Actuelle","rgba(45,91,227,0.8)"],["●","Répondue","#22c55e"],["●","Non rép.","rgba(255,255,255,0.15)"]].map(([dot,label,color])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"rgba(255,255,255,0.4)"}}>
                <span style={{color,fontSize:10}}>{dot}</span>{label}
              </div>
            ))}
          </div>
        </div>

        {/* Grille questions */}
        <div className="exam-nav-block" style={{padding:"14px 18px",flex:1}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Navigation</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
            {questions.map((_,i)=>{
              const isCur=i===current;
              const isDone=answers[i]!==undefined;
              return(
                <div key={i} onClick={()=>setCurrent(i)} style={{
                  height:36,borderRadius:7,
                  background:isCur?"rgba(45,91,227,0.8)":isDone?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.06)",
                  border:`1.5px solid ${isCur?"#2d5be3":isDone?"#22c55e":"rgba(255,255,255,0.1)"}`,
                  cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,fontWeight:700,
                  color:isCur?"#fff":isDone?"#4ade80":"rgba(255,255,255,0.4)",
                  transition:"all .15s",
                }}>{i+1}</div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{padding:"14px 18px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",gap:8}}>
          <button className="btn btn-danger" onClick={()=>handleFinish()} style={{width:"100%",fontSize:12,padding:"10px"}}>
            ✓ Terminer ({answered}/{questions.length})
          </button>
          <button onClick={onAbort} style={{width:"100%",background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"8px",fontSize:11,color:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ← Quitter l'examen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFIL TAB — Editable
═══════════════════════════════════════════════════════════════ */
function ProfilTab({user,isPremium,attempts,onUpdate}) {
  const [form,setForm]   = useState({
    nom:    user.nom||"",
    email:  user.email||"",
    adresse:user.adresse||"",
    pays:   user.pays||"CA",
    tel:    user.tel||"",
    whatsapp:user.whatsapp||"",
    photo:  user.photo||"",
  });
  const [saved,setSaved] = useState(false);
  const [editing,setEditing]=useState(false);
  const photoRef = useRef();
  const [toast,showToast] = useToast();

  const handlePhoto = async e => {
    const f = e.target.files[0];
    if(!f) return;
    const b64 = await toBase64(f);
    setForm(p=>({...p,photo:b64}));
    setEditing(true);
  };

  const save = () => {
    const updated = {...user,...form};
    onUpdate(updated);
    setEditing(false);
    showToast("Profil mis à jour !");
  };

  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); setEditing(true); };
  const paysInfo = getPays(form.pays);
  const initials = form.nom.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?";

  const F = ({label,k,type="text",placeholder}) => (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
      <input className="inp" type={type} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={placeholder||label}/>
    </div>
  );

  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"32px"}}>
      {toast&&<Toast {...toast}/>}
      <div className="fu" style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:3}}>Mon <Grad>profil</Grad></h1>
          <p style={{fontSize:13,color:GRAY}}>Vos informations personnelles · Modifiables à tout moment</p>
        </div>
        {editing&&(
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-o btn-sm" onClick={()=>{setForm({nom:user.nom,email:user.email,adresse:user.adresse||"",pays:user.pays,tel:user.tel||"",whatsapp:user.whatsapp||"",photo:user.photo||""});setEditing(false);}}>Annuler</button>
            <button className="btn btn-p btn-sm" onClick={save}>💾 Enregistrer</button>
          </div>
        )}
      </div>

      {/* Photo + plan */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${BORDER}`}}>
          {/* Photo */}
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",border:`3px solid ${BORDER}`}}>
              {form.photo
                ? <img src={form.photo} alt="Photo" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>upd("photo","")}/>
                : <span style={{color:"#fff",fontWeight:700,fontSize:22}}>{initials}</span>
              }
            </div>
            <button onClick={()=>photoRef.current.click()} style={{position:"absolute",bottom:-2,right:-2,width:24,height:24,borderRadius:"50%",background:G,border:"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>📷</button>
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:DARK,marginBottom:3}}>{form.nom||"Votre nom"}</div>
            <div style={{fontSize:12,color:GRAY}}>{paysInfo.flag} {paysInfo.name} · Inscrit le {user.joined}</div>
            <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
              <span className="tag" style={{background:isPremium?G:"rgba(90,101,119,0.1)",color:isPremium?"#fff":GRAY,fontSize:10}}>{isPremium?"⭐ Premium":"Free"}</span>
              <span className="tag" style={{background:"rgba(5,150,105,0.1)",color:"#059669",fontSize:10}}>✅ {user.status}</span>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <button onClick={()=>photoRef.current.click()} className="btn btn-o btn-sm">📷 Changer photo</button>
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:4}}>
          {[["📖",Object.keys(attempts).filter(k=>k.startsWith("ce")).length,"Séries CE"],["🎧",Object.keys(attempts).filter(k=>k.startsWith("co")).length,"Séries CO"],["📅",user.lastLogin,"Dernière connexion"]].map(([icon,val,label])=>(
            <div key={label} style={{textAlign:"center",padding:"10px",background:BG,borderRadius:10}}>
              <div style={{fontSize:16,marginBottom:3}}>{icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:900,color:DARK}}>{val}</div>
              <div style={{fontSize:10,color:GRAY,marginTop:1}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Infos éditables */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:16}}>Informations personnelles</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <F label="Nom et Prénom" k="nom" placeholder="Mourad Benali"/>
          <F label="Adresse email" k="email" type="email" placeholder="votre@email.com"/>
        </div>
        <F label="Adresse / Ville" k="adresse" placeholder="123 Rue Principale, Montréal"/>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Pays de résidence</label>
          <select className="inp" value={form.pays} onChange={e=>upd("pays",e.target.value)}>
            {PAYS_LIST.map(p=><option key={p.code} value={p.code}>{p.flag} {p.name}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <F label="Téléphone" k="tel" placeholder="+1 514 000-0000"/>
          <F label="WhatsApp" k="whatsapp" placeholder="+1 514 000-0000"/>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:3}}>Mot de passe</h3>
            <p style={{fontSize:12,color:GRAY}}>Dernière modification : à l'inscription</p>
          </div>
          <button className="btn btn-o btn-sm" onClick={()=>showToast("Fonction disponible bientôt.","info")}>Modifier</button>
        </div>
      </div>

      {/* Upgrade */}
      {!isPremium&&(
        <div style={{background:G,borderRadius:14,padding:"24px 26px"}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>Passez à Premium</h3>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:16}}>80 séries débloquées · Refaire à tout moment · Modules CV et Emploi à venir</p>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#fff",marginBottom:14}}>30 $ <span style={{fontSize:13,fontWeight:400,opacity:.7}}>/ mois</span></div>
          <button className="btn" style={{background:"#fff",color:BLUE,fontWeight:700}}>Souscrire →</button>
        </div>
      )}

      {/* Save floating bar */}
      {editing&&(
        <div className="si" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:DARK,borderRadius:12,padding:"12px 22px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:500,border:"1px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>Modifications non enregistrées</span>
          <button className="btn btn-o btn-sm" onClick={()=>{setForm({nom:user.nom,email:user.email,adresse:user.adresse||"",pays:user.pays,tel:user.tel||"",whatsapp:user.whatsapp||"",photo:user.photo||""});setEditing(false);}}>Annuler</button>
          <button className="btn btn-p btn-sm" onClick={save}>💾 Enregistrer</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER DASHBOARD
═══════════════════════════════════════════════════════════════ */
function UserDashboard({user,onLogout,series,setSeries,setUsers}) {
  const [tab,setTab]         = useState("home");
  const [activeSerie,setActiveSerie] = useState(null);
  const [examType,setExamType]       = useState(null);
  const [attempts,setAttempts]       = useState({});
  const isPremium = user.plan==="premium";
  const initials  = user.nom.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const pays      = getPays(user.pays);

  const ceSeries = series.filter(s=>s.type==="CE");
  const coSeries = series.filter(s=>s.type==="CO");

  // Charger les tentatives depuis le backend
  useEffect(()=>{
    apiGet("/api/attempts").then(data=>{
      if(Array.isArray(data)){
        const map={};
        data.forEach(a=>{ map[a.serie_id]={correct:a.correct,score:a.score,level:a.level,date:a.done_at}; });
        setAttempts(map);
      }
    });
  },[]);

  const saveAttempt = useCallback((serieId, result, answers) => {
    const next = {...attempts, [serieId]:{...result, answers, date:new Date().toISOString()}};
    setAttempts(next);
    // Sauvegarder en DB
    apiPost("/api/attempts",{
      serie_id: serieId,
      correct:  result.correct,
      score:    result.score,
      level:    result.level,
      answers:  answers,
    });
  },[attempts,user.id]);

  const startSerie = async (serie, type) => {
    // Si les questions sont déjà chargées, on utilise directement
    if(serie.questions && serie.questions.length > 0){
      setActiveSerie(serie);
      setExamType(type);
      return;
    }
    // Sinon on charge depuis le backend
    try {
      const full = await apiGet(`/api/series/${serie.id}`);
      if(full && full.questions && full.questions.length > 0){
        setActiveSerie(full);
        setExamType(type);
        // Mettre à jour le state local aussi
        setSeries(prev=>prev.map(s=>s.id===serie.id?full:s));
      } else {
        alert("Impossible de charger les questions de cette série.");
      }
    } catch(e) {
      alert("Erreur réseau lors du chargement de la série.");
    }
  };

  const finishExam = (serieId, result, answers) => {
    saveAttempt(serieId, result, answers);
  };

  const abortExam = () => {
    setActiveSerie(null);
    setExamType(null);
  };

  const NAV = [
    {id:"home",   icon:"🏠", label:"Accueil"},
    {id:"ce",     icon:"📖", label:"Comp. Écrite"},
    {id:"co",     icon:"🎧", label:"Comp. Orale"},
    {id:"ee",     icon:"✍️", label:"Expr. Écrite", soon:true},
    {id:"eo",     icon:"🗣️", label:"Expr. Orale",  soon:true},
    {id:"cv",     icon:"📄", label:"Générateur CV", soon:true},
    {id:"emploi", icon:"🤖", label:"Emploi IA",     soon:true},
    {id:"profil", icon:"👤", label:"Mon profil"},
  ];

  // In exam mode
  if(activeSerie) {
    return (
      <div style={{minHeight:"100vh",background:BG,fontFamily:"'DM Sans',sans-serif"}}>
        <style>{CSS}</style>
        <div style={{background:DARK,height:58,display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"sticky",top:0,zIndex:50}}>
          <div style={{width:26,height:26,borderRadius:7,background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff",marginRight:10}}>PC</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:"#fff"}}>Passeport Carrière &nbsp;—&nbsp;</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{activeSerie.title}</span>
        </div>
        <ExamEngine serie={activeSerie} isPremium={isPremium} onFinish={finishExam} onAbort={abortExam}/>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>

      {/* SIDEBAR — desktop */}
      <aside className="sidebar-desktop" style={{width:220,background:DARK,display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,0.06)",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:7,background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:10,fontFamily:"'Playfair Display',serif"}}>PC</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:"#fff"}}>Passeport <Grad>Carrière</Grad></span>
          </div>
        </div>
        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0}}>{initials}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.nom}</div>
              <span className="tag" style={{background:isPremium?G:"rgba(255,255,255,0.1)",color:"#fff",fontSize:9,marginTop:3}}>{isPremium?"⭐ Premium":"Free"}</span>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"8px 0"}}>
          {NAV.map(n=>(
            <button key={n.id} className={`sidebar-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)} style={{opacity:n.soon?.65:1}}>
              <span style={{fontSize:14}}>{n.icon}</span>
              <span style={{fontSize:12,fontWeight:tab===n.id?600:400,color:tab===n.id?"#fff":"rgba(255,255,255,0.45)",flex:1}}>{n.label}</span>
              {n.soon&&<span style={{fontSize:8,background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)",borderRadius:4,padding:"1px 5px",fontWeight:700,letterSpacing:.3}}>BIENTÔT</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <button className="btn btn-ghost" onClick={onLogout} style={{width:"100%",fontSize:12,padding:"7px"}}>← Déconnexion</button>
        </div>
      </aside>

      {/* BOTTOM NAV — mobile */}
      <nav className="bottom-nav">
        {[{id:"home",i:"🏠",l:"Accueil"},{id:"ce",i:"📖",l:"CE"},{id:"co",i:"🎧",l:"CO"},{id:"profil",i:"👤",l:"Profil"},{id:"ee",i:"🚀",l:"Plus"}].map(n=>(
          <button key={n.id} className={`bottom-nav-btn${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)}>
            <span>{n.i}</span>
            <span>{n.l}</span>
          </button>
        ))}
      </nav>

      {/* MAIN */}
      <main className="main-content" style={{flex:1,overflowY:"auto",background:BG}}>

        {/* HOME */}
        {tab==="home"&&(
          <div style={{padding:"32px"}}>
            <div className="fu" style={{marginBottom:28}}>
              <p style={{fontSize:13,color:GRAY}}>👋 Bienvenue,</p>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:900,color:DARK,marginTop:4}}>{user.nom.split(" ")[0]} <Grad>!</Grad></h1>
            </div>
            <div className="dash-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:24}}>
              {[{id:"ce",icon:"📖",color:"#1a3a8f",bg:"rgba(26,58,143,0.07)",t:"Compréhension Écrite",d:`${ceSeries.length} séries · 60 min · 699 pts`,done:Object.keys(attempts).filter(k=>k.startsWith("ce")).length},
                {id:"co",icon:"🎧",color:MAG,bg:"rgba(192,24,110,0.07)",t:"Compréhension Orale",d:`${coSeries.length} séries · 35 min · 699 pts`,done:Object.keys(attempts).filter(k=>k.startsWith("co")).length}
              ].map(c=>(
                <div key={c.id} className="card card-h fu" onClick={()=>setTab(c.id)} style={{padding:22,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:G}}/>
                  <div style={{width:40,height:40,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:12}}>{c.icon}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:4}}>{c.t}</div>
                  <p style={{fontSize:12,color:GRAY,marginBottom:10}}>{c.d}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:c.color,fontWeight:600}}>{c.done} série(s) faite(s)</span>
                    <span style={{fontSize:13,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>→</span>
                  </div>
                </div>
              ))}
              {[{id:"ee",icon:"✍️",t:"Expression Écrite"},{id:"eo",icon:"🗣️",t:"Expression Orale"},{id:"cv",icon:"📄",t:"Générateur CV"},{id:"emploi",icon:"🤖",t:"Emploi IA"}].map((c,i)=>(
                <div key={i} className="card" onClick={()=>setTab(c.id)} style={{padding:22,cursor:"pointer",opacity:.55,position:"relative"}}>
                  <div style={{position:"absolute",top:10,right:12,fontSize:9,fontWeight:700,background:"rgba(90,101,119,0.12)",color:GRAY,borderRadius:4,padding:"2px 6px",letterSpacing:.3}}>BIENTÔT</div>
                  <div style={{width:40,height:40,borderRadius:10,background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:12}}>{c.icon}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:GRAY,marginBottom:4}}>{c.t}</div>
                  <span className="tag" style={{background:"rgba(90,101,119,0.1)",color:GRAY,fontSize:10}}>🚀 Coming Soon</span>
                </div>
              ))}
            </div>
            {!isPremium&&(
              <div style={{background:G,borderRadius:14,padding:"22px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>Passez Premium — 30 $ / mois</div>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>Toutes les séries débloquées · Refaire illimité · Accès à venir CV & Emploi</p>
                </div>
                <button className="btn" onClick={()=>setTab("profil")} style={{background:"#fff",color:BLUE,fontSize:12,fontWeight:700,padding:"9px 18px",whiteSpace:"nowrap"}}>Upgrader ⭐</button>
              </div>
            )}
          </div>
        )}

        {/* CE */}
        {tab==="ce"&&(
          <div style={{maxWidth:860,margin:"0 auto",padding:"32px"}}>
            <SeriesList type="CE" series={ceSeries} isPremium={isPremium} attempts={attempts} onStart={s=>startSerie(s,"CE")}/>
          </div>
        )}

        {/* CO */}
        {tab==="co"&&(
          <div style={{maxWidth:860,margin:"0 auto",padding:"32px"}}>
            <SeriesList type="CO" series={coSeries} isPremium={isPremium} attempts={attempts} onStart={s=>startSerie(s,"CO")}/>
          </div>
        )}

        {/* Coming Soon — CV, Emploi, EE, EO */}
        {(tab==="cv"||tab==="emploi"||tab==="ee"||tab==="eo")&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",padding:32,textAlign:"center"}}>
            <div style={{fontSize:64,marginBottom:20}}>{tab==="cv"?"📄":tab==="emploi"?"🤖":tab==="ee"?"✍️":"🗣️"}</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:DARK,marginBottom:10}}>
              {tab==="cv"?"Générateur CV":tab==="emploi"?"Emploi IA":tab==="ee"?"Expression Écrite":"Expression Orale"} — <Grad>Bientôt</Grad>
            </h2>
            <p style={{fontSize:14,color:GRAY,maxWidth:420,lineHeight:1.75}}>
              {tab==="ee"||tab==="eo"?"Ce module de production est en cours de développement et sera disponible prochainement.":"Ce module est en cours de développement. Il sera disponible prochainement pour tous les abonnés LaunchPad."}
            </p>
            <div style={{marginTop:24,background:GS,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 20px",fontSize:12,color:BLUE,fontWeight:600}}>
              🚀 Nous travaillons activement dessus — restez connecté !
            </div>
          </div>
        )}

        {/* Profil — Editable */}
        {tab==="profil"&&(
          <ProfilTab user={user} isPremium={isPremium} attempts={attempts} onUpdate={updatedUser=>{
            apiPut("/api/users/me", updatedUser).then(()=>{
              setUsers(prev=>prev.map(u=>u.id===updatedUser.id?updatedUser:u));
            });
          }}/>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — SERIE EDITOR
═══════════════════════════════════════════════════════════════ */
function QuestionEditor({question,index,onChange,onRemove,type}) {
  const q = question;
  const isImageChoice = type==="CO" && index<3;
  return (
    <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:11,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:700,color:DARK}}>Question {index+1} {isImageChoice?"(Image + 4 propositions)":"(Doc. sonore + 4 réponses)"}</span>
        <button onClick={onRemove} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Supprimer</button>
      </div>
      <ImageUpload label="Image (optionnel)" value={q.image||""} onChange={v=>onChange({...q,image:v})}/>
      <div style={{marginBottom:10}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Texte de la question</label>
        <textarea className="inp" value={q.text} onChange={e=>onChange({...q,text:e.target.value})} rows={2} placeholder="Texte de la question…"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {q.options.map((opt,i)=>(
          <div key={i}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:i===q.correct?"#059669":DARK,marginBottom:3}}>
              {["A","B","C","D"][i]} {i===q.correct?"✓ (correcte)":""}
            </label>
            <input className="inp" value={opt} onChange={e=>{const o=[...q.options];o[i]=e.target.value;onChange({...q,options:o});}} placeholder={`Option ${["A","B","C","D"][i]}`} style={{fontSize:12,borderColor:i===q.correct?"#059669":undefined}}/>
          </div>
        ))}
      </div>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Bonne réponse</label>
        <div style={{display:"flex",gap:7}}>
          {["A","B","C","D"].map((l,i)=>(
            <button key={i} onClick={()=>onChange({...q,correct:i})} style={{padding:"5px 14px",borderRadius:7,fontSize:12,fontWeight:700,border:`2px solid ${q.correct===i?"#059669":BORDER}`,background:q.correct===i?"rgba(5,150,105,0.1)":"#fff",color:q.correct===i?"#059669":DARK,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const AI_GENERATE_PROMPT = (type,title,qIndex) => `Tu es un expert créateur de contenu TCF Canada officiel.
Génère ${qIndex===0?39:1} question(s) de type "${type==="CE"?"Compréhension Écrite":"Compréhension Orale"} TCF Canada" pour la série "${title}".
${type==="CO"&&qIndex<3?"Les 3 premières questions doivent décrire une image (les options sont des phrases décrivant l'image).":"Les autres questions: 'Écoutez le document et choisissez la bonne réponse.'"}
Format JSON strict (tableau): [{"text":"La question?","image":null,"options":["Option A","Option B","Option C","Option D"],"correct":0}]
correct = index 0-3 de la bonne réponse.
Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

function SerieEditor({serie,onSave,onCancel,type}) {
  const isEdit = !!serie;
  const [title, setTitle]   = useState(serie?.title||"");
  const [premium,setPremium]= useState(serie?.premium||false);
  const [audioUrl,setAudio] = useState(serie?.audioUrl||"");
  const [questions,setQs]   = useState(serie?.questions||[]);
  const [aiLoading,setAiLoad]=useState(false);
  const [aiTab,setAiTab]    = useState("manual");
  const [toast,showToast]   = useToast();

  const addQuestion = () => {
    if(questions.length>=39) return;
    setQs(q=>[...q,{id:Date.now(),text:"",image:null,options:["","","",""],correct:0}]);
  };

  const generateWithAI = async () => {
    if(!title) return showToast("Saisissez d'abord un titre de série.","error");
    setAiLoad(true);
    const p = AI_GENERATE_PROMPT(type,title,0);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:p}]})});
      const d = await r.json();
      const text = d.content?.[0]?.text||"[]";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      const withIds = parsed.slice(0,39).map((q,i)=>({id:Date.now()+i,image:q.image||null,text:q.text||"",options:q.options||["","","",""],correct:q.correct||0}));
      setQs(withIds);
      showToast(`${withIds.length} questions générées par l'IA !`);
    } catch(e) { showToast("Erreur lors de la génération IA.","error"); }
    setAiLoad(false);
  };

  const save = () => {
    if(!title) return showToast("Titre obligatoire.","error");
    if(questions.length===0) return showToast("Ajoutez au moins une question.","error");
    const obj = {
      id: serie?.id || `${type.toLowerCase()}-${Date.now()}`,
      type, title, premium, audioUrl,
      questions: questions.slice(0,39),
    };
    onSave(obj);
  };

  return (
    <div>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Titre de la série *</label>
          <input className="inp" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Série 1 — Lieux et commerces"/>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:10}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"10px 14px",border:`2px solid ${premium?"#a0197e":BORDER}`,borderRadius:9,background:premium?"rgba(160,25,126,0.06)":"#fff",flex:1}}>
            <input type="checkbox" checked={premium} onChange={e=>setPremium(e.target.checked)} style={{width:15,height:15}}/>
            <span style={{fontSize:13,fontWeight:600,color:premium?"#a0197e":DARK}}>⭐ Série Premium</span>
          </label>
        </div>
      </div>

      {type==="CO"&&(
        <AudioUpload label="Fichier audio de la série (MP3)" value={audioUrl} onChange={setAudio}/>
      )}

      {/* Questions section */}
      <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:16,marginTop:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>Questions</span>
            <span style={{fontSize:12,color:GRAY,marginLeft:8}}>{questions.length} / 39</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className={`btn btn-sm ${aiTab==="manual"?"btn-p":"btn-o"}`} onClick={()=>setAiTab("manual")}>✏️ Manuel</button>
            <button className={`btn btn-sm ${aiTab==="ai"?"btn-p":"btn-o"}`} onClick={()=>setAiTab("ai")}>🤖 IA Assistée</button>
          </div>
        </div>

        {aiTab==="ai"&&(
          <div style={{background:GS,border:"1px solid rgba(26,58,143,0.15)",borderRadius:11,padding:16,marginBottom:14}}>
            <p style={{fontSize:13,color:DARK,marginBottom:10}}>L'IA va générer automatiquement <strong>39 questions</strong> adaptées au TCF Canada pour la série "<strong>{title||"..."}</strong>".</p>
            <button className="btn btn-p" onClick={generateWithAI} disabled={aiLoading}>
              {aiLoading?<><Spinner sm/> Génération en cours…</>:"🤖 Générer 39 questions avec l'IA"}
            </button>
            {questions.length>0&&<p style={{fontSize:11,color:"#059669",marginTop:8}}>✓ {questions.length} questions prêtes. Vous pouvez les modifier manuellement ci-dessous.</p>}
          </div>
        )}

        {aiTab==="manual"&&(
          <button className="btn btn-o btn-sm" onClick={addQuestion} disabled={questions.length>=39} style={{marginBottom:12}}>
            + Ajouter une question
          </button>
        )}

        <div style={{maxHeight:400,overflowY:"auto",paddingRight:4}}>
          {questions.map((q,i)=>(
            <QuestionEditor key={q.id} question={q} index={i} type={type}
              onChange={updated=>setQs(qs=>qs.map(qq=>qq.id===q.id?updated:qq))}
              onRemove={()=>setQs(qs=>qs.filter(qq=>qq.id!==q.id))}/>
          ))}
        </div>

        {questions.length===0&&(
          <div style={{textAlign:"center",padding:"28px 0",color:GRAY,fontSize:13}}>
            Aucune question. Ajoutez-en manuellement ou utilisez l'IA.
          </div>
        )}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16,borderTop:`1px solid ${BORDER}`,paddingTop:14}}>
        <button className="btn btn-o" onClick={onCancel}>Annuler</button>
        <button className="btn btn-p" onClick={save}>💾 {isEdit?"Enregistrer":"Créer la série"}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JSON IMPORT ZONE
═══════════════════════════════════════════════════════════════ */
function JsonImportZone({onImport}) {
  const fileRef = useRef();
  const [dragging,setDragging] = useState(false);
  const [preview,setPreview]   = useState(null);
  const [error,setError]       = useState("");

  const parse = text => {
    try {
      const data = JSON.parse(text.replace(/```json|```/g,"").trim());
      const arr  = Array.isArray(data)?data:[data];
      setPreview(arr);
      setError("");
    } catch {
      setError("JSON invalide. Vérifiez le format du fichier.");
      setPreview(null);
    }
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ev => parse(ev.target.result);
    reader.readAsText(f);
  };

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ev => parse(ev.target.result);
    reader.readAsText(f);
  };

  return (
    <div>
      <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
        style={{border:`2px dashed ${dragging?BLUE:BORDER}`,borderRadius:12,padding:24,textAlign:"center",background:dragging?"rgba(26,58,143,0.04)":BG,cursor:"pointer",transition:"all .18s"}}
        onClick={()=>fileRef.current.click()}>
        <div style={{fontSize:32,marginBottom:8}}>📁</div>
        <div style={{fontSize:13,fontWeight:600,color:DARK,marginBottom:3}}>Glissez un fichier JSON ici</div>
        <div style={{fontSize:11,color:GRAY}}>ou cliquez pour parcourir · Format : [{"{type, title, premium, questions:[...]}"}]</div>
      </div>
      <input ref={fileRef} type="file" accept=".json,application/json" style={{display:"none"}} onChange={handleFile}/>

      {error&&<div style={{marginTop:10,fontSize:12,color:"#dc2626",background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:8,padding:"8px 12px"}}>{error}</div>}

      {preview&&(
        <div style={{marginTop:12,background:"rgba(5,150,105,0.06)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#059669",marginBottom:8}}>✓ {preview.length} série(s) détectée(s) :</div>
          {preview.slice(0,5).map((s,i)=>(
            <div key={i} style={{fontSize:11,color:DARK,marginBottom:3}}>• [{s.type||"?"}] {s.title||"Sans titre"} — {s.questions?.length||0} questions {s.premium?"⭐":""}</div>
          ))}
          {preview.length>5&&<div style={{fontSize:11,color:GRAY}}>…et {preview.length-5} autre(s)</div>}
          <button className="btn btn-p btn-sm" onClick={()=>{onImport(preview);setPreview(null);}} style={{marginTop:10}}>
            ✅ Importer ces {preview.length} série(s)
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN SUB-EDITORS: SiteConfig, Avantages, Packs
═══════════════════════════════════════════════════════════════ */
function AdminSiteConfigEditor({siteConfig,onSave}) {
  const [cfg,setCfg] = useState({...INIT_SITE_CONFIG,...siteConfig});
  const upd = (k,v) => setCfg(c=>({...c,[k]:v}));
  const F = ({label,k,multi}) => (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
      {multi
        ?<textarea className="inp" value={cfg[k]||""} onChange={e=>upd(k,e.target.value)} rows={2}/>
        :<input className="inp" value={cfg[k]||""} onChange={e=>upd(k,e.target.value)}/>}
    </div>
  );
  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:14}}>🌐 Configuration générale</h3>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🏠 Identité du site</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="Nom du site" k="siteName"/>
          <F label="Slogan" k="tagline"/>
          <F label="Badge hero" k="heroBadge"/>
          <F label="Copyright footer" k="footerCopyright"/>
          <F label="Texte footer droite" k="footerRight"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🦸 Section Héro</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="Titre ligne 1" k="heroTitle1"/>
          <F label="Titre ligne 2" k="heroTitle2"/>
          <F label="CTA principal" k="ctaPrimary"/>
          <F label="CTA secondaire" k="ctaSecondary"/>
        </div>
        <F label="Sous-titre héro" k="heroSubtitle" multi/>
        <div style={{fontSize:11,fontWeight:700,color:DARK,marginBottom:8,marginTop:4,textTransform:"uppercase",letterSpacing:.4}}>Statistiques</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          <F label="Stat 1 valeur" k="stat1Val"/>
          <F label="Stat 1 label" k="stat1Label"/>
          <F label="Stat 2 valeur" k="stat2Val"/>
          <F label="Stat 2 label" k="stat2Label"/>
          <F label="Stat 3 valeur" k="stat3Val"/>
          <F label="Stat 3 label" k="stat3Label"/>
          <F label="Stat 4 valeur" k="stat4Val"/>
          <F label="Stat 4 label" k="stat4Label"/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:DARK,marginBottom:8,marginTop:8,textTransform:"uppercase",letterSpacing:.4}}>Badges de confiance</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <F label="Badge 1" k="trust1"/>
          <F label="Badge 2" k="trust2"/>
          <F label="Badge 3" k="trust3"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>📦 Sections page d'accueil</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="Description CE" k="ceDesc"/>
          <F label="Description CO" k="coDesc"/>
          <F label="Titre avantages" k="avantagesTitle"/>
          <F label="Sous-titre avantages" k="avantagesSubtitle"/>
          <F label="Titre packs" k="packsTitle"/>
          <F label="Sous-titre packs" k="packsSubtitle"/>
          <F label="Titre témoignages" k="testimonialsTitle"/>
          <F label="Sous-titre témoignages" k="testimonialsSubtitle"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🎯 CTA final</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="Titre CTA final" k="ctaFinalTitle"/>
          <F label="Texte CTA final" k="ctaFinalDesc"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🚀 Services Coming Soon</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="Titre section" k="comingSoonTitle"/>
          <F label="Sous-titre section" k="comingSoonSubtitle"/>
        </div>
        <div style={{background:"rgba(160,25,126,0.06)",border:"1px solid rgba(160,25,126,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:"#a0197e",marginBottom:8,textTransform:"uppercase"}}>📄 Générateur de CV</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <F label="Titre" k="cvTitle"/>
            <F label="Description" k="cvDesc"/>
          </div>
        </div>
        <div style={{background:"rgba(5,150,105,0.06)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#059669",marginBottom:8,textTransform:"uppercase"}}>💼 HireMe — Emploi IA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <F label="Titre" k="hiremeTitle"/>
            <F label="Description" k="hiremeDesc"/>
          </div>
        </div>
      </div>

      <button className="btn btn-p btn-sm" onClick={()=>onSave(cfg)}>💾 Enregistrer toute la configuration</button>
    </div>
  );
}

function AdminAvantagesEditor({avantages,onSave}) {
  const [items,setItems] = useState([...avantages]);
  const upd = (i,k,v) => setItems(arr=>arr.map((a,idx)=>idx===i?{...a,[k]:v}:a));
  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>⭐ Nos Avantages ({items.length}/6)</h3>
        {items.length<6&&<button className="btn btn-o btn-sm" onClick={()=>setItems(a=>[...a,{icon:"🔧",title:"Nouvel avantage",desc:"Description"}])}>+ Ajouter</button>}
      </div>
      {items.map((av,i)=>(
        <div key={i} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px",marginBottom:9,display:"grid",gridTemplateColumns:"60px 1fr 1fr auto",gap:10,alignItems:"center"}}>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Icône</label>
            <input className="inp" value={av.icon} onChange={e=>upd(i,"icon",e.target.value)} style={{fontSize:18,textAlign:"center",padding:"5px"}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Titre</label>
            <input className="inp" value={av.title} onChange={e=>upd(i,"title",e.target.value)} style={{fontSize:12}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Description</label>
            <input className="inp" value={av.desc} onChange={e=>upd(i,"desc",e.target.value)} style={{fontSize:12}}/>
          </div>
          <button onClick={()=>setItems(a=>a.filter((_,idx)=>idx!==i))} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:13}}>✕</button>
        </div>
      ))}
      <button className="btn btn-p btn-sm" onClick={()=>onSave(items)} style={{marginTop:8}}>💾 Enregistrer les avantages</button>
    </div>
  );
}

function AdminTestimonialsEditor({testimonials,onSave}) {
  const [items,setItems] = useState([...testimonials]);
  const upd = (i,k,v) => setItems(arr=>arr.map((t,idx)=>idx===i?{...t,[k]:v}:t));
  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>💬 Témoignages ({items.length})</h3>
        <button className="btn btn-o btn-sm" onClick={()=>setItems(a=>[...a,{name:"Prénom N.",pays:"🌍",level:"B1→B2",text:"Témoignage ici…"}])}>+ Ajouter</button>
      </div>
      {items.map((t,i)=>(
        <div key={i} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px",marginBottom:9}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 60px 80px auto",gap:9,marginBottom:8,alignItems:"center"}}>
            <div>
              <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Nom</label>
              <input className="inp" value={t.name} onChange={e=>upd(i,"name",e.target.value)} style={{fontSize:12}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Drapeau</label>
              <input className="inp" value={t.pays} onChange={e=>upd(i,"pays",e.target.value)} style={{fontSize:16,textAlign:"center",padding:"5px"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Niveau (ex: B1→B2)</label>
              <input className="inp" value={t.level} onChange={e=>upd(i,"level",e.target.value)} style={{fontSize:11}}/>
            </div>
            <button onClick={()=>setItems(a=>a.filter((_,idx)=>idx!==i))} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:13,marginTop:16}}>✕</button>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Témoignage</label>
            <textarea className="inp" value={t.text} onChange={e=>upd(i,"text",e.target.value)} rows={2} style={{fontSize:12}}/>
          </div>
        </div>
      ))}
      <button className="btn btn-p btn-sm" onClick={()=>onSave(items)} style={{marginTop:4}}>💾 Enregistrer les témoignages</button>
    </div>
  );
}

function AdminPacksEditor({packs,onSave}) {
  const [items,setItems] = useState(JSON.parse(JSON.stringify(packs)));
  const updPack = (i,k,v) => setItems(arr=>arr.map((p,idx)=>idx===i?{...p,[k]:v}:p));
  const updFeature = (pi,fi,v) => setItems(arr=>arr.map((p,idx)=>idx===pi?{...p,features:p.features.map((f,fIdx)=>fIdx===fi?v:f)}:p));
  const addFeature = pi => setItems(arr=>arr.map((p,idx)=>idx===pi?{...p,features:[...p.features,""]}:p));
  const removeFeature = (pi,fi) => setItems(arr=>arr.map((p,idx)=>idx===pi?{...p,features:p.features.filter((_,fIdx)=>fIdx!==fi)}:p));

  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:16}}>📦 Packs de Révision</h3>
      {items.map((pack,i)=>(
        <div key={pack.id} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:pack.color,flexShrink:0}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:DARK}}>{pack.name}</span>
            <label style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto",fontSize:12,cursor:"pointer"}}>
              <input type="checkbox" checked={pack.highlight} onChange={e=>updPack(i,"highlight",e.target.checked)}/> Mis en avant
            </label>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9,marginBottom:10}}>
            {[["Nom",pack.name,"name"],["Prix (ex: 29.99)",pack.price,"price"],["Accès (ex: 1 Mois)",pack.acces,"acces"],["Couleur (#hex)",pack.color,"color"]].map(([l,v,k])=>(
              <div key={k}>
                <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3,textTransform:"uppercase"}}>{l}</label>
                <input className="inp" value={v} onChange={e=>updPack(i,k,e.target.value)} style={{fontSize:12}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:8}}>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3,textTransform:"uppercase"}}>Bonus</label>
            <input className="inp" value={pack.bonus||""} onChange={e=>updPack(i,"bonus",e.target.value)} style={{fontSize:12}}/>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <label style={{fontSize:10,color:GRAY,textTransform:"uppercase",fontWeight:700}}>Fonctionnalités</label>
              <button className="btn btn-o btn-sm" onClick={()=>addFeature(i)} style={{fontSize:10,padding:"3px 9px"}}>+ Ajouter</button>
            </div>
            {pack.features.map((f,fi)=>(
              <div key={fi} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                <input className="inp" value={f} onChange={e=>updFeature(i,fi,e.target.value)} style={{fontSize:11,flex:1}}/>
                <button onClick={()=>removeFeature(i,fi)} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11,flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-p btn-sm" onClick={()=>onSave(items)}>💾 Enregistrer les packs</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════════════════════════ */
function AdminPanel({users,setUsers,series,setSeries,siteConfig,setSiteConfig,packs,setPacks,avantages,setAvantages,testimonials,setTestimonials,onLogout}) {
  const [tab,  setTab]   = useState("dashboard");
  const [modal,setModal] = useState(null);
  const [search,setSearch]=useState("");
  const [toast,showToast]=useToast();

  // Charger users et séries depuis la DB dès que l'admin s'ouvre
  useEffect(()=>{
    apiGet("/api/users").then(d=>{ if(Array.isArray(d)) setUsers(d); });
    apiGet("/api/series").then(d=>{ if(Array.isArray(d)&&d.length>0) setSeries(d); });
  },[]);

  const ceSeries = series.filter(s=>s.type==="CE");
  const coSeries = series.filter(s=>s.type==="CO");

  const saveSerie = async (obj) => {
    const res = await apiPost("/api/series", obj);
    if(res && !res.error){
      setSeries(prev=>{
        const exists=prev.find(s=>s.id===obj.id);
        return exists ? prev.map(s=>s.id===obj.id?obj:s) : [...prev,obj];
      });
      setModal(null);
      showToast(modal?.type==="edit"?"Série mise à jour !":"Série créée !");
    } else {
      showToast("Erreur lors de la sauvegarde.","error");
    }
  };

  const deleteSerie = async (id) => {
    const res = await apiDel(`/api/series/${id}`);
    if(res && !res.error){
      setSeries(prev=>prev.filter(s=>s.id!==id));
      setModal(null);
      showToast("Série supprimée.","info");
    } else {
      showToast("Erreur lors de la suppression.","error");
    }
  };

  const updateUser=(id,changes)=>{
    apiPut(`/api/users/${id}`,changes)
      .then(()=>{
        setUsers(prev=>prev.map(u=>u.id===id?{...u,...changes}:u));
        showToast("Utilisateur mis à jour.");
      });
  };
  const deleteUser=id=>{
    apiDel(`/api/users/${id}`)
      .then(()=>{
        setUsers(prev=>prev.filter(u=>u.id!==id));
        showToast("Utilisateur supprimé.","info");
      })
      .catch(()=>showToast("Erreur lors de la suppression.","error"));
  };

  const SeriesTable = ({list,typeLabel,typeKey}) => (
    <div style={{marginBottom:32}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:DARK}}>{typeKey==="CE"?"📖":"🎧"} {typeLabel} <span style={{fontSize:14,color:GRAY,fontWeight:400}}>({list.length}/40)</span></h3>
          <p style={{fontSize:12,color:GRAY}}>{list.filter(s=>!s.premium).length} gratuites · {list.filter(s=>s.premium).length} premium</p>
        </div>
        <button className="btn btn-p btn-sm" onClick={()=>setModal({type:"create",serieType:typeKey})}>+ Nouvelle série</button>
      </div>
      {list.length===0 ? (
        <div style={{textAlign:"center",padding:"28px",background:"#fff",border:`1.5px dashed ${BORDER}`,borderRadius:12,color:GRAY,fontSize:13}}>
          Aucune série. Cliquez sur "+ Nouvelle série" pour commencer.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {list.map((s,i)=>(
            <div key={s.id} style={{background:"#fff",border:`1.5px solid ${BORDER}`,borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:8,background:GS,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:BLUE,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:600,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</span>
                  <span className="tag" style={{background:s.premium?G:"rgba(5,150,105,0.1)",color:s.premium?"#fff":"#059669",fontSize:9,flexShrink:0}}>{s.premium?"⭐ Premium":"Gratuit"}</span>
                </div>
                <div style={{fontSize:11,color:GRAY}}>{s.questions?.length||0} questions · {typeKey==="CE"?"60 min":"35 min"} · 699 pts{s.audioUrl?" · 🎧 Audio":"" }</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>setModal({type:"edit",serie:s,serieType:typeKey})} style={{padding:"5px 10px",border:`1.5px solid ${BORDER}`,borderRadius:7,background:"#fff",fontSize:11,cursor:"pointer",color:GRAY,fontFamily:"'DM Sans',sans-serif"}}>✏️ Modifier</button>
                <button onClick={()=>setModal({type:"delete",serie:s})} style={{padding:"5px 10px",border:"1.5px solid rgba(220,38,38,0.3)",borderRadius:7,background:"rgba(220,38,38,0.05)",fontSize:11,cursor:"pointer",color:"#dc2626",fontFamily:"'DM Sans',sans-serif"}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ADMIN_NAV = [
    {id:"dashboard",icon:"📊",label:"Tableau de bord"},
    {id:"series",   icon:"📋",label:"Gestion des séries"},
    {id:"users",    icon:"👥",label:"Utilisateurs"},
    {id:"settings", icon:"⚙️",label:"Paramètres"},
  ];

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>
      {toast&&<Toast {...toast}/>}

      {/* SIDEBAR — desktop only */}
      <aside className="sidebar-desktop" style={{width:220,background:"#060e1a",display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,0.05)",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:7,background:G,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:10,fontFamily:"'Playfair Display',serif"}}>PC</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:"#fff"}}>Passeport Carrière</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:.5}}>ADMINISTRATION</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"8px 0"}}>
          {ADMIN_NAV.map(n=>(
            <button key={n.id} className={`sidebar-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
              <span style={{fontSize:14}}>{n.icon}</span>
              <span style={{fontSize:12,fontWeight:tab===n.id?600:400,color:tab===n.id?"#fff":"rgba(255,255,255,0.4)"}}>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:6}}>admin@passeportcarriere.ca</div>
          <button className="btn btn-ghost" onClick={onLogout} style={{width:"100%",fontSize:11,padding:"7px"}}>← Déconnexion</button>
        </div>
      </aside>

      {/* BOTTOM NAV — mobile only */}
      <nav className="bottom-nav">
        {ADMIN_NAV.map(n=>(
          <button key={n.id} className={`bottom-nav-btn${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)}>
            <span>{n.icon}</span>
            <span>{n.label.split(" ")[0]}</span>
          </button>
        ))}
        <button className="bottom-nav-btn" onClick={onLogout}>
          <span>🚪</span>
          <span>Quitter</span>
        </button>
      </nav>

      {/* CONTENT */}
      <main className="main-content" style={{flex:1,overflowY:"auto",background:BG}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div style={{padding:"24px 16px"}}>
            <div className="fu" style={{marginBottom:20}}>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:DARK,marginBottom:2}}>Tableau de bord</h1>
              <p style={{fontSize:12,color:GRAY}}>Passeport Carrière — Administration</p>
            </div>
            <div className="admin-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
              {[
                {icon:"👥",val:users.length,label:"Utilisateurs",sub:`${users.filter(u=>u.plan==="premium").length} premium`,color:"#1a3a8f"},
                {icon:"📖",val:ceSeries.length,label:"Séries CE",sub:`${ceSeries.filter(s=>!s.premium).length} gratuites`,color:BLUE},
                {icon:"🎧",val:coSeries.length,label:"Séries CO",sub:`${coSeries.filter(s=>!s.premium).length} gratuites`,color:MAG},
                {icon:"📋",val:series.reduce((a,s)=>a+(s.questions?.length||0),0),label:"Questions",sub:"CE + CO",color:"#7c3aed"},
              ].map((s,i)=>(
                <div key={i} className="card fu" style={{animationDelay:`${i*.06}s`,padding:14,cursor:"default"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:18}}>{s.icon}</span><div style={{width:6,height:6,borderRadius:"50%",background:s.color,marginTop:2}}/></div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:s.color,marginBottom:1}}>{s.val}</div>
                  <div style={{fontSize:11,fontWeight:600,color:DARK,marginBottom:1}}>{s.label}</div>
                  <div style={{fontSize:10,color:GRAY}}>{s.sub}</div>
                </div>
              ))}
            </div>
            {/* Quick actions */}
            <div className="card" style={{padding:16,marginBottom:12}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:DARK,marginBottom:10}}>Actions rapides</h3>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className="btn btn-p btn-sm" onClick={()=>{setTab("series");setTimeout(()=>setModal({type:"create",serieType:"CE"}),100);}}>+ Série CE</button>
                <button className="btn btn-p btn-sm" onClick={()=>{setTab("series");setTimeout(()=>setModal({type:"create",serieType:"CO"}),100);}}>+ Série CO</button>
                <button className="btn btn-o btn-sm" onClick={()=>setTab("users")}>👥 Utilisateurs</button>
              </div>
            </div>
            {/* Progression bars */}
            <div className="card" style={{padding:16}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:DARK,marginBottom:10}}>Progression des séries</h3>
              {[["CE","📖",ceSeries.length,BLUE],["CO","🎧",coSeries.length,MAG]].map(([type,icon,count,color])=>(
                <div key={type} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:13,color:DARK}}>{icon} Compréhension {type==="CE"?"Écrite":"Orale"}</span>
                    <span style={{fontSize:13,fontWeight:700,color}}>{count}/40</span>
                  </div>
                  <div style={{height:7,background:BG,borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(count/40)*100}%`,background:color,borderRadius:4,transition:"width .5s"}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERIES MANAGEMENT */}
        {tab==="series"&&(
          <div style={{padding:"24px 16px"}}>
            <div className="fu" style={{marginBottom:24}}>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:3}}>Gestion des Séries</h1>
              <p style={{fontSize:13,color:GRAY}}>Créez, modifiez et organisez les séries TCF Canada</p>
            </div>
            <SeriesTable list={ceSeries} typeLabel="Compréhension Écrite" typeKey="CE"/>
            <SeriesTable list={coSeries} typeLabel="Compréhension Orale" typeKey="CO"/>
          </div>
        )}

        {/* USERS */}
        {tab==="users"&&(
          <div style={{padding:"24px 16px"}}>
            <div className="fu" style={{marginBottom:20}}>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:3}}>Utilisateurs</h1>
              <p style={{fontSize:13,color:GRAY}}>{users.length} comptes enregistrés</p>
            </div>
            <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,padding:"9px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:GRAY}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou email…" style={{flex:1,border:"none",outline:"none",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:DARK,background:"transparent"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {users.filter(u=>u.nom.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())).map(u=>{
                const p=getPays(u.pays);
                return(
                  <div key={u.id} style={{background:"#fff",border:`1.5px solid ${u.status==="suspendu"?"rgba(220,38,38,0.2)":BORDER}`,borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:u.plan==="premium"?G:GS,display:"flex",alignItems:"center",justifyContent:"center",color:u.plan==="premium"?"#fff":BLUE,fontWeight:700,fontSize:12,flexShrink:0}}>{u.nom.charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                        <span style={{fontSize:13,fontWeight:700,color:DARK}}>{u.nom}</span>
                        <span className="tag" style={{background:u.plan==="premium"?G:"rgba(90,101,119,0.1)",color:u.plan==="premium"?"#fff":GRAY,fontSize:9}}>{u.plan==="premium"?"⭐ Premium":"Free"}</span>
                        <span className="tag" style={{background:u.status==="actif"?"rgba(5,150,105,0.09)":"rgba(220,38,38,0.09)",color:u.status==="actif"?"#059669":"#dc2626",fontSize:9}}>{u.status}</span>
                      </div>
                      <div style={{fontSize:11,color:GRAY}}>✉ {u.email} · {p.flag} {p.name} · {u.joined}</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                      <select value={u.plan} onChange={e=>updateUser(u.id,{plan:e.target.value})} style={{padding:"4px 6px",border:`1.5px solid ${BORDER}`,borderRadius:7,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff"}}>
                        <option value="free">Free</option>
                        <option value="premium">Premium ⭐</option>
                      </select>
                      <select value={u.status} onChange={e=>updateUser(u.id,{status:e.target.value})} style={{padding:"4px 6px",border:`1.5px solid ${BORDER}`,borderRadius:7,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff"}}>
                        <option value="actif">✅ Actif</option>
                        <option value="suspendu">🚫 Suspendu</option>
                      </select>
                      <button onClick={()=>deleteUser(u.id)} style={{padding:"4px 8px",border:"1.5px solid rgba(220,38,38,0.3)",borderRadius:7,background:"rgba(220,38,38,0.05)",fontSize:11,cursor:"pointer",color:"#dc2626",fontFamily:"'DM Sans',sans-serif"}}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab==="settings"&&(
          <div style={{padding:"24px 16px",maxWidth:820}}>
            <div className="fu" style={{marginBottom:24}}>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:3}}>Paramètres du site</h1>
              <p style={{fontSize:13,color:GRAY}}>Personnalisez le contenu de la page d'accueil en temps réel</p>
            </div>

            {/* JSON Import */}
            <div className="card" style={{padding:22,marginBottom:18,border:`1.5px solid rgba(26,58,143,0.2)`}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:5}}>📥 Import JSON — Séries & Exercices</h3>
              <p style={{fontSize:12,color:GRAY,lineHeight:1.65,marginBottom:14}}>
                Format attendu : <code style={{background:BG,padding:"1px 6px",borderRadius:4,fontSize:11}}>{"[{type,title,premium,questions:[...]}]"}</code>
              </p>
              <JsonImportZone onImport={async (imported)=>{
                let added=0;
                const toAdd=[];
                imported.forEach(s=>{
                  if(s.type&&s.title&&Array.isArray(s.questions)){
                    const obj={...s,id:s.id||`${s.type.toLowerCase()}-${Date.now()}-${added}`};
                    toAdd.push(obj);
                    added++;
                  }
                });
                if(toAdd.length===0){showToast("Aucune série valide trouvée.","error");return;}

                // Envoyer chaque série au backend
                let saved=0;
                showToast(`Envoi de ${toAdd.length} série(s) au serveur…`,"info");
                for(const obj of toAdd){
                  const res = await apiPost("/api/series", obj);
                  if(res && !res.error) saved++;
                }

                // Recharger les séries depuis la DB
                apiGet("/api/series").then(d=>{if(Array.isArray(d)&&d.length>0)setSeries(d);});

                if(saved>0) showToast(`✅ ${saved} série(s) sauvegardée(s) en base de données !`);
                else showToast("Erreur lors de la sauvegarde.","error");
              }}/>
              <div style={{marginTop:12}}>
                <button className="btn btn-o btn-sm" onClick={()=>{
                  const a=document.createElement("a");a.href="data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(series,null,2));a.download="pc-series.json";a.click();showToast("Export JSON téléchargé !");
                }}>⬇ Exporter {series.length} série(s) en JSON</button>
              </div>
            </div>

            {/* ── CONFIGURATION GÉNÉRALE ── */}
            <AdminSiteConfigEditor siteConfig={siteConfig} onSave={cfg=>{
              setSiteConfig(cfg);
              apiPut("/api/packs/config", cfg).then(()=>showToast("Configuration sauvegardée !"));
            }}/>
            {/* ── 2 SERVICES COMING SOON ── */}
          <div style={{marginBottom:32}}>
            <div style={{textAlign:"center",marginBottom:22}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:100,background:"rgba(90,101,119,0.1)",border:`1px solid ${BORDER}`,fontSize:11,fontWeight:700,color:GRAY,letterSpacing:.5}}>🚀 PROCHAINEMENT</span>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:DARK,marginTop:10,marginBottom:6}}>De nouveaux services arrivent</h3>
              <p style={{fontSize:13,color:GRAY}}>Votre préparation ne s'arrête pas au TCF — nous construisons votre avenir complet</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              {[
                {icon:"📄",color:"#a0197e",bg:"rgba(160,25,126,0.06)",border:"rgba(160,25,126,0.2)",t:"Générateur de CV",d:"Créez un CV professionnel adapté au marché canadien en quelques minutes, avec l'aide de l'IA.",chips:["IA Rédactrice","4 formats","ATS optimisé"]},
                {icon:"💼",color:"#059669",bg:"rgba(5,150,105,0.06)",border:"rgba(5,150,105,0.2)",t:"HireMe — Emploi IA",d:"Offres d'emploi scorées par IA selon votre profil. Lettre de motivation générée en 1 clic.",chips:["Score compatibilité","Lettre IA","Matching intelligent"]},
              ].map((s,i)=>(
                <div key={i} style={{background:"#fff",border:`1.5px dashed ${s.border}`,borderRadius:16,padding:26,position:"relative",overflow:"hidden",opacity:.75}}>
                  <div style={{position:"absolute",top:12,right:14,background:"rgba(90,101,119,0.1)",borderRadius:100,padding:"3px 10px",fontSize:10,fontWeight:700,color:GRAY,display:"flex",alignItems:"center",gap:4}}>🔒 Coming Soon</div>
                  <div style={{width:48,height:48,borderRadius:13,background:s.bg,border:`1.5px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14}}>{s.icon}</div>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:DARK,marginBottom:6}}>{s.t}</h3>
                  <p style={{fontSize:12,color:GRAY,lineHeight:1.7,marginBottom:12}}>{s.d}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {s.chips.map(c=><span key={c} style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:s.bg,color:s.color,fontWeight:600,border:`1px solid ${s.border}`}}>{c}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── NOS AVANTAGES ── */}
            <AdminAvantagesEditor avantages={avantages} onSave={av=>{
              setAvantages(av);
              apiPut("/api/packs/config",{avantages:JSON.stringify(av)}).then(()=>showToast("Avantages mis à jour !"));
            }}/>
            <AdminTestimonialsEditor testimonials={testimonials} onSave={t=>{
              setTestimonials(t);
              apiPut("/api/packs/config",{testimonials:JSON.stringify(t)}).then(()=>showToast("Témoignages mis à jour !"));
            }}/>

            {/* ── PACKS ── */}
            <AdminPacksEditor packs={packs} onSave={async pk=>{
              setPacks(pk);
              for(const p of pk){
                await apiPut(`/api/packs/${p.id}`,p);
              }
              showToast("Packs mis à jour !");
            }}/>
          </div>
        )}
      </main>

      {/* MODAL — Create/Edit serie */}
      <Modal open={modal?.type==="create"||modal?.type==="edit"} onClose={()=>setModal(null)}
        title={modal?.type==="edit"?`Modifier : ${modal.serie?.title}`:`Nouvelle série — ${modal?.serieType==="CE"?"Compréhension Écrite":"Compréhension Orale"}`}
        width={720}>
        {(modal?.type==="create"||modal?.type==="edit")&&(
          <SerieEditor serie={modal.serie||null} type={modal.serieType||modal.serie?.type} onSave={saveSerie} onCancel={()=>setModal(null)}/>
        )}
      </Modal>

      {/* MODAL — Delete confirm */}
      <Modal open={modal?.type==="delete"} onClose={()=>setModal(null)} title="Supprimer cette série ?" width={380}>
        <p style={{fontSize:13,color:GRAY,lineHeight:1.65,marginBottom:20}}>La série <strong>"{modal?.serie?.title}"</strong> et ses {modal?.serie?.questions?.length||0} questions seront définitivement supprimées.</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn btn-o" onClick={()=>setModal(null)}>Annuler</button>
          <button className="btn btn-danger" onClick={()=>deleteSerie(modal.serie.id)}>🗑 Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen,      setScreen]      = useState("landing");
  const [curUser,     setCurUser]     = useState(null);
  const [users,       setUsers]       = useState([]);
  const [series,      setSeries]      = useState([...SAMPLE_CE,...SAMPLE_CO]);
  const [siteConfig,  setSiteConfig]  = useState(INIT_SITE_CONFIG);
  const [packs,       setPacks]       = useState(INIT_PACKS);
  const [avantages,   setAvantages]   = useState(INIT_AVANTAGES);
  const [testimonials,setTestimonials]= useState(INIT_TESTIMONIALS);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const token = () => localStorage.getItem("pc_token");
  const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("pc_token");
    localStorage.removeItem("pc_session");
    setCurUser(null);
    setScreen("landing");
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      const session = LS.get("pc_session", null);
      if(session) logout();
    }, INACTIVITY_MS);
  }, [logout]);

  // Restaurer la session au refresh
  useEffect(() => {
    // Toujours charger les données publiques depuis le backend
    apiGet("/api/series").then(d=>{ if(Array.isArray(d)&&d.length>0) setSeries(d); });
    apiGet("/api/packs").then(d=>{ if(Array.isArray(d)&&d.length>0) setPacks(d); });
    apiGet("/api/packs/config").then(d=>{
      if(d && typeof d==="object"){
        // siteConfig
        const cfg={...INIT_SITE_CONFIG};
        Object.keys(INIT_SITE_CONFIG).forEach(k=>{ if(d[k]) cfg[k]=d[k]; });
        setSiteConfig(cfg);
        // avantages
        if(d.avantages){ try{ setAvantages(JSON.parse(d.avantages)); }catch{} }
        // testimonials
        if(d.testimonials){ try{ setTestimonials(JSON.parse(d.testimonials)); }catch{} }
      }
    });

    // Restaurer la session
    const session = LS.get("pc_session", null);
    const t = token();
    if(session && t) {
      const lastActivity = session.lastActivity || 0;
      const now = Date.now();
      if(now - lastActivity < INACTIVITY_MS) {
        if(session.isAdmin) {
          setScreen("admin");
          apiGet("/api/users").then(d=>{ if(Array.isArray(d)) setUsers(d); });
        } else if(session.user) {
          setCurUser(session.user);
          setScreen("user");
        }
        resetInactivityTimer();
      } else {
        logout();
      }
    }
  }, []);

  // Écouter les événements d'activité pour reset le timer
  useEffect(() => {
    const events = ["mousedown","mousemove","keydown","touchstart","scroll","click"];
    const handleActivity = () => {
      const session = LS.get("pc_session", null);
      if(session) {
        LS.set("pc_session", {...session, lastActivity: Date.now()});
        resetInactivityTimer();
      }
    };
    events.forEach(e => window.addEventListener(e, handleActivity, {passive:true}));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, [resetInactivityTimer]);

  // Sauvegarder la session quand l'user se connecte
  const loginUser = useCallback((u) => {
    setCurUser(u);
    setScreen("user");
    LS.set("pc_session", {user:u, isAdmin:false, lastActivity:Date.now()});
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const loginAdmin = useCallback(() => {
    setScreen("admin");
    LS.set("pc_session", {user:null, isAdmin:true, lastActivity:Date.now()});
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const logoutUser = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    logout();
  }, [logout]);

  return (
    <>
      <style>{CSS}</style>
      {screen==="landing"  && <LandingPage  onLogin={()=>setScreen("login")} onRegister={()=>setScreen("register")} siteConfig={siteConfig} packs={packs} avantages={avantages} testimonials={testimonials} registerSuccess={registerSuccess} onCloseSuccess={()=>setRegisterSuccess(false)}/>}
      {screen==="login"    && <LoginPage    users={users} onSuccess={loginUser} onAdminLogin={loginAdmin} onRegister={()=>setScreen("register")}/>}
      {screen==="register" && <RegisterPage users={users} setUsers={setUsers} onSuccess={()=>{setRegisterSuccess(true);setScreen("landing");}} onLogin={()=>setScreen("login")}/>}
      {screen==="user"     && curUser && <UserDashboard user={curUser} series={series} setSeries={setSeries} setUsers={setUsers} onLogout={logoutUser}/>}
      {screen==="admin"    && <AdminPanel   users={users} setUsers={setUsers} series={series} setSeries={setSeries} siteConfig={siteConfig} setSiteConfig={setSiteConfig} packs={packs} setPacks={setPacks} avantages={avantages} setAvantages={setAvantages} testimonials={testimonials} setTestimonials={setTestimonials} onLogout={logoutUser}/>}
    </>
  );
}