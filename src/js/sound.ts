import clickSoundUrl from "../assets/audio/click.ogg";

// Pre-load the audio
const clickSound = new Audio(clickSoundUrl);
clickSound.volume = 0.5;

export function playClick(): void {
  // Clone and play for overlapping sounds
  const sound = clickSound.cloneNode() as HTMLAudioElement;
  sound.play().catch(() => {
    // Ignore autoplay restrictions - sound will play on next user interaction
  });
}

// Event delegation: play click sound for all buttons except card
document.addEventListener(
  "pointerdown",
  (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest("button, .button");
    
    // Skip if not a button or if it's inside the card container
    if (!button || target.closest(".card-container")) return;
    
    playClick();
  },
  { passive: true }
);

