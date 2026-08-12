const track = document.getElementById("cardTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Let the browser handle vertical page scrolling natively, but hand
// horizontal gestures on this track entirely to our own swipe logic below.
// Without this, touchstart can kick off a native horizontal scroll before
// pointermove's preventDefault() has a chance to run, so the drag and our
// next()/prev() snap end up fighting each other.
track.style.touchAction = "pan-y";

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
  // getComputedStyle(track).columnGap can be the string "normal" (not just
  // empty) when no gap is set, and "normal" is truthy — so the old
  // `|| 16` fallback never ran and parseFloat("normal") silently produced
  // NaN, breaking every scroll calculation downstream. Guard on the parsed
  // number instead of the raw string.
  const parsedGap = parseFloat(getComputedStyle(track).columnGap);
  const gap = Number.isNaN(parsedGap) ? 16 : parsedGap;
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
  // Keep receiving pointermove/pointerup for this gesture even if the
  // finger/cursor drags outside the track's bounds mid-swipe — without
  // this, a drag that crosses the track's edge can silently stop firing
  // events, leaving the swipe "stuck" with no next()/prev() ever called.
  track.setPointerCapture(e.pointerId);
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

(function () {
  const video = document.getElementById("piramidaVideo");
  const badge = document.getElementById("playBadge");

  badge.addEventListener("click", () => {
    video.play();
  });

  video.addEventListener("play", () => {
    badge.classList.add("is-playing");
    video.setAttribute("controls", "");
  });

  video.addEventListener("pause", () => {
    badge.classList.remove("is-playing");
    video.removeAttribute("controls");
  });

  video.addEventListener("ended", () => {
    badge.classList.remove("is-playing");
    video.removeAttribute("controls");
  });
})();
