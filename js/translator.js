// Coptic dictionary data will be loaded from Google Sheets
// This is now handled by google-sheets.js
let copticDictionary = [];

$(document).ready(async function() {
    // Initialize variables
    let translateFrom = "arabic";
    let selectedLanguage = "arabic";

    function getActiveInput() {
        return translateFrom === "coptic" ? $('#copticWordInput') : $('#nonCopticWordInput');
    }

    function setTypingDirection(isCoptic, selectedLanguage) {
        var input = isCoptic ? $('#copticWordInput') : $('#nonCopticWordInput');
        input.attr('dir', isCoptic || (selectedLanguage == "arabic") ? 'ltr' : 'rtl');
        input.css('text-align', isCoptic || (selectedLanguage == "english") ? 'left' : 'right');
    }

    // Wait for Google Sheets data to be loaded
    let dataLoaded = false;
    const checkDataLoaded = setInterval(() => {
        if (window.copticDictionary && window.copticDictionary.length > 0) {
            dataLoaded = true;
            clearInterval(checkDataLoaded);
            
            // Initialize with language from language.js
            translateFrom = window.currentLanguage || "arabic";
            selectedLanguage = window.currentLanguage || "arabic";
            
            // Sync language selector with current language
            $('#selectedLanguage').val(selectedLanguage);
            
            // Initialize UI state
            setTypingDirection(translateFrom == "coptic", selectedLanguage);
            
            console.log(`Translator ready with ${window.copticDictionary.length} words from Google Sheets`);
        }
    }, 100);

    // Fallback timeout
    setTimeout(() => {
        if (!dataLoaded) {
            clearInterval(checkDataLoaded);
            console.warn('Google Sheets data not loaded, using fallback');
            // Initialize with fallback
            translateFrom = window.currentLanguage || "arabic";
            selectedLanguage = window.currentLanguage || "arabic";
            $('#selectedLanguage').val(selectedLanguage);
            setTypingDirection(translateFrom == "coptic", selectedLanguage);
        }
    }, 5000);

    // Language selector change
    $('#selectedLanguage').change(function() {
        selectedLanguage = $(this).val();
        $('#resultsContainer').empty();
        setTypingDirection(translateFrom == "coptic", selectedLanguage);
        $('#nonCopticWordInput').val('');
        $('#copticWordInput').val('');
        translateFrom = translateFrom == "coptic" ? translateFrom : selectedLanguage;
        
        // Update other language button text
        const buttonText = selectedLanguage === 'arabic' ? 'العربية' : 'English';
        $('#otherLanguageBtn').text(buttonText);
    });
    
    // Coptic button click
    $('#copticBtn').click(function () {
        translateFrom = "coptic";
        $('#copticKeyboard').show();
        $(this).addClass('btn-primary').removeClass('btn-secondary');
        $('#otherLanguageBtn').addClass('btn-secondary').removeClass('btn-primary');
        $('#resultsContainer').empty();

        // Hide Arabic input, show Coptic input
        $('#nonCopticWordInput').hide().val('');
        $('#copticWordInput').show();

        setTypingDirection(translateFrom == "coptic", selectedLanguage);
        $('#copticWordInput').attr('inputmode', 'none');
        $('#copticWordInput').blur();
    });

    // Other language button click
    $('#otherLanguageBtn').click(function () {
        translateFrom = selectedLanguage;
        $('#copticKeyboard').hide();
        $(this).addClass('btn-primary').removeClass('btn-secondary');
        $('#copticBtn').addClass('btn-secondary').removeClass('btn-primary');
        $('#resultsContainer').empty();

        // Hide Coptic input, show Arabic input
        $('#copticWordInput').hide().val('');
        $('#nonCopticWordInput').show();

        setTypingDirection(translateFrom == "coptic", selectedLanguage);
        $('#nonCopticWordInput').attr('inputmode', 'text');
    });

    // Coptic input focus
    $('#copticWordInput').on('focus', function() {
        if (translateFrom === "coptic") {
            $('#copticKeyboard').show();
        }
    });

    // Keyboard clicks
    $('.keyboard-key').click(function () {
        var char = $(this).data('char');
        var input = getActiveInput()[0];
        var start = input.selectionStart;
        var end = input.selectionEnd;

        if (document.activeElement !== input) {
            start = end = input.value.length;
        }

        if (char === "⌫") {
            if (start > 0) {
                input.value = input.value.slice(0, start - 1) + input.value.slice(end);
                input.focus();
                setTimeout(function () {
                    input.setSelectionRange(start - 1, start - 1);
                }, 0);
            }
        } else if (char === "✓") {
            $('#translateBtn').click();
            $('#copticKeyboard').hide();
        } else if (char !== "`") {
            var newValue = input.value.slice(0, start) + char + input.value.slice(end);
            var newCursorPos = start + char.length;
            input.value = newValue;
            input.focus();
            setTimeout(function () {
                input.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    });

    // Translate button click
    $('#translateBtn').click(function () {
        var word = getActiveInput().val().trim();
        if (word === '') return;
        $('#copticKeyboard').hide();

        // Search in dictionary
        const results = searchDictionary(word, translateFrom, selectedLanguage);
        const html = buildTranslationResults(results, selectedLanguage);
        $('#resultsContainer').html(html);
    });

    // Allow Enter key to translate
    $('#nonCopticWordInput, #copticWordInput').keypress(function(e) {
        if (e.which === 13) { // Enter key
            $('#translateBtn').click();
        }
    });
});

function searchDictionary(word, fromLang, toLang) {
    const results = [];
    const searchWord = word.toLowerCase().trim();
    
    if (!searchWord) return results;

    copticDictionary.forEach(item => {
        let match = false;
        
        switch(fromLang) {
            case 'coptic':
                match = item.coptic.toLowerCase().includes(searchWord);
                break;
            case 'arabic':
                match = item.arabic.includes(searchWord);
                break;
            case 'english':
                match = item.english.toLowerCase().includes(searchWord);
                break;
        }
        
        if (match) {
            results.push(item);
        }
    });
    
    return results;
}

function buildTranslationResults(results, selectedLang) {
    if (results.length === 0) {
        return `<p>${selectedLanguage === 'arabic' ? 'لم يتم العثور على الكلمة' : 'Word not found'}</p>`;
    }

    let html = '<div class="coptic-grid">';
    const isArabicUI = selectedLanguage === 'arabic';

    results.forEach(item => {
        let translated = selectedLang === 'arabic' ? 
            { word: item.arabic, pronunciation: item.pronunciation } :
            { word: item.english, pronunciation: item.englishPronunciation };

        if (isArabicUI) {
            const meaningLine = selectedLang === 'arabic' ? 
                `<p class='dictionary-coptic-label'>
                        ${selectedLanguage === 'arabic' ? 'المعنى:' : 'Meaning:'} <span class='arabic-text'>${translated.word}</span>
                    </p>` :
                `<p class='dictionary-coptic-label' dir='rtl'>
                        ${selectedLanguage === 'arabic' ? 'المعنى:' : 'Meaning:'} <span class='arabic-text'>${translated.word}</span>
                    </p>`;
            
            const pronunciationLine = selectedLang === 'arabic' ? 
                `<p class='dictionary-coptic-label'>
                        ${selectedLanguage === 'arabic' ? 'النطق:' : 'Pronunciation:'} <span class='arabic-text'>${translated.pronunciation}</span>
                    </p>` :
                `<p class='dictionary-coptic-label' dir='rtl'>
                        ${selectedLanguage === 'arabic' ? 'النطق:' : 'Pronunciation:'} <span class='arabic-text'>${translated.pronunciation}</span>
                    </p>`;
            
            html += `<div class='coptic-card' style='flex-direction: column !important'>
                    <p class='dictionary-coptic-label'>
                        <span class='coptic-text'>${item.coptic}</span> ${selectedLanguage === 'arabic' ? 'كلمة:' : 'Word:'}
                    </p>
                    ${meaningLine}
                    ${pronunciationLine}
                </div>`;
            } else {
                html += `<div class='coptic-card' style='flex-direction: column !important'>
                    <p class='dictionary-coptic-label'>
                        ${selectedLanguage === 'arabic' ? 'كلمة:' : 'Word:'} <span class='coptic-text'>${item.coptic}</span>
                    </p>
                    <p class='dictionary-coptic-label'>
                        ${selectedLanguage === 'arabic' ? 'المعنى:' : 'Meaning:'} <span class='arabic-text'>${translated.word}</span>
                    </p>
                    <p class='dictionary-coptic-label'>
                        ${selectedLanguage === 'arabic' ? 'النطق:' : 'Pronunciation:'} <span class='arabic-text'>${translated.pronunciation}</span>
                    </p>
                </div>`;
            }
        });
    

    html += '</div>';
    return html;
}
