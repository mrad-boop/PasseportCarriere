import { useState } from "react";
import { G, BLUE, DARK, GRAY, BORDER, Grad, Spinner, apiPost } from "./constants.jsx";

export default function CvParser({ onFill }) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const [dragging,setDragging]= useState(false);

  const ACCEPTED = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

  const toBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Lecture échouée"));
    r.readAsDataURL(file);
  });

  const getMime = file => {
    const ext = file.name.split(".").pop().toLowerCase();
    const map = { pdf:"application/pdf", jpg:"image/jpeg", jpeg:"image/jpeg",
                  png:"image/png", doc:"application/msword",
                  docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    return map[ext] || file.type;
  };

  const parse = async file => {
    if (!file) return;
    setLoading(true); setDone(false); setError("");

    try {
      const ext  = file.name.split(".").pop().toLowerCase();
      const mime = getMime(file);
      let body   = {};

      // Tous les formats envoyés en base64 — le backend gère l'extraction
      const b64 = await toBase64(file);
      body = { fileBase64: b64, mimeType: mime };

      const parsed = await apiPost("/api/ai/parse-cv", body);
      if (!parsed || parsed.error) throw new Error(parsed?.error || "Erreur serveur");
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
    e.preventDefault(); setDragging(false);
    parse(e.dataTransfer.files[0]);
  };

  return (
    <div style={{marginBottom:4}}>
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        style={{
          border:`2px dashed ${dragging?BLUE:done?"#059669":BORDER}`,
          borderRadius:14, padding:"24px 20px", textAlign:"center",
          background:dragging?"rgba(26,58,143,0.04)":done?"rgba(5,150,105,0.04)":"#fff",
          transition:"all .2s", cursor:"pointer"
        }}
        onClick={()=>!loading&&document.getElementById("cv-upload-input").click()}
      >
        <input id="cv-upload-input" type="file" accept={ACCEPTED}
          style={{display:"none"}} onChange={handleFile}/>

        {loading ? (
          <>
            <div style={{marginBottom:10}}><Spinner/></div>
            <div style={{fontSize:13,color:GRAY}}>Analyse du CV en cours…</div>
          </>
        ) : done ? (
          <>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontSize:14,fontWeight:700,color:"#059669",marginBottom:4}}>Données extraites !</div>
            <div style={{fontSize:12,color:GRAY}}>Vérifiez et complétez les champs pré-remplis ci-dessous.</div>
            <button onClick={e=>{e.stopPropagation();setDone(false);}}
              style={{marginTop:10,fontSize:11,color:BLUE,background:"none",border:"none",
                cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif"}}>
              Uploader un autre CV
            </button>
          </>
        ) : (
          <>
            <div style={{fontSize:36,marginBottom:10}}>📄</div>
            <div style={{fontSize:14,fontWeight:700,color:DARK,marginBottom:4}}>Importez votre CV existant</div>
            <div style={{fontSize:12,color:GRAY,marginBottom:12,lineHeight:1.6}}>
              Glissez-déposez ou cliquez · PDF, Word, JPG/PNG
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 20px",
              background:G,borderRadius:20,color:"#fff",fontSize:12,fontWeight:700}}>
              📁 Choisir un fichier
            </div>
          </>
        )}
      </div>
      {error&&(
        <div style={{marginTop:10,padding:"10px 14px",background:"rgba(220,38,38,0.06)",
          border:"1px solid rgba(220,38,38,0.2)",borderRadius:8,fontSize:12,color:"#dc2626"}}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
