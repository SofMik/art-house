(() => {
  "use strict";

  const status = document.getElementById("painting-status");
  const detail = document.getElementById("painting-detail");
  const image = document.getElementById("painting-image");
  const title = document.getElementById("painting-title");
  const technique = document.getElementById("painting-technique");
  const year = document.getElementById("painting-year");
  const size = document.getElementById("painting-size");
  const description = document.getElementById("painting-description");
  const price = document.getElementById("painting-price");
  const backLink = document.getElementById("painting-back");

  const availability = document.getElementById("painting-availability");
  const availabilityIndicator = document.getElementById(
    "painting-availability-indicator",
  );
  const enquire = document.getElementById("painting-enquire");

  // Full-screen painting modal
  const modal = document.getElementById("painting-modal");
  const modalImage = document.getElementById("painting-modal-image");
  const modalClose = document.getElementById("painting-modal-close");

  const paintingNavigation = document.getElementById("painting-navigation");
  const previousLink = document.getElementById("painting-previous");
  const nextLink = document.getElementById("painting-next");

  if (
    !status ||
    !detail ||
    !image ||
    !title ||
    !technique ||
    !year ||
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
  const returnCategory = params.get("from");

  const categoryPages = {
    landscapes: "galleries/landscapes.html",
    portraits: "galleries/portraits.html",
    "still-life": "galleries/still-life.html",
    "textured-painting": "galleries/textured-painting.html",
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
    if (event.key === "Escape" && modal && !modal.hidden) {
      event.preventDefault();
      closePaintingModal();
    }
  });

  function renderAvailability() {
    const isAvailable = painting.available === true;

    availability.textContent = isAvailable
      ? translate("artwork.available", "Available for sale")
      : translate("artwork.sold", "Sold");

    availabilityIndicator.classList.toggle("is-unavailable", !isAvailable);

    // Always show the enquiry button, even for sold paintings.
    enquire.hidden = false;

    enquire.textContent = translate(
      "artwork.contact",
      "Ask about this painting",
    );

  
    const recipient = "artbylef@gmail.com";

    const paintingTitle = getText(painting.title);

    const subject = translate("artwork.emailSubject", "Enquiry about painting");

    const bodyTemplate = translate(
      "artwork.emailBody",
      "Hello,\n\nI am interested in the following painting:\n\nTitle: {title}\nPainting ID: {id}\n\nCould you please provide more information?\n\nKind regards",
    );

    const body = bodyTemplate
      .replaceAll("{title}", paintingTitle)
      .replaceAll("{id}", painting.id);

    enquire.href =
      `mailto:${recipient}` +
      `?subject=${encodeURIComponent(`${subject}: ${paintingTitle}`)}` +
      `&body=${encodeURIComponent(body)}`;
  }

    async function renderPaintingNavigation() {
    if (!paintingNavigation || !previousLink || !nextLink) {
      return;
    }

    const categories = Array.isArray(painting.category)
      ? painting.category
      : [painting.category];

    // Use the collection from which the visitor opened the painting.
    const activeCategory = categories.includes(returnCategory)
      ? returnCategory
      : categories[0];

    const paintings =
      await window.PaintingsCatalog.getByCategory(activeCategory);

    if (paintings.length <= 1) {
      paintingNavigation.hidden = true;
      return;
    }

    const currentIndex = paintings.findIndex(
      (item) => item.id === painting.id
    );

    if (currentIndex === -1) {
      paintingNavigation.hidden = true;
      return;
    }

    // Wrap around at both ends of the collection.
    const previousIndex =
      (currentIndex - 1 + paintings.length) % paintings.length;

    const nextIndex =
      (currentIndex + 1) % paintings.length;

    function createPaintingURL(paintingId) {
      const url = new URL(window.location.href);

      url.search = "";
      url.searchParams.set("id", paintingId);
      url.searchParams.set("from", activeCategory);

      return url.href;
    }

    previousLink.href = createPaintingURL(
      paintings[previousIndex].id
    );

    nextLink.href = createPaintingURL(
      paintings[nextIndex].id
    );

    paintingNavigation.hidden = false;
  }

  function renderPainting() {
    if (!painting) {
      return;
    }

    const paintingTitle = getText(painting.title);

    title.textContent = paintingTitle;
    image.alt = paintingTitle;

    image.src = new URL(painting.image, document.baseURI).href;

    setOptionalText(technique, painting.technique);
    setOptionalText(description, painting.description);

    if (painting.canvasSize) {
      const { width, height, unit = "cm" } = painting.canvasSize;

    
    size.textContent = `${width} × ${height} ${unit}`;

      size.hidden = false;
    } else {
      size.textContent = "";
      size.hidden = true;
    }

      if (painting.price !== null && painting.price !== undefined) {
      const currency = translate("artwork.currency", "EUR");

      price.textContent = `${painting.price} ${currency}`;
      price.hidden = false;
    } else {
      price.textContent = "";
      price.hidden = true;
    }

    if (painting.year !== null && painting.year !== undefined) {
      
      year.textContent = `${painting.year}`;
      year.hidden = false;
    } else {
      year.textContent = "";
      year.hidden = true;
    }

    renderAvailability();

    document.title = paintingTitle
      ? `${paintingTitle} — >Art by Lef Studio`
      : "Painting — >Art by Lef Studio";

    // Keep the modal image and alt text synchronized
    // if the language changes while the modal is open.
    if (modal && !modal.hidden && modalImage) {
      modalImage.src = image.src;
      modalImage.alt = image.alt;
    }
  }



async function init() {
  status.hidden = true;

  const loadingTimer = window.setTimeout(() => {
    status.textContent = "Loading painting...";
    status.hidden = false;
  }, 500);

  try {
    if (!paintingId) {
      status.textContent = "No painting was specified.";
      status.hidden = false;
      return;
    }

    if (!window.PaintingsCatalog) {
      status.textContent = "The painting catalog is unavailable.";
      status.hidden = false;
      console.error("PaintingsCatalog was not found.");
      return;
    }

    painting = await window.PaintingsCatalog.getById(paintingId);

    if (!painting) {
      status.textContent = "Painting not found.";
      status.hidden = false;
      return;
    }

    const category = Array.isArray(painting.category)
      ? painting.category
      : [painting.category];

    const returnPage = categoryPages[returnCategory];

    backLink.href =
      returnPage && category.includes(returnCategory)
        ? returnPage
        : categoryPages[category[0]] || "index.html";

    renderPainting();

    detail.hidden = false;

    window.clearTimeout(loadingTimer);
    status.hidden = true;

    renderPaintingNavigation();

  } catch (error) {
    console.error("Could not load painting:", error);
    status.textContent = "Could not load painting. Please try again.";
    status.hidden = false;
  } finally {
    window.clearTimeout(loadingTimer);
  }
}




  document.addEventListener("languageChanged", () => {
    if (painting) {
      renderPainting();
    }
  });

  init();
})();
