import { useState } from "react";
import { G, BLUE, DARK, GRAY, BORDER, BG, Grad, Spinner } from "./constants.jsx";

/* ── CvParser — Upload CV et extraction automatique ── */
export default function CvParser({ onFill }) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const [dragging,setDragging]= useState(false);

  const ACCEPTED = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

  const toBase64 = file => new Promise((res,rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Lecture échouée"));
    r.readAsDataURL(file);
  });

  const getMimeType = file => {
    const ext = file.name.split(".").pop().toLowerCase();
    const map = { pdf:"application/pdf", jpg:"image/jpeg", jpeg:"image/jpeg",
                  png:"image/png", doc:"application/msword",
                  docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    return map[ext] || file.type;
  };

  const parse = async file => {
    if (!file) return;
    setLoading(true);
    setDone(false);
    setError("");

    try {
      const ext  = file.name.split(".").pop().toLowerCase();
      const b64  = await toBase64(file);
      const mime = getMimeType(file);

      // Construire le message selon le type
      const isImage = ["jpg","jpeg","png"].includes(ext);
      const isPdf   = ext === "pdf";

      let content;
      if (isImage) {
        content = [
          { type:"image",  source:{ type:"base64", media_type:mime, data:b64 } },
          { type:"text",   text: PROMPT }
        ];
      } else if (isPdf) {
        content = [
          { type:"document", source:{ type:"base64", media_type:"application/pdf", data:b64 } },
          { type:"text",     text: PROMPT }
        ];
      } else {
        // Word — convertir en texte côté client avec mammoth
        const mammoth = await import("mammoth");
        const arrayBuf = await file.arrayBuffer();
        const result   = await mammoth.extractRawText({ arrayBuffer: arrayBuf });
        content = [
          { type:"text", text: `Voici le texte extrait d'un CV Word:\n\n${result.value}\n\n${PROMPT}` }
        ];
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role:"user", content }]
        })
      });

      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";

      // Parser le JSON retourné
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);

      // Remplir le formulaire CV
      onFill(parsed);
      setDone(true);
    } catch(e) {
      console.error(e);
      setError("Impossible d'extraire les données. Vérifiez le format du fichier.");
    }
    setLoading(false);
  };

  const handleFile = e => parse(e.target.files[0]);
  const handleDrop = e => {
    e.preventDefault();
    setDragging(false);
    parse(e.dataTransfer.files[0]);
  };

  return (
    <div style={{marginBottom:20}}>
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        style={{
          border:`2px dashed ${dragging?BLUE:done?"#059669":BORDER}`,
          borderRadius:14, padding:"28px 20px", textAlign:"center",
          background:dragging?"rgba(26,58,143,0.04)":done?"rgba(5,150,105,0.04)":"#fff",
          transition:"all .2s", cursor:"pointer"
        }}
        onClick={()=>!loading&&document.getElementById("cv-upload-input").click()}
      >
        <input id="cv-upload-input" type="file" accept={ACCEPTED}
          style={{display:"none"}} onChange={handleFile}/>

        {loading ? (
          <>
            <Spinner/>
            <div style={{marginTop:12,fontSize:13,color:GRAY}}>Analyse du CV en cours…</div>
          </>
        ) : done ? (
          <>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontSize:14,fontWeight:700,color:"#059669",marginBottom:4}}>Données extraites avec succès !</div>
            <div style={{fontSize:12,color:GRAY}}>Vérifiez les champs pré-remplis ci-dessous et complétez si besoin.</div>
            <button onClick={e=>{e.stopPropagation();setDone(false);}}
              style={{marginTop:10,fontSize:11,color:BLUE,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>
              Uploader un autre CV
            </button>
          </>
        ) : (
          <>
            <div style={{fontSize:36,marginBottom:10}}>📄</div>
            <div style={{fontSize:14,fontWeight:700,color:DARK,marginBottom:4}}>
              Importez votre CV existant
            </div>
            <div style={{fontSize:12,color:GRAY,marginBottom:12,lineHeight:1.6}}>
              Glissez-déposez ou cliquez pour sélectionner<br/>
              <span style={{fontSize:11,opacity:.7}}>PDF, Word (.docx), Image JPG/PNG</span>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 20px",
              background:G,borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              📁 Choisir un fichier
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{marginTop:10,padding:"10px 14px",background:"rgba(220,38,38,0.06)",
          border:"1px solid rgba(220,38,38,0.2)",borderRadius:8,fontSize:12,color:"#dc2626"}}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

const PROMPT = `Analyse ce CV et extrais les informations en JSON strict (sans markdown, sans commentaire).
Retourne UNIQUEMENT ce JSON :
{
  "nom": "",
  "prenom": "",
  "email": "",
  "telephone": "",
  "adresse": "",
  "titre": "",
  "resume": "",
  "competences": "",
  "certifications": "",
  "references": "",
  "langues": [{"langue":"","niveau":""}],
  "experiences": [{"poste":"","entreprise":"","lieu":"","debutMois":"","debutAnnee":"","finMois":"","finAnnee":"","taches":[""]}],
  "formations": [{"diplome":"","etablissement":"","lieu":"","mois":"","annee":""}]
}
Si un champ est absent, laisse-le vide. Pour les listes, inclus tous les éléments trouvés.`;
