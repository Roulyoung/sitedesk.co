// Google Apps Script for Sitedesk leads.
// Handles two lead types:
// 1) contact (name, email, message)
// 2) calculator (shopUrl + email or phone + calculator metrics)

const SECRET = "OHUASDFIHUO87AIHUASDF&^^^&%kuhA123";
const DEST_EMAIL = "rdo90@live.nl";
const FROM_NAME = "Sitedesk Leads";
const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "No post data" });
    }

    var data = JSON.parse(e.postData.contents || "{}");
    if ((data.secret || "") !== SECRET) {
      return jsonResponse({ ok: false, error: "Forbidden" });
    }

    var leadType = toText(data.leadType || "contact").toLowerCase();
    var name = toText(data.name);
    var email = toText(data.email);
    var message = toText(data.message);
    var company = toText(data.company);
    var phone = toText(data.phone);
    var shopUrl = toText(data.shopUrl);
    var monthlyRevenue = toText(data.monthlyRevenue);
    var currentLoadTime = toText(data.currentLoadTime);
    var estimatedLoss = toText(data.estimatedLoss);

    if (company) {
      return jsonResponse({ ok: true, message: "Ignored honeypot" });
    }

    if (leadType === "calculator") {
      if (!shopUrl || (!email && !phone)) {
        return jsonResponse({ ok: false, error: "Validation failed" });
      }
      if (!name) name = "Calculator lead";
      if (!message) {
        message = [
          "Calculator lead aanvraag",
          "Shop URL: " + (shopUrl || "-"),
          "Telefoon: " + (phone || "-"),
          "E-mail: " + (email || "-"),
          "Maandelijkse omzet: " + (monthlyRevenue || "-"),
          "Huidige laadtijd: " + (currentLoadTime || "-"),
          "Geschat omzetverlies p/m: " + (estimatedLoss || "-"),
        ].join("\n");
      }
    } else {
      if (!name || !email || !message) {
        return jsonResponse({ ok: false, error: "Validation failed" });
      }
    }

    var sheet = getLeadSheet_();
    sheet.appendRow([
      new Date(),
      leadType,
      name,
      email,
      phone,
      shopUrl,
      monthlyRevenue,
      currentLoadTime,
      estimatedLoss,
      message,
    ]);

    var subject =
      leadType === "calculator"
        ? "Nieuwe calculator lead: " + (shopUrl || name)
        : "Nieuw contactbericht van " + name;

    var htmlBody =
      "<p><strong>Type:</strong> " + escapeHtml(leadType) + "</p>" +
      "<p><strong>Naam:</strong> " + escapeHtml(name || "-") + "</p>" +
      "<p><strong>E-mail:</strong> " + escapeHtml(email || "-") + "</p>" +
      "<p><strong>Telefoon:</strong> " + escapeHtml(phone || "-") + "</p>" +
      "<p><strong>Shop URL:</strong> " + escapeHtml(shopUrl || "-") + "</p>" +
      "<p><strong>Maandelijkse omzet:</strong> " + escapeHtml(monthlyRevenue || "-") + "</p>" +
      "<p><strong>Huidige laadtijd:</strong> " + escapeHtml(currentLoadTime || "-") + "</p>" +
      "<p><strong>Geschat verlies p/m:</strong> " + escapeHtml(estimatedLoss || "-") + "</p>" +
      "<p><strong>Bericht:</strong><br>" + escapeHtml(message || "-").replace(/\n/g, "<br>") + "</p>";

    var mailOptions = {
      name: FROM_NAME,
      htmlBody: htmlBody,
      noReply: false,
      replyTo: email || undefined,
    };
    MailApp.sendEmail(DEST_EMAIL, subject, message || "-", mailOptions);

    return jsonResponse({ ok: true, message: "Received" });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getLeadSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "timestamp",
      "leadType",
      "name",
      "email",
      "phone",
      "shopUrl",
      "monthlyRevenue",
      "currentLoadTime",
      "estimatedLoss",
      "message",
    ]);
  }

  return sheet;
}

function toText(value) {
  return value == null ? "" : String(value).trim();
}

function escapeHtml(input) {
  var text = toText(input);
  return text.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&#39;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
