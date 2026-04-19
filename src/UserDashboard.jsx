import { useState, useEffect, useRef, useCallback } from "react";
import { G, GS, BLUE, MAG, DARK, GRAY, BORDER, BG, CSS, Grad, Spinner, Modal, Toast, RANK_LABELS, CV_QUOTAS, getPays, API, apiGet, apiPost, formatTime } from "./constants.jsx";
import { SeriesList, ExamEngine } from "./ExamEngine.jsx";
import PaymentModal from "./PaymentModal.jsx";
import ProfilTab from "./ProfilTab.jsx";
import GenerateurCV from "./GenerateurCV.jsx";

function UserDashboard({user,onLogout,series,setSeries,setUsers}) {
  const [tab,setTab]         = useState("home");
  const [activeSerie,setActiveSerie] = useState(null);
  const [examType,setExamType]       = useState(null);
  const [attempts,setAttempts]       = useState({});
  const [showPayment,setShowPayment] = useState(false);
  const isPremium = user.plan==="premium";

  // Ping toutes les 60s pour tracker le temps de session
  useEffect(()=>{
    const ping = setInterval(()=>{
      apiPost("/api/users/session/ping",{}).catch(()=>{});
    }, 60000);
    // Ping au fermeture de l'onglet
    const handleUnload = () => { apiPost("/api/users/session/end",{}).catch(()=>{}); };
    window.addEventListener("beforeunload", handleUnload);
    return ()=>{ clearInterval(ping); window.removeEventListener("beforeunload", handleUnload); };
  },[]);
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

  const [serieLoading, setSerieLoading] = useState(false);
  const [serieError,   setSerieError]   = useState(null);

  const startSerie = async (serie, type) => {
    setSerieError(null);
    console.log("[PC] startSerie →", serie.id, "| questions:", serie.questions?.length, "| type:", serie.type || type);

    // Cas 1 : questions déjà en mémoire → on lance directement
    if(serie.questions && serie.questions.length > 0){
      const s = {...serie, type: serie.type || type};
      console.log("[PC] Cas 1 — questions en mémoire, setActiveSerie →", s.id, s.questions.length, "questions");
      setActiveSerie(s);
      setExamType(type);
      return;
    }
    // Cas 2 : besoin de charger depuis le backend
    console.log("[PC] Cas 2 — fetch /api/series/", serie.id);
    setSerieLoading(true);
    try {
      const full = await apiGet(`/api/series/${serie.id}`);
      setSerieLoading(false);
      console.log("[PC] Réponse backend →", full?.id, "| questions:", full?.questions?.length, "| error:", full?.error);
      if(full && !full.error && Array.isArray(full.questions) && full.questions.length > 0){
        const enriched = {...full, type: full.type || type};
        setActiveSerie(enriched);
        setExamType(type);
        setSeries(prev=>prev.map(s=>s.id===serie.id ? enriched : s));
      } else if(full && full.error) {
        setSerieError(full.error);
      } else {
        // Tentative de rechargement global des séries puis retry
        const all = await apiGet("/api/series");
        if(Array.isArray(all) && all.length > 0){
          setSeries(all);
          const found = all.find(s=>s.id===serie.id);
          if(found && found.questions && found.questions.length > 0){
            setActiveSerie({...found, type: found.type || type});
            setExamType(type);
            return;
          }
        }
        setSerieError("Les questions de cette série sont introuvables. Vérifiez l'import JSON.");
      }
    } catch(e) {
      setSerieLoading(false);
      console.error("[PC] Erreur startSerie:", e);
      setSerieError("Impossible de contacter le serveur. Vérifiez votre connexion.");
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
    {id:"cv",     icon:"📄", label:"Générateur CV"},
    {id:"emploi", icon:"🤖", label:"Emploi IA",     soon:true},
    {id:"profil", icon:"👤", label:"Mon profil"},
  ];

  // In exam mode
  if(serieLoading) {
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{width:44,height:44,border:`4px solid ${BORDER}`,borderTop:`4px solid ${BLUE}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
        <div style={{fontSize:14,color:GRAY}}>Chargement de la série…</div>
      </div>
    );
  }

  if(serieError) {
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{background:"#fff",border:`1.5px solid rgba(220,38,38,0.25)`,borderRadius:16,padding:"36px 32px",maxWidth:420,width:"100%",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:44,marginBottom:14}}>❌</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:DARK,marginBottom:8}}>Impossible de lancer la série</h2>
          <p style={{fontSize:13,color:GRAY,marginBottom:24,lineHeight:1.6}}>{serieError}</p>
          <button className="btn btn-p" onClick={()=>setSerieError(null)}>← Retour aux séries</button>
        </div>
      </div>
    );
  }

  if(activeSerie) {
    return (
      <div style={{minHeight:"100vh",background:BG,fontFamily:"'DM Sans',sans-serif"}}>
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
              {/* CV — ACTIF */}
              <div className="card card-h" onClick={()=>setTab("cv")} style={{padding:22,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:G}}/>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(160,25,126,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:12}}>📄</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:4}}>Générateur CV</div>
                <p style={{fontSize:12,color:GRAY,marginBottom:10}}>Modèle canadien · Bilingue FR/EN</p>
                <span className="tag" style={{background:"rgba(5,150,105,0.1)",color:"#059669",fontSize:10}}>✅ Disponible</span>
              </div>
              {/* EE, EO, Emploi — Coming Soon */}
              {[{id:"ee",icon:"✍️",t:"Expression Écrite"},{id:"eo",icon:"🗣️",t:"Expression Orale"},{id:"emploi",icon:"🤖",t:"Emploi IA"}].map((c,i)=>(
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
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>Passez à Premium</div>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>Toutes les séries débloquées · Générateur CV · Accès prioritaire</p>
                </div>
                <button className="btn" onClick={()=>setShowPayment(true)} style={{background:"#fff",color:BLUE,fontSize:12,fontWeight:700,padding:"9px 18px",whiteSpace:"nowrap"}}>Upgrader ⭐</button>
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

        {/* Générateur CV */}
        {tab==="cv"&&(
          <GenerateurCV user={user} isPremium={isPremium}/>
        )}

        {/* Coming Soon — Emploi, EE, EO */}
        {(tab==="emploi"||tab==="ee"||tab==="eo")&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",padding:32,textAlign:"center"}}>
            <div style={{fontSize:64,marginBottom:20}}>{tab==="emploi"?"🤖":tab==="ee"?"✍️":"🗣️"}</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:DARK,marginBottom:10}}>
              {tab==="emploi"?"Emploi IA":tab==="ee"?"Expression Écrite":"Expression Orale"} — <Grad>Bientôt</Grad>
            </h2>
            <p style={{fontSize:14,color:GRAY,maxWidth:420,lineHeight:1.75}}>
              Ce module est en cours de développement et sera disponible prochainement.
            </p>
            <div style={{marginTop:24,background:GS,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 20px",fontSize:12,color:BLUE,fontWeight:600}}>
              🚀 Nous travaillons activement dessus — restez connecté !
            </div>
          </div>
        )}

        {/* Profil — Editable */}
        {tab==="profil"&&(
          <ProfilTab user={user} isPremium={isPremium} attempts={attempts} onUpgrade={()=>setShowPayment(true)} onUpdate={updatedUser=>{
            apiPut("/api/users/me", updatedUser).then(()=>{
              setUsers(prev=>prev.map(u=>u.id===updatedUser.id?updatedUser:u));
            });
          }}/>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
