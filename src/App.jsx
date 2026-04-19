import { useState, useEffect, useCallback, useRef } from "react";
import { CSS, LS, API, INIT_USERS, SAMPLE_CE, SAMPLE_CO, INIT_SITE_CONFIG, INIT_PACKS, INIT_AVANTAGES, INIT_TESTIMONIALS, apiGet, apiPost } from "./constants.js";
import LandingPage from "./LandingPage.jsx";
import { LoginPage, RegisterPage } from "./AuthPages.jsx";
import UserDashboard from "./UserDashboard.jsx";
import AdminPanel from "./AdminPanel.jsx";

export default function App() {
  const [screen,      setScreen]      = useState("landing");
  const [curUser,     setCurUser]     = useState(null);
  const [users,       setUsers]       = useState([]);
  const [series,      setSeries]      = useState([...SAMPLE_CE,...SAMPLE_CO]);
  const [siteConfig,  setSiteConfig]  = useState(INIT_SITE_CONFIG);
  const [packs,       setPacks]       = useState(INIT_PACKS);
  const [avantages,   setAvantages]   = useState(INIT_AVANTAGES);
  const [testimonials,setTestimonials]= useState(INIT_TESTIMONIALS);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Injecter le CSS global dans <head> une seule fois, garanti disponible partout
  useEffect(() => {
    const id = "pc-global-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  const token = () => localStorage.getItem("pc_token");
  const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("pc_token");
    localStorage.removeItem("pc_session");
    setCurUser(null);
    setScreen("landing");
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      const session = LS.get("pc_session", null);
      if(session) logout();
    }, INACTIVITY_MS);
  }, [logout]);

  // Restaurer la session au refresh
  useEffect(() => {
    // Toujours charger les données publiques depuis le backend
    apiGet("/api/series").then(d=>{ if(Array.isArray(d)&&d.length>0) setSeries(d); });
    apiGet("/api/packs").then(d=>{
      if(Array.isArray(d)&&d.length>0){
        // Merger avec INIT_PACKS pour conserver les champs visuels (ribbonColor, colorDark, etc.)
        const merged = d.map(pack=>{
          const base = INIT_PACKS.find(p=>p.id===pack.id) || {};
          return { ...base, ...pack,
            ribbonColor: pack.ribbonColor || base.ribbonColor,
            colorDark:   pack.colorDark   || base.colorDark,
            color:       pack.color       || base.color,
            ribbon:      pack.ribbon      || base.ribbon,
            highlight:   pack.highlight   !== undefined ? !!pack.highlight : !!base.highlight,
            features:    Array.isArray(pack.features) ? pack.features : (base.features||[]),
          };
        });
        setPacks(merged);
      }
    });
    apiGet("/api/packs/config").then(d=>{
      if(d && typeof d==="object"){
        // siteConfig
        const cfg={...INIT_SITE_CONFIG};
        Object.keys(INIT_SITE_CONFIG).forEach(k=>{ if(d[k]) cfg[k]=d[k]; });
        setSiteConfig(cfg);
        // avantages
        if(d.avantages){ try{ setAvantages(JSON.parse(d.avantages)); }catch{} }
        // testimonials
        if(d.testimonials){ try{ setTestimonials(JSON.parse(d.testimonials)); }catch{} }
      }
    });

    // Restaurer la session
    const session = LS.get("pc_session", null);
    const t = token();
    if(session && t) {
      const lastActivity = session.lastActivity || 0;
      const now = Date.now();
      if(now - lastActivity < INACTIVITY_MS) {
        if(session.isAdmin) {
          setScreen("admin");
          apiGet("/api/users").then(d=>{ if(Array.isArray(d)) setUsers(d); });
        } else if(session.user) {
          setCurUser(session.user);
          setScreen("user");
        }
        resetInactivityTimer();
      } else {
        logout();
      }
    }
  }, []);

  // Écouter les événements d'activité pour reset le timer
  useEffect(() => {
    const events = ["mousedown","mousemove","keydown","touchstart","scroll","click"];
    const handleActivity = () => {
      const session = LS.get("pc_session", null);
      if(session) {
        LS.set("pc_session", {...session, lastActivity: Date.now()});
        resetInactivityTimer();
      }
    };
    events.forEach(e => window.addEventListener(e, handleActivity, {passive:true}));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, [resetInactivityTimer]);

  // Sauvegarder la session quand l'user se connecte
  const loginUser = useCallback((u) => {
    setCurUser(u);
    setScreen("user");
    LS.set("pc_session", {user:u, isAdmin:false, lastActivity:Date.now()});
    resetInactivityTimer();
    // Démarrer le tracking de session
    apiPost("/api/users/session/start", {}).catch(()=>{});
    // Recharger les séries avec le token frais
    apiGet("/api/series").then(d=>{ if(Array.isArray(d)&&d.length>0) setSeries(d); }).catch(()=>{});
  }, [resetInactivityTimer, setSeries]);

  const loginAdmin = useCallback(() => {
    setScreen("admin");
    LS.set("pc_session", {user:null, isAdmin:true, lastActivity:Date.now()});
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const logoutUser = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    // Terminer le tracking de session avant logout
    apiPost("/api/users/session/end", {}).catch(()=>{}).finally(()=>logout());
  }, [logout]);

  return (
    <>
      {screen==="landing"  && <LandingPage  onLogin={()=>setScreen("login")} onRegister={()=>setScreen("register")} siteConfig={siteConfig} packs={packs} avantages={avantages} testimonials={testimonials} registerSuccess={registerSuccess} onCloseSuccess={()=>setRegisterSuccess(false)}/>}
      {screen==="login"    && <LoginPage    users={users} onSuccess={loginUser} onAdminLogin={loginAdmin} onRegister={()=>setScreen("register")}/>}
      {screen==="register" && <RegisterPage users={users} setUsers={setUsers} onSuccess={()=>{setRegisterSuccess(true);setScreen("landing");}} onLogin={()=>setScreen("login")}/>}
      {screen==="user"     && curUser && <UserDashboard user={curUser} series={series} setSeries={setSeries} setUsers={setUsers} onLogout={logoutUser}/>}
      {screen==="admin"    && <AdminPanel   users={users} setUsers={setUsers} series={series} setSeries={setSeries} siteConfig={siteConfig} setSiteConfig={setSiteConfig} packs={packs} setPacks={setPacks} avantages={avantages} setAvantages={setAvantages} testimonials={testimonials} setTestimonials={setTestimonials} onLogout={logoutUser}/>}
    </>
  );
}

export default App;
