import { createIcons, Globe, RotateCcw } from "lucide";
import { Deck } from "./js/deck";
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
const cardContainer =
  document.querySelector<HTMLDivElement>(".card-container")!;
const cardElement = document.querySelector<HTMLDivElement>(".card")!;
const cardFront = document.querySelector<HTMLImageElement>(".card-front")!;
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

// Animation state
let isAnimating = false;

function updateCounter(): void {
  counterCurrent.textContent = String(deck.position);
  counterTotal.textContent = String(deck.remaining);
}

// Track cumulative rotation
let rotation = 0;

async function flipAndDraw(): Promise<void> {
  if (isAnimating) return;

  if (deck.isExhausted) {
    deck.reset();
  }

  const nextCard = deck.draw();
  if (!nextCard) return;

  isAnimating = true;

  // FLIP 1: front → back (continuous left rotation)
  const startRotation1 = rotation;
  rotation -= 180;
  await animate(
    cardElement,
    { transform: [`rotateY(${startRotation1}deg)`, `rotateY(${rotation}deg)`] },
    { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  ).finished;

  // Update front image while hidden (backface-visibility handles visibility)
  cardFront.src = nextCard.image;

  // Pause to show deck back
  await new Promise((resolve) => setTimeout(resolve, 180));

  // FLIP 2: back → new front (continue left rotation)
  const startRotation2 = rotation;
  rotation -= 180;
  await animate(
    cardElement,
    { transform: [`rotateY(${startRotation2}deg)`, `rotateY(${rotation}deg)`] },
    { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  ).finished;

  updateCounter();
  isAnimating = false;
}

// Initial draw (no animation)
const initialCard = deck.draw();
if (initialCard) {
  cardFront.src = initialCard.image;
  updateCounter();
}

// Click card to advance with flip animation
cardContainer.addEventListener("click", flipAndDraw);

// Press scale effect
press(cardContainer, (element) => {
  animate(element, { scale: 0.95 });
  return () => animate(element, { scale: 1 });
});

// Reset button reshuffles
resetButton.addEventListener("click", async () => {
  if (isAnimating) return;
  deck.reset();
  await flipAndDraw();
});
