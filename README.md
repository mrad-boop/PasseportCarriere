# 🍁 Passeport Carrière — TCF Canada

Plateforme de préparation TCF Canada avec scoring officiel A1→C2, 80 séries d'entraînement, interface admin complète.

---

## 📁 Structure du projet

```
passeport-carriere/
├── index.html          ← Point d'entrée HTML
├── vite.config.js      ← Config Vite
├── package.json        ← Dépendances
├── vercel.json         ← Config déploiement Vercel
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx        ← Point d'entrée React
    └── App.jsx         ← Application complète
```

---

## 🚀 Déploiement — Guide complet

### Étape 1 — Préparer le projet en local

```bash
# 1. Créer un dossier et y placer tous les fichiers
mkdir passeport-carriere
cd passeport-carriere

# 2. Installer les dépendances
npm install

# 3. Tester en local
npm run dev
# → Ouvrir http://localhost:5173
```

---

### Étape 2 — Pousser sur GitHub

```bash
# 1. Initialiser Git
git init
git add .
git commit -m "🚀 Initial commit — Passeport Carrière TCF Canada"

# 2. Créer un dépôt sur https://github.com/new
#    Nom suggéré : passeport-carriere
#    Visibilité : Public ou Private (au choix)

# 3. Connecter et pousser
git remote add origin https://github.com/VOTRE_USERNAME/passeport-carriere.git
git branch -M main
git push -u origin main
```

---

### Étape 3A — Déployer sur Vercel (recommandé — gratuit)

1. Aller sur **https://vercel.com** → Se connecter avec GitHub
2. Cliquer **"Add New Project"**
3. Sélectionner le dépôt `passeport-carriere`
4. Configuration automatique détectée (Vite) :
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. Cliquer **"Deploy"**
6. ✅ URL générée : `https://passeport-carriere.vercel.app`

**Déploiements automatiques** : chaque `git push` sur `main` redéploie automatiquement.

---

### Étape 3B — Déployer sur Render (alternative gratuite)

1. Aller sur **https://render.com** → Se connecter avec GitHub
2. Cliquer **"New" → "Static Site"**
3. Connecter le dépôt `passeport-carriere`
4. Configuration :
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
5. Cliquer **"Create Static Site"**
6. ✅ URL générée : `https://passeport-carriere.onrender.com`

> ⚠️ **Important pour Render** : Dans les paramètres du site, ajouter une règle de redirection :
> - Source : `/*`
> - Destination : `/index.html`
> - Type : **Rewrite**

---

## 🔐 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@launchpad.ca | Admin2026! |
| Utilisateur | mourad@email.com | Test1234! |

---

## ⚙️ Fonctionnalités

- ✅ Authentification (inscription / connexion)
- ✅ Dashboard utilisateur avec 80 séries TCF (CE + CO)
- ✅ Moteur d'examen avec timer officiel
- ✅ Scoring A1→C2 barème officiel
- ✅ Résultats détaillés par question
- ✅ Profil utilisateur éditable + photo
- ✅ Panel d'administration complet
- ✅ Gestion des séries (CRUD + import JSON + IA)
- ✅ Gestion des packs Bronze/Silver/Gold
- ✅ Gestion des témoignages, avantages, textes
- ✅ Persistence localStorage
- 🚀 Coming Soon : Expression Écrite, Orale, CV, HireMe

---

## 📦 Données persistées (localStorage)

| Clé | Contenu |
|-----|---------|
| `lp_users` | Utilisateurs inscrits |
| `lp_series` | Séries et questions |
| `lp_site_config` | Textes de la page d'accueil |
| `lp_packs` | Packs Bronze/Silver/Gold |
| `lp_avantages` | Section avantages |
| `lp_testimonials` | Témoignages |
| `lp_att_{userId}` | Résultats par utilisateur |

---

## 🌐 Nom de domaine personnalisé

### Sur Vercel :
1. Aller dans **Settings → Domains**
2. Ajouter votre domaine (ex: `passeportcarriere.ca`)
3. Configurer les DNS chez votre registrar :
   - Type : `CNAME`
   - Nom : `www`
   - Valeur : `cname.vercel-dns.com`

### Sur Render :
1. Aller dans **Settings → Custom Domains**
2. Ajouter votre domaine
3. Suivre les instructions DNS fournies

---

© 2026 Passeport Carrière
