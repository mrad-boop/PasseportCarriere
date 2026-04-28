import { useState } from "react";
import { G, BLUE, DARK, GRAY, BORDER, Grad, Spinner, apiPost } from "./constants.jsx";

export default function LettreMotivation({ user }) {
  const [poste,     setPoste]     = useState("");
  const [entreprise,setEntreprise]= useState("");
  const [descPoste, setDescPoste] = useState("");
  const [cvText,    setCvText]    = useState("");
  const [ton,       setTon]       = useState("formel");
  const [langue,    setLangue]    = useState("fr");
  const [lettre,    setLettre]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);

  const TON = {
    formel:    { label:"Formel",    desc:"Classique et professionnel", icon:"🎩" },
    dynamique: { label:"Dynamique", desc:"Moderne et percutant",       icon:"⚡" },
    creatif:   { label:"Créatif",   desc:"Original et mémorable",      icon:"✨" },
  };

  const INP = {fontSize:12,padding:"9px 12px",border:`1.5px solid ${BORDER}`,borderRadius:9,width:"100%",outline:"none",fontFamily:"'DM Sans',sans-serif",color:DARK,background:"#fff",boxSizing:"border-box"};

  const generate = async () => {
    if (!poste.trim()) return;
    setLoading(true); setLettre("");
    try {
      const data = await apiPost("/api/ai/lettre", { poste, entreprise, descPoste, cvText, ton, langue, user });
      setLettre(data?.lettre || data?.error || "Erreur inconnue.");
    } catch(e) { setLettre("Erreur lors de la generation."); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(lettre); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const print = () => {
    const w = window.open("","_blank");
    w.document.write(`<html><head><meta charset="utf-8"><style>body{font-family:Arial;max-width:700px;margin:40px auto;font-size:14px;line-height:1.8}</style></head><body>${lettre.replace(/\n/g,"<br/>")}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"32px 16px"}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:4}}>Lettre de <Grad>Motivation</Grad></h1>
        <p style={{fontSize:13,color:GRAY}}>Generez une lettre personnalisee basee sur votre CV et l'offre d'emploi</p>
      </div>

      <div className="card" style={{padding:24,marginBottom:16}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:DARK,marginBottom:16}}>Informations sur le poste</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase"}}>Poste vise *</label>
            <input style={INP} value={poste} onChange={e=>setPoste(e.target.value)} placeholder="ex: Technicien de maintenance"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase"}}>Entreprise (optionnel)</label>
            <input style={INP} value={entreprise} onChange={e=>setEntreprise(e.target.value)} placeholder="ex: Bombardier Aeronautique"/>
          </div>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase"}}>Description / Exigences du poste</label>
          <textarea style={{...INP,resize:"vertical",lineHeight:1.6}} rows={4} value={descPoste} onChange={e=>setDescPoste(e.target.value)} placeholder="Collez ici l'offre d'emploi ou les competences requises..."/>
        </div>
      </div>

      <div className="card" style={{padding:24,marginBottom:16}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:DARK,marginBottom:14}}>Votre CV</h3>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase"}}>Contenu de votre CV</label>
        <textarea style={{...INP,resize:"vertical",lineHeight:1.6}} rows={8} value={cvText} onChange={e=>setCvText(e.target.value)} placeholder="Collez ici le texte de votre CV..."/>
        <div style={{fontSize:10,color:GRAY,marginTop:3}}>Copiez-collez le texte de votre CV pour une lettre plus personnalisee.</div>
      </div>

      <div className="card" style={{padding:24,marginBottom:20}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:DARK,marginBottom:16}}>Style de la lettre</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:8,textTransform:"uppercase"}}>Langue</label>
            <div style={{display:"flex",gap:8}}>
              {[["fr","FR Francais"],["en","CA English"]].map(([v,l])=>(
                <button key={v} onClick={()=>setLangue(v)} style={{flex:1,padding:"9px",border:`2px solid ${langue===v?BLUE:BORDER}`,borderRadius:9,background:langue===v?"rgba(26,58,143,0.06)":"#fff",cursor:"pointer",fontSize:12,fontWeight:langue===v?700:400,color:langue===v?BLUE:DARK,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:8,textTransform:"uppercase"}}>Ton</label>
            <div style={{display:"flex",gap:8}}>
              {Object.entries(TON).map(([v,{label,icon}])=>(
                <button key={v} onClick={()=>setTon(v)} style={{flex:1,padding:"9px 4px",border:`2px solid ${ton===v?BLUE:BORDER}`,borderRadius:9,background:ton===v?"rgba(26,58,143,0.06)":"#fff",cursor:"pointer",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>
                  <div style={{fontSize:14}}>{icon}</div>
                  <div style={{fontSize:10,fontWeight:700,color:ton===v?BLUE:DARK,marginTop:2}}>{label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={loading||!poste.trim()} style={{width:"100%",padding:"14px",marginBottom:20,background:poste.trim()?G:"#e4e8f0",border:"none",borderRadius:12,color:poste.trim()?"#fff":GRAY,fontSize:14,fontWeight:700,cursor:poste.trim()?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        {loading?<><Spinner sm/> Generation en cours...</>:"Generer la lettre de motivation"}
      </button>

      {lettre&&(
        <div className="card" style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>Votre lettre</h3>
            <div style={{display:"flex",gap:8}}>
              <button onClick={copy} className="btn btn-o btn-sm">{copied?"Copie":"Copier"}</button>
              <button onClick={print} className="btn btn-p btn-sm">Imprimer / PDF</button>
            </div>
          </div>
          <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,padding:"32px 36px",fontFamily:"Arial,sans-serif",fontSize:13,lineHeight:1.9,color:"#222",whiteSpace:"pre-wrap"}}>
            {lettre}
          </div>
        </div>
      )}
    </div>
  );
}
