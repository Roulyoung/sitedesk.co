// Google Apps Script for contact form: stores to Sheet and sends email.
// Uses a shared secret to block unauthorized calls.

const SECRET = 'CHANGE_ME_SECRET_TOKEN'; // replace with a strong random string
const DEST_EMAIL = 'rdo90@hotmail.com';
const FROM_NAME = 'Sitedesk Contact';
const FROM_EMAIL = 'no-reply@sitedesk.co'; // use a domain-aligned sender to avoid spam filtering

function doPost(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: "No post data" }, 400, headers);
    }

    const data = JSON.parse(e.postData.contents || "{}");
    const secret = data.secret || "";
    if (secret !== SECRET) {
      return jsonResponse({ error: "Forbidden" }, 403, headers);
    }

    const name = (data.name || "").toString().trim();
    const email = (data.email || "").toString().trim();
    const message = (data.message || "").toString().trim();
    const honeypot = (data.company || "").toString().trim();

    if (honeypot) {
      return jsonResponse({ message: "OK" }, 200, headers);
    }

    if (!name || !email || !message) {
      return jsonResponse({ error: "Validation failed" }, 400, headers);
    }

    // Store in active sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.appendRow([new Date(), name, email, message]);

    // Send email
    MailApp.sendEmail({
      to: DEST_EMAIL,
      replyTo: email,
      subject: `Nieuw bericht van ${name}`,
      name: FROM_NAME,
      htmlBody: `<p><strong>Naam:</strong> ${escapeHtml(name)}</p>
                 <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                 <p><strong>Bericht:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
      noReply: false,
      from: FROM_EMAIL,
    });

    return jsonResponse({ message: "Received" }, 200, headers);
  } catch (err) {
    return jsonResponse({ error: err && err.message ? err.message : String(err) }, 500, headers);
  }
}

function doOptions(e) {
  return jsonResponse({}, 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}

function jsonResponse(obj, status, headers) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers)
    .setResponseCode(status);
}

function escapeHtml(input) {
  return input.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&#39;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
