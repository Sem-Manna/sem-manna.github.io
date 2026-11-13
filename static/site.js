// Highlight the current page.
const currentPath = location.pathname.replace(/\/$/, "/index.html");
document.querySelectorAll(".navbar .nav-link").forEach((link) => {
    const target = new URL(link.href).pathname;
    if (target === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
    }
});

// Opening an abstract briefly adds a decorative audience or a few incentives.
// Native details/summary controls continue to handle the actual interaction.
(() => {
    const abstracts = document.querySelectorAll(".paper-abstract[data-surprise]");
    if (!abstracts.length) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const activeSurprises = new Map();
    const casts = {
        audience: {
            characters: ["observer", "eye", "observer", "eye", "observer"],
        },
        incentives: {
            characters: ["donkey", "money", "money", "money", "elephant"],
        },
    };

    function dismiss(details) {
        const active = activeSurprises.get(details);
        if (!active) return;
        window.clearTimeout(active.timer);
        active.layer.remove();
        activeSurprises.delete(details);
    }

    function dismissAll() {
        for (const details of activeSurprises.keys()) dismiss(details);
    }

    for (const details of abstracts) {
        const cast = casts[details.dataset.surprise];
        const summary = details.querySelector("summary");
        if (!cast || !summary) continue;

        details.addEventListener("toggle", () => {
            dismiss(details);
            if (!details.open || motionPreference.matches || document.hidden) return;

            const layer = document.createElement("span");
            layer.className = "paper-surprise";
            layer.setAttribute("aria-hidden", "true");

            const stage = document.createElement("span");
            stage.className = "surprise-stage";
            for (const [index, character] of cast.characters.entries()) {
                const template = document.getElementById(`egg-${character}`);
                if (!template) continue;
                const actor = document.createElement("span");
                actor.className = `surprise-character surprise-character--${character}`;
                actor.style.setProperty("--slot", `${7 + index * 21.5}%`);
                actor.style.setProperty("--tilt", `${index % 2 ? 5 : -5}deg`);
                actor.style.setProperty("--delay", `${index * 40}ms`);
                actor.append(template.content.cloneNode(true));
                stage.append(actor);
            }
            if (!stage.childElementCount) return;

            layer.append(stage);
            summary.append(layer);

            activeSurprises.set(details, {
                layer,
                timer: window.setTimeout(() => dismiss(details), 2000),
            });
        });
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) dismissAll();
    });
    motionPreference.addEventListener("change", () => {
        if (motionPreference.matches) dismissAll();
    });
})();

// A patient reader earns one visit from the resident research assistant.
(() => {
    const header = document.querySelector(".site-header");
    const template = document.getElementById("header-cat-template");
    if (!header || !template) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let remaining = 60 * 1000;
    let startedAt = null;
    let waitTimer;
    let cleanupTimer;
    let hasVisited = false;
    let cat;
    let imageRequest;
    let imageUrl;

    function pauseCountdown() {
        window.clearTimeout(waitTimer);
        if (startedAt !== null) {
            remaining = Math.max(0, remaining - (performance.now() - startedAt));
            startedAt = null;
        }
    }

    function finishVisit() {
        window.clearTimeout(cleanupTimer);
        imageRequest?.abort();
        imageRequest = null;
        cat?.remove();
        cat = null;
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        imageUrl = null;
        document.removeEventListener("visibilitychange", syncCountdown);
        motionPreference.removeEventListener("change", syncCountdown);
        window.removeEventListener("pagehide", leavePage);
        window.removeEventListener("pageshow", syncCountdown);
        window.removeEventListener("resize", finishVisit);
    }

    function startVisit() {
        pauseCountdown();
        if (document.hidden || motionPreference.matches || hasVisited) return;
        hasVisited = true;
        cat = template.content.firstElementChild.cloneNode(true);
        const visit = cat;
        const image = visit.querySelector("img");
        const duration = Number(visit.dataset.durationMs);
        visit.style.setProperty("--cat-duration", `${duration}ms`);
        visit.addEventListener("animationend", (event) => {
            if (event.animationName === "header-cat-cross") finishVisit();
        });
        image.addEventListener("load", () => {
            if (cat !== visit) return;
            window.clearTimeout(cleanupTimer);
            visit.classList.add("is-running");
            cleanupTimer = window.setTimeout(finishVisit, duration + 1000);
        }, { once: true });
        image.addEventListener("error", finishVisit, { once: true });
        header.append(visit);
        window.addEventListener("resize", finishVisit, { once: true });
        // Keep a stalled image request from leaving a dormant layer behind.
        cleanupTimer = window.setTimeout(finishVisit, 15000);
        imageRequest = new AbortController();
        // Buffer all frames before giving the GIF a fresh playback clock.
        fetch(image.dataset.src, { signal: imageRequest.signal })
            .then((response) => {
                if (!response.ok) throw new Error("The header animation could not load.");
                return response.blob();
            })
            .then((blob) => {
                if (cat !== visit) return;
                imageUrl = URL.createObjectURL(blob);
                image.src = imageUrl;
            })
            .catch(() => {
                if (cat === visit) finishVisit();
            });
    }

    function syncCountdown() {
        pauseCountdown();
        if (document.hidden || motionPreference.matches) {
            if (hasVisited) finishVisit();
            return;
        }
        if (hasVisited) return;
        startedAt = performance.now();
        waitTimer = window.setTimeout(startVisit, remaining);
    }

    function leavePage() {
        pauseCountdown();
        if (hasVisited) finishVisit();
    }

    document.addEventListener("visibilitychange", syncCountdown);
    motionPreference.addEventListener("change", syncCountdown);
    window.addEventListener("pagehide", leavePage);
    window.addEventListener("pageshow", syncCountdown);
    syncCountdown();
})();
