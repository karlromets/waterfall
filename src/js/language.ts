import { animate, press, spring } from "motion";
import { setLanguage, initI18n } from "./i18n.ts";

const languageToggle =
  document.querySelector<HTMLButtonElement>("#language-toggle")!;
const languageMenu = document.querySelector<HTMLDivElement>("#language-menu")!;
const languageButtons =
  languageMenu.querySelectorAll<HTMLButtonElement>(".language-button");

let menuOpen = false;
let menuAnimating = false;

async function openMenu(): Promise<void> {
  if (menuAnimating || menuOpen) return;
  menuAnimating = true;
  menuOpen = true;

  languageToggle.setAttribute("aria-expanded", "true");
  languageMenu.hidden = false;

  await animate(
    languageMenu,
    { x: 0, opacity: 1 },
    { type: "spring", stiffness: 400, damping: 30 }
  ).finished;

  menuAnimating = false;
}

async function closeMenu(): Promise<void> {
  if (menuAnimating || !menuOpen) return;
  menuAnimating = true;
  menuOpen = false;

  languageToggle.setAttribute("aria-expanded", "false");

  await animate(
    languageMenu,
    { x: "-120%", opacity: 0 },
    { type: "spring", stiffness: 300, damping: 35 }
  ).finished;

  languageMenu.hidden = true;
  menuAnimating = false;
}

async function selectLanguage(lang: "et" | "en"): Promise<void> {
  if (menuAnimating) return;
  menuAnimating = true;

  // 2. Bounce back up (with slight overshoot from spring)
  await animate(
    languageMenu,
    { scale: 1 },
    { type: spring, stiffness: 400, damping: 20 }
  );

  // Apply language
  setLanguage(lang);

  // Close with scale baked into the exit
  menuOpen = false;
  languageToggle.setAttribute("aria-expanded", "false");

  await animate(
    languageMenu,
    { x: "-120%", opacity: 0 },
    { type: "spring", stiffness: 300, damping: 30 }
  ).finished;

  languageMenu.hidden = true;
  menuAnimating = false;
}

// Language button handlers
languageButtons.forEach((btn) => {
  press(btn, () => {
    const lang = btn.getAttribute("data-lang") as "et" | "en";

    animate(
      languageMenu,
      { scale: 0.95 },
      { type: spring, stiffness: 500, damping: 30 }
    );

    return async () => {
      selectLanguage(lang);
    };
  });
});

// Toggle on press
press("#language-toggle", () => {
  if (menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    menuOpen &&
    !languageMenu.contains(e.target as Node) &&
    !languageToggle.contains(e.target as Node)
  ) {
    closeMenu();
  }
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) {
    closeMenu();
    languageToggle.focus();
  }
});

// Initialize on load
initI18n();
