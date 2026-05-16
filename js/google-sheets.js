// google-sheets.js
// Drop-in replacement for C# FileHelper — all 5 operations ported to JS.
//
// SETUP (one-time):
//   READ only  → paste your API key in GOOGLE_API_KEY (no login needed)
//   WRITE too  → also set GOOGLE_CLIENT_ID for OAuth sign-in
//
// Column mapping (matches C# row order A→E):
//   A = CopticWord  B = PronunciationWord  C = ArabicWord
//   D = EnglishPronunciationWord  E = EnglishWord

(function () {

// ── CONFIG ────────────────────────────────────────────────────────────────────
var SPREADSHEET_ID  = '1DBsHarQ8qCTgXWwn6dnqpHZ9MmXMA5cJN6JZIMdXqY8';
var SHEET_NAME      = 'Coptic';
var GOOGLE_API_KEY  = 'AIzaSyCmGGE5A72DQ5zyq8zwi6h-fvc-TFlQlf8';   // Required for all reads
var GOOGLE_CLIENT_ID = '';                   // Optional: only needed for Add/Update/Delete
// ─────────────────────────────────────────────────────────────────────────────

var BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
var oauthToken = null;   // set after signIn()

// ── AUTH (needed only for writes) ────────────────────────────────────────────
// Mirrors: GetCredential() in C#
// Call this before Add / Update / Delete.
// Resolves with the access token string.
function signIn() {
    return new Promise(function (resolve, reject) {
        if (oauthToken) { resolve(oauthToken); return; }
        if (!GOOGLE_CLIENT_ID) {
            reject(new Error('GOOGLE_CLIENT_ID not set — write operations require OAuth.'));
            return;
        }
        // Load the Google Identity Services library on demand
        if (!window.google || !window.google.accounts) {
            var s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.onload = function () { requestToken(resolve, reject); };
            s.onerror = function () { reject(new Error('Failed to load Google Identity Services')); };
            document.head.appendChild(s);
        } else {
            requestToken(resolve, reject);
        }
    });
}

function requestToken(resolve, reject) {
    var client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: function (resp) {
            if (resp.error) { reject(new Error(resp.error)); return; }
            oauthToken = resp.access_token;
            resolve(oauthToken);
        }
    });
    client.requestAccessToken();
}

function authHeaders() {
    return { 'Authorization': 'Bearer ' + oauthToken, 'Content-Type': 'application/json' };
}

// ── HELPER: parse a row array → dictionary object ────────────────────────────
function rowToObject(row) {
    return {
        coptic:               (row[0] || '').toString().trim(),
        pronunciation:        (row[1] || '').toString().trim(),
        arabic:               (row[2] || '').toString().trim(),
        englishPronunciation: (row[3] || '').toString().trim(),
        english:              (row[4] || '').toString().trim()
    };
}

function objectToRow(obj) {
    return [
        obj.coptic               || '',
        obj.pronunciation        || '',
        obj.arabic               || '',
        obj.englishPronunciation || '',
        obj.english              || ''
    ];
}

// ── 1. ReadDataFromFile ───────────────────────────────────────────────────────
// C#: ReadDataFromFile(sheetName, spreadsheetId)
// Returns: Promise<Array<{coptic, pronunciation, arabic, englishPronunciation, english}>>
//
// Uses API key — no login required. Sheet must be shared as "Anyone can view".
function readDataFromFile(sheetName, spreadsheetId) {
    sheetName     = sheetName     || SHEET_NAME;
    spreadsheetId = spreadsheetId || SPREADSHEET_ID;

    var range = encodeURIComponent(sheetName + '!A:L');
    var url   = BASE + '/' + spreadsheetId + '/values/' + range + '?key=' + GOOGLE_API_KEY;

    return fetch(url)
        .then(function (r) {
            if (!r.ok) throw new Error('Sheets API error: ' + r.status + ' ' + r.statusText);
            return r.json();
        })
        .then(function (data) {
            var rows = data.values || [];
            var result = [];
            for (var i = 1; i < rows.length; i++) {   // skip header row (i=0)
                if (!rows[i][0]) continue;             // skip blank rows
                result.push(rowToObject(rows[i]));
            }
            return result;
        });
}

