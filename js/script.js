document.addEventListener("DOMContentLoaded", function () {
    let lang = localStorage.getItem("lang") || "EN";
    setLanguage(lang);
    updateDropdown(lang);
});
 
async function setLanguage(lang) {
    try {
        const response = await fetch("json/lang.json");
        const translations = await response.json();

        localStorage.setItem("lang", lang);

        document.getElementById("current-lang").innerHTML = `<img id="current-lang-flag" src="images/flags/${lang.toLowerCase()}.svg" alt="Language" style="margin-right: 8px;"> <span id="lang-text">${lang}</span>`;

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
    
    langOption.innerHTML = `<img src="images/flags/${otherLang.toLowerCase()}.svg" alt="${otherLang}" style="margin-right: 8px;"> ${otherLang}`;
    
    dropdown.appendChild(langOption);
}


function toggleDropdown() {
    document.getElementById("language-dropdown").classList.toggle("show");
}



function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");

    alertIcon.className = '';

    if (type === "success") {
        alertBox.className = `alert success`;
        alertIcon.classList.add("fas", "fa-check-circle");
    } else if (type === "error") {
        alertBox.className = `alert error`;
        alertIcon.classList.add("fas", "fa-times-circle"); 
    } else if (type === "info") {
        alertBox.className = `alert info`;
        alertIcon.classList.add("fas", "fa-info-circle");
    }
    else if (type === "loading") {
        alertBox.className = `alert loading`;
        alertIcon.classList.add("fas", "fa-spinner", "fa-spin");
    }

    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);
}

const form = document.getElementById('contact-form');

form.addEventListener('submit', async function (e) {
e.preventDefault();

showAlert("Enviando...", "loading");

const formData = new FormData(form);

try {
    const response = await fetch(form.action, {
    method: form.method,
    body: formData,
    headers: {
        'Accept': 'application/json'
    }
    });

    if (response.ok) {
    showAlert("¡Tu mensaje ha sido enviado correctamente!", "success");
    form.reset();
    } else {
    showAlert("Ocurrió un error al enviar el formulario. Intenta de nuevo.", "error");
    }
} catch (error) {
    showAlert("No se pudo conectar con el servidor. Intenta más tarde.", "error");
}
});
