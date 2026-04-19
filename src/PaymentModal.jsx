import { useState } from "react";
import { G, BLUE, DARK, GRAY, BORDER, BG, Modal, INIT_PACKS } from "./constants.jsx";

function PaymentModal({onClose}) {
  const [selectedPack,setSelectedPack] = useState(null);
  const [showCS,setShowCS] = useState(false);
  const PACKS_PAY = [
    {id:"bronze",name:"Bronze",price:"14.99",color:"#cd7f32",colorDark:"#a0522d",cv:3,acces:"7 Jours",features:["40 tests CE","40 tests CO","Expression Orale","Expression Écrite","Version 2026"],bonus:"3 générations CV"},
    {id:"silver",name:"Silver",price:"24.99",color:"#607080",colorDark:"#4a5a6a",cv:10,acces:"15 Jours",features:["40 tests CE","40 tests CO","Expression Orale","Expression Écrite","Version 2026"],bonus:"10 générations CV",highlight:true},
    {id:"gold",  name:"Gold",  price:"39.99",color:"#c8a227",colorDark:"#9a7b0a",cv:30,acces:"30 Jours",features:["40 tests CE","40 tests CO","Expression Orale","Expression Écrite","Version 2026"],bonus:"30 générations CV"},
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(6,13,31,0.85)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:860,fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#fff",marginBottom:6}}>Choisissez votre <span style={{background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Pack</span></h2>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Sélectionnez un pack puis procédez au paiement</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
          {PACKS_PAY.map(p=>(
            <div key={p.id} onClick={()=>setSelectedPack(p.id)} style={{background:selectedPack===p.id?"rgba(45,91,227,0.15)":"rgba(255,255,255,0.04)",border:`2px solid ${selectedPack===p.id?BLUE:p.highlight?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:22,cursor:"pointer",transition:"all .18s",position:"relative"}}>
              {p.highlight&&<div style={{position:"absolute",top:0,right:0,background:"#2d5be3",fontSize:9,fontWeight:900,padding:"4px 12px 4px 16px",borderRadius:"0 12px 0 14px",color:"#fff",letterSpacing:.6}}>POPULAIRE</div>}
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:p.color,marginBottom:8}}>{p.name}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:12}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>$</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"#fff"}}>{p.price.split(".")[0]}</span>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{"."+(p.price.split(".")[1]||"99")}</span>
              </div>
              {p.features.map((f,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:3}}>✓ {f}</div>)}
              <div style={{marginTop:10,background:`${p.color}22`,border:`1px solid ${p.color}44`,borderRadius:7,padding:"6px 10px",fontSize:11,color:p.color,fontWeight:600}}>📄 {p.bonus} · 📅 Accès {p.acces}</div>
              {selectedPack===p.id&&<div style={{marginTop:10,textAlign:"center",color:BLUE,fontSize:12,fontWeight:700}}>✅ Sélectionné</div>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button className="btn btn-p" style={{padding:"12px 36px",fontSize:14}} onClick={()=>{ if(!selectedPack){alert("Veuillez sélectionner un pack.");return;} setShowCS(true); }}>
            💳 Payer maintenant
          </button>
          <button className="btn btn-ghost" style={{padding:"12px 22px"}} onClick={onClose}>Annuler</button>
        </div>
      </div>
      {/* Coming soon popup */}
      {showCS&&(
        <div style={{position:"fixed",inset:0,background:"rgba(6,13,31,0.85)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:20,padding:40,textAlign:"center",maxWidth:380,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
            <div style={{fontSize:52,marginBottom:16}}>🚀</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:DARK,marginBottom:10}}>Paiement — Bientôt disponible</h3>
            <p style={{fontSize:13,color:GRAY,lineHeight:1.7,marginBottom:20}}>Le système de paiement en ligne sera disponible très prochainement. Contactez-nous pour activer votre pack manuellement.</p>
            <button className="btn btn-p" style={{width:"100%"}} onClick={()=>{ setShowCS(false); onClose(); }}>Compris !</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentModal;
