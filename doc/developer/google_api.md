Google API
==========

* The Google OAuth2 is used, [read file authentication.md](./authentication.md).
* The Google Spreadsheet is used to update the database documentation for manual and other document.

Google Spreadsheet
------------------

Good documentation: http://gspread.readthedocs.io/en/latest/oauth2.html

To resume :
1. Create signed credentials "Service account key" for Drive API in format JSON.
2. Move the file to "database/client_secret.json"

Manual generator
----------------

To enable the option to generate the manual from a spreadsheet:
1. Copy the file ./database/example_config.json to ./database/config.json
2. Fill information in key "google_spreadsheet".