import { createIcons, Globe, RotateCcw } from "lucide";
import { Deck, type Card } from "./js/deck";
import { animate } from "motion/mini";
import { press } from "motion";

// Glob import all card images
const cardModules = import.meta.glob<{ default: string }>(
  "./assets/cards/*.png",
  { eager: true }
);

// Flatten to { path: resolvedUrl }
const cardImages: Record<string, string> = {};
for (const [path, module] of Object.entries(cardModules)) {
  cardImages[path] = module.default;
}

// Initialize icons
createIcons({
  icons: { RotateCcw, Globe },
});

// DOM elements
const cardImg = document.querySelector<HTMLImageElement>(
  'img[alt="Current Card"]'
)!;
const counterCurrent = document.querySelector<HTMLSpanElement>(
  ".counter-separator span:first-child"
)!;
const counterTotal = document.querySelector<HTMLSpanElement>(
  ".counter-separator span:last-child"
)!;
const resetButton = document.querySelector<HTMLButtonElement>(
  'button:has([data-lucide="rotate-ccw"])'
)!;

// Initialize deck
const deck = new Deck(cardImages);

function updateUI(card: Card): void {
  cardImg.src = card.image;
  counterCurrent.textContent = String(deck.position);
  counterTotal.textContent = String(deck.remaining);
}

function drawNext(): void {
  if (deck.isExhausted) {
    deck.reset();
  }
  const card = deck.draw();
  if (card) {
    updateUI(card);
  }
}

// Initial draw
drawNext();

// Click card to advance
cardImg.addEventListener("click", drawNext);

press(cardImg, (element) => {
  animate(element, { scale: 0.9 });

  return () => animate(element, { scale: 1 });
});

// Reset button reshuffles
resetButton.addEventListener("click", () => {
  deck.reset();
  drawNext();
});
