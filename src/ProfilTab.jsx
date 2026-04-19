import { useState } from "react";
import { G, BLUE, DARK, GRAY, BORDER, BG, CSS, Grad, Toast, PAYS_LIST, RANK_LABELS, API, apiGet, apiPost } from "./constants.jsx";
import PaymentModal from "./PaymentModal.jsx";

function ProfilTab({user,isPremium,attempts,onUpdate,onUpgrade}) {
  const [form,setForm]   = useState({
    nom:    user.nom||"",
    email:  user.email||"",
    adresse:user.adresse||"",
    pays:   user.pays||"CA",
    tel:    user.tel||"",
    whatsapp:user.whatsapp||"",
    photo:  user.photo||"",
  });
  const [saved,setSaved] = useState(false);
  const [editing,setEditing]=useState(false);
  const photoRef = useRef();
  const [toast,showToast] = useToast();

  const handlePhoto = async e => {
    const f = e.target.files[0];
    if(!f) return;
    const b64 = await toBase64(f);
    setForm(p=>({...p,photo:b64}));
    setEditing(true);
  };

  const save = () => {
    const updated = {...user,...form};
    onUpdate(updated);
    setEditing(false);
    showToast("Profil mis à jour !");
  };

  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); setEditing(true); };
  const paysInfo = getPays(form.pays);
  const initials = form.nom.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?";

  // Composant input local — nommé PF pour éviter conflit avec Field global
  const PF = ({label,k,type="text",placeholder}) => (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
      <input className="inp" type={type} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={placeholder||label}/>
    </div>
  );

  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"32px"}}>
      {toast&&<Toast {...toast}/>}
      <div className="fu" style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:DARK,marginBottom:3}}>Mon <Grad>profil</Grad></h1>
          <p style={{fontSize:13,color:GRAY}}>Vos informations personnelles · Modifiables à tout moment</p>
        </div>
        {editing&&(
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-o btn-sm" onClick={()=>{setForm({nom:user.nom,email:user.email,adresse:user.adresse||"",pays:user.pays,tel:user.tel||"",whatsapp:user.whatsapp||"",photo:user.photo||""});setEditing(false);}}>Annuler</button>
            <button className="btn btn-p btn-sm" onClick={save}>💾 Enregistrer</button>
          </div>
        )}
      </div>

      {/* Photo + plan */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${BORDER}`}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",border:`3px solid ${BORDER}`}}>
              {form.photo
                ? <img src={form.photo} alt="Photo" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>upd("photo","")}/>
                : <span style={{color:"#fff",fontWeight:700,fontSize:22}}>{initials}</span>
              }
            </div>
            <button onClick={()=>photoRef.current.click()} style={{position:"absolute",bottom:-2,right:-2,width:24,height:24,borderRadius:"50%",background:G,border:"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>📷</button>
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:DARK,marginBottom:3}}>{form.nom||"Votre nom"}</div>
            <div style={{fontSize:12,color:GRAY}}>{paysInfo.flag} {paysInfo.name} · Inscrit le {user.joined}</div>
            <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
              <span className="tag" style={{background:isPremium?G:"rgba(90,101,119,0.1)",color:isPremium?"#fff":GRAY,fontSize:10}}>{isPremium?"⭐ Premium":"Free"}</span>
              <span className="tag" style={{background:"rgba(5,150,105,0.1)",color:"#059669",fontSize:10}}>✅ {user.status}</span>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <button onClick={()=>photoRef.current.click()} className="btn btn-o btn-sm">📷 Changer photo</button>
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:4}}>
          {[["📖",Object.keys(attempts).filter(k=>k.startsWith("ce")).length,"Séries CE"],["🎧",Object.keys(attempts).filter(k=>k.startsWith("co")).length,"Séries CO"],["📅",user.lastLogin,"Dernière connexion"]].map(([icon,val,label])=>(
            <div key={label} style={{textAlign:"center",padding:"10px",background:BG,borderRadius:10}}>
              <div style={{fontSize:16,marginBottom:3}}>{icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:900,color:DARK}}>{val}</div>
              <div style={{fontSize:10,color:GRAY,marginTop:1}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Infos éditables */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:16}}>Informations personnelles</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <PF label="Nom et Prénom" k="nom" placeholder="Votre nom complet"/>
          <PF label="Adresse email" k="email" type="email" placeholder="votre@email.com"/>
        </div>
        <PF label="Adresse / Ville" k="adresse" placeholder="Ville, Province, Canada"/>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:DARK,marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Pays de résidence</label>
          <select className="inp" value={form.pays} onChange={e=>upd("pays",e.target.value)}>
            {PAYS_LIST.map(p=><option key={p.code} value={p.code}>{p.flag} {p.name}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <PF label="Téléphone" k="tel" placeholder="+1 514 000-0000"/>
          <PF label="WhatsApp" k="whatsapp" placeholder="+1 514 000-0000"/>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:DARK,marginBottom:3}}>Mot de passe</h3>
            <p style={{fontSize:12,color:GRAY}}>Dernière modification : à l'inscription</p>
          </div>
          <button className="btn btn-o btn-sm" onClick={()=>showToast("Fonction disponible bientôt.","info")}>Modifier</button>
        </div>
      </div>

      {/* Upgrade */}
      {!isPremium&&(
        <div style={{background:G,borderRadius:14,padding:"24px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
          <div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>Passez à Premium</h3>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.6}}>Toutes les séries débloquées · Générateur CV · Accès prioritaire</p>
          </div>
          <button className="btn" style={{background:"#fff",color:BLUE,fontWeight:700,padding:"11px 24px"}} onClick={onUpgrade}>Upgrader ⭐</button>
        </div>
      )}

      {/* Save floating bar */}
      {editing&&(
        <div className="si" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:DARK,borderRadius:12,padding:"12px 22px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:500,border:"1px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>Modifications non enregistrées</span>
          <button className="btn btn-o btn-sm" onClick={()=>{setForm({nom:user.nom,email:user.email,adresse:user.adresse||"",pays:user.pays,tel:user.tel||"",whatsapp:user.whatsapp||"",photo:user.photo||""});setEditing(false);}}>Annuler</button>
          <button className="btn btn-p btn-sm" onClick={save}>💾 Enregistrer</button>
        </div>
      )}
    </div>
  );
}

export default ProfilTab;