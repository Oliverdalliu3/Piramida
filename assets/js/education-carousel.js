/* ─────────────────────────────────────────────
     DATA
  ───────────────────────────────────────────── */
      const ITEMS = [
        {
          label: "Graphic Design",
          color: "#e8503a",
          img: "./assets/images/0be2fd837e46e1dbbfbe5ecb17f7d2ef1799e7c9 (1).png",
        },
        {
          label: "Music",
          color: "#7c4d9e",
          img: "./assets/images/4d4494e51518b0723ba377d776658e219fecc676 (1).jpg",
        },
        {
          label: "3D Modeling",
          color: "#5a8a3c",
          img: "./assets/images/24fd138e4c487270d6656b18bacb04deac6199b3 (1).jpg",
        },
        {
          label: "Animation",
          color: "#e09428",
          img: "./assets/images/510df378ce3d16f0d7d9137f4390f307fe81cb0c (1).png",
        },
        {
          label: "Drawing",
          color: "#3a7abf",
          img: "./assets/images/513a15bf08553429fdf22d302de80799941a90ae (1).jpg",
        },
        {
          label: "Game Dev",
          color: "#e040a0",
          img: "./assets/images/c0d7437a3950068afe0cd31c4fea121c5ccd6442 (1).jpg",
        },
        {
          label: "Photography",
          color: "#2ab8c8",
          img: "./assets/images/d501635b931639cb374bb4c3479369868029ca63 (1).jpg",
        },
      ];
      /* ─────────────────────────────────────────────
     SETTINGS
  ───────────────────────────────────────────── */
      const MOBILE_BREAKPOINT = 767;

      const DESKTOP_GAP = 14;
      const CENTER_W = 280;
      const CENTER_H = 310;
      const NEXT_H = 360;
      const MAX_W = 280;
      const MAX_H = 540;

      const MOBILE_SIDE_SPACE = 30;
      const MOBILE_GAP = 20;
      const MOBILE_CARD_H = 512;
      const MOBILE_CARD_MAX_W = 380;
      const MOBILE_RADIUS = 28;

      const SNAP_EASE = 0.1;

      /* ─────────────────────────────────────────────
     ELEMENTS
  ───────────────────────────────────────────── */
      const track = document.getElementById("track");
      const viewport = document.getElementById("viewport");
      const dotsContainer = document.getElementById("carouselDots");

      if (!track || !viewport) {
        console.error("Carousel elements were not found.");
      } else {
        const N = ITEMS.length;
        const COPIES = 3;
        const TOTAL = COPIES * N;
        const dots = [];

        if (dotsContainer) {
          ITEMS.forEach((item, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className =
              "dot h-2 w-2 rounded-full bg-gray-500 transition-all";
            dot.setAttribute("aria-label", `Go to ${item.label}`);
            dot.addEventListener("click", () => {
              activeIndex = N + index;
              snapTarget = calculateOffset(activeIndex);
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
          });
        }

        function isMobile() {
          return window.innerWidth <= MOBILE_BREAKPOINT;
        }

        function mobileCardWidth() {
          const availableWidth = viewportWidth() - MOBILE_SIDE_SPACE - 56;
          return Math.min(MOBILE_CARD_MAX_W, Math.max(240, availableWidth));
        }

        function currentCardWidth() {
          return isMobile() ? mobileCardWidth() : CENTER_W;
        }

        function currentGap() {
          return isMobile() ? MOBILE_GAP : DESKTOP_GAP;
        }

        function currentSlotWidth() {
          return currentCardWidth() + currentGap();
        }

        /* ─────────────────────────────────────────────
       BUILD CARDS
    ───────────────────────────────────────────── */
        const allCards = [];

        for (let copy = 0; copy < COPIES; copy++) {
          ITEMS.forEach((item, originalIndex) => {
            const card = document.createElement("div");
            card.className = "card";
            card.dataset.index = originalIndex;

            const img = document.createElement("img");
            img.src = item.img;
            img.alt = item.label;
            img.draggable = false;
            img.addEventListener("error", () => {
              console.error(`Image could not be loaded: ${item.img}`);
            });

            card.appendChild(img);
            track.appendChild(card);

            allCards.push({ el: card, origIdx: originalIndex });
          });
        }

        /* ─────────────────────────────────────────────
       CARD SIZE
    ───────────────────────────────────────────── */
        function sizeAt(distSlots) {
          if (isMobile()) {
            return {
              w: mobileCardWidth(),
              h: MOBILE_CARD_H,
            };
          }

          const distance = Math.abs(distSlots);
          const maxDistance = Math.floor(N / 2) + 1;

          let height;

          if (distance <= 1) {
            height = CENTER_H + (NEXT_H - CENTER_H) * distance;
          } else {
            const progress = Math.min(
              (distance - 1) / Math.max(maxDistance - 1, 1),
              1,
            );

            const easedProgress = progress * progress;
            height = NEXT_H + (MAX_H - NEXT_H) * easedProgress;
          }

          const widthProgress = Math.min(distance, maxDistance) / maxDistance;
          const easedWidthProgress = widthProgress * widthProgress;
          const width = CENTER_W + (MAX_W - CENTER_W) * easedWidthProgress;

          return { w: width, h: height };
        }

        function viewportWidth() {
          return viewport.offsetWidth;
        }

        function calculateOffset(index) {
          const slotWidth = currentSlotWidth();

          if (isMobile()) {
            return index * slotWidth - MOBILE_SIDE_SPACE;
          }

          return index * slotWidth + slotWidth / 2 - viewportWidth() / 2;
        }

        function setupSizes() {
          const slotWidth = currentSlotWidth();

          viewport.style.setProperty(
            "--mobile-side-space",
            `${MOBILE_SIDE_SPACE}px`,
          );

          viewport.style.height = isMobile()
            ? `${MOBILE_CARD_H}px`
            : `${MAX_H + 20}px`;

          track.style.width = `${TOTAL * slotWidth}px`;
        }

        /* ─────────────────────────────────────────────
       STATE
    ───────────────────────────────────────────── */
        let activeIndex = isMobile() ? N : N + Math.floor(N / 2);
        let offset = calculateOffset(activeIndex);
        let snapTarget = offset;

        let isDragging = false;
        let hasDragged = false;
        let dragStartX = 0;
        let dragStartOffset = 0;
        let dragLastX = 0;
        let dragLastT = 0;
        let velocity = 0;

        function wrapOffset() {
          const setWidth = N * currentSlotWidth();
          const minIndex = N;
          const maxIndex = N * 2 - 1;

          if (activeIndex < minIndex) {
            activeIndex += N;
            offset += setWidth;
            snapTarget += setWidth;
          }

          if (activeIndex > maxIndex) {
            activeIndex -= N;
            offset -= setWidth;
            snapTarget -= setWidth;
          }
        }

        /* ─────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────── */
        function updateCarouselUi() {
          const originalIndex = ((activeIndex % N) + N) % N;

          dots.forEach((dot, index) => {
            const isActive = index === originalIndex;
            dot.classList.toggle("h-3", isActive);
            dot.classList.toggle("w-3", isActive);
            dot.classList.toggle("h-2", !isActive);
            dot.classList.toggle("w-2", !isActive);
            dot.classList.toggle("bg-[#CBFF00]", isActive);
            dot.classList.toggle("bg-gray-500", !isActive);
            dot.setAttribute("aria-current", isActive ? "true" : "false");
          });
        }

        function renderFrame() {
          const slotWidth = currentSlotWidth();
          const translateX = -offset;
          const viewportCenter = viewportWidth() / 2;

          track.style.transform = `translateX(${translateX}px)`;

          updateCarouselUi();

          allCards.forEach(({ el }, index) => {
            const slotCenter = index * slotWidth + slotWidth / 2 + translateX;
            const distancePixels = slotCenter - viewportCenter;
            const distanceSlots = distancePixels / slotWidth;
            const { w, h } = sizeAt(distanceSlots);

            el.style.width = `${w}px`;
            el.style.height = `${h}px`;
            el.style.left = `${index * slotWidth}px`;

            if (isMobile()) {
              el.style.opacity = "1";
              el.style.borderRadius = `${MOBILE_RADIUS}px`;
            } else {
              const absoluteDistance = Math.abs(distanceSlots);
              const maxVisible = N / 2 + 0.5;
              const opacity = Math.max(
                0.15,
                1 - (absoluteDistance / maxVisible) * 0.75,
              );

              el.style.opacity = opacity;
              el.style.borderRadius = "";
            }
          });
        }

        function snapNearest(direction = 0) {
          const slotWidth = currentSlotWidth();

          if (direction === 1) {
            activeIndex += 1;
          } else if (direction === -1) {
            activeIndex -= 1;
          } else if (isMobile()) {
            activeIndex = Math.round((offset + MOBILE_SIDE_SPACE) / slotWidth);
          } else {
            activeIndex = Math.round(
              (offset + viewportWidth() / 2 - slotWidth / 2) / slotWidth,
            );
          }

          snapTarget = calculateOffset(activeIndex);
        }

        function animationLoop() {
          if (!isDragging) {
            const difference = snapTarget - offset;

            if (Math.abs(difference) > 0.2) {
              offset += difference * SNAP_EASE;
            } else {
              offset = snapTarget;
            }

            wrapOffset();
          }

          renderFrame();
          requestAnimationFrame(animationLoop);
        }

        /* ─────────────────────────────────────────────
       MOUSE
    ───────────────────────────────────────────── */
        viewport.addEventListener("mousedown", (event) => {
          isDragging = true;
          hasDragged = false;
          dragStartX = event.clientX;
          dragStartOffset = offset;
          dragLastX = event.clientX;
          dragLastT = performance.now();
          velocity = 0;
          viewport.classList.add("dragging");
          event.preventDefault();
        });

        window.addEventListener("mousemove", (event) => {
          if (!isDragging) return;

          const movement = dragStartX - event.clientX;
          if (Math.abs(movement) > 5) hasDragged = true;

          const deltaX = dragLastX - event.clientX;
          const deltaTime = performance.now() - dragLastT;

          velocity = deltaX / Math.max(deltaTime, 1);
          offset = dragStartOffset + movement;
          dragLastX = event.clientX;
          dragLastT = performance.now();

          wrapOffset();
        });

        window.addEventListener("mouseup", (event) => {
          if (!isDragging) return;

          isDragging = false;
          viewport.classList.remove("dragging");

          const totalMovement = dragStartX - event.clientX;

          if (velocity > 0.3 || totalMovement > 40) {
            snapNearest(1);
          } else if (velocity < -0.3 || totalMovement < -40) {
            snapNearest(-1);
          } else {
            snapNearest(0);
          }
        });

        /* ─────────────────────────────────────────────
       TOUCH
    ───────────────────────────────────────────── */
        viewport.addEventListener(
          "touchstart",
          (event) => {
            if (!event.touches.length) return;

            isDragging = true;
            hasDragged = false;
            dragStartX = event.touches[0].clientX;
            dragStartOffset = offset;
            dragLastX = dragStartX;
            dragLastT = performance.now();
            velocity = 0;
          },
          { passive: true },
        );

        window.addEventListener(
          "touchmove",
          (event) => {
            if (!isDragging || !event.touches.length) return;

            const currentX = event.touches[0].clientX;
            const movement = dragStartX - currentX;

            if (Math.abs(movement) > 5) hasDragged = true;

            const deltaX = dragLastX - currentX;
            const deltaTime = performance.now() - dragLastT;

            velocity = deltaX / Math.max(deltaTime, 1);
            offset = dragStartOffset + movement;
            dragLastX = currentX;
            dragLastT = performance.now();

            wrapOffset();
          },
          { passive: true },
        );

        window.addEventListener("touchend", (event) => {
          if (!isDragging) return;

          isDragging = false;

          const endX = event.changedTouches[0]?.clientX ?? dragLastX;
          const totalMovement = dragStartX - endX;

          if (velocity > 0.3 || totalMovement > 40) {
            snapNearest(1);
          } else if (velocity < -0.3 || totalMovement < -40) {
            snapNearest(-1);
          } else {
            snapNearest(0);
          }
        });

        /* ─────────────────────────────────────────────
       CLICK + KEYBOARD
    ───────────────────────────────────────────── */
        allCards.forEach(({ el }, index) => {
          el.addEventListener("click", () => {
            if (hasDragged) return;

            activeIndex = index;
            snapTarget = calculateOffset(activeIndex);
            wrapOffset();
          });
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "ArrowLeft") snapNearest(-1);
          if (event.key === "ArrowRight") snapNearest(1);
        });

        let wasMobile = isMobile();

        window.addEventListener("resize", () => {
          const nowMobile = isMobile();

          /* When entering mobile, begin with the first image. */
          if (nowMobile && !wasMobile) {
            activeIndex = N;
          }

          setupSizes();
          snapTarget = calculateOffset(activeIndex);
          offset = snapTarget;
          renderFrame();

          wasMobile = nowMobile;
        });

        setupSizes();
        renderFrame();
        animationLoop();
      }
