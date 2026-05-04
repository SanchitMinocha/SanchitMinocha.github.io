import os

path = '/Users/msanchit/Desktop/web_development/my_website/phd-defense/style.css'
with open(path, 'r') as f:
    lines = f.readlines()

# Remove everything after the first ENVELOPE REVEAL OVERLAY comment
new_lines = []
for line in lines:
    if 'ENVELOPE REVEAL OVERLAY' in line:
        break
    new_lines.append(line)

content = "".join(new_lines)
content += """
/* =========================================
   ENVELOPE REVEAL OVERLAY
   ========================================= */

#reveal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    background: var(--navy-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.envelope-flap {
    position: absolute;
    background: var(--navy-mid);
    z-index: 2;
    transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.8s ease;
}

.envelope-flap-top {
    top: 0; left: 0; right: 0; height: 60%;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    border-bottom: 1px solid rgba(200, 169, 110, 0.3);
    z-index: 4;
    transform-origin: top;
}

.envelope-flap-bottom {
    bottom: 0; left: 0; right: 0; height: 50%;
    clip-path: polygon(0 100%, 100% 100%, 50% 0);
    z-index: 3;
}

.reveal-flap {
    position: absolute;
    top: 0; bottom: 0; width: 50%;
    background: var(--navy-dark);
    z-index: 1;
    transition: transform 1s ease-in-out 0.4s;
}

.reveal-flap-left { left: 0; }
.reveal-flap-right { right: 0; }

.reveal-content {
    position: relative;
    z-index: 10;
    text-align: center;
    transition: all 0.5s ease;
}

.reveal-seal {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.reveal-seal:hover {
    transform: scale(1.1);
}

.seal-inner {
    width: 80px; height: 80px;
    background: radial-gradient(circle at 30% 30%, #d4af37, #b8860b);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: #fff;
}

.seal-icon { width: 36px; height: 36px; }

.reveal-instruction {
    color: var(--water-light);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 500;
}

/* Opening State */
#reveal-overlay.opened .envelope-flap-top {
    transform: rotateX(160deg);
    opacity: 0;
}

#reveal-overlay.opened .envelope-flap-bottom {
    transform: translateY(100%);
}

#reveal-overlay.opened .reveal-flap-left { transform: translateX(-100%); }
#reveal-overlay.opened .reveal-flap-right { transform: translateX(100%); }

#reveal-overlay.opened .reveal-content {
    opacity: 0;
    transform: scale(0.8);
    pointer-events: none;
}

#reveal-overlay.hidden { display: none; }

body.locked { overflow: hidden; }

/* =========================================
   CHATBOT VISIBILITY FIX
   ========================================= */

/* Hide by default until reveal */
#cb-launcher, #cb-window, #cb-popup {
    visibility: hidden;
    opacity: 0;
}

/* Restore launcher only after reveal */
body.reveal-complete #cb-launcher {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.5s ease;
}

/* Let the popup appear if intended */
body.reveal-complete #cb-popup {
    visibility: visible;
    opacity: 1;
}

/* Ensure window overrides visibility when opened */
#cb-window.open {
    visibility: visible;
    opacity: 1;
}

/* IMPORTANT: Do NOT force #cb-window visibility here by default. 
   Its visibility is managed by toggling the .open class. */
"""

with open(path, 'w') as f:
    f.write(content)
