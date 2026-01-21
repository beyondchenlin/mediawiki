<?php

namespace MediaWiki\Extension\LanguageBarFooter;

use Config;
use OutputPage;
use Skin;

class Hooks {

    private Config $config;

    public function __construct( ?Config $config = null ) {
        $this->config = $config ?? \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
    }

    public function onBeforePageDisplay( OutputPage $out, Skin $skin ): void {
        $enabledSkins = $this->config->get( 'LanguageBarFooterEnabledSkins' );

        if ( !in_array( '*', $enabledSkins, true ) &&
             !in_array( $skin->getSkinName(), $enabledSkins, true ) ) {
            return;
        }

        $out->addModuleStyles( 'ext.languageBarFooter.styles' );
        $out->addModules( 'ext.languageBarFooter.scripts' );

        $out->addJsConfigVars( 'wgLanguageBarFooterLanguages',
            $this->config->get( 'LanguageBarFooterLanguages' ) );
        $out->addJsConfigVars( 'wgLanguageBarFooterPosition',
            $this->config->get( 'LanguageBarFooterPosition' ) );
    }
}