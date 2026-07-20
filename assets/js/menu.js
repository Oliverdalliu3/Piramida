document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.getElementById("openMenu");
  const closeButton = document.getElementById("closeMenu");
  const menu = document.getElementById("mobileMenu");

  if (!openButton || !closeButton || !menu) return;

  let lastFocusedElement = null;

  const setMenuState = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    openButton.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);

    if (isOpen) {
      lastFocusedElement = document.activeElement;
      closeButton.focus();
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  openButton.addEventListener("click", () => setMenuState(true));
  closeButton.addEventListener("click", () => setMenuState(false));

  menu.addEventListener("click", (event) => {
    if (event.target === menu) setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
});
