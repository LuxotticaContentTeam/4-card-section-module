/**
 * Prompt command to set project variables
 *
 * Answers can also arrive from the environment, which is what makes the build
 * usable in CI: with no TTY the inquirer prompt never resolves, gulp gives up
 * and — exiting 0 — reports success while producing no dist/ at all.
 *
 *   VARIANT   required to skip the prompt, e.g. SGH (must exist in projectConfig.json)
 *   LANGUAGE  optional, defaults to the first entry of projectConfig.json > langs
 *   RELEASE   optional, "yes"/"true"/"1" to also write release/<VARIANT>/<version>/
 *
 * Set VARIANT and the prompt is skipped entirely; leave it unset and the
 * interactive behaviour is exactly as before. Building several brands is then a
 * matter of running the build once per variant.
 */

let { src } = require("gulp"),
  fs = require("fs"),
  $ = require("gulp-load-plugins")({ pattern: ["gulp-*"] }), // Setting a global variable to include all glup- plugin
  // `isProd` used to be read here without being imported: it only resolved
  // because script.task.js leaks it as an implicit global.
  { conf, isProd, BRANDS } = require("./_config.js");
projectConfiguration = require("../projectConfig.json");
const c = require("ansi-colors"),
  log = require("fancy-log");

const getBrandExtendedName = (selectedBrand) => {
  let brandClean = selectedBrand.split("_")[0];
  let brandExtendedName = "";
  brandExtendedName = BRANDS[brandClean];
  return brandExtendedName;
};

const isTruthy = (value) => ["yes", "true", "1"].includes(String(value).trim().toLowerCase());

/**
 * Store the chosen answers where every other task reads them from.
 * @param {{lang: string|undefined, variant: string, release: boolean}} choice
 */
const applyChoice = ({ lang, variant, release }) => {
  global.projLanguage = lang ? lang : undefined;
  global.isRelease = release;
  global.selectedVariant = variant;
  global.selectedBrand = variant.split("_")[0];
  global.selectedBrandExtendedName = getBrandExtendedName(variant);

  process.env.CURRENT_BRAND = global.selectedVariant;
};

/**
 * Read the answers from the environment, or return null to fall back to the prompt.
 * Throws on an unknown variant rather than building the wrong brand silently.
 */
const choiceFromEnv = () => {
  const variant = process.env.VARIANT;
  if (!variant) return null;

  if (!conf.variants.includes(variant)) {
    throw new Error(`VARIANT "${variant}" is not in projectConfig.json > variants (${conf.variants.join(", ")})`);
  }

  const lang = process.env.LANGUAGE || projectConfiguration.langs[0];

  if (process.env.LANGUAGE && !projectConfiguration.langs.includes(process.env.LANGUAGE)) {
    throw new Error(`LANGUAGE "${process.env.LANGUAGE}" is not in projectConfig.json > langs (${projectConfiguration.langs.join(", ")})`);
  }

  return { lang, variant, release: isTruthy(process.env.RELEASE) };
};

module.exports = function prompt(cb) {
  const fromEnv = choiceFromEnv();

  if (fromEnv) {
    applyChoice(fromEnv);
    log(c.green.bold(`✅ Non-interactive run — variant: ${fromEnv.variant}, language: ${fromEnv.lang}, release: ${fromEnv.release ? "yes" : "no"}`));
    return cb();
  }

  let questions = [
    {
      type: "list",
      name: "lang",
      message: "Hello, please choose language",
      choices: projectConfiguration.langs,
    },
    {
      type: "list",
      name: "variant",
      message: "Please choose variant",
      choices: conf.variants.sort(),
    },
  ];
  if (isProd) {
    questions[0] = {
      type: "list",
      name: "release",
      message: "Create release?",
      choices: ["no", "yes"],
    };
  }
  return src(["projectConfig.json"]).pipe(
    $.prompt.prompt(questions, (res) => {
      applyChoice({
        lang: res.lang,
        variant: res.variant,
        release: res.release === "yes",
      });

      cb();
    })
  );
};
