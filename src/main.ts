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

// Two card elements for alternating flip (Safari workaround for >180° rotation bug)
const cardA = document.querySelector<HTMLDivElement>(".card-a")!;
const cardB = document.querySelector<HTMLDivElement>(".card-b")!;
const cardFrontA = cardA.querySelector<HTMLImageElement>(".card-front")!;
const cardFrontB = cardB.querySelector<HTMLImageElement>(".card-front")!;

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
let activeCard: "A" | "B" = "A";

function updateCounter(): void {
  counterCurrent.textContent = String(deck.position);
  counterTotal.textContent = String(deck.remaining);
}

async function flipAndDraw(): Promise<void> {
  if (isAnimating) return;

  if (deck.isExhausted) {
    deck.reset();
  }

  const nextCard = deck.draw();
  if (!nextCard) return;

  isAnimating = true;

  // Get current and next card elements
  const current = activeCard === "A" ? cardA : cardB;
  const next = activeCard === "A" ? cardB : cardA;
  const nextFront = activeCard === "A" ? cardFrontB : cardFrontA;

  // FLIP 1: current card 0° → -180° (shows deck back)
  await animate(
    current,
    { transform: ["rotateY(0deg)", "rotateY(-180deg)"] },
    { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  ).finished;

  // Prep next card: set new image, position at +180° (back visible), show it
  nextFront.src = nextCard.image;
  next.style.transform = "rotateY(180deg)";
  next.style.visibility = "visible";
  current.style.visibility = "hidden";

  // Pause to show deck back
  await new Promise((r) => setTimeout(r, 180));

  // FLIP 2: next card +180° → 0° (continuous left rotation visually)
  await animate(
    next,
    { transform: ["rotateY(180deg)", "rotateY(0deg)"] },
    { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  ).finished;

  // Reset current card to 0° for next cycle
  current.style.transform = "rotateY(0deg)";

  // Swap active card
  activeCard = activeCard === "A" ? "B" : "A";

  updateCounter();
  isAnimating = false;
}

// Initial draw (no animation)
const initialCard = deck.draw();
if (initialCard) {
  cardFrontA.src = initialCard.image;
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
