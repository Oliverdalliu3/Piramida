(function () {
  const root = document.getElementById("attractions");
  if (!root) return;

  const cards = root.querySelector("[data-cards]");
  const track = root.querySelector("[data-track]");
  const tagEl = root.querySelector("[data-caption-tag]");
  const titleEl = root.querySelector("[data-caption-title]");
  const descEl = root.querySelector("[data-caption-desc]");
  const prevBtn = root.querySelector("[data-prev]");
  const nextBtn = root.querySelector("[data-next]");
  const dots = Array.from(root.querySelectorAll("[data-dot-target]"));
  if (!cards) return;

  const TOTAL = cards.children.length;

  // The centered card is whichever one sits in the middle of the current
  // DOM order (5 cards -> index 2). All of its content already lives on
  // the element itself — the data-desc attribute, and the visible
  // data-card-tag / data-card-title text inside its own mobile overlay —
  // this file only ever reads that, never sets it.
  function centerCard() {
    const children = Array.from(cards.children);
    return children[Math.floor(children.length / 2)];
  }

  function syncCaption() {
    const active = centerCard();
    if (!active) return;

    const overlayTag = active.querySelector("[data-card-tag]");
    const overlayTitle = active.querySelector("[data-card-title]");

    if (tagEl && titleEl && descEl) {
      [tagEl, titleEl, descEl].forEach((el) => (el.style.opacity = "0"));
      window.setTimeout(() => {
        tagEl.textContent = overlayTag ? overlayTag.textContent : "";
        titleEl.textContent = overlayTitle ? overlayTitle.textContent : "";
        descEl.textContent = active.dataset.desc || "";
        [tagEl, titleEl, descEl].forEach((el) => (el.style.opacity = "1"));
      }, 150);
    }

    if (dots.length) {
      const activeIndex = active.dataset.index;
      dots.forEach((dot) => {
        dot.classList.toggle("is-active", dot.dataset.dotTarget === activeIndex);
      });
    }
  }

  function next() {
    cards.appendChild(cards.firstElementChild);
    syncCaption();
  }

  function prev() {
    cards.insertBefore(cards.lastElementChild, cards.firstElementChild);
    syncCaption();
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  // Dots: each one carries the fixed data-index of the card it represents.
  // Clicking jumps there by the shortest path, using the same next()/prev()
  // the arrows use, so nothing about how a slide is displayed changes.
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = Number(dot.dataset.dotTarget);
      const current = Number(centerCard().dataset.index);
      if (Number.isNaN(target) || Number.isNaN(current)) return;

      const diff = (target - current + TOTAL) % TOTAL;
      if (diff === 0) return;

      if (diff <= TOTAL - diff) {
        for (let i = 0; i < diff; i++) next();
      } else {
        for (let i = 0; i < TOTAL - diff; i++) prev();
      }
    });
  });

  // --- Swipe / drag support ---------------------------------------------
  // Lives on the cards row itself (not the buttons) so dragging the photos
  // never steals a click from the arrows. This only reads the gesture and,
  // on release, changes slide once — the cards themselves already transition
  // smoothly via the CSS on .attraction-card, so nothing else needs to move
  // during the drag itself.
  if (track && cards) {
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let locked = null; // "x" | "y" once we know which way the gesture goes
    let firedThisGesture = false;
    const THRESHOLD = 60; // px of drag needed to change slide

    const onPointerMove = (e) => {
      if (!dragging || firedThisGesture) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!locked) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }
      }

      if (locked === "x") {
        e.preventDefault();

        if (Math.abs(dx) > THRESHOLD) {
          firedThisGesture = true;
          if (dx < 0) next();
          else prev();
        }
      }
    };

    const onPointerUp = () => {
      dragging = false;
      locked = null;
      firedThisGesture = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    const onPointerDown = (e) => {
      // Let the prev/next buttons and dots handle their own clicks untouched.
      if (e.target.closest("[data-prev],[data-next],[data-dot-target]")) return;

      dragging = true;
      locked = null;
      firedThisGesture = false;
      startX = e.clientX;
      startY = e.clientY;
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    };

    cards.addEventListener("pointerdown", onPointerDown);

    cards.style.touchAction = "pan-y";
    cards.style.cursor = "grab";
  }

  // --- Keyboard support ---------------------------------------------------
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  });

  syncCaption();
})();


(function () {
  const root = document.getElementById("experiences");
  if (!root) return;

  const track = root.querySelector("[data-exp-track]");
  const dotsWrap = root.querySelector("[data-exp-dots]");
  const prevBtn = root.querySelector("[data-exp-prev]");
  const nextBtn = root.querySelector("[data-exp-next]");
  if (!track) return;

  // How many "pages" the strip has depends on how many cards fit per
  // screen width, which only the browser knows at runtime — so the dots
  // themselves are built here. This is structural (empty buttons, no
  // text/images), never content: every venue photo, name, and category
  // above is authored directly in the HTML, not here.
  let pageCount = 1;
  let dots = [];

  function computePageCount() {
    const width = track.clientWidth;
    if (!width) return 1;
    return Math.max(1, Math.round(track.scrollWidth / width));
  }

  function buildDots() {
    if (!dotsWrap) return;
    pageCount = computePageCount();

    dotsWrap.innerHTML = "";
    dots = [];

    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "experience-dot";
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", () => {
        track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    updateActiveDot();
  }

  function updateActiveDot() {
    if (!dots.length) return;
    const width = track.clientWidth || 1;
    const current = Math.round(track.scrollLeft / width);
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  }

  function scrollByPage(direction) {
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => scrollByPage(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollByPage(1));

  let scrollTicking = false;
  track.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateActiveDot();
      scrollTicking = false;
    });
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildDots, 150);
  });

  buildDots();
})();