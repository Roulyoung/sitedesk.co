# Google Sheets -> Cloudflare Cache Purge Button

Use this to let a non-technical customer purge Cloudflare cache from a button in Google Sheets.

## 1) Create Cloudflare API token

- Cloudflare Dashboard -> `My Profile` -> `API Tokens` -> `Create Token`
- Use template: `Edit zone cache`
- Permissions:
  - `Zone` -> `Cache Purge` -> `Purge`
  - `Zone` -> `Zone` -> `Read`
- Zone Resources: include only your zone (e.g. `sitedesk.co`)
- Save token securely.

## 2) Add Apps Script in Google Sheets

In your Sheet: `Extensions` -> `Apps Script`, then paste:

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sitedesk')
    .addItem('Purge Cloudflare Cache', 'purgeCloudflareCache')
    .addToUi();
}

function purgeCloudflareCache() {
  var scriptProps = PropertiesService.getScriptProperties();
  var zoneId = scriptProps.getProperty('CF_ZONE_ID');
  var token = scriptProps.getProperty('CF_API_TOKEN');

  if (!zoneId || !token) {
    SpreadsheetApp.getUi().alert(
      'Missing CF_ZONE_ID / CF_API_TOKEN in Script Properties.'
    );
    return;
  }

  var url = 'https://api.cloudflare.com/client/v4/zones/' + zoneId + '/purge_cache';
  var payload = { purge_everything: true };

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  var body = response.getContentText();

  if (status >= 200 && status < 300) {
    SpreadsheetApp.getUi().alert('Cloudflare cache purged successfully.');
  } else {
    SpreadsheetApp.getUi().alert('Purge failed (' + status + '): ' + body);
  }
}
```

## 3) Set secure script properties

In Apps Script:
- `Project Settings` -> `Script properties` -> add:
  - `GH_TOKEN` = GitHub PAT (needs `repo` + `workflow` scope, or equivalent fine-grained permissions)
  - `GH_OWNER` = GitHub owner/org name
  - `GH_REPO` = repository name
  - `CF_ZONE_ID` = your zone id
  - `CF_API_TOKEN` = your API token

Do not hardcode secrets inside script files.

## 4) Add a visual button

- In Google Sheet: `Insert` -> `Drawing` -> create a button shape like `Purge Cache`.
- Place it on the sheet.
- Click three dots on drawing -> `Assign script` -> `purgeCloudflareCache`

## Optional: purge specific URLs only

Replace payload with:

```javascript
var payload = {
  files: [
    'https://sitedesk.co/',
    'https://sitedesk.co/shop/',
    'https://sitedesk.co/blog/'
  ]
};
```

This is safer and reduces global cache churn.

## Troubleshooting Update Button

If "Update Website" does nothing:

1. Verify `GH_OWNER` and `GH_REPO` are exact.
2. Verify `GH_TOKEN` has enough permissions to call:
   - `POST /repos/{owner}/{repo}/dispatches`
3. In GitHub -> `Actions`, check if workflow `Sitedesk Build and Deploy` started.
4. If workflow started but deploy failed, verify repo secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PAGES_PROJECT_NAME`
5. Verify workflow trigger exists in `.github/workflows/deploy.yml`:
   - `repository_dispatch`
   - `types: [webhook_update_from_sheets]`
