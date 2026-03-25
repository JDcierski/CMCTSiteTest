function getSiteRoot() {
    const path = window.location.pathname;
    const normalized = path.endsWith("/") ? path : path.substring(0, path.lastIndexOf("/") + 1);

    if (normalized.includes("/bots/")) {
        return "../../";
    }

    return "./";
}

function injectSharedLayout() {
    const root = getSiteRoot();

    const topbarTarget = document.getElementById("site-topbar");
    const footerTarget = document.getElementById("site-footer");

    if (topbarTarget) {
        topbarTarget.innerHTML = `
            <header class="topbar">
                <div class="topbar-inner">
                    <a href="${root}index.html" class="brand">
                        <img src="${root}CMCRLogo.png" alt="CMCR Logo" />
                    </a>
                    <nav class="nav">
                        <a href="${root}index.html#about">About</a>
                        <a href="${root}index.html#roster">Bots</a>
                        <a href="${root}index.html#board">Board</a>
                        <a href="${root}index.html#socials">Socials</a>
                    </nav>
                </div>
            </header>
        `;
    }

    if (footerTarget) {
        footerTarget.innerHTML = `
            <footer class="footer page-shell">
                CMU Combat Robotics. Site built by John Ciecierski. &copy; 2026. All rights reserved.
            </footer>
        `;
    }
}

async function loadRoster() {
    const rosterGrid = document.getElementById("rosterGrid");
    if (!rosterGrid) {
        return;
    }

    try {
        const response = await fetch("bots/index.json");
        if (!response.ok) {
            throw new Error("Could not load bots/index.json");
        }

        const bots = await response.json();

        if (!Array.isArray(bots) || bots.length === 0) {
            rosterGrid.innerHTML = `
                <article class="bot-card" style="display:flex; align-items:end; justify-content:start; padding:16px; min-height:220px;">
                    <div class="bot-overlay" style="position:static; background:none; padding:0;">
                        <h3 class="bot-name">No bots yet</h3>
                        <p class="bot-class">Add a bot folder and update bots/index.json</p>
                    </div>
                </article>
            `;
            return;
        }

        bots.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

        rosterGrid.innerHTML = bots.map(bot => {
            const href = bot.page || `bots/${bot.slug}/`;
            const image = bot.cover_image || `bots/${bot.slug}/cover.jpg`;
            const name = bot.name || bot.slug || "Unknown Bot";
            const weightClass = bot.weight_class || "Unknown Class";

            return `
                <a class="bot-card" href="${href}">
                    <img class="bot-image" src="${image}" alt="${name}" />
                    <div class="bot-overlay">
                        <h3 class="bot-name">${name}</h3>
                        <p class="bot-class">${weightClass}</p>
                    </div>
                </a>
            `;
        }).join("");
    } catch (error) {
        rosterGrid.innerHTML = `
            <article class="bot-card" style="display:flex; align-items:end; justify-content:start; padding:16px; min-height:220px;">
                <div class="bot-overlay" style="position:static; background:none; padding:0;">
                    <h3 class="bot-name">Roster failed to load</h3>
                    <p class="bot-class">Make sure bots/index.json exists and is valid JSON</p>
                </div>
            </article>
        `;
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    injectSharedLayout();
    loadRoster();
});