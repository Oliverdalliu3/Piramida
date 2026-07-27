(() => {
  const carousel = document.querySelector(".event-spaces-carousel");

  if (carousel) {
    const track = carousel.querySelector(".event-spaces-card-track");
    const previousButton = carousel.querySelector(
      ".event-spaces-carousel-arrow-left",
    );
    const nextButton = carousel.querySelector(
      ".event-spaces-carousel-arrow-right",
    );

    if (track && previousButton && nextButton) {
      const getStep = () => {
        const firstCard = track.querySelector(".event-spaces-card");
        const styles = window.getComputedStyle(track);
        const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

        return firstCard ? firstCard.getBoundingClientRect().width + gap : 320;
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
  }

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