// ── 2. AddDataToFile ─────────────────────────────────────────────────────────
// C#: AddDataToFile(objNewRecords, sheetName, spreadsheetId)
// records: Array of objects OR Array of row-arrays
// Appends rows after the last filled row (matches appendRequest in C#).
function addDataToFile(records, sheetName, spreadsheetId) {
    sheetName     = sheetName     || SHEET_NAME;
    spreadsheetId = spreadsheetId || SPREADSHEET_ID;

    return signIn().then(function () {
        var values = records.map(function (r) {
            return Array.isArray(r) ? r : objectToRow(r);
        });

        var range = sheetName + '!A:L';
        var url   = BASE + '/' + spreadsheetId + '/values/' + encodeURIComponent(range)
                  + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';

        return fetch(url, {
            method:  'POST',
            headers: authHeaders(),
            body:    JSON.stringify({ values: values })
        }).then(function (r) {
            if (!r.ok) return r.json().then(function (e) { throw new Error(JSON.stringify(e)); });
            return r.json();
        });
    });
}

// ── 3. UpdateDataToFile ──────────────────────────────────────────────────────
// C#: UpdateDataToFile(objUpdatedRecords, idx, sheetName, spreadsheetId)
// idx: 1-based row number (same as C# — row 1 = header, row 2 = first data row)
// records: Array of objects OR Array of row-arrays
function updateDataToFile(records, idx, sheetName, spreadsheetId) {
    sheetName     = sheetName     || SHEET_NAME;
    spreadsheetId = spreadsheetId || SPREADSHEET_ID;

    return signIn().then(function () {
        var values = records.map(function (r) {
            return Array.isArray(r) ? r : objectToRow(r);
        });

        var range = sheetName + '!A' + idx + ':L';
        var url   = BASE + '/' + spreadsheetId + '/values/' + encodeURIComponent(range)
                  + '?valueInputOption=USER_ENTERED';

        return fetch(url, {
            method:  'PUT',
            headers: authHeaders(),
            body:    JSON.stringify({ values: values })
        }).then(function (r) {
            if (!r.ok) return r.json().then(function (e) { throw new Error(JSON.stringify(e)); });
            return r.json();
        });
    });
}

// ── 4. DeleteDataFromFile ────────────────────────────────────────────────────
// C#: DeleteDataFromFile(idx, sheetName, spreadsheetId)
// Clears the row at 1-based index idx (matches ClearValues in C#).
function deleteDataFromFile(idx, sheetName, spreadsheetId) {
    sheetName     = sheetName     || SHEET_NAME;
    spreadsheetId = spreadsheetId || SPREADSHEET_ID;

    return signIn().then(function () {
        var range = sheetName + '!A' + idx + ':L';
        var url   = BASE + '/' + spreadsheetId + '/values/' + encodeURIComponent(range) + ':clear';

        return fetch(url, {
            method:  'POST',
            headers: authHeaders(),
            body:    JSON.stringify({})
        }).then(function (r) {
            if (!r.ok) return r.json().then(function (e) { throw new Error(JSON.stringify(e)); });
            return r.json();
        });
    });
}

