import { useState, useRef } from "react";
import { G, BLUE, MAG, DARK, GRAY, BORDER, BG, Grad, Spinner, apiPost } from "./constants.jsx";

/* ── LettreMotivation — page séparée du dashboard ── */
export default function LettreMotivation({ user, isPremium }) {
  const [poste,    setPoste]    = useState("");
  const [entreprise,setEntreprise]=useState("");
  const [ton,      setTon]      = useState("formel");
  const [langue,   setLangue]   = useState("fr");
  const [lettre,   setLettre]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState(false);
  const printRef = useRef();

  const TON_LABELS = {
    formel:    { label:"Formel",    desc:"Classique et professionnel", icon:"🎩" },
    dynamique: { label:"Dynamique", desc:"Moderne et percutant",       icon:"⚡" },
    creatif:   { label:"Créatif",   desc:"Original et mémorable",      icon:"✨" },
  };

  const generate = async () => {
    if (!poste.trim()) return;
    setLoading(true);
    setLettre("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Tu es un expert RH francophone spécialisé dans l'immigration canadienne.
Rédige une lettre de motivation ${langue === "fr" ? "en français" : "en anglais"} avec un ton ${ton}.

Candidat :
- Nom : ${user.nom || "Non précisé"}
- Email : ${user.email || "Non précisé"}
- Pays : ${user.pays || "Non précisé"}

Poste visé : ${poste}
${entreprise ? `Entreprise : ${entreprise}` : ""}

Contraintes :
- 3-4 paragraphes maximum
- Mentionne le parcours d'immigration/relocalisation au Canada
- Termine par une formule de politesse adaptée au ton
- Réponds UNIQUEMENT avec la lettre, sans aucun commentaire ni markdown`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setLettre(text);
    } catch(e) {
      setLettre("Erreur lors de la génération. Veuillez réessayer.");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(lettre);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const print = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Lettre de motivation</title>
      <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;font-size:14px;line-height:1.8;color:#222}
      @media print{body{margin:20px}}</style></head>
      <body>${lettre.replace(/\n/g,"<br/>")}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"32px 16px"}}>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:4}}>
          Lettre de <Grad>Motivation</Grad>
        </h1>
        <p style={{fontSize:13,color:GRAY}}>Générez une lettre personnalisée en quelques secondes grâce à l'IA</p>
      </div>

      {/* Formulaire */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:18}}>
          🎯 Paramètres
        </h3>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>
              Poste visé *
            </label>
            <input className="inp" value={poste} onChange={e=>setPoste(e.target.value)}
              placeholder="ex: Technicien de maintenance"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>
              Entreprise (optionnel)
            </label>
            <input className="inp" value={entreprise} onChange={e=>setEntreprise(e.target.value)}
              placeholder="ex: Bombardier Aéronautique"/>
          </div>
        </div>

        {/* Langue */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:8,textTransform:"uppercase",letterSpacing:.4}}>
            Langue
          </label>
          <div style={{display:"flex",gap:10}}>
            {[["fr","🇫🇷 Français"],["en","🇨🇦 English"]].map(([v,l])=>(
              <button key={v} onClick={()=>setLangue(v)}
                style={{flex:1,padding:"10px",border:`2px solid ${langue===v?BLUE:BORDER}`,borderRadius:10,
                  background:langue===v?"rgba(26,58,143,0.06)":"#fff",cursor:"pointer",
                  fontSize:13,fontWeight:langue===v?700:400,color:langue===v?BLUE:DARK,
                  fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Ton */}
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:8,textTransform:"uppercase",letterSpacing:.4}}>
            Ton de la lettre
          </label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {Object.entries(TON_LABELS).map(([v,{label,desc,icon}])=>(
              <button key={v} onClick={()=>setTon(v)}
                style={{padding:"12px 10px",border:`2px solid ${ton===v?BLUE:BORDER}`,borderRadius:12,
                  background:ton===v?"rgba(26,58,143,0.06)":"#fff",cursor:"pointer",textAlign:"center",
                  transition:"all .15s",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:ton===v?BLUE:DARK}}>{label}</div>
                <div style={{fontSize:10,color:GRAY,marginTop:2}}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading||!poste.trim()}
          style={{width:"100%",padding:"13px",background:poste.trim()?G:"#e4e8f0",
            border:"none",borderRadius:12,color:poste.trim()?"#fff":GRAY,
            fontSize:14,fontWeight:700,cursor:poste.trim()?"pointer":"not-allowed",
            fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",
            justifyContent:"center",gap:10,transition:"all .2s"}}>
          {loading ? <><Spinner sm/> Génération en cours…</> : "✨ Générer la lettre"}
        </button>
      </div>

      {/* Résultat */}
      {lettre && (
        <div className="card" style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK}}>
              📝 Votre lettre de motivation
            </h3>
            <div style={{display:"flex",gap:8}}>
              <button onClick={copy} className="btn btn-o btn-sm">
                {copied ? "✅ Copié" : "📋 Copier"}
              </button>
              <button onClick={print} className="btn btn-p btn-sm">
                🖨️ Imprimer / PDF
              </button>
            </div>
          </div>

          {/* Aperçu lettre */}
          <div ref={printRef} style={{
            background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,
            padding:"32px 36px",fontFamily:"Arial,sans-serif",fontSize:13,
            lineHeight:1.9,color:"#222",whiteSpace:"pre-wrap",
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)"
          }}>
            {lettre}
          </div>

          <div style={{marginTop:14,padding:"12px 16px",background:"rgba(26,58,143,0.05)",
            borderRadius:10,fontSize:12,color:GRAY,border:`1px solid rgba(26,58,143,0.1)`}}>
            💡 Conseil : Relisez et personnalisez la lettre avant de l'envoyer. Ajoutez des détails spécifiques à votre expérience.
          </div>
        </div>
      )}
    </div>
  );
}
