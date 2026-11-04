
(() => {
  "use strict";

  const scriptURL = document.currentScript.src;
  const projectRoot = new URL("../", scriptURL);
  const catalogURL = new URL("data/paintings.json", projectRoot);

  let paintingsPromise = null;

  async function loadPaintings() {
    if (!paintingsPromise) {
      paintingsPromise = fetch(catalogURL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load paintings.json: HTTP ${response.status}`
            );
          }

          return response.json();
        })
        .then((paintings) => {
          if (!Array.isArray(paintings)) {
            throw new Error("The paintings catalog must be an array.");
          }

          const ids = new Set();

          for (const painting of paintings) {
            if (
              !painting.id ||
              !painting.category ||
              !painting.image ||
              !painting.title
            ) {
              throw new Error("A painting is missing required fields.");
            }

            if (ids.has(painting.id)) {
              throw new Error(`Duplicate painting ID: ${painting.id}`);
            }

            ids.add(painting.id);
          }

          return paintings;
        })
        .catch((error) => {
          paintingsPromise = null;
          throw error;
        });
    }

    return paintingsPromise;
  }

  window.PaintingsCatalog = {
    load: loadPaintings,

    async getByCategory(category) {
      const paintings = await loadPaintings();

      return paintings.filter((painting) =>
  Array.isArray(painting.category)
    ? painting.category.includes(category)
    : painting.category === category
);
    },

    async getById(id) {
      const paintings = await loadPaintings();

      return paintings.find(
        (painting) => painting.id === id
      ) || null;
    }
  };
})();

