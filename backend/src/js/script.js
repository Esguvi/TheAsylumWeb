document.addEventListener("DOMContentLoaded", function () {
    let lang = localStorage.getItem("lang") || "EN";
    setLanguage(lang);
    updateDropdown(lang);
});

async function setLanguage(lang) {
    try {
        const response = await fetch("../public/json/lang.json");
        const translations = await response.json();

        localStorage.setItem("lang", lang);

        document.getElementById("current-lang").innerHTML = `<img id="current-lang-flag" src="../public/images/flags/${lang.toLowerCase()}.svg" alt="Language" style="margin-right: 8px;"> <span id="lang-text">${lang}</span>`;

        document.querySelectorAll("[data-lang]").forEach(element => {
            let key = element.getAttribute("data-lang");
            let translation = translations[lang][key] || key;

            if (element.tagName === "A") {
                let icon = element.querySelector("i");
                element.textContent = translation;

                if (icon) {
                    element.prepend(icon);
                }
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

        updateDropdown(lang);
    } catch (error) {
    }
}

function updateDropdown(currentLang) {
    const dropdown = document.getElementById("language-dropdown");
    dropdown.innerHTML = "";

    let otherLang = currentLang === "EN" ? "ES" : "EN"; 

    const langOption = document.createElement("div");
    langOption.classList.add("language-option");
    langOption.onclick = () => setLanguage(otherLang);
    
    langOption.innerHTML = `<img src="../public/images/flags/${otherLang.toLowerCase()}.svg" alt="${otherLang}" style="margin-right: 8px;"> ${otherLang}`;
    
    dropdown.appendChild(langOption);
}


function toggleDropdown() {
    document.getElementById("language-dropdown").classList.toggle("show");
}
