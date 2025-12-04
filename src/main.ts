import { createIcons, Globe, RotateCcw } from "lucide";
import { Deck } from "./js/deck";
import { easeOut, press, spring, animate } from "motion";
import "./js/language";
import { setOnConfirm } from "./js/modal";
import { optimizeImageUrl, optimizeImageRecord } from "./js/imageOptimizer";
import deckBackUrl from "./assets/deck-back.png";

// Glob import all card images
const cardModules = import.meta.glob<{ default: string }>(
  "./assets/cards/*.png",
  { eager: true }
);

// Flatten to { path: resolvedUrl } and optimize for production
const rawCardImages: Record<string, string> = {};
for (const [path, module] of Object.entries(cardModules)) {
  rawCardImages[path] = module.default;
}
const cardImages = optimizeImageRecord(rawCardImages);

// Optimized deck back URL
const optimizedDeckBack = optimizeImageUrl(deckBackUrl);

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
const cardBackA = cardA.querySelector<HTMLImageElement>(".card-back")!;
const cardBackB = cardB.querySelector<HTMLImageElement>(".card-back")!;

// Set optimized deck-back images
cardBackA.src = optimizedDeckBack;
cardBackB.src = optimizedDeckBack;

const counterCurrent = document.querySelector<HTMLSpanElement>(
  ".counter-separator span:first-child"
)!;
const counterTotal = document.querySelector<HTMLSpanElement>(
  ".counter-separator span:last-child"
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
    { duration: 0.5, ease: easeOut }
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
    { duration: 0.5, ease: easeOut }
  ).finished;

  // Reset current card to 0° for next cycle
  current.style.transform = "rotateY(0deg)";

  // Swap active card
  activeCard = activeCard === "A" ? "B" : "A";

  updateCounter();
  isAnimating = false;
}

async function shuffleAndDraw(): Promise<void> {
  if (isAnimating) return;
  isAnimating = true;

  deck.reset();

  const current = activeCard === "A" ? cardA : cardB;
  const next = activeCard === "A" ? cardB : cardA;
  const nextFront = activeCard === "A" ? cardFrontB : cardFrontA;

  // Draw first card now so we can set it up
  const nextCard = deck.draw();
  if (!nextCard) {
    isAnimating = false;
    return;
  }

  // STEP 1: Flip current card to show deck back
  await animate(
    current,
    { transform: ["rotateY(0deg)", "rotateY(-180deg)"] },
    { duration: 0.5, ease: easeOut }
  ).finished;

  // STEP 2: Spin the card 360° on Z-axis (shuffle effect) with spring physics
  // Animate the card itself, combining rotateY(-180deg) with rotateZ spin
  await animate(
    current,
    {
      transform: [
        "rotateY(-180deg) rotateZ(0deg)",
        "rotateY(-180deg) rotateZ(360deg)",
      ],
    },
    { type: spring, stiffness: 80, damping: 12 } // ~0.75s with spring bounce
  ).finished;

  // Reset to just rotateY for clean state
  current.style.transform = "rotateY(-180deg)";

  // STEP 3: Prep next card and flip to reveal
  nextFront.src = nextCard.image;
  next.style.transform = "rotateY(180deg)";
  next.style.visibility = "visible";
  current.style.visibility = "hidden";

  await new Promise((r) => setTimeout(r, 180));

  // Flip to reveal new card
  await animate(
    next,
    { transform: ["rotateY(180deg)", "rotateY(0deg)"] },
    { duration: 0.5, ease: easeOut }
  ).finished;

  current.style.transform = "rotateY(0deg)";
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

press(cardContainer, (element) => {
  animate(
    element,
    { scale: 0.95 },
    { type: spring, stiffness: 500, damping: 30 }
  );

  return async (_event, info) => {
    // Bounce back
    await animate(
      element,
      { scale: 1 },
      { type: spring, stiffness: 400, damping: 20 }
    ).finished;

    // Then flip
    if (info.success) {
      flipAndDraw();
    }
  };
});

setOnConfirm(async () => {
  if (isAnimating) return;
  // Wait for modal close animation to finish, then shuffle
  await new Promise((resolve) => setTimeout(resolve, 300));
  await shuffleAndDraw();
});
