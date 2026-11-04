
(() => {
  "use strict";

const GRID_ID = "painting-grid";
const grid = document.getElementById(GRID_ID);
const CATEGORY = grid?.dataset.category;


  if (!grid || !window.PaintingsCatalog) {
    console.error("Painting gallery or catalog was not found.");
    return;
  }

  function getLanguage() {
    return window.SiteTranslations?.getLanguage?.() || "en";
  }

  function getLocalizedText(value, language) {
    if (typeof value === "string") {
      return value;
    }

    if (value && typeof value === "object") {
      return value[language] || value.en || "";
    }

    return "";
  }

  function createCard(painting, index, language) {
    const card = document.createElement("article");
    card.className = "painting-card";

    const imageLink = document.createElement("button");
    imageLink.type = "button";
    imageLink.className = "painting-card-image";

    imageLink.setAttribute(
      "aria-label",
      getLocalizedText(painting.title, language)
    );

    const image = document.createElement("img");

    image.src = new URL(
      `../${painting.image}`,
      window.location.href
    ).href;

    image.alt = getLocalizedText(painting.title, language);
    image.loading = index < 3 ? "eager" : "lazy";
    image.decoding = "async";

    imageLink.appendChild(image);

    const info = document.createElement("div");
    info.className = "painting-card-info";

    const title = document.createElement("h3");
    title.className = "painting-card-title";
    title.textContent = getLocalizedText(
      painting.title,
      language
    );

    info.appendChild(title);
    card.append(imageLink, info);

    imageLink.addEventListener("click", () => {
      const pageURL = new URL(
        "../painting.html",
        window.location.href
      );

      pageURL.searchParams.set("id", painting.id);

      window.location.href = pageURL.href;
    });

    return card;
  }

  async function renderGallery() {
    try {
      const paintings =
        await window.PaintingsCatalog.getByCategory(CATEGORY);

      if (!Array.isArray(paintings) || paintings.length === 0) {
        grid.textContent = "No paintings found.";
        return;
      }

      const language = getLanguage();
      const fragment = document.createDocumentFragment();

      paintings.forEach((painting, index) => {
        fragment.appendChild(
          createCard(painting, index, language)
        );
      });

      grid.replaceChildren(fragment);
    } catch (error) {
      console.error("Could not load painting gallery:", error);

      grid.textContent =
        "Could not load paintings. Please try again.";
    }
  }

  document.addEventListener("languageChanged", renderGallery);

  renderGallery();
})();

