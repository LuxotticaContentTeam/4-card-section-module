// Module content. Every string is an object keyed by locale and resolved at
// runtime by getTrad() (src/js/modules/utils.js), which falls back
// country -> language -> en-us -> first key.
//
// `image` is a file name only; contents.js prefixes it with the environment
// image path (package.json > projectConfigurations.paths).
//
// Copy and assets come from Figma "SGH - RB META APEROL", node 410:8852.
window["ct_cm__@projectNameCamel@Config"] = {
  main_features: {
    title: {
      "en-us": "Main features",
    },
    cards: [
      {
        id: "image-video-capture",
        title: { "en-us": "Image & video capture*" },
        description: { "en-us": "Capture every moment hands-free." },
        disclaimer: { "en-us": "*Not available on Ray-Ban Audio." },
        image: "feature-01-capture.jpg",
      },
      {
        id: "open-ear-audio",
        title: { "en-us": "Open-ear audio" },
        description: {
          "en-us": "Experience premium audio while keeping conversations and ambient sounds within earshot.",
        },
        image: "feature-02-audio.jpg",
      },
      {
        id: "touch-control",
        title: { "en-us": "Touch control" },
        description: {
          "en-us": "Seamlessly control music, take photos, and make calls with responsive touch controls.",
        },
        image: "feature-03-touch.jpg",
      },
      {
        id: "meta-ai",
        title: { "en-us": "Meta AI" },
        description: {
          "en-us": "Get answers about what you see, personalized suggestions, and helpful reminders on the go.",
        },
        image: "feature-04-meta-ai.jpg",
      },
    ],
  },
};
