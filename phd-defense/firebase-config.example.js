/*
 ============================================
 FIREBASE SETUP INSTRUCTIONS
 ============================================

 IMPORTANT: This file is a TEMPLATE. You need to:
 1. Create a FREE Firebase project at console.firebase.google.com
 2. Add a web app to your project
 3. Copy the config object from Firebase
 4. Create a NEW file called "firebase-config.js" (without ".example")
 5. Paste the config below and fill in your values
 6. Save firebase-config.js in this same folder

 firebase-config.js will be GITIGNORED and NOT pushed to GitHub.

 ============================================
 STEP-BY-STEP SETUP
 ============================================

 1. Go to https://console.firebase.google.com
 2. Click "Create a project" → enter project name "phd-defense" → Continue
 3. Skip analytics (optional) → Create project
 4. Once created, go to Project Settings (gear icon top-left)
 5. Scroll to "Your apps" → Click "Add app" → Choose "Web"
 6. Give it a name like "PhD Defense Invite"
 7. Copy the config object (it looks like the structure below)
 8. Go to "Build" menu on left → Select "Realtime Database"
 9. Click "Create Database" → Choose Seattle (or closest region) → Start in Test Mode
 10. Return to this file, fill in YOUR config values below, save as firebase-config.js

 ============================================
 */

// Replace these with your Firebase project config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get reference to the Realtime Database
const database = firebase.database();
