/**
 * MediaWiki Language Bar - Footer Script
 * Copy this content to: MediaWiki:Vector.js
 *
 * Injects multilingual language bar at footer, matching official mediawiki.org
 */

( function () {
    'use strict';

    // Language data: [code, native name]
    // Matching official mediawiki.org language list exactly
    var languages = [
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

    /**
     * Build HTML for a single language link
     */
    function buildLanguageLink( langCode, langName, isPrimary ) {
        // Link changes the user's interface language via uselang parameter
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
    }

    /**
     * Build the complete language bar HTML
     */
    function buildLanguageBar() {
        var html = '<div class="mw-language-bar-wrap">';
        html += '<div class="mw-language-bar-footer nmbox noprint mw-content-ltr" dir="ltr">';
        html += '<div class="mw-language-bar-header nmbox-header">Languages:</div>';
        html += '<div class="mw-language-bar-text nmbox-text mbox-text">';

        for ( var i = 0; i < languages.length; i++ ) {
            if ( i > 0 ) {
                html += ' &nbsp;• ';
            }
            html += buildLanguageLink( languages[i][0], languages[i][1], i === 0 );
        }

        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    /**
     * Insert language bar into page
     */
    function insertLanguageBar() {
        // Find the footer element
        var footer = document.querySelector( 'footer.mw-footer, #footer' );
        var contentArea = document.querySelector( '.mw-body-content, #mw-content-text' );

        if ( !contentArea ) {
            return;
        }

        if ( document.querySelector( '.mw-language-bar-footer' ) ) {
            return;
        }

        // Create language bar element
        var languageBar = document.createElement( 'div' );
        languageBar.innerHTML = buildLanguageBar();
        var languageBarElement = languageBar.firstChild;

        // Insert before footer if exists, otherwise after content
        if ( footer && footer.parentNode ) {
            footer.parentNode.insertBefore( languageBarElement, footer );
        } else if ( contentArea.parentNode ) {
            // Insert after the content area
            if ( contentArea.nextSibling ) {
                contentArea.parentNode.insertBefore( languageBarElement, contentArea.nextSibling );
            } else {
                contentArea.parentNode.appendChild( languageBarElement );
            }
        }
    }

    // Run when DOM is ready
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', insertLanguageBar );
    } else {
        insertLanguageBar();
    }

}() );
