# Quick Setup Checklist

## Before Going Live

- [ ] **Add your portrait**
  - Copy your photo as `portrait.jpg` to the `/phd-defense/` folder
  - Image should be square (280×280px or larger)

- [ ] **Set up Firebase** (5 minutes)
  - Go to https://console.firebase.google.com
  - Create project: `phd-defense`
  - Add web app
  - Copy config object
  - Create Realtime Database (Test Mode)
  - Create `firebase-config.js` from the template
  - Paste your config values

- [ ] **Test locally**
  ```bash
  python3 -m http.server 8000
  # Visit http://localhost:8000/phd-defense/
  ```
  - Check hero loads with animations
  - Click RSVP button → modal opens
  - Submit RSVP → see success message
  - Chatbot launcher visible (bottom-right)
  - Test on mobile (375px width)

- [ ] **Customize (optional)**
  - Edit committee names if needed
  - Adjust colors in `style.css` if desired
  - Update any text in `index.html`

## Deploying

```bash
# Push to GitHub
git add phd-defense/
git commit -m "feat: add Final PhD Defense invite page"
git push origin dev_phase1

# Goes live at: https://sanchitminocha.github.io/phd-defense/
```

## Key Features Checklist

- [ ] Hero with "You are invited to the Final PhD Defense" tag
- [ ] Name: "Sanchit Minocha" with bouncing graduation cap 🎓
- [ ] Subtitle: "A 4-Year Journey in Research & Discovery"
- [ ] Department: "Civil & Environmental Engineering: Data Science"
- [ ] Meta pills: Date, Time, Room
- [ ] **RSVP button in hero** (primary CTA)
- [ ] **"Find Directions" link** (subtle, below RSVP)
- [ ] RSVP modal with name input + in-person/online toggle
- [ ] Live attendee list
- [ ] Research overview + expandable technical abstract
- [ ] Location section with map + directions
- [ ] Committee listing
- [ ] Chatbot launcher (Pikachu)

## After the Defense

```bash
# Clean up
rm -rf phd-defense/
git add -A
git commit -m "cleanup: remove phd-defense after event"
git push
```

---

**Everything is isolated.** Deleting the folder won't affect your main site.

Good luck with your defense! 🎓✨
