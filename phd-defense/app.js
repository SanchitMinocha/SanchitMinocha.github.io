/*
 ==============================================
 PhD Defense RSVP & Interactions
 Firebase integration + Modal logic
 ==============================================
 */

// ===== ADD TO CALENDAR (iCal download) =====

function downloadICS(e) {
    e.preventDefault();
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Sanchit Minocha//PhD Defense//EN',
        'BEGIN:VEVENT',
        'UID:phd-defense-sanchit-minocha-2026@sanchitminocha.github.io',
        'DTSTAMP:20260501T000000Z',
        'DTSTART:20260508T180000Z',
        'DTEND:20260508T200000Z',
        'SUMMARY:PhD Defense — Sanchit Minocha',
        'DESCRIPTION:From Sediment to Storage: Tracking the World\'s Reservoirs\\n\\nJoin in person at ECE 303\\, Paul G. Allen Center\\, University of Washington\\, Seattle\\, WA\\n\\nOr via Zoom: https://washington.zoom.us/j/97867307714',
        'LOCATION:ECE 303\\, Paul G. Allen Center for Computer Science & Engineering\\, University of Washington\\, Seattle\\, WA 98195',
        'URL:https://sanchitminocha.github.io/phd-defense/',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanchit-phd-defense.ics';
    a.click();
    URL.revokeObjectURL(url);
}

// ===== COUNTDOWN TIMER =====

