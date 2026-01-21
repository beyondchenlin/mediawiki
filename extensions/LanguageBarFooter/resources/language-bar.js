( function () {
    'use strict';

    var defaultLanguages = [
        ['en', 'English'],
        ['af', 'Afrikaans'],
        ['ar', 'العربية'],
        ['ast', 'asturianu'],
        ['az', 'azərbaycanca'],
        ['ba', 'башҡортса'],
        ['be', 'беларуская'],
        ['be-tarask', 'беларуская (тарашкевіца)'],
        ['bg', 'български'],
        ['bn', 'বাংলা'],
        ['bs', 'bosanski'],
        ['ca', 'català'],
        ['ckb', 'کوردی'],
        ['cs', 'čeština'],
        ['da', 'dansk'],
        ['de', 'Deutsch'],
        ['el', 'Ελληνικά'],
        ['eo', 'Esperanto'],
        ['es', 'español'],
        ['fa', 'فارسی'],
        ['fi', 'suomi'],
        ['fr', 'français'],
        ['gl', 'galego'],
        ['gu', 'ગુજરાતી'],
        ['he', 'עברית'],
        ['hi', 'हिन्दी'],
        ['hr', 'hrvatski'],
        ['hu', 'magyar'],
        ['hy', 'հայերեն'],
        ['ia', 'interlingua'],
        ['id', 'Bahasa Indonesia'],
        ['it', 'italiano'],
        ['ja', '日本語'],
        ['jv', 'Jawa'],
        ['kk', 'қазақша'],
        ['ko', '한국어'],
        ['ml', 'മലയാളം'],
        ['ms', 'Bahasa Melayu'],
        ['mwl', 'Mirandés'],
        ['nl', 'Nederlands'],
        ['or', 'ଓଡ଼ିଆ'],
        ['pl', 'polski'],
        ['pt', 'português'],
        ['pt-br', 'português do Brasil'],
        ['ro', 'română'],
        ['ru', 'русский'],
        ['sc', 'sardu'],
        ['si', 'සිංහල'],
        ['sk', 'slovenčina'],
        ['sl', 'slovenščina'],
        ['so', 'Soomaaliga'],
        ['sq', 'shqip'],
        ['sr', 'српски / srpski'],
        ['sv', 'svenska'],
        ['syl', 'ꠍꠤꠟꠐꠤ'],
        ['th', 'ไทย'],
        ['tr', 'Türkçe'],
        ['uk', 'українська'],
        ['vi', 'Tiếng Việt'],
        ['yue', '粵語'],
        ['zh', '中文']
    ];

    var configLanguages = mw.config.get( 'wgLanguageBarFooterLanguages' );
    var configPosition = mw.config.get( 'wgLanguageBarFooterPosition' ) || 'footer';

    var languages = defaultLanguages;

    if ( configLanguages && configLanguages.length > 0 ) {
        if ( typeof configLanguages[0] === 'string' ) {
            languages = configLanguages.map( function ( code ) {
                var name = code;
                if ( mw.language && typeof mw.language.getData === 'function' ) {
                    name = mw.language.getData( code, 'language-name' ) ||
                           mw.language.getData( code, 'language-name-fallback' ) ||
                           code;
                }
                return [code, name];
            } );
        } else if ( typeof configLanguages[0] === 'object' ) {
            languages = configLanguages;
        }
    }

    function buildLanguageLink( langCode, langName, isPrimary ) {
        try {
            var currentUrl = new URL( window.location.href );
            currentUrl.searchParams.set( 'uselang', langCode );

            var linkHtml = '<a href="' + currentUrl.toString() + '" ' +
                'hreflang="' + langCode + '" ' +
                'title="' + langName + '">' +
                langName + '</a>';

            if ( isPrimary ) {
                return '<strong>' + linkHtml + '</strong>';
            }

            return '<bdi lang="' + langCode + '">' + linkHtml + '</bdi>';
        } catch ( e ) {
            console.error( 'LanguageBarFooter: Error building language link for ' + langCode, e );
            return '';
        }
    }

    function buildLanguageBar() {
        try {
            var html = '<div class="mw-language-bar-wrap">';
            html += '<div class="mw-language-bar-footer" dir="ltr">';
            html += '<div class="mw-language-bar-header">Languages:</div>';
            html += '<div class="mw-language-bar-text">';

            for ( var i = 0; i < languages.length; i++ ) {
                var link = buildLanguageLink( languages[i][0], languages[i][1], i === 0 );
                if ( link ) {
                    if ( i > 0 ) {
                        html += ' &nbsp;• ';
                    }
                    html += link;
                }
            }

            html += '</div>';
            html += '</div>';
            html += '</div>';

            return html;
        } catch ( e ) {
            console.error( 'LanguageBarFooter: Error building language bar', e );
            return '';
        }
    }

    function insertLanguageBar() {
        try {
            var footer = document.querySelector( 'footer.mw-footer, #footer' );
            var contentArea = document.querySelector( '.mw-body-content, #mw-content-text' );

            if ( !contentArea ) {
                return;
            }

            if ( document.querySelector( '.mw-language-bar-footer' ) ) {
                return;
            }

            var languageBar = document.createElement( 'div' );
            languageBar.innerHTML = buildLanguageBar();
            var languageBarElement = languageBar.firstChild;

            if ( !languageBarElement ) {
                return;
            }

            if ( configPosition === 'footer' && footer && footer.parentNode ) {
                footer.parentNode.insertBefore( languageBarElement, footer );
            } else if ( contentArea.parentNode ) {
                if ( contentArea.nextSibling ) {
                    contentArea.parentNode.insertBefore( languageBarElement, contentArea.nextSibling );
                } else {
                    contentArea.parentNode.appendChild( languageBarElement );
                }
            }
        } catch ( e ) {
            console.error( 'LanguageBarFooter: Error inserting language bar', e );
        }
    }

    var initCalled = false;
    function initLanguageBar() {
        if ( initCalled ) {
            return;
        }
        initCalled = true;
        insertLanguageBar();
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', function () {
            try {
                initLanguageBar();
            } catch ( e ) {
                console.error( 'LanguageBarFooter: Error initializing', e );
            }
        } );
    } else {
        try {
            initLanguageBar();
        } catch ( e ) {
            console.error( 'LanguageBarFooter: Error initializing', e );
        }
    }

}() );
