// Apply the saved appearance before the stylesheets are painted.
(() => {
    const storageKey = "sem-manna-theme";
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const filePreview = window.location.protocol === "file:";
    const nextTheme = { light: "dark", dark: "rain", rain: "light" };
    const validTheme = (value) => Object.hasOwn(nextTheme, value);
    let preference = null;
    let currentTheme;

    try {
        const saved = window.localStorage.getItem(storageKey);
        if (validTheme(saved)) preference = saved;
    } catch {
        // The toggle still works when browser storage is unavailable.
    }

    // File previews can have separate storage for each HTML file.
    if (filePreview) {
        const requested = new URL(window.location.href).searchParams.get("theme");
        if (validTheme(requested)) {
            preference = requested;
            remember(requested);
        }
    }

    function remember(theme) {
        try {
            window.localStorage.setItem(storageKey, theme);
        } catch {
            // Keep the in-memory selection even if persistence is blocked.
        }
    }

    function syncPreviewLinks() {
        if (!filePreview) return;
        for (const link of document.querySelectorAll(".navbar a[href]")) {
            const target = new URL(link.href, window.location.href);
            if (target.protocol !== "file:" || !target.pathname.endsWith(".html")) continue;
            if (preference) target.searchParams.set("theme", preference);
            else target.searchParams.delete("theme");
            link.href = target.href;
        }
    }

    function syncControls() {
        const label = `Switch to ${nextTheme[currentTheme]} mode`;
        for (const button of document.querySelectorAll("[data-theme-toggle]")) {
            button.setAttribute("aria-label", label);
            button.setAttribute("title", label);
            button.hidden = false;
        }
    }

    function syncPreviewAddress() {
        if (!filePreview) return;
        const target = new URL(window.location.href);
        if (preference) target.searchParams.set("theme", preference);
        else target.searchParams.delete("theme");
        try {
            window.history.replaceState(null, "", target.href);
        } catch {
            // Some browsers restrict history updates for local files.
        }
    }

    function apply(theme) {
        currentTheme = theme;
        root.setAttribute("data-bs-theme", theme);
        root.style.colorScheme = theme === "dark" ? "dark" : "light";
        syncControls();
        syncPreviewAddress();
        syncPreviewLinks();
    }

    function automaticTheme() {
        return systemTheme.matches ? "dark" : "light";
    }

    function bindControls() {
        syncControls();
        syncPreviewLinks();
        for (const button of document.querySelectorAll("[data-theme-toggle]")) {
            button.addEventListener("click", () => {
                preference = nextTheme[currentTheme];
                remember(preference);
                apply(preference);
            });
        }
    }

    apply(preference || automaticTheme());
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindControls, { once: true });
    } else {
        bindControls();
    }

    systemTheme.addEventListener("change", () => {
        if (!preference) apply(automaticTheme());
    });
    window.addEventListener("storage", (event) => {
        if (event.key !== storageKey && event.key !== null) return;
        preference = validTheme(event.newValue) ? event.newValue : null;
        apply(preference || automaticTheme());
    });
})();
