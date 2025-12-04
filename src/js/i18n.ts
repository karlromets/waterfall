type Lang = "et" | "en";

const translations: Record<Lang, Record<string, string>> = {
  et: {
    "lang.estonian": "eesti",
    "lang.english": "english",
    "restart.title": "Segame kaardid uuesti ära?",
    "restart.content": "Praegune seis kaob ja alustame uuest ilusast pakist.",
    "restart.no": "oops",
    "restart.yes": "jap",
  },
  en: {
    "lang.estonian": "eesti",
    "lang.english": "english",
    "restart.title": "Are you sure you want to restart?",
    "restart.content":
      "This will result in your current game state being wiped.",
    "restart.no": "oops",
    "restart.yes": "yeap",
  },
};

let currentLang: Lang = (localStorage.getItem("lang") as Lang) || "et";

export function t(key: string): string {
  return translations[currentLang][key] ?? key;
}

export function setLanguage(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  updateDOM();
}

export function getLanguage(): Lang {
  return currentLang;
}

function updateDOM(): void {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n")!;
    el.textContent = t(key);
  });
}

export function initI18n(): void {
  document.documentElement.lang = currentLang;
  updateDOM();
}
