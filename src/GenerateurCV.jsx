import { useState, useEffect, useRef } from "react";
import CvParser from "./CvParser.jsx";
import { G, BLUE, MAG, DARK, GRAY, BORDER, BG, CSS, Grad, CV_QUOTAS, RANK_LABELS, API, apiGet, apiPost } from "./constants.jsx";

const CV_DEFAULT = {
  prenom:"", nom:"", adresse:"", telephone:"", email:"", titre:"", resume:"",
  experiences: [{ poste:"", entreprise:"", lieu:"", debutMois:"", debutAnnee:"", finMois:"", finAnnee:"", taches:[""] }],
  formations:  [{ diplome:"", etablissement:"", lieu:"", mois:"", annee:"" }],
  competences:"", certifications:"",
  langues: [{ langue:"", niveau:"" }],
  references:"",
};


function CvS({label,children}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:12,fontWeight:700,color:BLUE,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:3,height:14,background:G,borderRadius:2}}/>{label}
      </div>
      {children}
    </div>
  );
}

function GenerateurCV({user, isPremium}) {
  const [form,     setForm]     = useState(CV_DEFAULT);
  const [lang,     setLang]     = useState("fr");
  const [color,    setColor]    = useState("#1a3a8f");
  const [font,     setFont]     = useState("Arial");
  const [useColor, setUseColor] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const fillFromCV = (parsed) => {
    setForm(prev => ({
      ...prev,
      nom:            parsed.nom             || prev.nom,
      prenom:         parsed.prenom          || prev.prenom,
      email:          parsed.email           || prev.email,
      telephone:      parsed.telephone       || prev.telephone,
      adresse:        parsed.adresse         || prev.adresse,
      titre:          parsed.titre           || prev.titre,
      resume:         parsed.resume          || prev.resume,
      competences:    parsed.competences     || prev.competences,
      certifications: parsed.certifications  || prev.certifications,
      references:     parsed.references      || prev.references,
      langues:     parsed.langues?.length     ? parsed.langues     : prev.langues,
      experiences: parsed.experiences?.length ? parsed.experiences : prev.experiences,
      formations:  parsed.formations?.length  ? parsed.formations  : prev.formations,
    }));
  };
  const [saved,    setSaved]    = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [cvCount,  setCvCount]  = useState(0);
  const [quota,    setQuota]    = useState(0);
  const [rank,     setRank]     = useState("free");
  const saveTimer = useRef(null);

  // ── Charger depuis le backend au montage ──
  useEffect(()=>{
    setLoading(true);
    apiGet("/api/cv").then(data=>{
      if(data && typeof data==="object"){
        setForm(f=>({...CV_DEFAULT, ...f,
          prenom: data.prenom || user?.nom?.split(" ")[0] || "",
          nom:    data.nom    || user?.nom?.split(" ").slice(1).join(" ") || "",
          email:  data.email  || user?.email || "",
          ...data,
        }));
        if(data.cvLang)     setLang(data.cvLang);
        if(data.cvColor)    setColor(data.cvColor);
        if(data.cvFont)     setFont(data.cvFont);
        if(data.cvUseColor) setUseColor(data.cvUseColor);
        setCvCount(data.cv_count || 0);
        setQuota(data.quota  || 0);
        setRank(data.rank    || "free");
      } else {
        setForm(f=>({...f,
          prenom: user?.nom?.split(" ")[0] || "",
          nom:    user?.nom?.split(" ").slice(1).join(" ") || "",
          email:  user?.email || "",
        }));
        // Charger quota séparément
        apiGet("/api/cv/quota").then(q=>{
          if(q){ setCvCount(q.cv_count||0); setQuota(q.quota||0); setRank(q.rank||"free"); }
        });
      }
      setLoading(false);
    });
  },[]);

  // ── Auto-save : 2s après la dernière modification ──
  const triggerSave = (newForm, newLang=lang, newColor=color, newUseColor=useColor, newFont=font) => {
    clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(async ()=>{
      setSaving(true);
      await apiPost("/api/cv/save", {
        ...newForm, cvLang: newLang, cvColor: newColor, cvUseColor: newUseColor,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(()=>setSaved(false), 2500);
    }, 1500);
  };

  const upd = (k,v) => {
    const n = {...form,[k]:v};
    setForm(n);
    triggerSave(n);
  };
  const updArr = (arr,i,k,v) => {
    const cp=[...form[arr]]; cp[i]={...cp[i],[k]:v};
    const n={...form,[arr]:cp}; setForm(n); triggerSave(n);
  };
  const addArr = (arr,tmpl) => {
    const n={...form,[arr]:[...form[arr],tmpl]}; setForm(n); triggerSave(n);
  };
  const delArr = (arr,i) => {
    const n={...form,[arr]:form[arr].filter((_,idx)=>idx!==i)}; setForm(n); triggerSave(n);
  };
  const updTache = (ei,ti,v) => {
    const cp=[...form.experiences];
    cp[ei]={...cp[ei],taches:cp[ei].taches.map((t,x)=>x===ti?v:t)};
    const n={...form,experiences:cp}; setForm(n); triggerSave(n);
  };
  const changeLang = v  => { setLang(v);     triggerSave(form,v,color,useColor); };
  const changeColor= v  => { setColor(v);    triggerSave(form,lang,v,useColor); };
  const changeUseC = v  => { setUseColor(v); triggerSave(form,lang,color,v); };

  const T = {
    fr:{ resume:"RÉSUMÉ PROFESSIONNEL", exp:"EXPÉRIENCES PROFESSIONNELLES", form:"FORMATION & ÉDUCATION", comp:"COMPÉTENCES", lang:"LANGUES", cert:"FORMATION CONTINUE & CERTIFICATIONS", ref:"RÉFÉRENCES", present:"Disponible sur demande" },
    en:{ resume:"PROFESSIONAL SUMMARY", exp:"WORK EXPERIENCE", form:"EDUCATION", comp:"SKILLS", lang:"LANGUAGES", cert:"CERTIFICATIONS & TRAINING", ref:"REFERENCES", present:"Available upon request" },
  };

  const fmtDate = (m,y) => m&&y?`${String(m).padStart(2,"0")}/${y}`:y||m||"";
  const fmtRange = (e) => {
    const d = fmtDate(e.debutMois,e.debutAnnee);
    const f = e.finMois||e.finAnnee ? fmtDate(e.finMois,e.finAnnee) : "Aujourd'hui";
    return d ? `${d} — ${f}` : "";
  };
  const _ts = (c) => `font-size:10.5px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;color:${useColor?c:"#000"};border-bottom:1.5px solid ${useColor?c:"#000"};padding-bottom:3px;margin-top:14px;margin-bottom:6px;display:block;`;

  const buildCVBlock = (lg) => {
    const t = T[lg];
    const c = color;
    return `
      <div style="font-family:${font},sans-serif;color:#000;font-size:11px;line-height:1.6;max-width:720px;margin:0 auto;padding:36px 44px;">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:19px;font-weight:900;letter-spacing:1.5px;">${(form.prenom+" "+form.nom).toUpperCase()}</div>
          ${form.titre?`<div style="font-size:11.5px;color:#333;margin-top:4px;font-style:italic;">${form.titre}</div>`:""}
          <div style="font-size:10px;margin-top:5px;color:#222;">${[form.adresse,form.telephone,form.email].filter(Boolean).join("  |  ")}</div>
        </div>
        <div style="margin-bottom:12px;"></div>

        ${form.resume?`<span style="${_ts(c)}">${t.resume}</span><div style="font-size:10.5px;margin-bottom:8px;">${form.resume.replace(/\n/g,"<br/>")}</div>`:""}

        ${form.experiences.filter(e=>e.poste||e.entreprise).length?`
        <span style="${_ts(c)}">${t.exp}</span>
        ${form.experiences.map(e=>`
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-weight:700;font-size:11px;">${e.poste}</span>
              <span style="font-size:10px;color:#444;">${fmtRange(e)}</span>
            </div>
            <div style="font-size:10px;font-style:italic;margin-bottom:2px;">${e.entreprise}${e.lieu?", "+e.lieu:""}</div>
            <ul style="margin:2px 0 0 0;padding-left:16px;">${e.taches.filter(Boolean).map(ta=>`<li style="margin-bottom:1px;">${ta}</li>`).join("")}</ul>
          </div>`).join("")}`:""}

        ${form.formations.filter(f=>f.diplome).length?`
        <span style="${_ts(c)}">${t.form}</span>
        ${form.formations.map(f=>`
          <div style="margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-weight:700;font-size:11px;">${f.diplome}</span>
              <span style="font-size:10px;color:#444;">${fmtDate(f.mois,f.annee)}</span>
            </div>
            <div style="font-size:10px;font-style:italic;">${f.etablissement}${f.lieu?", "+f.lieu:""}</div>
          </div>`).join("")}`:""}

        ${form.certifications?`<span style="${_ts(c)}">${t.cert}</span><div style="font-size:10.5px;">${form.certifications.split("\n").filter(Boolean).map(l=>`<div style="margin-bottom:2px;">• ${l}</div>`).join("")}</div>`:""}

        ${form.competences?`<span style="${_ts(c)}">${t.comp}</span><div style="font-size:10.5px;">${form.competences.split("\n").filter(Boolean).map(l=>`<div style="margin-bottom:2px;">• ${l}</div>`).join("")}</div>`:""}

        ${form.langues.filter(l=>l.langue).length?`
        <span style="${_ts(c)}">${t.lang}</span>
        ${form.langues.map(l=>`<div style="font-size:10.5px;margin-bottom:2px;">• <strong>${l.langue}</strong>${l.niveau?" : "+l.niveau:""}</div>`).join("")}`:""}

        <span style="${_ts(c)}">${t.ref}</span>
        <div style="font-size:10.5px;">${form.references||t.present}</div>
      </div>`;
  };

  const generatePDF = async () => {
    // Vérifier quota
    const res = await apiPost("/api/cv/generate", {
      ...form, cvLang:lang, cvColor:color, cvUseColor:useColor,
    });
    if(res?.error){
      alert(`❌ ${res.error}`);
      return;
    }
    // Mettre à jour compteur local
    if(res?.cv_count !== undefined) setCvCount(res.cv_count);

    let html = "";
    if(lang==="bilingual"){
      html = buildCVBlock("fr")+'<div style="page-break-before:always;"></div>'+buildCVBlock("en");
    } else {
      html = buildCVBlock(lang);
    }
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>CV - ${form.prenom} ${form.nom}</title>
      <style>
        @page{margin:0} @media print{.no-print{display:none!important}body{margin:0}}
        body{margin:0;background:#fff;}
      </style>
    </head><body>
      <div class="no-print" style="text-align:center;padding:10px;background:#1a3a8f;color:#fff;font-family:Arial,sans-serif;font-size:12px;position:sticky;top:0;z-index:99;">
        <button onclick="window.print()" style="background:#fff;color:#1a3a8f;border:none;padding:7px 22px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;margin-right:12px;">🖨️ Imprimer / Enregistrer en PDF</button>
        <span style="opacity:.7">Dans la boîte d'impression → choisir "Enregistrer en PDF" comme imprimante</span>
      </div>
      ${html}
    </body></html>`);
    win.document.close();
  };

  if(loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",flexDirection:"column",gap:16}}>
      <div className="spin"/>
      <span style={{fontSize:13,color:GRAY}}>Chargement de votre profil CV...</span>
    </div>
  );

  const inp = {width:"100%",padding:"8px 11px",border:`1.5px solid ${BORDER}`,borderRadius:8,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff",color:DARK,boxSizing:"border-box"};


  return (
    <div style={{padding:"24px 20px",maxWidth:860,margin:"0 auto"}}>
      {/* Header */}
      <div className="fu" style={{marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:DARK,marginBottom:3}}>📄 Générateur de <Grad>CV</Grad></h1>
          <p style={{fontSize:12,color:GRAY}}>Modèle canadien professionnel — Sauvegarde automatique</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {/* Rang badge */}
          {rank!=="free"&&(
            <span style={{
              background: RANK_LABELS[rank]?.bg || "rgba(107,114,128,0.1)",
              color: RANK_LABELS[rank]?.color || GRAY,
              borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700,
              border:`1.5px solid ${RANK_LABELS[rank]?.color || GRAY}44`,
            }}>
              {rank==="bronze"?"🥉":rank==="silver"?"🥈":rank==="gold"?"🥇":"⭐"} {RANK_LABELS[rank]?.label}
            </span>
          )}
          {/* Compteur générations */}
          <div style={{
            background: cvCount>=quota && quota>0 ? "rgba(220,38,38,0.07)" : "rgba(5,150,105,0.07)",
            border: `1.5px solid ${cvCount>=quota && quota>0 ? "rgba(220,38,38,0.2)" : "rgba(5,150,105,0.2)"}`,
            borderRadius:10, padding:"6px 14px", fontSize:12, textAlign:"center",
          }}>
            <div style={{fontWeight:700, color: cvCount>=quota && quota>0 ? "#dc2626" : "#059669"}}>
              {cvCount} / {quota} générations
            </div>
            <div style={{fontSize:10,color:GRAY,marginTop:2}}>
              {quota===0 ? "Aucun pack actif" : cvCount>=quota ? "Quota atteint" : `${quota-cvCount} restante(s)`}
            </div>
          </div>
          {saving&&<span style={{color:BLUE,fontSize:11}}>💾 Sauvegarde...</span>}
          {saved&&<span style={{color:"#059669",fontSize:11}}>✅ Sauvegardé</span>}
        </div>
      </div>

      {/* Alerte quota atteint */}
      {quota===0&&(
        <div style={{background:"rgba(220,38,38,0.07)",border:"1.5px solid rgba(220,38,38,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:20}}>🔒</span>
          <div>
            <div style={{fontWeight:700,color:"#dc2626",fontSize:13,marginBottom:2}}>Aucun pack actif</div>
            <div style={{fontSize:12,color:GRAY}}>Vous avez besoin d'un pack Bronze (3 CV), Silver (10 CV) ou Gold (30 CV) pour générer votre CV. Contactez votre administrateur.</div>
          </div>
        </div>
      )}
      {quota>0&&cvCount>=quota&&(
        <div style={{background:"rgba(220,38,38,0.07)",border:"1.5px solid rgba(220,38,38,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:20}}>⚠️</span>
          <div>
            <div style={{fontWeight:700,color:"#dc2626",fontSize:13,marginBottom:2}}>Quota de générations atteint</div>
            <div style={{fontSize:12,color:GRAY}}>Votre pack {RANK_LABELS[rank]?.label} permet {quota} génération(s). Vous pouvez toujours modifier et sauvegarder votre profil CV.</div>
          </div>
        </div>
      )}

      {/* Options barre */}
      <div className="card" style={{padding:16,marginBottom:16,display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <label style={{fontSize:10,fontWeight:700,color:GRAY,display:"block",marginBottom:3,textTransform:"uppercase"}}>🌐 Version</label>
          <select value={lang} onChange={e=>changeLang(e.target.value)} style={{...inp,width:190}}>
            <option value="fr">🇫🇷 Français uniquement</option>
            <option value="en">🇨🇦 Anglais uniquement</option>
            <option value="bilingual">🇫🇷🇨🇦 Bilingue (FR + EN)</option>
          </select>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <label style={{fontSize:10,fontWeight:700,color:GRAY,textTransform:"uppercase"}}>🎨 Rubriques en couleur</label>
          <input type="checkbox" checked={useColor} onChange={e=>changeUseC(e.target.checked)} style={{width:16,height:16,cursor:"pointer"}}/>
          {useColor&&<input type="color" value={color} onChange={e=>changeColor(e.target.value)} style={{width:34,height:26,border:`1px solid ${BORDER}`,cursor:"pointer",borderRadius:4}}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <label style={{fontSize:10,fontWeight:700,color:GRAY,textTransform:"uppercase"}}>🔤 Police</label>
          <select value={font} onChange={e=>{const v=e.target.value;setFont(v);triggerSave({...form},lang,color,useColor);}} style={{fontSize:11,border:`1px solid ${BORDER}`,borderRadius:6,padding:"3px 6px",cursor:"pointer",outline:"none",background:"#fff",fontFamily:"inherit"}}>
            {[["Arial","Arial"],["Times New Roman","Times New Roman"],["Calibri","Calibri"],["Garamond","Garamond"],["Georgia","Georgia"],["Trebuchet MS","Trebuchet MS"],["Verdana","Verdana"],["Helvetica","Helvetica"],["Palatino Linotype","Palatino Linotype"],["Cambria","Cambria"]].map(([l,v])=>(
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-p" onClick={generatePDF} disabled={quota===0||cvCount>=quota} style={{marginLeft:"auto",padding:"9px 22px",opacity:quota===0||cvCount>=quota?0.4:1}}>
          🖨️ Générer le PDF {quota>0?`(${quota-cvCount} restant${quota-cvCount>1?"s":""})`:""}
        </button>
      </div>

      {/* Pré-remplissage automatique */}
      <div className="card" style={{padding:20,marginBottom:16,border:`1.5px solid rgba(26,58,143,0.15)`,background:"rgba(26,58,143,0.02)"}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:DARK,marginBottom:4}}>🚀 Pré-remplissage automatique</h3>
        <p style={{fontSize:12,color:GRAY,marginBottom:14}}>Uploadez votre CV existant — l'IA extrait et pré-remplit le formulaire en quelques secondes.</p>
        <CvParser onFill={fillFromCV}/>
      </div>

      {/* Formulaire */}
      <div className="card" style={{padding:22}}>

        <CvS label="Informations personnelles">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["Prénom","prenom",""],["Nom","nom",""],["Titre / Poste visé","titre","Ex: Éducatrice de la petite enfance"],["Email","email",""],["Téléphone","telephone","+1 514 000-0000"],["Adresse","adresse","Ville, Province, Canada"]].map(([l,k,ph])=>(
              <div key={k}>
                <label style={{fontSize:10,color:GRAY,display:"block",marginBottom:3}}>{l}</label>
                <input style={inp} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={ph}/>
              </div>
            ))}
          </div>
        </CvS>

        <CvS label="Résumé professionnel">
          <textarea style={{...inp,minHeight:90,resize:"vertical"}} value={form.resume} onChange={e=>upd("resume",e.target.value)} placeholder="Décrivez votre profil professionnel, vos années d'expérience et votre objectif de carrière au Canada..."/>
          <div style={{fontSize:10,color:GRAY,marginTop:4}}><em>Laisser vide si vous préférez ne pas inclure de résumé</em></div>
        </CvS>

        <CvS label="Expériences professionnelles">
          {form.experiences.map((exp,i)=>(
            <div key={i} style={{background:BG,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${BORDER}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:8}}>
                {[["Poste / Titre","poste"],["Entreprise / Organisation","entreprise"],["Lieu (Ville, Pays)","lieu"]].map(([l,k])=>(
                  <div key={k}><label style={{fontSize:10,color:GRAY,display:"block",marginBottom:3}}>{l}</label><input style={inp} value={exp[k]} onChange={e=>updArr("experiences",i,k,e.target.value)}/></div>
                ))}
                <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                  <div>
                    <label style={{fontSize:10,color:GRAY,display:"block",marginBottom:3}}>Début (MM/AAAA)</label>
                    <div style={{display:"flex",gap:6}}>
                      <select style={{...inp,flex:1}} value={exp.debutMois} onChange={e=>updArr("experiences",i,"debutMois",e.target.value)}>
                        <option value="">Mois</option>
                        {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                      <input style={{...inp,flex:"0 0 80px"}} value={exp.debutAnnee} onChange={e=>updArr("experiences",i,"debutAnnee",e.target.value)} placeholder="AAAA" maxLength={4}/>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:10,color:GRAY,display:"block",marginBottom:3}}>Fin (MM/AAAA ou vide = Aujourd'hui)</label>
                    <div style={{display:"flex",gap:6}}>
                      <select style={{...inp,flex:1}} value={exp.finMois} onChange={e=>updArr("experiences",i,"finMois",e.target.value)}>
                        <option value="">Mois</option>
                        {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                      <input style={{...inp,flex:"0 0 80px"}} value={exp.finAnnee} onChange={e=>updArr("experiences",i,"finAnnee",e.target.value)} placeholder="AAAA" maxLength={4}/>
                    </div>
                    <div style={{fontSize:9,color:GRAY,marginTop:3}}>Laisser vide = "Aujourd'hui"</div>
                  </div>
                </div>
              </div>
              <label style={{fontSize:10,color:GRAY,display:"block",marginBottom:4}}>Tâches / Réalisations</label>
              {exp.taches.map((t,ti)=>(
                <div key={ti} style={{display:"flex",gap:6,marginBottom:5}}>
                  <input style={{...inp,flex:1}} value={t} onChange={e=>updTache(i,ti,e.target.value)} placeholder="Ex: Accueillir les enfants et favoriser leur intégration"/>
                  {exp.taches.length>1&&<button onClick={()=>{const n=[...form.experiences];n[i].taches=n[i].taches.filter((_,x)=>x!==ti);const nf={...form,experiences:n};setForm(nf);triggerSave(nf);}} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:12,flexShrink:0}}>✕</button>}
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button onClick={()=>{const n=[...form.experiences];n[i].taches=[...n[i].taches,""];const nf={...form,experiences:n};setForm(nf);triggerSave(nf);}} className="btn btn-o btn-sm" style={{fontSize:11}}>+ Tâche</button>
                {form.experiences.length>1&&<button onClick={()=>delArr("experiences",i)} style={{background:"rgba(220,38,38,0.07)",border:"1px solid rgba(220,38,38,0.2)",color:"#dc2626",borderRadius:7,padding:"4px 11px",cursor:"pointer",fontSize:11}}>🗑 Supprimer</button>}
              </div>
            </div>
          ))}
          <button onClick={()=>addArr("experiences",{poste:"",entreprise:"",lieu:"",debutMois:"",debutAnnee:"",finMois:"",finAnnee:"",taches:[""]})} className="btn btn-o btn-sm">+ Ajouter une expérience</button>
          <div style={{fontSize:10,color:GRAY,marginTop:6}}><em>Les expériences sans poste ni entreprise ne seront pas incluses dans le CV</em></div>
        </CvS>

        <CvS label="Formation & Éducation">
          {form.formations.map((f,i)=>(
            <div key={i} style={{background:BG,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${BORDER}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {[["Diplôme / Formation","diplome"],["Établissement","etablissement"],["Lieu","lieu"]].map(([l,k])=>(
                  <div key={k}><label style={{fontSize:10,color:GRAY,display:"block",marginBottom:3}}>{l}</label><input style={inp} value={f[k]} onChange={e=>updArr("formations",i,k,e.target.value)}/></div>
                ))}
                <div>
                  <label style={{fontSize:10,color:GRAY,display:"block",marginBottom:3}}>Date (MM/AAAA)</label>
                  <div style={{display:"flex",gap:6}}>
                    <select style={{...inp,flex:1}} value={f.mois} onChange={e=>updArr("formations",i,"mois",e.target.value)}>
                      <option value="">Mois</option>
                      {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                    <input style={{...inp,flex:"0 0 80px"}} value={f.annee} onChange={e=>updArr("formations",i,"annee",e.target.value)} placeholder="AAAA" maxLength={4}/>
                  </div>
                </div>
              </div>
              {form.formations.length>1&&<button onClick={()=>delArr("formations",i)} style={{marginTop:8,background:"rgba(220,38,38,0.07)",border:"1px solid rgba(220,38,38,0.2)",color:"#dc2626",borderRadius:7,padding:"4px 11px",cursor:"pointer",fontSize:11}}>🗑 Supprimer</button>}
            </div>
          ))}
          <button onClick={()=>addArr("formations",{diplome:"",etablissement:"",lieu:"",mois:"",annee:""})} className="btn btn-o btn-sm">+ Ajouter une formation</button>
          <div style={{fontSize:10,color:GRAY,marginTop:6}}><em>Les formations sans diplôme ne seront pas incluses dans le CV</em></div>
        </CvS>

        <CvS label="Certifications & Formation continue">
          <textarea style={{...inp,minHeight:100,resize:"vertical"}} value={form.certifications} onChange={e=>upd("certifications",e.target.value)} placeholder={"Titre de la certification – Organisme – MM/AAAA\nTitre de la certification – Organisme – MM/AAAA\n..."}/>
          <div style={{fontSize:10,color:GRAY,marginTop:4}}>Une certification par ligne — elles seront listées avec • dans le CV &nbsp;·&nbsp; <em>Laisser vide si non applicable</em></div>
        </CvS>

        <CvS label="Compétences">
          <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={form.competences} onChange={e=>upd("competences",e.target.value)} placeholder={"Votre compétence 1\nVotre compétence 2\nVotre compétence 3\n..."}/>
          <div style={{fontSize:10,color:GRAY,marginTop:4}}>Une compétence par ligne &nbsp;·&nbsp; <em>Laisser vide si non applicable</em></div>
        </CvS>

        <CvS label="Langues">
          {form.langues.map((l,i)=>(
            <div key={i} style={{display:"flex",gap:9,marginBottom:7,alignItems:"center"}}>
              <input style={{...inp,flex:"0 0 140px"}} value={l.langue} onChange={e=>updArr("langues",i,"langue",e.target.value)} placeholder="Français"/>
              <input style={{...inp,flex:1}} value={l.niveau} onChange={e=>updArr("langues",i,"niveau",e.target.value)} placeholder="Lu, écrit et parlé (Courant)"/>
              {form.langues.length>1&&<button onClick={()=>delArr("langues",i)} style={{background:"rgba(220,38,38,0.1)",border:"none",color:"#dc2626",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:12,flexShrink:0}}>✕</button>}
            </div>
          ))}
          <button onClick={()=>addArr("langues",{langue:"",niveau:""})} className="btn btn-o btn-sm">+ Ajouter une langue</button>
          <div style={{fontSize:10,color:GRAY,marginTop:6}}><em>Les langues sans nom ne seront pas incluses dans le CV</em></div>
        </CvS>

        <CvS label="Références">
          <input style={inp} value={form.references} onChange={e=>upd("references",e.target.value)} placeholder="Disponible sur demande / Available upon request"/>
          <div style={{fontSize:10,color:GRAY,marginTop:4}}><em>Laisser vide pour afficher "Disponible sur demande" automatiquement</em></div>
        </CvS>

        <div style={{display:"flex",justifyContent:"center",gap:12,paddingTop:16,flexWrap:"wrap"}}>
          <button className="btn btn-p" onClick={generatePDF} disabled={quota===0||cvCount>=quota} style={{padding:"11px 30px",fontSize:13,opacity:quota===0||cvCount>=quota?0.4:1}}>
            🖨️ Générer &amp; Imprimer {quota>0?`(${quota-cvCount} restant${quota-cvCount>1?"s":""})`:""}
          </button>
          <button className="btn btn-o" onClick={async()=>{setSaving(true);await apiPost("/api/cv/save",{...form,cvLang:lang,cvColor:color,cvUseColor:useColor});setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);}} style={{padding:"11px 22px",fontSize:13}}>
            💾 Sauvegarder maintenant
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateurCV;
