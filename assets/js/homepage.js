const track = document.getElementById("cardTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ---- Infinite loop setup: clone all cards before and after ----
const originalCards = Array.from(track.children);
const cardCount = originalCards.length;

originalCards.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.appendChild(clone); // after
});
originalCards
  .slice()
  .reverse()
  .forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.insertBefore(clone, track.firstChild); // before
  });

function cardStep() {
  const card = track.querySelector(".card-snap");
  if (!card) return 0;
  const gap = parseFloat(getComputedStyle(track).columnGap || 16);
  return card.getBoundingClientRect().width + gap;
}

function currentIndex() {
  return Math.round(track.scrollLeft / cardStep());
}
function goTo(index, smooth = true) {
  track.style.scrollBehavior = smooth ? "smooth" : "auto";

  track.scrollLeft = index * cardStep();
}

// ---- Detect and mark whichever card is centered in the viewport ----
function updateActiveCard() {
  const cards = track.querySelectorAll(".card-snap");
  const trackRect = track.getBoundingClientRect();
  const centerX = trackRect.left + trackRect.width / 2;

  let closest = null;
  let closestDist = Infinity;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const dist = Math.abs(cardCenter - centerX);
    if (dist < closestDist) {
      closestDist = dist;
      closest = card;
    }
  });

  cards.forEach((card) => card.classList.toggle("is-active", card === closest));
}

// Start centered in the "originals" block (skip the prepended clones)
function init() {
  goTo(cardCount, false);
  updateActiveCard();
}
requestAnimationFrame(init);
window.addEventListener("load", init);

function next() {
  goTo(currentIndex() + 1);
}
function prev() {
  goTo(currentIndex() - 1);
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

// Silently re-center once a scroll settles into a clone zone,
// so the loop feels endless without a visible jump.
// Also update the active card live while scrolling (rAF-throttled).
let settleTimer;
let scrollTicking = false;

track.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateActiveCard();
      scrollTicking = false;
    });
    scrollTicking = true;
  }

  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    const idx = currentIndex();
    if (idx >= cardCount * 2) goTo(idx - cardCount, false);
    else if (idx < cardCount) goTo(idx + cardCount, false);
    updateActiveCard();
  }, 80);
});

window.addEventListener("resize", () => {
  goTo(currentIndex(), false);
  updateActiveCard();
});

// ---- Swipe (pointer-based) — snaps to next/prev, no live drag-follow ----
let startX = 0;
let startY = 0;
let pointerDown = false;
let swiped = false;
const SWIPE_THRESHOLD = 40;

track.addEventListener("pointerdown", (e) => {
  pointerDown = true;
  swiped = false;
  startX = e.clientX;
  startY = e.clientY;
});

track.addEventListener("pointermove", (e) => {
  if (!pointerDown) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
    e.preventDefault(); // stop native scroll/selection during a horizontal swipe
  }
});

track.addEventListener("pointerup", (e) => {
  if (!pointerDown) return;
  pointerDown = false;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > SWIPE_THRESHOLD) {
    swiped = true;
    dx < 0 ? next() : prev();
  }
});

track.addEventListener("pointercancel", () => {
  pointerDown = false;
});

// Prevent click-through on links/images right after a swipe
track.addEventListener(
  "click",
  (e) => {
    if (swiped) {
      e.preventDefault();
      e.stopPropagation();
      swiped = false;
    }
  },
  true,
);

track.querySelectorAll("img").forEach((img) => {
  img.addEventListener("dragstart", (e) => e.preventDefault());
});
