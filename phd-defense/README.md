# Final PhD Defense — Invite Page

**Celebrating 4 Years of Research & Discovery**  
Sanchit Minocha · May 8, 2026, 11 AM PST

---

## ✨ Overview

A beautiful, interactive invite page for your PhD Defense featuring:

- **Elegant water/satellite theme** — inspired by your research on reservoirs & sediment
- **DM Serif Display + DM Sans** fonts for editorial sophistication
- **RSVP modal** with in-person/online toggle
- **Live attendee tracking** via Firebase
- **Integrated AI chatbot** (Pikachu from your main site)
- **Responsive design** optimized for mobile & desktop
- **Smooth animations** (scroll hints, floating particles, fade-ins)

---

## 🚀 Quick Setup

### 1. Add Your Portrait Photo

Replace `portrait.svg` with your actual photo as `portrait.jpg`:
- Recommended: square image, 280×280px or larger
- The page falls back to the SVG if JPG is missing

```bash
# Copy your photo to the phd-defense folder
cp /path/to/your/photo.jpg phd-defense/portrait.jpg
```

### 2. Set Up Firebase for RSVP (5 minutes)

RSVP functionality requires a free Firebase Realtime Database.

#### Step 1: Create Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"** → name it `phd-defense` → Continue
3. Skip analytics → **Create project**

#### Step 2: Add Web App
1. Once created, go to **Project Settings** (gear icon, top-left)
2. Scroll to **"Your apps"**
3. Click **"Add app"** → select **Web**
4. Name it "PhD Defense Invite" → Register
5. **Copy the config object** (your API keys)

#### Step 3: Create Database
1. Go to **Build** menu (left sidebar)
2. Click **Realtime Database**
3. **Create Database** → Choose region (Seattle recommended)
4. **Start in Test Mode** (allows public RSVP submission)

#### Step 4: Add Config
1. In `phd-defense/` folder, copy `firebase-config.example.js` to `firebase-config.js`
2. Open `firebase-config.js` and replace placeholders:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       projectId: "YOUR_PROJECT",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
3. Save (it's gitignored, won't be pushed)

### 3. Test Locally

```bash
cd /Users/msanchit/Desktop/web_development/my_website
python3 -m http.server 8000
# Visit http://localhost:8000/phd-defense/
```

You should see:
- ✅ Hero with animated satellite grid + floating particles
- ✅ RSVP button in hero section
- ✅ Subtle "Find Directions" link
- ✅ Research overview, location, directions
- ✅ Chatbot launcher (bottom-right)
- ✅ Live attendee list when you RSVP

---

## 📁 File Structure

```
phd-defense/
├── index.html                  # Main page (DM fonts, modal RSVP)
├── style.css                   # 24KB of styles (water/sand theme)
├── app.js                      # Modal logic, RSVP, Firebase integration
├── firebase-config.example.js  # Template (committed to git)
├── firebase-config.js          # Your config (gitignored)
├── portrait.svg                # Placeholder with SM initials
├── portrait.jpg                # Your photo (you add this)
└── README.md                   # This file
```

### Parent Site References (Read-Only)
- `../assets/js/chatbot.js` — AI chatbot widget (NOT modified)
- `../assets/img/chat_icon/` — Pikachu images for chatbot (NOT modified)

All references are read-only. **Deleting `/phd-defense/` will NOT affect your main site.**

---

## 🎨 Design Features

### Colors
- **Navy Dark:** #0d2b3e (hero background)
- **Water Blue:** #2E86AB (buttons, accents)
- **Water Light:** #A8D8EA (links, tags)
- **Sand:** #C8A96E (dividers, particles)
- **Cream:** #FAFAF7 (body background)

### Typography
- **Headings:** DM Serif Display (elegant, editorial)
- **Body:** DM Sans (clean, modern)

### Hero Animations
- **Satellite grid overlay** (radial-gradient dots)
- **Floating sediment particles** (animated upward)
- **Staggered fade-ins** on text elements
- **Bouncing graduation cap** (🎓)
- **Scroll hint** with bob animation

### RSVP Modal
- **Name input** with validation
- **Attendance toggle:** In Person 🏛️ vs Online 💻
- **Live attendee list** (Firebase-powered)
- **Success state** with celebration emoji 🎊

### Location Section
- **Google Maps embed** centered on ECE Building
- **Step-by-step directions** to ECE 303
- **Zoom link** for remote attendees

---

## 🤖 Chatbot Integration

The page includes Pikachu-themed AI assistant (from your main site).

**Features:**
- Floating launcher button (bottom-right)
- Response length toggle (Short/Long)
- AI provider dropdown (Groq, Local, OpenRouter, Cerebras)
- Talks to UW proxy server (no API keys exposed)

The chatbot is **fully self-contained** — it loads your main site's `chatbot.js` without making any changes to your site's code.

---

## 🧠 Customization

### Change Hero Text
Edit `index.html`, lines ~90-110:
```html
<div class="hero-tag">You Are Invited to the Final</div>
<h1 class="hero-name">
    <span class="name-first">Sanchit</span>
    <span class="name-middle">Minocha</span>
    <span class="hero-cap">🎓</span>
</h1>
```

### Adjust Colors
Edit `style.css`, lines ~14-25:
```css
--water: #2E86AB;      /* Main blue */
--sand: #C8A96E;       /* Sand/earth tone */
--cream: #FAFAF7;      /* Background */
```

