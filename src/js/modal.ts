import { animate, easeOut, press, spring } from "motion";

const backdrop = document.querySelector<HTMLDivElement>("#restart-backdrop")!;
const modal = document.querySelector<HTMLDivElement>("#restart-modal")!;
const toggleBtn = document.querySelector<HTMLButtonElement>("#restart-toggle")!;
const noBtn = document.querySelector<HTMLButtonElement>("#restart-no")!;
const yesBtn = document.querySelector<HTMLButtonElement>("#restart-yes")!;

// Focusable elements inside modal
const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let previouslyFocused: HTMLElement | null = null;

let isOpen = false;
let isAnimating = false;

// Callback for yes action (set from main.ts)
let onConfirm: (() => void) | null = null;

export function setOnConfirm(callback: () => void): void {
  onConfirm = callback;
}

async function openModal(): Promise<void> {
  if (isOpen || isAnimating) return;
  isAnimating = true;
  isOpen = true;

  // Store current focus
  previouslyFocused = document.activeElement as HTMLElement;

  // Show elements
  backdrop.hidden = false;
  modal.hidden = false;

  // Subtle scale-in, no translation
  animate(
    modal,
    { opacity: 1, scale: 1 },
    { type: "spring", stiffness: 400, damping: 30 }
  );

  backdrop.style.pointerEvents = "auto";

  // Focus first button
  noBtn.focus();

  isAnimating = false;
}

async function closeModal(): Promise<void> {
  if (!isOpen || isAnimating) return;
  isAnimating = true;
  isOpen = false;

  backdrop.style.pointerEvents = "none";

  // Quick, decisive exit
  await animate(
    modal,
    { opacity: 0, scale: 0.96 },
    { duration: 0.15, ease: easeOut }
  );

  backdrop.hidden = true;
  modal.hidden = true;

  // Restore focus
  previouslyFocused?.focus();

  isAnimating = false;
}

// Focus trap
function handleTab(e: KeyboardEvent): void {
  if (!isOpen) return;

  const focusable = modal.querySelectorAll<HTMLElement>(focusableSelector);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// Button bounce helper - modal version (faster callback)
function addModalButtonBounce(
  btn: HTMLButtonElement,
  callback: () => void
): void {
  press(btn, (element) => {
    animate(
      element,
      { scale: 0.95 },
      { type: spring, stiffness: 500, damping: 30 }
    );

    return async (_event, info) => {
      if (info.success) {
        // Tiny delay to register the press, then fire callback
        // while button is still animating back
        setTimeout(() => {
          callback();
        }, 50);
      }

      // Button bounces back
      animate(
        element,
        { scale: 1 },
        { type: spring, stiffness: 400, damping: 20 }
      );
    };
  });
}

// Event listeners
press(toggleBtn, () => {
  openModal();
});

addModalButtonBounce(noBtn, () => {
  closeModal();
});

addModalButtonBounce(yesBtn, () => {
  if (onConfirm) onConfirm();
  closeModal();
});

// Click outside to close
backdrop.addEventListener("click", () => {
  closeModal();
});

// Escape to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) {
    closeModal();
  }
  if (e.key === "Tab" && isOpen) {
    handleTab(e);
  }
});

export { openModal, closeModal };
