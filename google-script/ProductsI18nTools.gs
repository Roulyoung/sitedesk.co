/**
 * Sitedesk Products i18n Tools
 *
 * Goals:
 * - Add predictable locale columns in Products sheet.
 * - Fill missing translations once (as values, no formulas).
 * - Generate missing localized slugs.
 * - Keep manual edits safe (only empty target cells are written).
 *
 * Script Properties (Project Settings -> Script properties):
 * - I18N_PRODUCTS_SHEET: default "Products"
 * - I18N_BASE_LANG: default "nl"
 * - I18N_TARGET_LANGS: comma-separated, default "en"
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Sitedesk i18n")
    .addItem("1) Setup i18n columns", "setupI18nColumns")
    .addItem("2) Fill missing translations (values only)", "fillMissingTranslations")
    .addItem("3) Generate missing localized slugs", "generateMissingLocalizedSlugs")
    .addItem("4) Show i18n config", "showI18nConfig")
    .addToUi();
}

function setupI18nColumns() {
  var ui = SpreadsheetApp.getUi();
  var cfg = getI18nConfig_();
  var sheet = getSheetOrThrow_(cfg.sheetName);
  var headers = getHeaderMap_(sheet, cfg.headerRow);

  var requiredBase = ["slug", "name", "description"];
  var missingBase = requiredBase.filter(function (h) {
    return headers[h] == null;
  });
  if (missingBase.length > 0) {
    ui.alert(
      "Missing base columns in '" +
        cfg.sheetName +
        "': " +
        missingBase.join(", ") +
        ". Add these first and run again.",
    );
    return;
  }

  var toEnsure = [];
  cfg.targetLangs.forEach(function (lang) {
    toEnsure.push("slug_" + lang);
    toEnsure.push("name_" + lang);
    toEnsure.push("description_" + lang);
  });

  var appended = 0;
  toEnsure.forEach(function (header) {
    if (headers[header] == null) {
      sheet.getRange(cfg.headerRow, sheet.getLastColumn() + 1).setValue(header);
      appended += 1;
    }
  });

  ui.alert(
    appended > 0
      ? "Done. Added " + appended + " i18n columns."
      : "No new columns added. i18n columns already present.",
  );
}

function fillMissingTranslations() {
  var ui = SpreadsheetApp.getUi();
  var cfg = getI18nConfig_();
  var sheet = getSheetOrThrow_(cfg.sheetName);
  var headers = getHeaderMap_(sheet, cfg.headerRow);

  ensureColumnsOrThrow_(headers, ["name", "description"], cfg.sheetName);
  cfg.targetLangs.forEach(function (lang) {
    ensureColumnsOrThrow_(headers, ["name_" + lang, "description_" + lang], cfg.sheetName);
  });

  var rowCount = sheet.getLastRow() - cfg.headerRow;
  if (rowCount <= 0) {
    ui.alert("No product rows found.");
    return;
  }

  var response = ui.alert(
    "Fill missing translations",
    "This will write ONLY empty target translation cells as fixed values.\nManual overrides are kept.\n\nContinue?",
    ui.ButtonSet.YES_NO,
  );
  if (response !== ui.Button.YES) return;

  createBackupSheet_(sheet);

  var values = sheet.getRange(cfg.headerRow + 1, 1, rowCount, sheet.getLastColumn()).getValues();
  var updates = 0;

  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var baseName = toText_(row[headers["name"] - 1]);
    var baseDescription = toText_(row[headers["description"] - 1]);

    cfg.targetLangs.forEach(function (lang) {
      var nameKey = "name_" + lang;
      var descKey = "description_" + lang;

      var currentName = toText_(row[headers[nameKey] - 1]);
      var currentDesc = toText_(row[headers[descKey] - 1]);

      if (!currentName && baseName) {
        row[headers[nameKey] - 1] = safeTranslate_(baseName, cfg.baseLang, lang);
        updates += 1;
      }
      if (!currentDesc && baseDescription) {
        row[headers[descKey] - 1] = safeTranslate_(baseDescription, cfg.baseLang, lang);
        updates += 1;
      }
    });
  }

  sheet.getRange(cfg.headerRow + 1, 1, rowCount, sheet.getLastColumn()).setValues(values);
  ui.alert("Done. Filled " + updates + " missing translation cells.");
}

function generateMissingLocalizedSlugs() {
  var ui = SpreadsheetApp.getUi();
  var cfg = getI18nConfig_();
  var sheet = getSheetOrThrow_(cfg.sheetName);
  var headers = getHeaderMap_(sheet, cfg.headerRow);

  ensureColumnsOrThrow_(headers, ["slug", "name"], cfg.sheetName);
  cfg.targetLangs.forEach(function (lang) {
    ensureColumnsOrThrow_(headers, ["slug_" + lang, "name_" + lang], cfg.sheetName);
  });

  var rowCount = sheet.getLastRow() - cfg.headerRow;
  if (rowCount <= 0) {
    ui.alert("No product rows found.");
    return;
  }

  var response = ui.alert(
    "Generate missing localized slugs",
    "This writes ONLY empty slug_<lang> cells.\nManual slug overrides are kept.\n\nContinue?",
    ui.ButtonSet.YES_NO,
  );
  if (response !== ui.Button.YES) return;

  createBackupSheet_(sheet);

  var values = sheet.getRange(cfg.headerRow + 1, 1, rowCount, sheet.getLastColumn()).getValues();
  var updates = 0;

  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var baseSlug = toText_(row[headers["slug"] - 1]);
    var baseName = toText_(row[headers["name"] - 1]);

    cfg.targetLangs.forEach(function (lang) {
      var slugKey = "slug_" + lang;
      var nameKey = "name_" + lang;
      var currentSlug = toText_(row[headers[slugKey] - 1]);
      if (currentSlug) return;

      var localizedName = toText_(row[headers[nameKey] - 1]);
      var source = localizedName || baseName || baseSlug;
      if (!source) return;

      row[headers[slugKey] - 1] = slugify_(source);
      updates += 1;
    });
  }

  sheet.getRange(cfg.headerRow + 1, 1, rowCount, sheet.getLastColumn()).setValues(values);
  ui.alert("Done. Generated " + updates + " missing localized slugs.");
}

function showI18nConfig() {
  var cfg = getI18nConfig_();
  SpreadsheetApp.getUi().alert(
    [
      "Products sheet: " + cfg.sheetName,
      "Base language: " + cfg.baseLang,
      "Target languages: " + cfg.targetLangs.join(", "),
      "",
      "Set these in Script Properties:",
      "I18N_PRODUCTS_SHEET",
      "I18N_BASE_LANG",
      "I18N_TARGET_LANGS",
    ].join("\n"),
  );
}

function getI18nConfig_() {
  var props = PropertiesService.getScriptProperties();
  var sheetName = (props.getProperty("I18N_PRODUCTS_SHEET") || "Products").trim();
  var baseLang = (props.getProperty("I18N_BASE_LANG") || "nl").trim().toLowerCase();
  var targetLangs = (props.getProperty("I18N_TARGET_LANGS") || "en")
    .split(",")
    .map(function (v) {
      return (v || "").trim().toLowerCase();
    })
    .filter(function (v) {
      return v && v !== baseLang;
    });
  if (targetLangs.length === 0) targetLangs = ["en"];

  return {
    sheetName: sheetName,
    baseLang: baseLang,
    targetLangs: targetLangs,
    headerRow: 1,
  };
}

function getSheetOrThrow_(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }
  return sheet;
}

function getHeaderMap_(sheet, headerRow) {
  var lastCol = sheet.getLastColumn();
  if (lastCol <= 0) return {};
  var headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var key = toText_(headers[i]).toLowerCase();
    if (key) map[key] = i + 1;
  }
  return map;
}

function ensureColumnsOrThrow_(headerMap, required, sheetName) {
  var missing = required.filter(function (h) {
    return headerMap[h] == null;
  });
  if (missing.length > 0) {
    throw new Error("Missing required columns in '" + sheetName + "': " + missing.join(", "));
  }
}

function safeTranslate_(text, sourceLang, targetLang) {
  try {
    return LanguageApp.translate(text, sourceLang, targetLang);
  } catch (_err) {
    return text;
  }
}

function createBackupSheet_(sheet) {
  var ss = sheet.getParent();
  var backupName =
    sheet.getName() +
    "_backup_" +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  var backup = sheet.copyTo(ss);
  backup.setName(backupName);
}

function slugify_(value) {
  var s = toText_(value).toLowerCase();
  s = s
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s;
}

function toText_(value) {
  return value == null ? "" : String(value).trim();
}
