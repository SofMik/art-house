
(() => {
  "use strict";

  const status = document.getElementById("painting-status");
  const detail = document.getElementById("painting-detail");
  const image = document.getElementById("painting-image");
  const title = document.getElementById("painting-title");
  const technique = document.getElementById("painting-technique");
  const size = document.getElementById("painting-size");
  const description = document.getElementById("painting-description");
  const price = document.getElementById("painting-price");
  const backLink = document.getElementById("painting-back");

  const availability = document.getElementById("painting-availability");
  const availabilityIndicator = document.getElementById(
    "painting-availability-indicator"
  );
  const enquire = document.getElementById("painting-enquire");

  // Full-screen painting modal
  const modal = document.getElementById("painting-modal");
  const modalImage = document.getElementById("painting-modal-image");
  const modalClose = document.getElementById("painting-modal-close");

  if (
    !status ||
    !detail ||
    !image ||
    !title ||
    !technique ||
    !size ||
    !description ||
    !price ||
    !backLink ||
    !availability ||
    !availabilityIndicator ||
    !enquire
  ) {
    console.error("Painting page elements are missing.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const paintingId = params.get("id");

  const categoryPages = {
    landscapes: "galleries/landscapes.html",
    portraits: "galleries/portraits.html",
    "still-life": "galleries/still-life.html",
    "textured-painting": "galleries/textured-painting.html"
  };

  let painting = null;
  let previouslyFocusedElement = null;
  let modalCloseTimer = null;

  function getLanguage() {
    return window.SiteTranslations?.getLanguage?.() || "en";
  }

  function getText(value) {
    if (typeof value === "string") {
      return value;
    }

    if (value && typeof value === "object") {
      const language = getLanguage();
      return value[language] || value.en || "";
    }

    return "";
  }

  function translate(key, fallback) {
    const value = window.SiteTranslations?.t?.(key);

    if (typeof value === "string" && value !== key) {
      return value;
    }

    return fallback;
  }

  function setOptionalText(element, value) {
    const text = getText(value);

    element.textContent = text;
    element.hidden = !text;
  }

  // Open the full-screen image modal.
  function openPaintingModal() {
    if (!modal || !modalImage || !image.src || image.hidden) {
      return;
    }

    if (!modal.hidden) {
      return;
    }

    if (modalCloseTimer !== null) {
      window.clearTimeout(modalCloseTimer);
      modalCloseTimer = null;
    }

    previouslyFocusedElement = document.activeElement;

    modalImage.src = image.src;
    modalImage.alt = image.alt;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("painting-modal-open");

    // Allow the browser to apply the initial state before animating.
    requestAnimationFrame(() => {
      if (!modal.hidden) {
        modal.classList.add("is-open");
      }
    });

    if (modalClose) {
      modalClose.focus();
    }
  }

  // Close the modal and restore the previous focus.
  function closePaintingModal() {
    if (!modal || modal.hidden) {
      return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("painting-modal-open");

    if (modalCloseTimer !== null) {
      window.clearTimeout(modalCloseTimer);
    }

    modalCloseTimer = window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) {
        modal.hidden = true;
        modalImage?.removeAttribute("src");
      }

      modalCloseTimer = null;
    }, 180);

    if (
      previouslyFocusedElement &&
      typeof previouslyFocusedElement.focus === "function"
    ) {
      previouslyFocusedElement.focus();
    } else {
      image.focus();
    }

    previouslyFocusedElement = null;
  }

  // Open the image when the main painting is clicked.
  image.addEventListener("click", openPaintingModal);

  // Close using the X button.
  modalClose?.addEventListener("click", closePaintingModal);

  // Close only when the dark background itself is clicked.
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closePaintingModal();
    }
  });

  // Close using Escape.
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      modal &&
      !modal.hidden
    ) {
      event.preventDefault();
      closePaintingModal();
    }
  });

  function renderAvailability() {
    const isAvailable = painting.available === true;


    availability.textContent = isAvailable
      ? translate("artwork.available", "Available for sale")
      : translate("artwork.sold", "Sold");

    availabilityIndicator.classList.toggle(
      "is-unavailable",
      !isAvailable
    );

// Always show the enquiry button, even for sold paintings.
  enquire.hidden = false;

  enquire.textContent = translate(
    "artwork.contact",
    "Ask about this painting"
  );

    // Replace with Elena's real email address.
    const recipient = "ELENA_EMAIL@example.com";

    const paintingTitle = getText(painting.title);

    const subject = translate(
      "artwork.emailSubject",
      "Enquiry about painting"
    );

    const bodyTemplate = translate(
      "artwork.emailBody",
      "Hello,\n\nI am interested in the following painting:\n\nTitle: {title}\nPainting ID: {id}\n\nCould you please provide more information?\n\nKind regards"
    );

    const body = bodyTemplate
      .replaceAll("{title}", paintingTitle)
      .replaceAll("{id}", painting.id);

    enquire.href =
      `mailto:${recipient}` +
      `?subject=${encodeURIComponent(`${subject}: ${paintingTitle}`)}` +
      `&body=${encodeURIComponent(body)}`;

  }

  function renderPainting() {
    if (!painting) {
      return;
    }

    const paintingTitle = getText(painting.title);

    title.textContent = paintingTitle;
    image.alt = paintingTitle;

    image.src = new URL(
      painting.image,
      document.baseURI
    ).href;

    setOptionalText(technique, painting.technique);
    setOptionalText(description, painting.description);

    if (painting.canvasSize) {
      const {
        width,
        height,
        unit = "cm"
      } = painting.canvasSize;

      const canvasLabel = translate(
        "artwork.canvasSize",
        "Canvas size"
      );

      size.textContent =
        `${canvasLabel}: ${width} × ${height} ${unit}`;

      size.hidden = false;
    } else {
      size.textContent = "";
      size.hidden = true;
    }

    if (
      painting.price !== null &&
      painting.price !== undefined
    ) {
      const currency = translate("artwork.currency", "EUR");

      price.textContent = `${painting.price} ${currency}`;
      price.hidden = false;
    } else {
      price.textContent = "";
      price.hidden = true;
    }

    renderAvailability();

    document.title = paintingTitle
      ? `${paintingTitle} — Elena Art House`
      : "Painting — Elena Art House";

    // Keep the modal image and alt text synchronized
    // if the language changes while the modal is open.
    if (modal && !modal.hidden && modalImage) {
      modalImage.src = image.src;
      modalImage.alt = image.alt;
    }
  }

  async function init() {
    if (!paintingId) {
      status.textContent = "No painting was specified.";
      return;
    }

    if (!window.PaintingsCatalog) {
      status.textContent = "The painting catalog is unavailable.";
      console.error("PaintingsCatalog was not found.");
      return;
    }

    try {
      painting = await window.PaintingsCatalog.getById(paintingId);

      if (!painting) {
        status.textContent = "Painting not found.";
        return;
      }

      backLink.href =
        categoryPages[painting.category] || "index.html";

      renderPainting();

      detail.hidden = false;
      status.hidden = true;
    } catch (error) {
      console.error("Could not load painting:", error);
      status.textContent =
        "Could not load painting. Please try again.";
    }
  }

  document.addEventListener("languageChanged", () => {
    if (painting) {
      renderPainting();
    }
  });

  init();
})();


