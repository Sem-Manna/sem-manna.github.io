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