### Modify Committee
Edit `index.html`, lines ~340-360:
```html
<div class="committee-card">
    <div class="member-name">Your Name</div>
    <p class="member-role">Your Role</p>
</div>
```

---

## 🔧 Troubleshooting

### Chatbot not appearing
- Open in browser (not `file://`) — use local server or GitHub Pages
- Check browser console (F12) for errors
- Verify `../assets/js/chatbot.js` exists (from main site)

### RSVP not working
- Did you create `firebase-config.js`?
- Check browser console for Firebase errors
- Verify Realtime Database is in "Test Mode"

### Portrait image not showing
- File should be named exactly `portrait.jpg` in `/phd-defense/`
- Image should be square, ideally 280×280px or larger
- Page falls back to SVG placeholder if JPG is missing

### Modal not opening
- Try refreshing the page (Cmd+R)
- Check browser console for JavaScript errors

---

## 📤 Deploying to GitHub Pages

### The Problem: Firebase Keys in a Public Repo

`firebase-config.js` is already in `.gitignore` so it won't get pushed — but GitHub Pages serves static files, so there's **no server-side** place to hide secrets. The approach used here is the standard one for public static sites with Firebase:

> **Firebase Realtime Database keys for web apps are not truly secret.** Anyone can see them in your browser's network tab. What actually protects your data is Firebase **Security Rules** (which you set in the Console), not keeping the key private. So committing the key is acceptable *as long as your Security Rules are locked down.*

That said, the cleanest workflow for this repo is a **GitHub Actions build step** that injects the config at deploy time, keeping the key out of the committed source.

---

### Option A — Simple: Commit the config (acceptable for this use case)

Firebase web API keys are not secret by design. Your database is protected by Security Rules, not key secrecy.

1. In `phd-defense/`, copy `firebase-config.example.js` → `firebase-config.js` and fill in your values
2. **Remove `firebase-config.js` from `.gitignore`** (or keep it ignored and use Option B)
3. Push normally — the key will be public but your data is protected by Firebase rules

**Tighten your Firebase rules first:**
```json
{
  "rules": {
    "rsvps": {
      ".read": true,
      ".write": true,
      "$entry": {
        ".validate": "newData.hasChildren(['name','mode','ts']) && newData.child('name').val().length <= 80"
      }
    }
  }
}
```

---

### Option B — Clean: GitHub Actions injects the config at deploy time

This keeps the key out of git entirely. GitHub Actions reads it from a **Repository Secret** and writes `firebase-config.js` during the deploy workflow.

#### Step 1: Add secrets to GitHub

1. Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Add each value from your Firebase config as a separate secret:

| Secret name | Value |
|---|---|
| `FIREBASE_API_KEY` | your apiKey |
| `FIREBASE_AUTH_DOMAIN` | your authDomain |
| `FIREBASE_DATABASE_URL` | your databaseURL |
| `FIREBASE_PROJECT_ID` | your projectId |
| `FIREBASE_STORAGE_BUCKET` | your storageBucket |
| `FIREBASE_MESSAGING_SENDER_ID` | your messagingSenderId |
| `FIREBASE_APP_ID` | your appId |

#### Step 2: Create the workflow file

Create `.github/workflows/deploy.yml` in the root of your repo:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Inject Firebase config
        run: |
          cat > phd-defense/firebase-config.js << EOF
          const firebaseConfig = {
            apiKey: "${{ secrets.FIREBASE_API_KEY }}",
            authDomain: "${{ secrets.FIREBASE_AUTH_DOMAIN }}",
            databaseURL: "${{ secrets.FIREBASE_DATABASE_URL }}",
            projectId: "${{ secrets.FIREBASE_PROJECT_ID }}",
            storageBucket: "${{ secrets.FIREBASE_STORAGE_BUCKET }}",
            messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
            appId: "${{ secrets.FIREBASE_APP_ID }}"
          };
          firebase.initializeApp(firebaseConfig);
          EOF

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

#### Step 3: Push to `main` to trigger deploy

```bash
git add phd-defense/
git commit -m "feat: add PhD defense invite page"
git push origin main
```

GitHub Actions will inject the Firebase config and deploy to `gh-pages` branch automatically. The live URL will be:
```
https://sanchitminocha.github.io/phd-defense/
```

> **Note:** Make sure GitHub Pages is set to serve from the `gh-pages` branch in **Settings → Pages → Source**.

---

### Quick deploy (no Firebase, just the static page)

If you just want the page live without RSVP functionality:

```bash
git add phd-defense/
git commit -m "feat: add PhD defense invite page"
git push origin main
```

---

## 🧹 After the Defense (Cleanup)

To remove the page and save disk space:

```bash
# Delete the folder
rm -rf phd-defense/

# Or via git
git rm -r phd-defense/
git commit -m "cleanup: remove phd-defense page after event"
git push
```

Your main website will continue to work perfectly — there are zero dependencies.

---

## 📞 Questions?

- **Firebase setup:** https://firebase.google.com/docs/database/web
- **CSS variables:** https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **Fonts:** https://fonts.google.com
- **Your email:** msanchit@uw.edu

---

**Made with 💧 for your final defense!**

🎓 A 4-year journey, celebrated.
