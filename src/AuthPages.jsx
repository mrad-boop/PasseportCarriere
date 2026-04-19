import { useState } from "react";
import { G, BLUE, DARK, GRAY, BORDER, BG, CSS, Grad, Spinner, API, ADMIN_CREDS, apiPost } from "./constants.jsx";

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
          <p style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>Passeport Carrière — TCF Canada</p>
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

export { LoginPage, RegisterPage };