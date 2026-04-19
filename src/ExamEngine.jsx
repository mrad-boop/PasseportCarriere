import { useState, useEffect, useRef, useCallback } from "react";

// ── Tokens de design (copiés depuis App.jsx) ──
const G = "linear-gradient(135deg,#1a3a8f 0%,#2d5be3 40%,#a0197e 75%,#c0186e 100%)";
const GS = "linear-gradient(135deg,rgba(26,58,143,0.07) 0%,rgba(192,24,110,0.07) 100%)";
const BLUE="#1a3a8f", MAG="#c0186e", DARK="#0f1827", GRAY="#5a6577", BORDER="#e4e8f0", BG="#f6f8fc";

// ── Tranches de scoring ──
const TRANCHES = [
  {min:1,  max:4,  level:"A1", pts:3,  color:"#6b7280", bg:"rgba(107,114,128,0.1)"},
  {min:5,  max:10, level:"A2", pts:9,  color:"#d97706", bg:"rgba(217,119,6,0.1)"},
  {min:11, max:19, level:"B1", pts:15, color:"#f59e0b", bg:"rgba(245,158,11,0.1)"},
  {min:20, max:29, level:"B2", pts:21, color:"#3b82f6", bg:"rgba(59,130,246,0.1)"},
  {min:30, max:35, level:"C1", pts:26, color:"#1a3a8f", bg:"rgba(26,58,143,0.1)"},
  {min:36, max:39, level:"C2", pts:33, color:"#7c3aed", bg:"rgba(124,58,237,0.1)"},
];

// ── Calcul du score ──
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

// ── Liste des séries ──
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

      {/* Free badge — affiché uniquement aux comptes gratuits */}
      {!isPremium&&(
        <div style={{background:"rgba(5,150,105,0.08)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:13,color:"#065f46"}}>
          <strong>✅ {freeSeries.length} séries gratuites</strong> incluses · Les séries Premium nécessitent un abonnement
        </div>
      )}

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

// ── Moteur d'examen ──
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
  const q         = questions[current];

  // handleFinish DÉFINI EN PREMIER — avant tout useEffect qui l'utilise
  const answersRef  = useRef({});
  const finishedRef = useRef(false);
  useEffect(()=>{ answersRef.current = answers; },[answers]);

  const handleFinish = useCallback(()=>{
    if(finishedRef.current) return;
    finishedRef.current = true;
    const ans = answersRef.current;
    setFinished(true);
    const res = calcScore(ans, questions);
    onFinish(serie.id, res, ans);
    setShowResults(true);
  },[questions, serie.id, onFinish]);

  const handleFinishRef = useRef(handleFinish);
  useEffect(()=>{ handleFinishRef.current = handleFinish; },[handleFinish]);

  // Timer
  useEffect(()=>{
    if(finished) return;
    const t = setInterval(()=>setTimeLeft(tl=>{
      if(tl<=1){ clearInterval(t); handleFinishRef.current(); return 0; }
      return tl-1;
    }),1000);
    return ()=>clearInterval(t);
  },[finished]);

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = Math.round(timeLeft/timeLimit*100);

  const select = idx => {
    if(finished) return;
    setAnswers(a=>({...a,[current]:idx}));
  };

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

  if(!q) return (
    <div style={{maxWidth:600,margin:"40px auto",padding:"0 24px"}}>
      <div style={{background:"#fff",border:"2px solid #f97316",borderRadius:16,padding:"32px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>⚠️</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:DARK,marginBottom:16}}>
          Diagnostic — Série reçue mais questions vides
        </h2>
        <div style={{background:"#fef3c7",borderRadius:10,padding:"16px",marginBottom:20,textAlign:"left",fontSize:12,fontFamily:"monospace",wordBreak:"break-all"}}>
          <div><strong>serie.id :</strong> {serie.id || "undefined"}</div>
          <div><strong>serie.type :</strong> {serie.type || "undefined"}</div>
          <div><strong>serie.title :</strong> {serie.title || "undefined"}</div>
          <div><strong>serie.questions :</strong> {JSON.stringify(serie.questions)?.substring(0,200) || "null/undefined"}</div>
          <div><strong>questions.length :</strong> {questions.length}</div>
          <div><strong>current :</strong> {current}</div>
          <div><strong>q :</strong> {String(q)}</div>
        </div>
        <p style={{fontSize:13,color:GRAY,marginBottom:20}}>
          Ce message confirme que ExamEngine reçoit bien la série mais les questions sont vides ou mal formatées.<br/>
          Copiez ces infos et partagez-les pour identifier le problème.
        </p>
        <button className="btn btn-p" onClick={onAbort}>← Retour aux séries</button>
      </div>
    </div>
  );

  const answered = Object.keys(answers).length;
  const isUrgent = timeLeft < 300;

  return (
    <div className="exam-layout" style={{display:"flex",minHeight:"calc(100vh - 58px)",fontFamily:"'DM Sans',sans-serif"}}>

      {/* ── GAUCHE : Zone question ── */}
      <div className="exam-content" style={{flex:1,padding:"28px 32px",background:BG}}>

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
      {/* MODAL PAIEMENT */}
    </div>
  );
}


export { SeriesList, ExamEngine };