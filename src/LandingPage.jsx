import { useState } from "react";
import { G, GS, BLUE, MAG, DARK, GRAY, BORDER, BG, LANDING_CSS, Grad, CV_QUOTAS, RANK_LABELS, INIT_PACKS, calcScore, INIT_AVANTAGES, INIT_TESTIMONIALS, INIT_SITE_CONFIG } from "./constants.jsx";

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


          {/* ── SERVICES PREMIUM ── */}
          <div style={{marginBottom:40}}>
            <div style={{textAlign:"center",marginBottom:22}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:100,background:"rgba(5,150,105,0.1)",border:"1px solid rgba(5,150,105,0.25)",fontSize:11,fontWeight:700,color:"#059669",letterSpacing:.5}}>✅ SERVICES PREMIUM</span>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:DARK,marginTop:10,marginBottom:6}}>Boostez votre candidature au Canada</h3>
              <p style={{fontSize:13,color:GRAY}}>Des outils professionnels inclus dans vos packs pour maximiser vos chances</p>
            </div>
            <div className="coming-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              {[
                {
                  icon:"📄", color:"#a0197e", bg:"rgba(160,25,126,0.06)", border:"rgba(160,25,126,0.2)",
                  t: cfg.cvTitle || "Générateur de CV",
                  d: cfg.cvDesc || "Créez un CV professionnel au format canadien en quelques minutes. Modèle bilingue FR/EN, optimisé ATS, noir total avec option couleur.",
                  chips:["Modèle canadien","Bilingue FR/EN","ATS optimisé"],
                  badge:"✅ Disponible", badgeBg:"rgba(5,150,105,0.1)", badgeColor:"#059669",
                  quotas:"Bronze 3 · Silver 10 · Gold 30 générations",
                },
                {
                  icon:"💼", color:"#059669", bg:"rgba(5,150,105,0.06)", border:"rgba(5,150,105,0.2)",
                  t: cfg.hiremeTitle || "HireMe — Emploi IA",
                  d: cfg.hiremeDesc || "Offres d'emploi scorées par IA selon votre profil. Lettre de motivation générée en 1 clic. Matching intelligent avec le marché canadien.",
                  chips:["Score compatibilité","Lettre IA","Matching intelligent"],
                  badge:"🚀 Bientôt", badgeBg:"rgba(90,101,119,0.1)", badgeColor:GRAY,
                  quotas:"",
                },
              ].map((s,i)=>(
                <div key={i} style={{background:"#fff",border:`1.5px solid ${s.border}`,borderRadius:16,padding:26,position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
                  <div style={{position:"absolute",top:14,right:16,background:s.badgeBg,borderRadius:100,padding:"3px 11px",fontSize:10,fontWeight:700,color:s.badgeColor}}>{s.badge}</div>
                  <div style={{width:52,height:52,borderRadius:14,background:s.bg,border:`1.5px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:14}}>{s.icon}</div>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:DARK,marginBottom:6}}>{s.t}</h3>
                  <p style={{fontSize:12,color:GRAY,lineHeight:1.75,marginBottom:12}}>{s.d}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:s.quotas?10:0}}>
                    {s.chips.map(c=><span key={c} style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:s.bg,color:s.color,fontWeight:600,border:`1px solid ${s.border}`}}>{c}</span>)}
                  </div>
                  {s.quotas&&(
                    <div style={{fontSize:10,color:s.color,fontWeight:600,background:s.bg,borderRadius:8,padding:"5px 10px",border:`1px solid ${s.border}`}}>
                      🎯 {s.quotas}
                    </div>
                  )}
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
                {/* Ribbon badge — coin supérieur droit */}
                <div style={{
                  position:"absolute",top:0,right:0,
                  background:pack.ribbonColor,
                  color:"#fff",
                  fontSize:9,fontWeight:900,letterSpacing:.6,
                  padding:"5px 12px 5px 18px",
                  borderRadius:"0 14px 0 16px",
                  boxShadow:`-2px 2px 8px ${pack.ribbonColor}55`,
                  zIndex:2,
                  fontFamily:"'DM Sans',sans-serif",
                  whiteSpace:"nowrap",
                }}>{pack.ribbon}</div>

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
                    <div style={{background:pack.highlight?"rgba(255,255,255,0.1)":"rgba(5,150,105,0.07)",border:`1px solid ${pack.highlight?"rgba(255,255,255,0.15)":"rgba(5,150,105,0.2)"}`,borderRadius:9,padding:"10px 12px",marginBottom:10}}>
                      <div style={{fontSize:9,fontWeight:900,color:pack.highlight?"#86efac":"#059669",letterSpacing:1,marginBottom:5}}>BONUS</div>
                      <div style={{fontSize:12,color:pack.highlight?"rgba(255,255,255,0.8)":DARK}}>{pack.bonus}</div>
                    </div>
                  )}

                  {/* CV Quota badge */}
                  {["bronze","silver","gold"].includes(pack.id)&&(
                    <div style={{background:pack.highlight?"rgba(255,255,255,0.08)":pack.id==="gold"?"rgba(200,162,39,0.08)":pack.id==="silver"?"rgba(140,155,171,0.1)":"rgba(205,127,50,0.08)",border:`1px solid ${pack.highlight?"rgba(255,255,255,0.12)":pack.color+"44"}`,borderRadius:9,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:14}}>📄</span>
                      <div>
                        <div style={{fontSize:9,fontWeight:900,color:pack.highlight?"rgba(255,255,255,0.5)":pack.colorDark,letterSpacing:1,marginBottom:2}}>GÉNÉRATEUR DE CV</div>
                        <div style={{fontSize:12,fontWeight:700,color:pack.highlight?"#fff":pack.colorDark}}>
                          {pack.id==="bronze"?"3 générations incluses":pack.id==="silver"?"10 générations incluses":"30 générations incluses"}
                        </div>
                      </div>
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

export default LandingPage;