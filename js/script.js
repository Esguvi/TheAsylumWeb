document.addEventListener("DOMContentLoaded", function() {
    let lang = localStorage.getItem("lang") || "EN";
    setLanguage(lang);
});

async function setLanguage(lang) {
    try {
        const response = await fetch("json/lang.json");
        const translations = await response.json();

        localStorage.setItem("lang", lang);

        document.getElementById("lang-text").textContent = lang;
        document.getElementById("current-lang-flag").src = `images/flags/${lang.toLowerCase()}.svg`;

        document.querySelectorAll("[data-lang]").forEach(element => {
            let key = element.getAttribute("data-lang");
            let translation = translations[lang][key] || key;

            if (element.tagName === "A") {
                element.textContent = translation;
            } else {
                let icon = element.querySelector("i");
                let anchor = element.querySelector("a");

                if (anchor) {
                    anchor.textContent = translation;
                } else {
                    element.innerHTML = icon ? `<i class="${icon.className}"></i> ${translation}` : translation;
                }
            }
        });

        let pageKey = document.body.getAttribute("data-page") || "home";
        document.title = translations[lang][pageKey] + " - The Asylum";    
    } catch (error) {
        console.error("Error cargando las traducciones:", error);
    }
}

function toggleLanguage() {
    let currentLang = localStorage.getItem("lang") || "EN";
    let newLang = currentLang === "EN" ? "ES" : "EN";
    setLanguage(newLang);
}
