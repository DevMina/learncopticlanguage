// translator.js - handles all translator UI logic
// Reads dictionary via SheetsAPI.readDataFromFile() from google-sheets.js
(function () {

$(document).ready(function () {

    // ── State ─────────────────────────────────────────────────────────────────
    var translateFrom = 'arabic';   // 'coptic' | 'arabic' | 'english'
    var selectedLang  = 'arabic';   // 'arabic' | 'english'  (output language)

    // ── UI helpers ────────────────────────────────────────────────────────────
    function getActiveInput() {
        return translateFrom === 'coptic'
            ? $('#copticWordInput')
            : $('#nonCopticWordInput');
    }

    function uiText(ar, en) {
        return selectedLang === 'arabic' ? ar : en;
    }

    function setInputDirection() {
        if (translateFrom === 'coptic') {
            $('#copticWordInput').attr('dir', 'ltr').css('text-align', 'left');
        } else {
            var rtl = (selectedLang === 'arabic');
            $('#nonCopticWordInput')
                .attr('dir', rtl ? 'rtl' : 'ltr')
                .css('text-align', rtl ? 'right' : 'left');
        }
    }

    function showMsg(html) {
        $('#resultsContainer').html(html);
    }

    function showLoading() {
        showMsg('<p class="text-muted">' + uiText('جاري التحميل...', 'Loading...') + '</p>');
    }

    function showStatus(msg) {
        $('#dictStatus').text(msg);
    }

    // ── Load dictionary via SheetsAPI ─────────────────────────────────────────
    // google-sheets.js exposes window.SheetsAPI and sets window.copticDictionary.
    // We also reload fresh on demand so data stays current.
    function loadDictionary() {
        showStatus(uiText('جاري تحميل القاموس...', 'Loading dictionary...'));

        window.SheetsAPI.readDataFromFile()
            .then(function (data) {
                window.copticDictionary = data;
                showStatus(uiText(
                    'تم تحميل ' + data.length + ' كلمة',
                    data.length + ' words loaded'
                ));
                console.log('Dictionary ready: ' + data.length + ' words');
            })
            .catch(function (err) {
                // copticDictionary already set to FALLBACK by google-sheets.js
                var count = (window.copticDictionary || []).length;
                showStatus(uiText(
                    'بيانات احتياطية (' + count + ' كلمة)',
                    'Fallback data (' + count + ' words)'
                ));
                console.warn('SheetsAPI failed, using fallback:', err.message);
            });
    }

    // ── Mode switching ────────────────────────────────────────────────────────
    function activateCoptic() {
        translateFrom = 'coptic';
        $('#copticBtn').removeClass('btn-secondary').addClass('btn-primary');
        $('#otherLanguageBtn').removeClass('btn-primary').addClass('btn-secondary');
        $('#nonCopticWordInput').hide().val('');
        $('#copticWordInput').show().attr('inputmode', 'none');
        $('#copticKeyboard').show();
        showMsg('');
        setInputDirection();
        $('#copticWordInput').blur();
    }

    function activateOther() {
        translateFrom = selectedLang;
        $('#otherLanguageBtn').removeClass('btn-secondary').addClass('btn-primary');
        $('#copticBtn').removeClass('btn-primary').addClass('btn-secondary');
        $('#copticWordInput').hide().val('');
        $('#nonCopticWordInput').show().attr('inputmode', 'text');
        $('#copticKeyboard').hide();
        showMsg('');
        setInputDirection();
    }

    $('#copticBtn').on('click', activateCoptic);
    $('#otherLanguageBtn').on('click', activateOther);

    // ── Output-language selector ──────────────────────────────────────────────
    $('#selectedLanguage').on('change', function () {
        selectedLang = $(this).val();
        if (translateFrom !== 'coptic') translateFrom = selectedLang;
        $('#otherLanguageBtn').text(selectedLang === 'arabic' ? 'العربية' : 'English');
        $('#nonCopticWordInput').attr('placeholder',
            selectedLang === 'arabic' ? 'اكتب الكلمة هنا...' : 'Type word here...');
        setInputDirection();
        showMsg('');
        $('#nonCopticWordInput').val('');
        $('#copticWordInput').val('');
    });

    // ── Coptic keyboard ───────────────────────────────────────────────────────
    $('#copticWordInput').on('focus', function () {
        if (translateFrom === 'coptic') $('#copticKeyboard').show();
    });

    $(document).on('click', '.keyboard-key', function () {
        var char    = $(this).data('char');
        var input   = getActiveInput()[0];
        var atInput = (document.activeElement === input);
        var start   = atInput ? input.selectionStart : input.value.length;
        var end     = atInput ? input.selectionEnd   : input.value.length;

        if (char === '⌫') {
            if (start > 0) {
                input.value = input.value.slice(0, start - 1) + input.value.slice(end);
                input.focus();
                setTimeout(function () { input.setSelectionRange(start - 1, start - 1); }, 0);
            }
        } else if (char === '✓') {
            $('#copticKeyboard').hide();
            doTranslate();
        } else if (char !== '`') {
            var newVal = input.value.slice(0, start) + char + input.value.slice(end);
            var pos    = start + char.length;
            input.value = newVal;
            input.focus();
            setTimeout(function () { input.setSelectionRange(pos, pos); }, 0);
        }
    });

    // ── Translation ───────────────────────────────────────────────────────────
    function doTranslate() {
        var word = getActiveInput().val().trim();
        if (!word) return;
        $('#copticKeyboard').hide();

        var dict = window.copticDictionary;

        // Still loading — wait for google-sheets.js to finish
        if (dict === null || dict === undefined) {
            showMsg('<p class="text-muted">' + uiText('جاري تحميل القاموس، أعد المحاولة...', 'Dictionary loading, please retry...') + '</p>');
            return;
        }

        if (!Array.isArray(dict) || dict.length === 0) {
            showMsg('<p class="text-muted">' + uiText('القاموس فارغ.', 'Dictionary is empty.') + '</p>');
            return;
        }

        var results = searchDictionary(word, dict);
        showMsg(buildResults(results));
    }

    $('#translateBtn').on('click', doTranslate);
    $('#nonCopticWordInput, #copticWordInput').on('keydown', function (e) {
        if (e.key === 'Enter') doTranslate();
    });

    // ── Search ────────────────────────────────────────────────────────────────
    function normalizeArabic(s) {
        return (s || '')
            .replace(/[أإآا]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .trim();
    }

    function searchDictionary(word, dict) {
        var q = word.toLowerCase().trim();
        return dict.filter(function (item) {
            switch (translateFrom) {
                case 'coptic':  return (item.coptic  || '').toLowerCase().includes(q);
                case 'arabic':  return normalizeArabic(item.arabic  || '').includes(normalizeArabic(word));
                case 'english': return (item.english || '').toLowerCase().includes(q);
                default:        return false;
            }
        });
    }

    // ── Build results HTML ────────────────────────────────────────────────────
    function buildResults(results) {
        if (results.length === 0) {
            return '<p class="text-muted">' + uiText('لم يتم العثور على الكلمة', 'Word not found') + '</p>';
        }

        var wordLabel = uiText('كلمة:',   'Word:');
        var meanLabel = uiText('المعنى:', 'Meaning:');
        var pronLabel = uiText('النطق:',  'Pronunciation:');

        var html = '<div class="coptic-grid">';
        results.forEach(function (item) {
            var out = selectedLang === 'arabic'
                ? { word: item.arabic  || '', pron: item.pronunciation        || '' }
                : { word: item.english || '', pron: item.englishPronunciation || '' };

            html +=
                '<div class="coptic-card" style="flex-direction:column !important;">' +
                    '<p class="dictionary-coptic-label">' +
                        wordLabel + ' <span class="coptic-text">'  + esc(item.coptic) + '</span>' +
                    '</p>' +
                    '<p class="dictionary-coptic-label">' +
                        meanLabel + ' <span class="arabic-text">'  + esc(out.word)    + '</span>' +
                    '</p>' +
                    '<p class="dictionary-coptic-label">' +
                        pronLabel + ' <span class="arabic-text">'  + esc(out.pron)    + '</span>' +
                    '</p>' +
                '</div>';
        });
        html += '</div>';
        return html;
    }

    function esc(s) {
        return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    setInputDirection();
    loadDictionary();   // fetch fresh data from Google Sheets via SheetsAPI
});

})();