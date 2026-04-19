import { useState, useEffect, useRef, useCallback } from "react";
import { G, GS, BLUE, MAG, DARK, GRAY, BORDER, BG, CSS, Grad, Spinner, Modal, Toast, ImageUpload, AudioUpload, RANK_LABELS, API, apiGet, apiPost, formatTime } from "./constants.js";

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

function JsonImportZone({onImport}) {
  const fileRef = useRef();
  const [dragging,setDragging] = useState(false);
  const [previews,setPreviews] = useState([]); // array of {filename, series[]}
  const [errors,setErrors]     = useState([]);

  const parseFiles = files => {
    const list = Array.from(files).slice(0,10);
    const newPreviews = []; const newErrors = [];
    let done = 0;
    list.forEach(f=>{
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result.replace(/```json|```/g,"").trim());
          const arr  = Array.isArray(data)?data:[data];
          newPreviews.push({filename:f.name, series:arr});
        } catch {
          newErrors.push(`❌ ${f.name} : JSON invalide`);
        }
        done++;
        if(done===list.length){
          setPreviews([...newPreviews]);
          setErrors([...newErrors]);
        }
      };
      reader.readAsText(f);
    });
  };

  const handleFile = e => { if(e.target.files.length) parseFiles(e.target.files); };
  const handleDrop = e => { e.preventDefault(); setDragging(false); if(e.dataTransfer.files.length) parseFiles(e.dataTransfer.files); };
  const totalSeries = previews.reduce((a,p)=>a+p.series.length,0);
  const allSeries   = previews.flatMap(p=>p.series);

  return (
    <div>
      <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
        style={{border:`2px dashed ${dragging?BLUE:BORDER}`,borderRadius:12,padding:24,textAlign:"center",background:dragging?"rgba(26,58,143,0.04)":BG,cursor:"pointer",transition:"all .18s"}}
        onClick={()=>fileRef.current.click()}>
        <div style={{fontSize:32,marginBottom:8}}>📁</div>
        <div style={{fontSize:13,fontWeight:600,color:DARK,marginBottom:3}}>Glissez vos fichiers JSON ici</div>
        <div style={{fontSize:11,color:GRAY}}>ou cliquez pour parcourir · <strong>Jusqu'à 10 fichiers JSON simultanément</strong></div>
      </div>
      <input ref={fileRef} type="file" accept=".json,application/json" multiple style={{display:"none"}} onChange={handleFile}/>

      {errors.length>0&&(
        <div style={{marginTop:10,fontSize:12,color:"#dc2626",background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:8,padding:"8px 12px"}}>
          {errors.map((e,i)=><div key={i}>{e}</div>)}
        </div>
      )}

      {previews.length>0&&(
        <div style={{marginTop:12,background:"rgba(5,150,105,0.06)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#059669",marginBottom:8}}>
            ✓ {previews.length} fichier(s) · {totalSeries} série(s) détectée(s) :
          </div>
          {previews.map((p,pi)=>(
            <div key={pi} style={{marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:700,color:DARK,marginBottom:2}}>📄 {p.filename}</div>
              {p.series.slice(0,3).map((s,i)=>(
                <div key={i} style={{fontSize:11,color:GRAY,marginLeft:12,marginBottom:1}}>• [{s.type||"?"}] {s.title||"Sans titre"} — {s.questions?.length||0} questions{s.premium?" ⭐":""}</div>
              ))}
              {p.series.length>3&&<div style={{fontSize:10,color:GRAY,marginLeft:12}}>…et {p.series.length-3} autre(s)</div>}
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
            <button className="btn btn-p btn-sm" onClick={()=>{onImport(allSeries);setPreviews([]);setErrors([]);}}>
              ✅ Importer {totalSeries} série(s)
            </button>
            <button className="btn btn-o btn-sm" onClick={()=>{setPreviews([]);setErrors([]);}}>✕ Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSiteConfigEditor({siteConfig,onSave}) {
  const cfg = useRef({...INIT_SITE_CONFIG,...siteConfig});
  const refs = useRef({});

  const getVal = () => {
    const out = {...cfg.current};
    Object.keys(refs.current).forEach(k=>{
      if(refs.current[k]) out[k] = refs.current[k].value;
    });
    return out;
  };

  const Field = ({label,k,multi}) => (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
      {multi
        ?<textarea className="inp" defaultValue={cfg.current[k]||""} ref={el=>refs.current[k]=el} rows={2}/>
        :<input className="inp" defaultValue={cfg.current[k]||""} ref={el=>refs.current[k]=el}/>}
    </div>
  );
  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:14}}>🌐 Configuration générale</h3>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🏠 Identité du site</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nom du site" k="siteName"/>
          <Field label="Slogan" k="tagline"/>
          <Field label="Badge hero" k="heroBadge"/>
          <Field label="Copyright footer" k="footerCopyright"/>
          <Field label="Texte footer droite" k="footerRight"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🦸 Section Héro</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Titre ligne 1" k="heroTitle1"/>
          <Field label="Titre ligne 2" k="heroTitle2"/>
          <Field label="CTA principal" k="ctaPrimary"/>
          <Field label="CTA secondaire" k="ctaSecondary"/>
        </div>
        <Field label="Sous-titre héro" k="heroSubtitle" multi/>
        <div style={{fontSize:11,fontWeight:700,color:DARK,marginBottom:8,marginTop:4,textTransform:"uppercase",letterSpacing:.4}}>Statistiques</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          <Field label="Stat 1 valeur" k="stat1Val"/>
          <Field label="Stat 1 label" k="stat1Label"/>
          <Field label="Stat 2 valeur" k="stat2Val"/>
          <Field label="Stat 2 label" k="stat2Label"/>
          <Field label="Stat 3 valeur" k="stat3Val"/>
          <Field label="Stat 3 label" k="stat3Label"/>
          <Field label="Stat 4 valeur" k="stat4Val"/>
          <Field label="Stat 4 label" k="stat4Label"/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:DARK,marginBottom:8,marginTop:8,textTransform:"uppercase",letterSpacing:.4}}>Badges de confiance</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <Field label="Badge 1" k="trust1"/>
          <Field label="Badge 2" k="trust2"/>
          <Field label="Badge 3" k="trust3"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>📦 Sections page d'accueil</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Description CE" k="ceDesc"/>
          <Field label="Description CO" k="coDesc"/>
          <Field label="Titre avantages" k="avantagesTitle"/>
          <Field label="Sous-titre avantages" k="avantagesSubtitle"/>
          <Field label="Titre packs" k="packsTitle"/>
          <Field label="Sous-titre packs" k="packsSubtitle"/>
          <Field label="Titre témoignages" k="testimonialsTitle"/>
          <Field label="Sous-titre témoignages" k="testimonialsSubtitle"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🎯 CTA final</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Titre CTA final" k="ctaFinalTitle"/>
          <Field label="Texte CTA final" k="ctaFinalDesc"/>
        </div>
      </div>

      <div style={{background:"rgba(26,58,143,0.05)",border:"1px solid rgba(26,58,143,0.15)",borderRadius:9,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>🚀 Services Coming Soon</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Titre section" k="comingSoonTitle"/>
          <Field label="Sous-titre section" k="comingSoonSubtitle"/>
        </div>
        <div style={{background:"rgba(160,25,126,0.06)",border:"1px solid rgba(160,25,126,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:"#a0197e",marginBottom:8,textTransform:"uppercase"}}>📄 Générateur de CV</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Field label="Titre" k="cvTitle"/>
            <Field label="Description" k="cvDesc"/>
          </div>
        </div>
        <div style={{background:"rgba(5,150,105,0.06)",border:"1px solid rgba(5,150,105,0.2)",borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#059669",marginBottom:8,textTransform:"uppercase"}}>💼 HireMe — Emploi IA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Field label="Titre" k="hiremeTitle"/>
            <Field label="Description" k="hiremeDesc"/>
          </div>
        </div>
      </div>

      <button className="btn btn-p btn-sm" onClick={()=>onSave(getVal())}>💾 Enregistrer toute la configuration</button>
    </div>
  );
}

function AdminAvantagesEditor({avantages,onSave}) {
  const [items,setItems] = useState([...avantages]);
  const rowRefs = useRef({});

  const collectAndSave = () => {
    const updated = items.map((av,i)=>({
      icon:  rowRefs.current[`${i}_icon`]?.value  ?? av.icon,
      title: rowRefs.current[`${i}_title`]?.value ?? av.title,
      desc:  rowRefs.current[`${i}_desc`]?.value  ?? av.desc,
    }));
    onSave(updated);
  };

  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>⭐ Nos Avantages ({items.length}/6)</h3>
        {items.length<6&&<button className="btn btn-o btn-sm" onClick={()=>setItems(a=>[...a,{icon:"🔧",title:"Nouvel avantage",desc:"Description"}])}>+ Ajouter</button>}
      </div>
      {items.map((av,i)=>(
        <div key={`av-${i}`} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px",marginBottom:9,display:"grid",gridTemplateColumns:"60px 1fr 1fr auto",gap:10,alignItems:"center"}}>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Icône</label>
            <input className="inp" defaultValue={av.icon} ref={el=>rowRefs.current[`${i}_icon`]=el} style={{fontSize:18,textAlign:"center",padding:"5px"}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Titre</label>
            <input className="inp" defaultValue={av.title} ref={el=>rowRefs.current[`${i}_title`]=el} style={{fontSize:12}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Description</label>
            <input className="inp" defaultValue={av.desc} ref={el=>rowRefs.current[`${i}_desc`]=el} style={{fontSize:12}}/>
          </div>
          <button onClick={()=>setItems(a=>a.filter((_,idx)=>idx!==i))} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:13}}>✕</button>
        </div>
      ))}
      <button className="btn btn-p btn-sm" onClick={collectAndSave} style={{marginTop:8}}>💾 Enregistrer les avantages</button>
    </div>
  );
}

function AdminTestimonialsEditor({testimonials,onSave}) {
  const [items,setItems] = useState([...testimonials]);
  const rowRefs = useRef({});
  const collectAndSave = () => {
    const updated = items.map((t,i)=>({
      name:  rowRefs.current[i+"_name"]?.value  ?? t.name,
      pays:  rowRefs.current[i+"_pays"]?.value  ?? t.pays,
      level: rowRefs.current[i+"_level"]?.value ?? t.level,
      text:  rowRefs.current[i+"_text"]?.value  ?? t.text,
    }));
    onSave(updated);
  };
  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>💬 Témoignages ({items.length})</h3>
        <button className="btn btn-o btn-sm" onClick={()=>setItems(a=>[...a,{name:"Prénom N.",pays:"🌍",level:"B1→B2",text:"Témoignage ici…"}])}>+ Ajouter</button>
      </div>
      {items.map((t,i)=>(
        <div key={"tm"+i} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px",marginBottom:9}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 60px 80px auto",gap:9,marginBottom:8,alignItems:"center"}}>
            <div>
              <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Nom</label>
              <input className="inp" defaultValue={t.name} ref={el=>rowRefs.current[i+"_name"]=el} style={{fontSize:12}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Drapeau</label>
              <input className="inp" defaultValue={t.pays} ref={el=>rowRefs.current[i+"_pays"]=el} style={{fontSize:16,textAlign:"center",padding:"5px"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Niveau (ex: B1→B2)</label>
              <input className="inp" defaultValue={t.level} ref={el=>rowRefs.current[i+"_level"]=el} style={{fontSize:11}}/>
            </div>
            <button onClick={()=>setItems(a=>a.filter((_,idx)=>idx!==i))} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:13,marginTop:16}}>✕</button>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3}}>Témoignage</label>
            <textarea className="inp" defaultValue={t.text} ref={el=>rowRefs.current[i+"_text"]=el} rows={2} style={{fontSize:12}}/>
          </div>
        </div>
      ))}
      <button className="btn btn-p btn-sm" onClick={collectAndSave} style={{marginTop:4}}>💾 Enregistrer les témoignages</button>
    </div>
  );
}

function AdminPacksEditor({packs,onSave}) {
  const [items,setItems] = useState(JSON.parse(JSON.stringify(packs)));
  const packRefs = useRef({});
  const addFeature = pi => setItems(arr=>arr.map((p,idx)=>idx===pi?{...p,features:[...p.features,""]}:p));
  const removeFeature = (pi,fi) => setItems(arr=>arr.map((p,idx)=>idx===pi?{...p,features:p.features.filter((_,fIdx)=>fIdx!==fi)}:p));
  const toggleHighlight = (i,v) => setItems(arr=>arr.map((p,idx)=>idx===i?{...p,highlight:v}:p));
  const collectAndSave = () => {
    const updated = items.map((pack,i)=>({
      ...pack,
      name:  packRefs.current[i+"_name"]?.value  ?? pack.name,
      price: packRefs.current[i+"_price"]?.value ?? pack.price,
      acces: packRefs.current[i+"_acces"]?.value ?? pack.acces,
      color: packRefs.current[i+"_color"]?.value ?? pack.color,
      bonus: packRefs.current[i+"_bonus"]?.value ?? pack.bonus,
      features: pack.features.map((_,fi)=>packRefs.current[i+"_feat_"+fi]?.value ?? pack.features[fi]),
    }));
    onSave(updated);
  };
  return (
    <div className="card" style={{padding:22,marginBottom:14}}>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:16}}>📦 Packs de Révision</h3>
      {items.map((pack,i)=>(
        <div key={"pk"+pack.id} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:pack.color,flexShrink:0}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:DARK}}>{pack.name}</span>
            <label style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto",fontSize:12,cursor:"pointer"}}>
              <input type="checkbox" checked={pack.highlight} onChange={e=>toggleHighlight(i,e.target.checked)}/> Mis en avant
            </label>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9,marginBottom:10}}>
            {[["Nom","name",pack.name],["Prix","price",pack.price],["Accès","acces",pack.acces],["Couleur","color",pack.color]].map(([l,k,v])=>(
              <div key={k}>
                <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3,textTransform:"uppercase"}}>{l}</label>
                <input className="inp" defaultValue={v} ref={el=>packRefs.current[i+"_"+k]=el} style={{fontSize:12}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:8}}>
            <label style={{display:"block",fontSize:10,color:GRAY,marginBottom:3,textTransform:"uppercase"}}>Bonus</label>
            <input className="inp" defaultValue={pack.bonus||""} ref={el=>packRefs.current[i+"_bonus"]=el} style={{fontSize:12}}/>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <label style={{fontSize:10,color:GRAY,textTransform:"uppercase",fontWeight:700}}>Fonctionnalités</label>
              <button className="btn btn-o btn-sm" onClick={()=>addFeature(i)} style={{fontSize:10,padding:"3px 9px"}}>+ Ajouter</button>
            </div>
            {pack.features.map((f,fi)=>(
              <div key={fi} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                <input className="inp" defaultValue={f} ref={el=>packRefs.current[i+"_feat_"+fi]=el} style={{fontSize:11,flex:1}}/>
                <button onClick={()=>removeFeature(i,fi)} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11,flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-p btn-sm" onClick={collectAndSave}>💾 Enregistrer les packs</button>
    </div>
  );
}

function AdminSerieBox({list,typeKey,typeLabel,icon,accentColor,accentBg,accentBorder,setModal,onDelete}) {
  const [open,setOpen] = useState(true);
  return (
    <div style={{background:"#fff",border:`2px solid ${accentBorder}`,borderRadius:16,overflow:"hidden",boxShadow:`0 4px 20px ${accentBg}`}}>
      <div style={{background:accentBg,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1.5px solid ${accentBorder}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:accentBorder,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:accentColor}}>{typeLabel}</div>
            <div style={{fontSize:11,color:GRAY,marginTop:1}}>{list.length} séries · {list.filter(s=>!s.premium).length} gratuites · {list.filter(s=>s.premium).length} premium</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button className="btn btn-p btn-sm" style={{fontSize:11}} onClick={()=>setModal({type:"create",serieType:typeKey})}>+ Ajouter</button>
          <button onClick={()=>setOpen(o=>!o)} style={{width:28,height:28,border:`1.5px solid ${accentBorder}`,borderRadius:7,background:"#fff",cursor:"pointer",fontSize:13,color:accentColor,display:"flex",alignItems:"center",justifyContent:"center"}}>{open?"▲":"▼"}</button>
        </div>
      </div>
      {open&&(
        <div style={{maxHeight:320,overflowY:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:6}}>
          {list.length===0?(
            <div style={{textAlign:"center",padding:20,color:GRAY,fontSize:12}}>Aucune série {typeKey}. Cliquez sur + Ajouter.</div>
          ):list.map((s,i)=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:BG,borderRadius:8,border:`1px solid ${BORDER}`}}>
              <div style={{width:24,height:24,borderRadius:6,background:accentBorder,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:accentColor,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                <div style={{fontSize:10,color:GRAY}}>{s.questions?.length||0} q · {s.premium?"⭐ Premium":"Free"}</div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button onClick={()=>setModal({type:"edit",serie:s,serieType:typeKey})} style={{padding:"3px 8px",border:`1px solid ${BORDER}`,borderRadius:5,background:"#fff",fontSize:10,cursor:"pointer",color:GRAY}}>✏️</button>
                <button onClick={()=>onDelete(s.id)} style={{padding:"3px 8px",border:"1px solid rgba(220,38,38,0.2)",borderRadius:5,background:"rgba(220,38,38,0.04)",fontSize:10,cursor:"pointer",color:"#dc2626"}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSerieBoxSoon({typeLabel,icon,accentColor,accentBg,accentBorder}) {
  return (
    <div style={{background:"#fff",border:`2px solid ${accentBorder}`,borderRadius:16,overflow:"hidden",opacity:0.75}}>
      <div style={{background:accentBg,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1.5px solid ${accentBorder}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:accentBorder,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:accentColor}}>{typeLabel}</div>
            <div style={{fontSize:11,color:GRAY,marginTop:1}}>0 séries · Bientôt disponible</div>
          </div>
        </div>
        <span style={{fontSize:10,fontWeight:700,background:accentBorder,color:accentColor,padding:"4px 10px",borderRadius:20}}>🚀 Bientôt</span>
      </div>
      <div style={{padding:"28px 18px",textAlign:"center",color:GRAY,fontSize:12}}>Module {typeLabel} — disponible prochainement</div>
    </div>
  );
}


function AdminPanel({users,setUsers,series,setSeries,siteConfig,setSiteConfig,packs,setPacks,avantages,setAvantages,testimonials,setTestimonials,onLogout}) {
  const [tab,  setTab]   = useState("dashboard");
  const [modal,setModal] = useState(null);
  const [search,setSearch]=useState("");
  const [filterPlan,setFilterPlan]=useState("all");
  const [filterRank,setFilterRank]=useState("all");
  const [filterStatus,setFilterStatus]=useState("all");
  const [toast,showToast]=useToast();
  const [addUserModal,setAddUserModal]=useState(false);
  const [newUser,setNewUser]=useState({nom:"",email:"",password:"",plan:"free",rank:"free"});
  const [addUserError,setAddUserError]=useState("");

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
                {icon:"🥇",val:users.filter(u=>u.rank==="gold").length,label:"Rang Gold",sub:`${users.filter(u=>u.rank==="silver").length} Silver · ${users.filter(u=>u.rank==="bronze").length} Bronze`,color:"#c8a227"},
                {icon:"📖",val:ceSeries.length,label:"Séries CE",sub:`${ceSeries.filter(s=>!s.premium).length} gratuites`,color:BLUE},
                {icon:"📄",val:users.reduce((a,u)=>a+(u.cv_count||0),0),label:"CV Générés",sub:"Total plateforme",color:"#a0197e"},
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
          <div style={{padding:"24px 16px",maxWidth:1100,margin:"0 auto"}}>
            <div className="fu" style={{marginBottom:24}}>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:3}}>Gestion des Séries</h1>
              <p style={{fontSize:13,color:GRAY}}>Organisez les séries TCF Canada par type · {series.length} séries au total</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <AdminSerieBox list={ceSeries} typeKey="CE" typeLabel="Compréhension Écrite" icon="📖"
                accentColor="#1a3a8f" accentBg="rgba(26,58,143,0.06)" accentBorder="rgba(26,58,143,0.15)"
                setModal={setModal} onDelete={deleteSerieAdmin}/>
              <AdminSerieBox list={coSeries} typeKey="CO" typeLabel="Compréhension Orale" icon="🎧"
                accentColor="#c0186e" accentBg="rgba(192,24,110,0.05)" accentBorder="rgba(192,24,110,0.15)"
                setModal={setModal} onDelete={deleteSerieAdmin}/>
              <AdminSerieBoxSoon typeLabel="Expression Écrite" icon="✍️"
                accentColor="#059669" accentBg="rgba(5,150,105,0.05)" accentBorder="rgba(5,150,105,0.15)"/>
              <AdminSerieBoxSoon typeLabel="Expression Orale" icon="🗣️"
                accentColor="#d97706" accentBg="rgba(217,119,6,0.05)" accentBorder="rgba(217,119,6,0.15)"/>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab==="users"&&(
          <div style={{padding:"24px 16px"}}>
            <div className="fu" style={{marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:DARK,marginBottom:2}}>Utilisateurs</h1>
                <p style={{fontSize:12,color:GRAY}}>{users.length} comptes enregistrés</p>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className="btn btn-p btn-sm" onClick={()=>setAddUserModal(true)}>+ Ajouter</button>
                <button className="btn btn-o btn-sm" onClick={()=>{
                  const loadXLSX = (cb) => {
                    if(window.XLSX){ cb(); return; }
                    const s=document.createElement("script");
                    s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
                    s.onload=cb; document.head.appendChild(s);
                  };
                  loadXLSX(()=>{
                    const filtered=users.filter(u=>{
                      const q=search.toLowerCase();
                      return (!q||u.nom?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q))
                        &&(filterPlan==="all"||u.plan===filterPlan)
                        &&(filterRank==="all"||(u.rank||"free")===filterRank)
                        &&(filterStatus==="all"||u.status===filterStatus);
                    });
                    const data=filtered.map(u=>({
                      "Nom":u.nom||"",
                      "Email":u.email||"",
                      "Pays":u.pays||"",
                      "Plan":u.plan||"free",
                      "Rang":u.rank||"free",
                      "Statut":u.status||"",
                      "Inscription":u.joined||"",
                      "Dernière connexion (Tunisie)":u.last_login||"—",
                      "Temps sur plateforme":formatTime(u.total_time),
                      "CV générés":u.cv_count||0,
                    }));
                    const ws=window.XLSX.utils.json_to_sheet(data);
                    ws["!cols"]=[22,28,10,10,10,10,20,26,18,12].map(w=>({wch:w}));
                    const wb=window.XLSX.utils.book_new();
                    window.XLSX.utils.book_append_sheet(wb,ws,"Utilisateurs");
                    window.XLSX.writeFile(wb,`passeport-carriere-users-${new Date().toISOString().slice(0,10)}.xlsx`);
                  });
                }}>📊 Exporter Excel</button>
              </div>
            </div>

            {/* Barre de filtres */}
            <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flex:"1 1 180px"}}>
                <span style={{color:GRAY,fontSize:13}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom ou email…" style={{flex:1,border:"none",outline:"none",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:DARK,background:"transparent"}}/>
              </div>
              {[
                {val:filterPlan, set:setFilterPlan, opts:[["all","Tous plans"],["free","Free"],["premium","Premium"]]},
                {val:filterRank, set:setFilterRank, opts:[["all","Tous rangs"],["free","🔓 Free"],["bronze","🥉 Bronze"],["silver","🥈 Silver"],["gold","🥇 Gold"]]},
                {val:filterStatus, set:setFilterStatus, opts:[["all","Tous statuts"],["actif","✅ Actif"],["suspendu","🚫 Suspendu"]]},
              ].map((f,i)=>(
                <select key={i} value={f.val} onChange={e=>f.set(e.target.value)} style={{padding:"5px 8px",border:`1px solid ${BORDER}`,borderRadius:7,fontSize:11,outline:"none",background:"#fff",fontFamily:"'DM Sans',sans-serif"}}>
                  {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              ))}
              {(filterPlan!=="all"||filterRank!=="all"||filterStatus!=="all"||search)&&(
                <button onClick={()=>{setSearch("");setFilterPlan("all");setFilterRank("all");setFilterStatus("all");}} style={{fontSize:11,color:GRAY,background:"none",border:"none",cursor:"pointer",padding:"4px 6px",fontFamily:"'DM Sans',sans-serif"}}>✕ Reset</button>
              )}
            </div>

            {/* Modal ajout utilisateur */}
            {addUserModal&&(
              <div style={{position:"fixed",inset:0,background:"rgba(10,16,30,.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div className="card" style={{width:"100%",maxWidth:420,padding:28}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:DARK,marginBottom:18}}>Ajouter un utilisateur</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                    <div><label style={{fontSize:10,fontWeight:700,color:GRAY,display:"block",marginBottom:3,textTransform:"uppercase"}}>Nom complet</label><input className="inp" value={newUser.nom} onChange={e=>setNewUser(n=>({...n,nom:e.target.value}))}/></div>
                    <div><label style={{fontSize:10,fontWeight:700,color:GRAY,display:"block",marginBottom:3,textTransform:"uppercase"}}>Email</label><input className="inp" type="email" value={newUser.email} onChange={e=>setNewUser(n=>({...n,email:e.target.value}))}/></div>
                    <div><label style={{fontSize:10,fontWeight:700,color:GRAY,display:"block",marginBottom:3,textTransform:"uppercase"}}>Mot de passe</label><input className="inp" type="password" value={newUser.password} onChange={e=>setNewUser(n=>({...n,password:e.target.value}))}/></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><label style={{fontSize:10,fontWeight:700,color:GRAY,display:"block",marginBottom:3,textTransform:"uppercase"}}>Plan</label>
                        <select className="inp" value={newUser.plan} onChange={e=>setNewUser(n=>({...n,plan:e.target.value}))}>
                          <option value="free">Free</option>
                          <option value="premium">Premium ⭐</option>
                        </select>
                      </div>
                      <div><label style={{fontSize:10,fontWeight:700,color:GRAY,display:"block",marginBottom:3,textTransform:"uppercase"}}>Rang</label>
                        <select className="inp" value={newUser.rank} onChange={e=>setNewUser(n=>({...n,rank:e.target.value}))}>
                          <option value="free">🔓 Free</option>
                          <option value="bronze">🥉 Bronze</option>
                          <option value="silver">🥈 Silver</option>
                          <option value="gold">🥇 Gold</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {addUserError&&<div style={{color:"#dc2626",fontSize:12,marginBottom:10}}>{addUserError}</div>}
                  <div style={{display:"flex",gap:10}}>
                    <button className="btn btn-p" style={{flex:1}} onClick={async()=>{
                      if(!newUser.nom||!newUser.email||!newUser.password){setAddUserError("Tous les champs sont requis.");return;}
                      const res=await apiPost("/api/auth/register",{nom:newUser.nom,email:newUser.email,password:newUser.password,pays:"CA"});
                      if(res?.error){setAddUserError(res.error);return;}
                      // Mettre à jour plan et rang
                      if(res?.user?.id){
                        await apiPut(`/api/users/${res.user.id}`,{plan:newUser.plan,rank:newUser.rank,status:"actif"});
                      }
                      apiGet("/api/users").then(d=>{if(Array.isArray(d))setUsers(d);});
                      setAddUserModal(false);
                      setNewUser({nom:"",email:"",password:"",plan:"free",rank:"free"});
                      setAddUserError("");
                      showToast("Utilisateur créé !");
                    }}>Créer</button>
                    <button className="btn btn-o" onClick={()=>{setAddUserModal(false);setAddUserError("");}}>Annuler</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,padding:"9px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:GRAY}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou email…" style={{flex:1,border:"none",outline:"none",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:DARK,background:"transparent"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {users.filter(u=>{
                const q=search.toLowerCase();
                const ms=!q||u.nom?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q);
                const mp=filterPlan==="all"||u.plan===filterPlan;
                const mr=filterRank==="all"||(u.rank||"free")===filterRank;
                const mt=filterStatus==="all"||u.status===filterStatus;
                return ms&&mp&&mr&&mt;
              }).map(u=>{
                const p=getPays(u.pays);
                const isAdmin = u.email==="admin@launchpad.ca" || u.role==="admin";
                return(
                  <div key={u.id} style={{background:"#fff",border:`1.5px solid ${u.status==="suspendu"?"rgba(220,38,38,0.2)":BORDER}`,borderRadius:11,padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:isAdmin?"#1a3a8f":u.plan==="premium"?G:GS,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{u.nom?.charAt(0)||"?"}</div>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:13,fontWeight:700,color:DARK}}>{u.nom}</span>
                          {isAdmin&&<span className="tag" style={{background:"rgba(26,58,143,0.1)",color:BLUE,fontSize:9}}>🛡 Admin</span>}
                          <span className="tag" style={{background:u.plan==="premium"?G:"rgba(90,101,119,0.1)",color:u.plan==="premium"?"#fff":GRAY,fontSize:9}}>{u.plan==="premium"?"⭐ Premium":"Free"}</span>
                          {u.rank&&u.rank!=="free"&&<span className="tag" style={{background:RANK_LABELS[u.rank]?.bg,color:RANK_LABELS[u.rank]?.color,fontSize:9}}>{u.rank==="bronze"?"🥉":u.rank==="silver"?"🥈":"🥇"} {RANK_LABELS[u.rank]?.label}</span>}
                          <span className="tag" style={{background:u.status==="actif"?"rgba(5,150,105,0.09)":"rgba(220,38,38,0.09)",color:u.status==="actif"?"#059669":"#dc2626",fontSize:9}}>{u.status}</span>
                        </div>
                        <div style={{fontSize:11,color:GRAY,marginBottom:5}}>✉ {u.email} · {p.flag} {p.name}</div>
                        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                          <span style={{fontSize:10,color:GRAY}}>🕐 <strong style={{color:DARK}}>{formatTime(u.total_time)}</strong> sur la plateforme</span>
                          <span style={{fontSize:10,color:GRAY}}>🔑 <strong style={{color:DARK}}>{u.last_login||"—"}</strong></span>
                          {u.cv_count>0&&<span style={{fontSize:10,color:GRAY}}>📄 <strong style={{color:DARK}}>{u.cv_count}</strong> CV</span>}
                        </div>
                      </div>
                      {isAdmin ? (
                        <span style={{fontSize:11,color:BLUE,fontWeight:600,padding:"4px 10px",border:`1px solid ${BLUE}33`,borderRadius:7,background:"rgba(26,58,143,0.05)",alignSelf:"center"}}>🔒 Protégé</span>
                      ) : (
                        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <select value={u.plan} onChange={e=>updateUser(u.id,{plan:e.target.value,rank:u.rank||"free",status:u.status})} style={{padding:"4px 6px",border:`1.5px solid ${BORDER}`,borderRadius:7,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff"}}>
                            <option value="free">Free</option>
                            <option value="premium">Premium ⭐</option>
                          </select>
                          <select value={u.rank||"free"} onChange={e=>updateUser(u.id,{plan:u.plan,rank:e.target.value,status:u.status})} style={{padding:"4px 6px",border:`1.5px solid ${BORDER}`,borderRadius:7,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff"}}>
                            <option value="free">🔓 Free</option>
                            <option value="bronze">🥉 Bronze</option>
                            <option value="silver">🥈 Silver</option>
                            <option value="gold">🥇 Gold</option>
                          </select>
                          <select value={u.status} onChange={e=>updateUser(u.id,{plan:u.plan,rank:u.rank||"free",status:e.target.value})} style={{padding:"4px 6px",border:`1.5px solid ${BORDER}`,borderRadius:7,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff"}}>
                            <option value="actif">✅ Actif</option>
                            <option value="suspendu">🚫 Suspendu</option>
                          </select>
                          <button onClick={()=>deleteUser(u.id)} style={{padding:"4px 8px",border:"1.5px solid rgba(220,38,38,0.3)",borderRadius:7,background:"rgba(220,38,38,0.05)",fontSize:11,cursor:"pointer",color:"#dc2626",fontFamily:"'DM Sans',sans-serif"}}>🗑</button>
                        </div>
                      )}
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

export default AdminPanel;
