
(() => {
  "use strict";
 /* 1. LOAD FEATURED STILL LIFE */
  async function loadFeaturedStillLife() {
    const image = document.getElementById("featured-still-life");

    if (!image || !window.PaintingsCatalog) {
      return;
    }

    try {
      const painting = await window.PaintingsCatalog.getById(
        "still-life-001"
      );

      if (!painting) {
        console.error("Painting not found: still-life-001");
        return;
      }

      image.src = painting.image;

      const language =
        window.SiteTranslations?.getLanguage() || "en";

      image.alt =
        painting.title?.[language] ||
        painting.title?.en ||
        "";
    } catch (error) {
      console.error("Could not load featured painting:", error);
    }
  }

 /* 2. MOBILE NAVIGATION */

  function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.getElementById("main-nav");

    if (!menuToggle || !mainNav) {
      return;
    }

    function openMenu() {
      mainNav.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Open and close menu
    menuToggle.addEventListener("click", toggleMenu);

    // Close menu after clicking a navigation link
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close menu with Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      const clickedInsideMenu =
        mainNav.contains(event.target) ||
        menuToggle.contains(event.target);

      if (!clickedInsideMenu) {
        closeMenu();
      }
    });

    // Close menu when switching to desktop layout
    window.matchMedia("(min-width: 761px)").addEventListener(
      "change",
      (event) => {
        if (event.matches) {
          closeMenu();
        }
      }
    );
  }


  /* 3. INITIALIZE */

  function init() {
    loadFeaturedStillLife();
    initMobileMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
