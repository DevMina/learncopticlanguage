// Google Sheets API integration for translator
let copticDictionary = [];

// Google Sheets configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyA5sFmKQZLr3vYjGhH5P9J2Q8R7T6W3N4L8X';
const SPREADSHEET_ID = '1DBsHarQ8qCTgXWwn6dnqpHZ9MmXMA5cJN6JZIMdXqY8';
const SHEET_NAME = 'Coptic';

// Load Google Sheets API
function loadGoogleSheetsAPI() {
    return new Promise((resolve, reject) => {
        // Load the Google Sheets API
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi.load('client', () => {
                gapi.client.init({
                    apiKey: GOOGLE_SHEETS_API_KEY,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                }).then(() => {
                    console.log('Google Sheets API loaded');
                    resolve();
                }).catch(error => {
                    console.error('Error loading Google Sheets API:', error);
                    reject(error);
                });
            });
        };
        script.onerror = () => reject(new Error('Failed to load Google Sheets API'));
        document.head.appendChild(script);
    });
}

// Fetch data from Google Sheets
async function fetchCopticData() {
    try {
        await loadGoogleSheetsAPI();
        
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:L`,
        });
        
        const values = response.result.values;
        if (values && values.length > 0) {
            copticDictionary = [];
            
            // Skip header row (first row)
            for (let i = 1; i < values.length; i++) {
                const row = values[i];
                if (row && row.length >= 5) {
                    copticDictionary.push({
                        coptic: row[0] || '',
                        pronunciation: row[1] || '',
                        arabic: row[2] || '',
                        english: row[4] || '',
                        englishPronunciation: row[3] || ''
                    });
                }
            }
            
            console.log(`Loaded ${copticDictionary.length} words from Google Sheets`);
            return copticDictionary;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return [];
    }
}

// Initialize Google Sheets data
$(document).ready(async function() {
    try {
        await fetchCopticData();
        console.log('Google Sheets data loaded successfully');
    } catch (error) {
        console.error('Failed to load Google Sheets data:', error);
        // Fallback to static data if Google Sheets fails
        console.log('Using fallback static data');
        
        // Load fallback static data
        window.copticDictionary = [
            { coptic: "Alwm", pronunciation: "Alom", arabic: "جبن", english: "cheese", englishPronunciation: "alom" },
            { coptic: "Alem", pronunciation: "Aleem", arabic: "بيت", english: "house", englishPronunciation: "aleem" },
            { coptic: "Anok", pronunciation: "Anok", arabic: "أنا", english: "I", englishPronunciation: "anok" },
            { coptic: "Nan", pronunciation: "Nan", arabic: "نحن", english: "we", englishPronunciation: "nan" },
            { coptic: "Nok", pronunciation: "Nok", arabic: "أنت", english: "you", englishPronunciation: "nok" },
            { coptic: "Nan", pronunciation: "Nan", arabic: "أنتم", english: "you (plural)", englishPronunciation: "nan" },
            { coptic: "Af", pronunciation: "Af", arabic: "هو", english: "he", englishPronunciation: "af" },
            { coptic: "Es", pronunciation: "Es", arabic: "هي", english: "she", englishPronunciation: "es" },
            { coptic: "Af", pronunciation: "Af", arabic: "هم", english: "they", englishPronunciation: "af" },
            { coptic: "Met", pronunciation: "Met", arabic: "موت", english: "death", englishPronunciation: "met" },
            { coptic: "Zoe", pronunciation: "Zoe", arabic: "حياة", english: "life", englishPronunciation: "zoe" },
            { coptic: "Agios", pronunciation: "Agios", arabic: "مقدس", english: "holy", englishPronunciation: "agios" },
            { coptic: "Ecosmin", pronunciation: "Ecosmin", arabic: "مسكون", english: "universe", englishPronunciation: "ecosmin" },
            { coptic: "Pater", pronunciation: "Pater", arabic: "آب", english: "father", englishPronunciation: "pater" },
            { coptic: "Iesous", pronunciation: "Iesous", arabic: "يسوع", english: "Jesus", englishPronunciation: "iesous" },
            { coptic: "Christos", pronunciation: "Christos", arabic: "المسيح", english: "Christ", englishPronunciation: "christos" },
            { coptic: "Pneuma", pronunciation: "Pneuma", arabic: "روح", english: "spirit", englishPronunciation: "pneuma" },
            { coptic: "Eklisia", pronunciation: "Eklisia", arabic: "كنيسة", english: "church", englishPronunciation: "eklisia" },
            { coptic: "Evlogimenos", pronunciation: "Evlogimenos", arabic: "مبارك", english: "blessed", englishPronunciation: "evlogimenos" },
            { coptic: "Kyrie", pronunciation: "Kyrie", arabic: "يا رب", english: "Lord", englishPronunciation: "kyrie" },
            { coptic: "Eleyson", pronunciation: "Eleyson", arabic: "ارحم", english: "have mercy", englishPronunciation: "eleyson" },
            { coptic: "Amyn", pronunciation: "Amyn", arabic: "آمين", english: "Amen", englishPronunciation: "amyn" },
            { coptic: "Sotir", pronunciation: "Sotir", arabic: "مخلص", english: "savior", englishPronunciation: "sotir" },
            { coptic: "Theos", pronunciation: "Theos", arabic: "الله", english: "God", englishPronunciation: "theos" },
            { coptic: "Anthropos", pronunciation: "Anthropos", arabic: "إنسان", english: "human", englishPronunciation: "anthropos" },
            { coptic: "Ginesthe", pronunciation: "Ginesthe", arabic: "كن", english: "be", englishPronunciation: "ginesthe" },
            { coptic: "Logos", pronunciation: "Logos", arabic: "كلمة", english: "word", englishPronunciation: "logos" },
            { coptic: "Aletheia", pronunciation: "Aletheia", arabic: "حق", english: "truth", englishPronunciation: "aletheia" },
            { coptic: "Agape", pronunciation: "Agape", arabic: "محبة", english: "love", englishPronunciation: "agape" },
            { coptic: "Eiren", pronunciation: "Eiren", arabic: "سلام", english: "peace", englishPronunciation: "eiren" }
        ];
    }
});

// Export for use in translator.js
window.copticDictionary = copticDictionary;
window.fetchCopticData = fetchCopticData;
