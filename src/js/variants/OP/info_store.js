// Store info for OP.
//
// Ported from LuxotticaContentTeam/RTR_BannerHome (src/js/brands/OP/info_store.js):
// this brand's storefront exposes its locale through the global `ct_data`.
// The country string it builds ("en-us") is what getTrad() matches first.
//
// NOT verified against the live site — unlike SGH, where checking showed
// ct_data.lang is a bare language ("en") and the locale has to be composed with
// ct_data.country. RTR assumes the full locale ("en_US") instead, so both
// shapes are handled below until this brand can be checked on its own site.
const infoStoreLocal = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let info_store = {
        brand: "OP",
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
    // Guard on ct_data itself, not on window.lang as RTR does: on a page where
    // the locale global never lands, reading ct_data.lang would throw instead
    // of retrying.
    if (window.ct_data && ct_data.lang && ct_data.country) {
      // ct_data.lang is either a full locale ("en_US") or a bare language
      // ("en"), depending on the storefront — compose with ct_data.country in
      // the second case so getTrad() still gets "en-us" rather than "en".
      const locale = ct_data.lang.includes("_") ? ct_data.lang.replace("_", "-") : `${ct_data.lang}-${ct_data.country}`;

      let info_store = {
        brand: "OP",
        lang: ct_data.lang.split("_")[0], // en
        storeId: ct_data.storeId,
        catalog: ct_data.catalogID,
        country: locale.toLowerCase(), // en-us
        langID: ct_data.langID,
        currency: window.currencySymbol,
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
