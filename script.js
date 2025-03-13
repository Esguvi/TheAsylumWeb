document.addEventListener("DOMContentLoaded", function() {
    let lang = localStorage.getItem("lang") || "EN";
    setLanguage(lang);
});

async function setLanguage(lang) {
    const response = await fetch("lang.json");
    const translations = await response.json();

    localStorage.setItem("lang", lang);
    
    document.getElementById("lang-text").textContent = lang;
    
    document.getElementById("current-lang-flag").src = `images/flags/${lang.toLowerCase()}.svg`;

    document.querySelectorAll("[data-lang]").forEach(element => {
        let key = element.getAttribute("data-lang");
        element.innerHTML = `<i class="${element.querySelector("i")?.className || ""}"></i> ${translations[lang][key]}`;
    });

    let pageKey = document.body.getAttribute("data-page") || "home";
    document.title = translations[lang][pageKey] + " - The Asylum";    
}

function toggleLanguage() {
    let currentLang = localStorage.getItem("lang") || "EN";
    let newLang = currentLang === "EN" ? "ES" : "EN";
    setLanguage(newLang);
}
