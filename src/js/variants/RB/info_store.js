// Store info for RB.
//
// Ported from LuxotticaContentTeam/RTR_BannerHome (src/js/brands/RB/info_store.js):
// Ray-Ban's storefront publishes the WCS configuration as `window.wcs_config`,
// where the locale already comes as "en-US" — lowercased here so it matches the
// locale keys in the content json.
const infoStoreLocal = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let info_store = {
        brand: "RB",
        lang: document.querySelector("#ct_lang").getAttribute("lang"),
        storeId: "12001",
        currency: "$",
        catalog: "",
        country: document.querySelector("#ct_lang").getAttribute("country"),
        langID: "-1",
      };

      resolve(info_store);
    }, 1000);
  });
};

const infoStoreProd = () => {
  return new Promise((resolve, reject) => {
    if (window.wcs_config) {
      let info_store = {
        brand: "RB",
        lang: wcs_config.locale.split("-")[0], // en
        storeId: wcs_config.storeId,
        catalog: wcs_config.catalogId,
        country: wcs_config.locale.toLowerCase(), // en-us
        langID: wcs_config.langId,
        baseURL: window.location.origin + wcs_config.topCategoriesDisplayURL,
      };

      resolve(info_store);
    } else {
      setTimeout(() => {
        infoStoreProd().then(resolve).catch(reject);
      }, 300);
    }
  });
};

var infoStore;

if ("@env@" === "development") {
  infoStore = infoStoreLocal;
} else {
  infoStore = infoStoreProd;
}

export default infoStore;