// ── 5. GetFileDataAsync (gviz) ───────────────────────────────────────────────
// C#: GetFileDataAsync() — returns raw gviz JSON string
// Returns: Promise<Object>  (already parsed, wrapper stripped)
// Same sheet ID as C# original. Pass a different id if needed.
function getFileDataAsync(spreadsheetId) {
    spreadsheetId = spreadsheetId || SPREADSHEET_ID;
    var url = 'https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/gviz/tq';

    return fetch(url)
        .then(function (r) {
            if (!r.ok) throw new Error('gviz error: ' + r.status);
            return r.text();
        })
        .then(function (text) {
            // Strip: google.visualization.Query.setResponse(  ...  );
            var json = text
                .replace(/^[^(]+\(/, '')   // remove everything up to first (
                .replace(/\);?\s*$/, '');   // remove trailing );
            return JSON.parse(json);
        });
}

// ── INIT: load dictionary on page start ──────────────────────────────────────
window.copticDictionary = null;

readDataFromFile(SHEET_NAME, SPREADSHEET_ID)
    .then(function (data) {
        window.copticDictionary = data;
        console.log('Sheets API: loaded ' + data.length + ' words');
    })
    .catch(function (err) {
        console.warn('Sheets API failed (' + err.message + '), using fallback');
        window.copticDictionary = FALLBACK;
    });

// ── FALLBACK (used when API key missing or network unavailable) ───────────────
var FALLBACK = [
    { coptic: "Anok",      pronunciation: "Anok",      arabic: "أنا",    englishPronunciation: "anok",      english: "I" },
    { coptic: "Nan",       pronunciation: "Nan",        arabic: "نحن",    englishPronunciation: "nan",       english: "we" },
    { coptic: "Nok",       pronunciation: "Nok",        arabic: "أنت",    englishPronunciation: "nok",       english: "you" },
    { coptic: "Af",        pronunciation: "Af",         arabic: "هو",     englishPronunciation: "af",        english: "he" },
    { coptic: "Es",        pronunciation: "Es",         arabic: "هي",     englishPronunciation: "es",        english: "she" },
    { coptic: "Met",       pronunciation: "Met",        arabic: "موت",    englishPronunciation: "met",       english: "death" },
    { coptic: "Zoe",       pronunciation: "Zoe",        arabic: "حياة",   englishPronunciation: "zoe",       english: "life" },
    { coptic: "Pater",     pronunciation: "Pater",      arabic: "آب",     englishPronunciation: "pater",     english: "father" },
    { coptic: "Iesous",    pronunciation: "Iesous",     arabic: "يسوع",   englishPronunciation: "iesous",    english: "Jesus" },
    { coptic: "Christos",  pronunciation: "Christos",   arabic: "المسيح", englishPronunciation: "christos",  english: "Christ" },
    { coptic: "Pneuma",    pronunciation: "Pneuma",     arabic: "روح",    englishPronunciation: "pneuma",    english: "spirit" },
    { coptic: "Eklisia",   pronunciation: "Eklisia",    arabic: "كنيسة",  englishPronunciation: "eklisia",   english: "church" },
    { coptic: "Kyrie",     pronunciation: "Kyrie",      arabic: "يا رب",  englishPronunciation: "kyrie",     english: "Lord" },
    { coptic: "Amyn",      pronunciation: "Amyn",       arabic: "آمين",   englishPronunciation: "amyn",      english: "Amen" },
    { coptic: "Theos",     pronunciation: "Theos",      arabic: "الله",   englishPronunciation: "theos",     english: "God" },
    { coptic: "Logos",     pronunciation: "Logos",      arabic: "كلمة",   englishPronunciation: "logos",     english: "word" },
    { coptic: "Agape",     pronunciation: "Agape",      arabic: "محبة",   englishPronunciation: "agape",     english: "love" },
    { coptic: "Eiren",     pronunciation: "Eiren",      arabic: "سلام",   englishPronunciation: "eiren",     english: "peace" },
    { coptic: "Noute",     pronunciation: "Noute",      arabic: "الله",   englishPronunciation: "noute",     english: "God" },
    { coptic: "Moou",      pronunciation: "Moou",       arabic: "ماء",    englishPronunciation: "moou",      english: "water" }
];

// ── PUBLIC API ────────────────────────────────────────────────────────────────
window.SheetsAPI = {
    readDataFromFile:   readDataFromFile,
    addDataToFile:      addDataToFile,
    updateDataToFile:   updateDataToFile,
    deleteDataFromFile: deleteDataFromFile,
    getFileDataAsync:   getFileDataAsync,
    signIn:             signIn
};

})();