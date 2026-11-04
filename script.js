
(() => {
  "use strict";

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

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      loadFeaturedStillLife
    );
  } else {
    loadFeaturedStillLife();
  }
})();
