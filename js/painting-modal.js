/*
(() => {
  "use strict";

  const dialog = document.getElementById("painting-dialog");
  const content = document.getElementById("dialog-content");

  if (!dialog || !content) {
    console.error("Painting dialog elements were not found.");
    return;
  }

  function getLanguage() {
    return window.SiteTranslations?.getLanguage() || "en";
  }

  function getText(value) {
    if (typeof value === "string") {
      return value;
    }

    if (value && typeof value === "object") {
      return value[getLanguage()] || value.en || "";
    }

    return "";
  }

  function addText(parent, tag, className, text) {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;

    parent.appendChild(element);

    return element;
  }

  function open(painting) {
    if (!painting) return;

    content.replaceChildren();

    const layout = document.createElement("div");
    layout.className = "painting-detail";

    const imageWrap = document.createElement("div");
    imageWrap.className = "painting-detail-image";

    const image = document.createElement("img");

    image.src = new URL(
      painting.image,
      new URL("../", window.location.href)
    ).href;

    image.alt = getText(painting.title);
    image.decoding = "async";

    imageWrap.appendChild(image);
    layout.appendChild(imageWrap);

    const details = document.createElement("div");
    details.className = "painting-detail-info";

    addText(
      details,
      "h2",
      "painting-detail-title",
      getText(painting.title)
    );

    const technique = getText(painting.technique);

    if (technique) {
      addText(
        details,
        "p",
        "painting-detail-technique",
        technique
      );
    }

    if (painting.canvasSize) {
      const {
        width,
        height,
        unit = "cm"
      } = painting.canvasSize;

      const labels = {
        en: "Canvas size",
        fi: "Kankaan koko",
        es: "Tamaño del lienzo"
      };

      addText(
        details,
        "p",
        "painting-detail-size",
        `${labels[getLanguage()] || labels.en}: ${width} × ${height} ${unit}`
      );
    }

    const description = getText(painting.description);

    if (description) {
      addText(
        details,
        "p",
        "painting-detail-description",
        description
      );
    }

    if (
      painting.price !== null &&
      painting.price !== undefined
    ) {
      addText(
        details,
        "p",
        "painting-detail-price",
        String(painting.price)
      );
    }

    layout.appendChild(details);
    content.appendChild(layout);

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  function close() {
    if (dialog.open) {
      dialog.close();
    }
  }

  dialog
    .querySelector(".dialog-close")
    ?.addEventListener("click", close);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  window.PaintingModal = {
    open,
    close
  };
})();

*/