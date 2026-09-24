// Store info for OO.
//
// Ported from LuxotticaContentTeam/RTR_BannerHome (src/js/brands/OO/info_store.js):
// Oakley publishes no locale global, so the country is read off the url — the
// segment straight after the host, e.g. oakley.com/en-us/... -> "en-us".
//
// Nothing to wait for, so unlike the other brands this resolves immediately;
// when the url carries no locale segment it resolves with undefined values and
// getTrad() falls back to en-us.
const infoStoreLocal = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let info_store = {
        brand: "OO",
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
  return new Promise((resolve) => {
    const website = location.origin.split("/")[2];
    const segments = window.location.href.split("/");
    const segment = segments[segments.indexOf(website) + 1];
    const country = segment ? segment.split("?")[0] : undefined; // en-us | fr-fr | de-de
    const lang = country ? country.split("-")[0] : undefined; // en | fr | de

    resolve({
      brand: "OO",
      lang,
      storeId: undefined,
      catalog: undefined,
      country,
      langID: undefined,
    });
  });
};

var infoStore;

if ("@env@" === "development") {
  infoStore = infoStoreLocal;
} else {
  infoStore = infoStoreProd;
}

export default infoStore;