function initCountdownTimer() {
    // Defense time: May 8, 2026, 11:00 AM PDT
    const defenseTime = new Date('2026-05-08T11:00:00-07:00').getTime();
    const timerEl = document.getElementById('countdown-timer');

    function updateTimer() {
        const now = new Date().getTime();
        const distance = defenseTime - now;

        if (distance <= 0) {
            timerEl.textContent = '🎓 Defense is happening now!';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        let text = '';
        if (days > 0) {
            text = `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
            text = `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            text = `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
        }

        timerEl.textContent = `⏱️ ${text}`;
    }

    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute
}

// ===== ZOOM BUTTON =====

function openZoom() {
    window.open('https://washington.zoom.us/j/97867307714', '_blank');
}

// ===== MODAL MANAGEMENT =====

function openRSVP() {
    const modal = document.getElementById('rsvp-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeRSVP() {
    const modal = document.getElementById('rsvp-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('rsvp-modal');
    if (event.target === modal) {
        closeRSVP();
    }
});

// ===== ATTENDANCE MODE TOGGLE =====

function selectAttendanceMode(mode) {
    document.getElementById('attendance-mode').value = mode;

    const inpersonBtn = document.getElementById('btn-inperson');
    const onlineBtn = document.getElementById('btn-online');

    if (mode === 'inperson') {
        inpersonBtn.classList.add('active');
        onlineBtn.classList.remove('active');
    } else {
        onlineBtn.classList.add('active');
        inpersonBtn.classList.remove('active');
    }
}

// ===== ABSTRACT TOGGLE =====

function toggleAbstract() {
    const technicalText = document.getElementById('abstract-technical');
    const button = document.querySelector('.btn-toggle');

    if (technicalText.style.display === 'none') {
        technicalText.style.display = 'block';
        button.textContent = 'Hide Technical Abstract ↑';
    } else {
        technicalText.style.display = 'none';
        button.textContent = 'Read Full Technical Abstract →';
    }
}

// ===== FIREBASE RSVP LOGIC =====

const STORAGE_KEY = 'phd-defense-rsvp-name';
const STORAGE_MODE_KEY = 'phd-defense-rsvp-mode';

function checkFirebaseInit() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Check your internet connection or script tags.');
        return false;
    }
    if (typeof database === 'undefined') {
        console.warn('Firebase Database not initialized. Please check firebase-config.js');
        return false;
    }
    return true;
}

function handleRSVP(event) {
    if (event) event.preventDefault();
    console.log('RSVP form submitted');

    if (!checkFirebaseInit()) {
        alert('RSVP system is still connecting or not configured. Please wait a moment or check your setup.');
        return;
    }

    const nameInput = document.getElementById('rsvp-name');
    const modeInput = document.getElementById('attendance-mode');
    
    if (!nameInput || !modeInput) {
        console.error('Form inputs not found');
        return;
    }

    const name = nameInput.value.trim();
    const mode = modeInput.value;

    if (!name || name.length < 2) {
        alert('Please enter your full name (at least 2 characters).');
        return;
    }

    const submitBtn = document.querySelector('.btn-rsvp');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    database.ref('rsvps').push({
        name: name,
        mode: mode,
        ts: firebase.database.ServerValue.TIMESTAMP,
    }).then(() => {
        localStorage.setItem(STORAGE_KEY, name);
        localStorage.setItem(STORAGE_MODE_KEY, mode);
        showRSVPSuccess(name, mode);
    }).catch((error) => {
        console.error('Firebase RSVP error:', error);
        alert('Something went wrong saving your RSVP. Please try again.');
    }).finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Count Me In 🎓';
    });
}

function showRSVPSuccess(name, mode) {
    const formContainer = document.getElementById('rsvp-form-container');
    const successContainer = document.getElementById('rsvp-success');
    const successMsg = document.getElementById('success-msg');
    const successSub = document.getElementById('success-sub');

    if (mode === 'inperson') {
        successMsg.textContent = `See you in room ECE 303, ${name.split(' ')[0]}!`;
        successSub.textContent = 'Your spot is noted. See you May 8 at 11 AM!';
    } else {
        successMsg.textContent = `See you online, ${name.split(' ')[0]}!`;
        successSub.textContent = 'Zoom link is on the invite. See you May 8 at 11 AM!';
    }

    formContainer.style.display = 'none';
    successContainer.style.display = 'block';

    setTimeout(() => {
        successContainer.style.display = 'none';
        formContainer.style.display = 'block';
        document.getElementById('rsvp-name').value = '';
        closeRSVP();
    }, 3500);
}

function loadRSVPs() {
    if (!checkFirebaseInit()) {
        return;
    }

    const rsvpsRef = database.ref('rsvps');
    const rsvpList = document.getElementById('rsvp-list');
    const listSection = document.getElementById('rsvp-list-section');
    const countEl = document.getElementById('rsvp-count');
    const attendeesList = document.getElementById('attendees-list');
    const attendeesSection = document.getElementById('attendees-preview');
    const attendeesCount = document.getElementById('attendees-count');
    const userRsvpName = localStorage.getItem(STORAGE_KEY);

    rsvpsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        rsvpList.innerHTML = '';
        attendeesList.innerHTML = '';

        if (!data) {
            listSection.style.display = 'none';
            attendeesSection.style.display = 'none';
            return;
        }

        listSection.style.display = 'block';
        attendeesSection.style.display = 'block';

        const rsvps = Object.entries(data)
            .map(([key, value]) => ({
                key: key,
                ...value,
            }))
            .sort((a, b) => (b.ts || 0) - (a.ts || 0));

        rsvps.forEach((rsvp) => {
            const chip = document.createElement('div');
            chip.className = `rsvp-chip ${rsvp.mode || 'inperson'}`;

            if (rsvp.name === userRsvpName) {
                chip.textContent = rsvp.name + ' (you)';
                chip.style.fontWeight = '600';
            } else {
                chip.textContent = rsvp.name;
            }

            rsvpList.appendChild(chip);

            // Also add to hero attendees preview
            const attendeeChip = document.createElement('div');
            attendeeChip.className = 'attendee-chip';
            
            // Robust initials generation
            const nameParts = rsvp.name.trim().split(/\s+/).filter(p => p.length > 0);
            const initials = nameParts.length > 0 
                ? nameParts.map(p => p[0]).join('').slice(0, 2).toUpperCase()
                : '??';
                
            const mode = rsvp.mode || 'inperson';
            attendeeChip.innerHTML = `
                <div class="attendee-avatar ${mode === 'inperson' ? 'av-inperson' : 'av-online'}">${initials}</div>
                <span class="attendee-name">${rsvp.name}</span>
                <span class="attendee-mode">${mode === 'inperson' ? '· In person' : '· Online'}</span>
            `;
            attendeesList.appendChild(attendeeChip);
        });

        const count = rsvps.length;
        countEl.textContent = `${count} person${count !== 1 ? 's' : ''} registered`;
        const inPerson = rsvps.filter(r => (r.mode || 'inperson') === 'inperson').length;
        const online = rsvps.filter(r => (r.mode || 'inperson') === 'online').length;
        const modeBreakdown = inPerson && online ? ` · ${inPerson} in person, ${online} online` : '';
        attendeesCount.textContent = `${count} ${count === 1 ? 'person' : 'people'} coming${modeBreakdown}`;
    });
}

// ===== INIT ON PAGE LOAD =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize countdown timer
    initCountdownTimer();

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            offset: 100,
            once: true,
        });
    }

    // Load RSVPs
    loadRSVPs();

    // Set up RSVP form — single listener only (no onsubmit in HTML)
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleRSVP);
    }

    // Pre-fill if user already RSVP'd
    const savedName = localStorage.getItem(STORAGE_KEY);
    const savedMode = localStorage.getItem(STORAGE_MODE_KEY) || 'inperson';
    if (savedName) {
        selectAttendanceMode(savedMode);
        document.getElementById('rsvp-name').value = savedName;
    }

    // Initialize Reveal Animation
    initReveal();
});

function initReveal() {
    const overlay = document.getElementById('reveal-overlay');
    const seal = document.getElementById('reveal-seal');
    
    if (!overlay || !seal) return;

    // Lock body scroll until opened
    document.body.classList.add('locked');

    seal.addEventListener('click', () => {
        // Trigger opening animation
        overlay.classList.add('opened');
        
        // Sequence:
        // 1. Top flap folds up (1.2s)
        // 2. Side flaps slide away (starts at 0.3s, takes 1.2s total 1.5s)
        
        // Unlock body scroll and show chatbot launcher
        setTimeout(() => {
            document.body.classList.remove('locked');
            document.body.classList.add('reveal-complete');
        }, 1500);

        // Remove overlay from DOM
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 2500);
    });
}
