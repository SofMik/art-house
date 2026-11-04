
(() => {
  "use strict";

  const SUPPORTED_LANGUAGES = ["en", "fi", "es"];
  const DEFAULT_LANGUAGE = "en";
  const STORAGE_KEY = "site-language";

  // Find the project root from this script's location.
  const scriptElement = document.currentScript;

  const scriptURL = scriptElement
    ? scriptElement.src
    : new URL("js/translations.js", window.location.href).href;

  const PROJECT_ROOT = new URL("../", scriptURL);

  let currentLanguage = DEFAULT_LANGUAGE;
  let translations = {};
  let requestNumber = 0;

  // Safely read nested translation keys.
  function getTranslation(key) {
    return key.split(".").reduce((value, part) => {
      if (value && typeof value === "object") {
        return value[part];
      }

      return undefined;
    }, translations);
  }

  // Accept only supported languages.
  function normalizeLanguage(language) {
    const normalized = String(language || "")
      .toLowerCase()
      .split("-")[0];

    return SUPPORTED_LANGUAGES.includes(normalized)
      ? normalized
      : DEFAULT_LANGUAGE;
  }

  // Translate all elements containing data-i18n.
  function translateText() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = getTranslation(element.dataset.i18n);

      if (typeof value === "string") {
        element.textContent = value;
      }
    });
  }

  // Translate HTML attributes without changing element content.
  function translateAttributes() {
    const attributes = [
      ["aria-label", "i18nAriaLabel"],
      ["alt", "i18nAlt"],
      ["title", "i18nTitle"],
      ["placeholder", "i18nPlaceholder"]
    ];

    document.querySelectorAll("*").forEach((element) => {
      attributes.forEach(([attribute, datasetKey]) => {
        const key = element.dataset[datasetKey];

        if (!key) return;

        const value = getTranslation(key);

        if (typeof value === "string") {
          element.setAttribute(attribute, value);
        }
      });
    });
  }

  // Update language buttons, page title and metadata.
  function updatePage() {
    document.documentElement.lang = currentLanguage;

    translateText();
    translateAttributes();

    document.querySelectorAll("[data-lang]").forEach((button) => {
      const selected = button.dataset.lang === currentLanguage;

      button.setAttribute("aria-pressed", String(selected));
    });

    const pageTitle = getTranslation("meta.title");
    const pageDescription = getTranslation("meta.description");

    if (typeof pageTitle === "string") {
      document.title = pageTitle;
    }

    const descriptionElement = document.querySelector(
      'meta[name="description"]'
    );

    if (
      descriptionElement &&
      typeof pageDescription === "string"
    ) {
      descriptionElement.setAttribute("content", pageDescription);
    }

    // Notify galleries and artwork cards that the language changed.
    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          language: currentLanguage,
          translations
        }
      })
    );
  }

  // Load the chosen locale JSON file.
  async function setLanguage(language) {
    const nextLanguage = normalizeLanguage(language);
    const thisRequest = ++requestNumber;

    try {
      const localeURL = new URL(
        `locales/${nextLanguage}.json`,
        PROJECT_ROOT
      );

      const response = await fetch(localeURL);

      if (!response.ok) {
        throw new Error(
          `Failed to load ${nextLanguage}.json: HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (
        !data ||
        typeof data !== "object" ||
        !data.meta ||
        !data.nav
      ) {
        throw new Error(
          `Invalid translation file: ${nextLanguage}.json`
        );
      }

      // Ignore outdated requests if the visitor changed languages quickly.
      if (thisRequest !== requestNumber) return;

      currentLanguage = nextLanguage;
      translations = data;

      try {
        localStorage.setItem(STORAGE_KEY, currentLanguage);
      } catch {
        // The selected language still works if storage is unavailable.
      }

      updatePage();
    } catch (error) {
      console.error("Translation loading error:", error);

      if (thisRequest === requestNumber) {
        document.dispatchEvent(
          new CustomEvent("languageLoadError", {
            detail: {
              language: nextLanguage,
              error
            }
          })
        );
      }
    }
  }

  // Restore the saved language or use the browser language.
  function getInitialLanguage() {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);

      if (savedLanguage) {
        return normalizeLanguage(savedLanguage);
      }
    } catch {
      // Continue with the browser's language.
    }

    return normalizeLanguage(navigator.language);
  }

  // Handle EN / FI / ES buttons.
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const button = target.closest("[data-lang]");

    if (!button) return;

    setLanguage(button.dataset.lang);
  });

  // Public API for other project scripts.
  window.SiteTranslations = {
    setLanguage,

    getLanguage() {
      return currentLanguage;
    },

    t(key) {
      const value = getTranslation(key);

      return typeof value === "string" ? value : key;
    },

    getTranslations() {
      return translations;
    }
  };

  // Start the website in the saved or detected language.
  setLanguage(getInitialLanguage());
})();
