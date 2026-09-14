import { Analytics } from "./modules/analytics";
import { customLog, getTrad } from "./modules/utils";

// Replaced at build time by tasks/script.task.js from
// package.json > projectConfigurations.paths.{developmentImage,productionImage}
const IMAGE_PATH = "@imagePath@";

export class Contents {
  constructor({ stateManger, trackingId, json }) {
    this.json = json;
    this.stateManger = stateManger;
    this.trackingId = trackingId;
  }

  init() {
    if (this.initialized) return;
    customLog("[Contents] - init");

    this.setElements();

    this.buildHtml();

    this.eventHandler();

    Analytics.init({
      env: this.stateManger.env,
      trackingId: this.trackingId,
      moduleContainerSelector: this.container,
    });

    this.initialized = true;

    this.container.dataset.loaded = true;
  }

  setElements() {
    this.container = document.querySelector(this.stateManger.selector);
    this.section = this.container.querySelector(".ct_main-features");
    this.sectionTitle = this.container.querySelector(".ct_main-features__title");
    this.cards = [...this.container.querySelectorAll(".ct_main-features__card")];
  }

  buildHtml() {
    const data = this.json.main_features;

    if (!data || !Array.isArray(data.cards)) {
      customLog("[Contents] - no main_features data", "", "err");
      return;
    }

    const infoStore = this.stateManger.infoStore;

    this.sectionTitle.textContent = getTrad(data.title, infoStore);

    this.cards.forEach((card, index) => {
      const content = data.cards[index];

      // Fewer entries in the JSON than slots in the markup: drop the extra
      // cards rather than leaving empty boxes in the carousel.
      if (!content) {
        card.remove();
        return;
      }

      card.dataset.cardId = content.id || `card-${index + 1}`;

      const title = getTrad(content.title, infoStore);
      const description = getTrad(content.description, infoStore);
      const disclaimer = getTrad(content.disclaimer, infoStore);

      card.querySelector(".ct_main-features__card-title").textContent = title;
      card.querySelector(".ct_main-features__card-description").textContent = description;

      const disclaimerEl = card.querySelector(".ct_main-features__card-disclaimer");
      disclaimerEl.textContent = disclaimer;
      disclaimerEl.hidden = !disclaimer;

      // The trailing asterisk is a footnote marker for the disclaimer — it is
      // noise in alt text.
      this.setImage(card.querySelector(".ct_main-features__card-image"), content.image, title.replace(/\*+$/, ""));
    });

    // Refresh the list after any removal above.
    this.cards = [...this.container.querySelectorAll(".ct_main-features__card")];
  }

  setImage(img, fileName, alt) {
    if (!img) return;

    if (!fileName) {
      img.remove();
      return;
    }

    img.alt = alt || "";
    img.src = `${IMAGE_PATH}${fileName}`;
  }

  eventHandler() {
    this.observeEntry();
  }

  // Cards rise into place the first time the section is on screen. The CSS
  // does the staggering; this only flips the class, once.
  observeEntry() {
    if (!this.section) return;

    if (!("IntersectionObserver" in window)) {
      this.section.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.section.classList.add("is-visible");
          observer.disconnect();
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(this.section);
  }
}
