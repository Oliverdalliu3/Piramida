(() => {
  const setupCarousel = (
    carouselSelector,
    trackSelector,
    itemSelector,
    previousSelector,
    nextSelector,
  ) => {
    document.querySelectorAll(carouselSelector).forEach((carousel) => {
      const track = carousel.querySelector(trackSelector);
      const previousButton = carousel.querySelector(previousSelector);
      const nextButton = carousel.querySelector(nextSelector);

      if (track && previousButton && nextButton) {
        const getStep = () => {
          const firstItem = track.querySelector(itemSelector);
          const styles = window.getComputedStyle(track);
          const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

          return firstItem ? firstItem.getBoundingClientRect().width + gap : 320;
        };

        previousButton.addEventListener("click", () => {
          track.scrollBy({
            left: -getStep(),
            behavior: "smooth",
          });
        });

        nextButton.addEventListener("click", () => {
          track.scrollBy({
            left: getStep(),
            behavior: "smooth",
          });
        });
      }
    });
  };

  setupCarousel(
    ".event-spaces-carousel",
    ".event-spaces-card-track",
    ".event-spaces-card",
    ".event-spaces-carousel-arrow-left",
    ".event-spaces-carousel-arrow-right",
  );

  setupCarousel(
    ".leasing-form-carousel",
    ".leasing-form-gallery",
    "img",
    ".leasing-form-carousel-arrow-left",
    ".leasing-form-carousel-arrow-right",
  );

  const modal = document.getElementById("book-event-space-modal");
  const openButtons = document.querySelectorAll("[data-open-event-modal]");

  if (!modal || openButtons.length === 0) {
    return;
  }

  const closeButtons = modal.querySelectorAll("[data-close-event-modal]");
  let activeTrigger = null;

  const openModal = (trigger) => {
    activeTrigger = trigger;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("event-space-modal-open");
    modal.querySelector("[data-close-event-modal]")?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("event-space-modal-open");
    activeTrigger?.focus();
    activeTrigger = null;
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(button);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();
