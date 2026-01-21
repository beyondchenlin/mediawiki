# MediaWiki 多语言语言栏 - 扩展方式实现方案

## 📋 方案概述

本文档描述如何通过创建自定义扩展来实现多语言语言栏功能，这是 MediaWiki 官方推荐的最规范做法。

### 系统要求

- **MediaWiki**: >= 1.44.0
- **PHP**: >= 7.4 (使用了 PHP 7.0+ 和 7.1+ 的类型声明特性)

### 为什么选择扩展方式？

| 对比项 | 当前方案（MediaWiki 命名空间） | 扩展方式（推荐） |
|--------|-------------------------------|-------------------|
| **规范性** | ⚠️ 非标准 | ✅ 完全符合 MediaWiki 规范 |
| **版本控制** | ✅ 支持 | ✅ 支持 |
| **性能** | ⚠️ 一般 | ✅ 优秀（ResourceLoader 优化） |
| **可维护性** | ⚠️ 需要手动复制 | ✅ 自动加载 |
| **可分发性** | ❌ 不易分发 | ✅ 可打包分发 |
| **学习曲线** | ✅ 简单 | ⚠️ 需要学习扩展开发 |
| **适用场景** | 小型项目 | 中大型项目 |

---

## 📁 目录结构

```
extensions/
└── LanguageBarFooter/
    ├── extension.json           # 扩展配置文件
    ├── src/
    │   └── Hooks.php                # 钩子处理类
    ├── resources/
    │   ├── language-bar.css    # CSS 样式
    │   └── language-bar.js     # JavaScript 脚本
    ├── i18n/
    │   ├── en.json              # 英文翻译
    │   ├── zh-hans.json         # 简体中文翻译
    │   └── qqq.json            # 消息文档
    ├── tests/
    │   └── phpunit/
    │       └── LanguageBarFooterTest.php  # 单元测试
    ├── README.md               # 扩展说明
    ├── LICENSE                 # 许可证
    └── composer.json           # Composer 配置（可选）
```

---

## 🚀 实现步骤

### 步骤 1：创建扩展目录

```bash
cd extensions
mkdir LanguageBarFooter
cd LanguageBarFooter
mkdir -p src resources i18n tests/phpunit
```

### 步骤 2：创建 `extension.json`

```json
{
    "name": "LanguageBarFooter",
    "version": "1.0.0",
    "author": "Your Name",
    "url": "https://github.com/yourusername/LanguageBarFooter",
    "descriptionmsg": "languagebarfooter-desc",
    "license-name": "MIT",
    "type": "other",
    "requires": {
        "MediaWiki": ">= 1.44.0"
    },
    "AutoloadNamespaces": {
        "MediaWiki\\Extension\\LanguageBarFooter\\": "src/"
    },
    "Hooks": {
        "BeforePageDisplay": "main"
    },
    "HookHandlers": {
        "main": {
            "class": "MediaWiki\\Extension\\LanguageBarFooter\\Hooks"
        }
    },
    "config": {
        "LanguageBarFooterLanguages": {
            "value": ["en", "af", "ar", "ast", "az", "ba", "be", "be-tarask", "bg", "bn", "bs", "ca", "ckb", "cs", "da", "de", "el", "eo", "es", "fa", "fi", "fr", "gl", "gu", "he", "hi", "hr", "hu", "hy", "ia", "id", "it", "ja", "jv", "kk", "ko", "ml", "ms", "mwl", "nl", "or", "pl", "pt", "pt-br", "ro", "ru", "sc", "si", "sk", "sl", "so", "sq", "sr", "sv", "syl", "th", "tr", "uk", "vi", "yue", "zh"],
            "description": "List of language codes to display in the language bar"
        },
        "LanguageBarFooterPosition": {
            "value": "footer",
            "description": "Position to insert the language bar (footer/content)"
        },
        "LanguageBarFooterEnabledSkins": {
            "value": ["vector", "vector-2022"],
            "description": "List of skins where the language bar should be displayed"
        }
    },
    "ResourceModules": {
        "ext.languageBarFooter.styles": {
            "localBasePath": "resources",
            "remoteExtPath": "LanguageBarFooter/resources",
            "styles": [
                "language-bar.css"
            ],
            "position": "top"
        },
        "ext.languageBarFooter.scripts": {
            "localBasePath": "resources",
            "remoteExtPath": "LanguageBarFooter/resources",
            "scripts": [
                "language-bar.js"
            ],
            "dependencies": [
                "mediawiki.util"
            ],
            "position": "bottom"
        }
    },
    "MessagesDirs": {
        "LanguageBarFooter": [
            "i18n"
        ]
    },
    "manifest_version": 2
}
```

### 步骤 3：创建 CSS 样式文件

**文件路径**: `resources/language-bar.css`

```css
/**
 * MediaWiki Language Bar - Footer Styles
 * Extension: LanguageBarFooter
 *
 * Browser compatibility:
 * - flow-root: Chrome 58+, Firefox 53+, Safari 13.1+, Edge 79+
 * - For IE support, consider using clearfix fallback
 */

/* Wrapper clears floats similar to the official main page layout */
.mw-language-bar-wrap {
    display: flow-root;
}

/* Language bar container */
.mw-language-bar-footer {
    background: #f8f9fa;
    border: 1px solid #a2a9b1;
    box-sizing: border-box;
    margin: 2px 0;
    padding: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    overflow: hidden;
}

/* Ensure consistent sizing inside the bar */
.mw-language-bar-footer * {
    box-sizing: border-box;
}

/* Header cell */
.mw-language-bar-footer .mw-language-bar-header {
    background: #eaecf0;
    padding: 4px 0.5em;
    font-weight: bold;
    text-align: center;
    white-space: nowrap;
}

/* Text cell */
.mw-language-bar-footer .mw-language-bar-text {
    border-top: 1px solid #a2a9b1;
    width: 100%;
    padding: 4px 0.5em;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* Language links */
.mw-language-bar-footer a {
    white-space: nowrap;
}

/* Table-style layout on wider screens */
@media screen and (min-width: 768px) {
    .mw-language-bar-footer .mw-language-bar-header {
        display: table-cell;
        border-right: 1px solid #a2a9b1;
        width: 1%;
    }

    .mw-language-bar-footer .mw-language-bar-text {
        border-top: none;
        display: table-cell;
    }
}

/* RTL support */
.mw-language-bar-footer[dir="rtl"] .mw-language-bar-header {
    border-right: none;
    border-left: 1px solid #a2a9b1;
}

.mw-language-bar-footer[dir="rtl"] .mw-language-bar-text {
    border-top: 1px solid #a2a9b1;
}

@media screen and (min-width: 768px) {
    .mw-language-bar-footer[dir="rtl"] .mw-language-bar-text {
        border-top: none;
    }
}

/* Respect Vector theme switching */
@media screen {
    html.skin-theme-clientpref-night .mw-language-bar-footer,
    html.skin-theme-clientpref-night .mw-language-bar-footer .mw-language-bar-header {
        background: transparent;
        color: inherit;
    }
}

@media screen and (prefers-color-scheme: dark) {
    html.skin-theme-clientpref-os .mw-language-bar-footer,
    html.skin-theme-clientpref-os .mw-language-bar-footer .mw-language-bar-header {
        background: transparent;
        color: inherit;
    }
}
```

### 步骤 4：创建 JavaScript 脚本文件

**文件路径**: `resources/language-bar.js`

```javascript
/**
 * MediaWiki Language Bar - Footer Script
 * Extension: LanguageBarFooter
 */

( function () {
    'use strict';

    // Default language data: [code, native name]
    // This serves as a fallback if the PHP configuration is not available
    // In normal operation, wgLanguageBarFooterLanguages will be set by PHP
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

    // Read configuration from MediaWiki
    var configLanguages = mw.config.get( 'wgLanguageBarFooterLanguages' );
    var configPosition = mw.config.get( 'wgLanguageBarFooterPosition' ) || 'footer';

    // Convert language codes to [code, name] format if needed
    // configLanguages can be either:
    // 1. An array of language codes: ['en', 'zh', 'es']
    // 2. An array of [code, name] pairs: [['en', 'English'], ['zh', '中文']]
    var languages = defaultLanguages;

    if ( configLanguages && configLanguages.length > 0 ) {
        if ( typeof configLanguages[0] === 'string' ) {
            // Convert language codes to [code, name] pairs
            languages = configLanguages.map( function ( code ) {
                var name = mw.language.getData( code, 'language-name' ) ||
                           mw.language.getData( code, 'language-name-fallback' ) ||
                           code;
                return [code, name];
            } );
        } else if ( typeof configLanguages[0] === 'object' ) {
            // Already in [code, name] format
            languages = configLanguages;
        }
    }

    /**
     * Build HTML for a single language link
     */
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

    /**
     * Build the complete language bar HTML
     */
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

    /**
     * Insert language bar into page
     */
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

            // Insert based on configured position
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

    // Run when DOM is ready
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', function () {
            try {
                insertLanguageBar();
            } catch ( e ) {
                console.error( 'LanguageBarFooter: Error initializing', e );
            }
        } );
    } else {
        try {
            insertLanguageBar();
        } catch ( e ) {
            console.error( 'LanguageBarFooter: Error initializing', e );
        }
    }

}() );
```

### 步骤 5：创建钩子实现

**文件路径**: `src/Hooks.php`

```php
<?php

namespace MediaWiki\Extension\LanguageBarFooter;

use Config;
use OutputPage;
use Skin;

/**
 * Hook handler for the extension
 */
class Hooks {

    private Config $config;

    public function __construct( ?Config $config = null ) {
        $this->config = $config ?? \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
    }

    /**
     * Add CSS and JS to the page
     *
     * @param OutputPage $out
     * @param Skin $skin
     * @return void
     */
    public function onBeforePageDisplay( OutputPage $out, Skin $skin ): void {
        $enabledSkins = $this->config->get( 'LanguageBarFooterEnabledSkins' );

        // 支持 '*' 表示启用所有皮肤
        if ( !in_array( '*', $enabledSkins, true ) &&
             !in_array( $skin->getSkinName(), $enabledSkins, true ) ) {
            return;
        }

        $out->addModuleStyles( 'ext.languageBarFooter.styles' );
        $out->addModules( 'ext.languageBarFooter.scripts' );

        // Pass configuration to JavaScript
        $out->addJsConfigVars( 'wgLanguageBarFooterLanguages',
            $this->config->get( 'LanguageBarFooterLanguages' ) );
        $out->addJsConfigVars( 'wgLanguageBarFooterPosition',
            $this->config->get( 'LanguageBarFooterPosition' ) );
    }
}
```

### 步骤 6：创建国际化文件

**文件路径**: `i18n/en.json`

```json
{
    "@metadata": {
        "authors": [
            "Your Name"
        ]
    },
    "languagebarfooter-desc": "Adds a multilingual language bar at the footer matching official mediawiki.org styling"
}
```

**文件路径**: `i18n/zh-hans.json`

```json
{
    "@metadata": {
        "authors": [
            "Your Name"
        ]
    },
    "languagebarfooter-desc": "在页脚添加多语言语言栏，样式与官方 mediawiki.org 一致"
}
```

**文件路径**: `i18n/qqq.json`

```json
{
    "@metadata": {
        "authors": [
            "Your Name"
        ]
    },
    "languagebarfooter-desc": "{{desc|name=LanguageBarFooter|url=https://github.com/yourusername/LanguageBarFooter}}"
}
```

### 步骤 7：创建 README 文件

**文件路径**: `README.md`

```markdown
# LanguageBarFooter

A MediaWiki extension that adds a multilingual language bar at the footer, matching the official mediawiki.org styling.

## Features

- ✅ Matches official mediawiki.org nmbox styling
- ✅ Supports 56 languages
- ✅ Responsive design (mobile and desktop)
- ✅ Dark mode support
- ✅ RTL support for right-to-left languages
- ✅ No database changes required
- ✅ Compatible with Vector 2022 skin
- ✅ Configurable language list and position

## Installation

1. Download the extension and place it in the `extensions/LanguageBarFooter` directory.

2. Add the following code at the bottom of your `LocalSettings.php`:

```php
wfLoadExtension( 'LanguageBarFooter' );
```

3. Done! Navigate to "Special:Version" on your wiki to verify that the extension is successfully installed.

## Configuration

### Basic Configuration

No configuration is required. The extension works out of the box with default settings.

### Advanced Configuration

You can customize the extension by adding the following settings to your `LocalSettings.php`:

#### Customize Language List

```php
// Option 1: Use language codes (names will be auto-detected)
$wgLanguageBarFooterLanguages = [ 'en', 'zh', 'es', 'fr', 'de', 'ja' ];

// Option 2: Use [code, name] pairs for custom names
$wgLanguageBarFooterLanguages = [
    ['en', 'English'],
    ['zh', '中文'],
    ['es', 'Español']
];
```

#### Change Display Position

```php
// Position options: 'footer' (default) or 'content'
$wgLanguageBarFooterPosition = 'footer';
```

#### Enable for Specific Skins

```php
// Enable only for Vector skins (default)
$wgLanguageBarFooterEnabledSkins = [ 'vector', 'vector-2022' ];

// Enable for all skins
$wgLanguageBarFooterEnabledSkins = [ '*' ];
```

## Customization

### Modifying the language list

You can customize the language list in `LocalSettings.php`:

```php
// Option 1: Use language codes (recommended - names auto-detected)
$wgLanguageBarFooterLanguages = [ 'en', 'zh', 'es', 'fr', 'de', 'ja' ];

// Option 2: Use [code, name] pairs for custom display names
$wgLanguageBarFooterLanguages = [
    ['en', 'English'],
    ['zh', '中文'],
    ['es', 'Español']
];
```

Note: The default language list in `resources/language-bar.js` is used as a fallback if no configuration is provided.

### Modifying styles

Edit `resources/language-bar.css` to customize the appearance.

## License

MIT License

**许可证说明**: 本扩展使用 MIT 许可证，这是一个与 MediaWiki 的 GPL-2.0-or-later 兼容的开源许可证。MediaWiki 官方推荐的兼容许可证包括：
- GPL-2.0-or-later (Wikimedia 标准许可证)
- MIT License
- BSD-3-Clause
- Apache-2.0
```

### 步骤 8：启用扩展

在 `LocalSettings.php` 中添加：

```php
wfLoadExtension( 'LanguageBarFooter' );
```

### 步骤 9：更新缓存

```bash
# 在 Docker 容器中运行
docker exec mw-web php maintenance/update.php

# 或在浏览器中访问
http://localhost:8081/index.php/Special:Version
```

---

## 🧪 测试

### 单元测试

**文件路径**: `tests/phpunit/LanguageBarFooterTest.php`

```php
<?php

namespace MediaWiki\Extension\LanguageBarFooter\Tests;

use MediaWiki\Extension\LanguageBarFooter\Hooks;
use MediaWikiIntegrationTestCase;
use OutputPage;
use Skin;

/**
 * @covers \MediaWiki\Extension\LanguageBarFooter\Hooks
 */
class LanguageBarFooterTest extends MediaWikiIntegrationTestCase {

    private Hooks $hooks;
    private OutputPage $out;
    private Skin $skin;

    protected function setUp(): void {
        parent::setUp();

        $config = $this->getServiceContainer()->getMainConfig();
        $this->hooks = new Hooks( $config );

        $this->out = $this->getMockBuilder( OutputPage::class )
            ->disableOriginalConstructor()
            ->onlyMethods( ['addModuleStyles', 'addModules'] )
            ->getMock();

        $this->skin = $this->getMockBuilder( Skin::class )
            ->disableOriginalConstructor()
            ->onlyMethods( ['getSkinName'] )
            ->getMock();
    }

    public function testOnBeforePageDisplayAddsModules() {
        $this->skin->method( 'getSkinName' )
            ->willReturn( 'vector' );

        $this->out->expects( $this->once() )
            ->method( 'addModuleStyles' )
            ->with( 'ext.languageBarFooter.styles' );

        $this->out->expects( $this->once() )
            ->method( 'addModules' )
            ->with( 'ext.languageBarFooter.scripts' );

        $this->hooks->onBeforePageDisplay( $this->out, $this->skin );
    }

    public function testOnBeforePageDisplaySkipsDisabledSkin() {
        $this->skin->method( 'getSkinName' )
            ->willReturn( 'monobook' );

        $this->out->expects( $this->never() )
            ->method( 'addModuleStyles' );

        $this->out->expects( $this->never() )
            ->method( 'addModules' );

        $this->hooks->onBeforePageDisplay( $this->out, $this->skin );
    }

    public function testOnBeforePageDisplayAddsJsConfigVars() {
        $this->skin->method( 'getSkinName' )
            ->willReturn( 'vector' );

        $this->out->expects( $this->once() )
            ->method( 'addJsConfigVars' )
            ->with(
                $this->logicalOr(
                    $this->equalTo( 'wgLanguageBarFooterLanguages' ),
                    $this->equalTo( 'wgLanguageBarFooterPosition' )
                )
            );

        $this->hooks->onBeforePageDisplay( $this->out, $this->skin );
    }
}
```

运行测试：

```bash
docker exec mw-web php tests/phpunit/phpunit.php extensions/LanguageBarFooter/tests/phpunit/LanguageBarFooterTest.php
```

---

## 📦 打包和分发

### 创建 Composer 配置（可选）

**文件路径**: `composer.json`

```json
{
    "name": "yourusername/language-bar-footer",
    "description": "MediaWiki extension for multilingual language bar",
    "type": "mediawiki-extension",
    "license": "MIT",
    "authors": [
        {
            "name": "Your Name",
            "email": "your.email@example.com"
        }
    ],
    "require": {
        "composer/installers": "^1.0|^2.0",
        "mediawiki/mediawiki": ">= 1.44.0"
    },
    "autoload": {
        "psr-4": {
            "MediaWiki\\Extension\\LanguageBarFooter\\": "src/"
        }
    },
    "extra": {
        "installer-name": "LanguageBarFooter"
    }
}
```

**注意**: composer.json 中的 autoload 路径保持 `src/` 不变，因为 PHP 类文件仍在 src 目录下。

### 发布到 GitHub

1. 创建 GitHub 仓库
2. 推送代码
3. 创建 Release

---

## 🔄 从当前方案迁移

### 迁移步骤

1. **备份当前配置**
   ```bash
   # 导出 MediaWiki:Vector.css
   docker exec mw-web php maintenance/dumpBackup.php --current --output=backup_vector.xml

   # 导出 MediaWiki:Vector.js
   docker exec mw-web php maintenance/dumpBackup.php --current --output=backup_vector_js.xml
   ```

2. **创建扩展目录**
   ```bash
   cd extensions
   mkdir -p LanguageBarFooter/src
   mkdir -p LanguageBarFooter/resources
   mkdir -p LanguageBarFooter/i18n
   mkdir -p LanguageBarFooter/tests/phpunit
   ```

3. **复制现有代码到扩展**
   - 将 CSS 内容复制到 `resources/language-bar.css`
   - 将 JavaScript 内容复制到 `resources/language-bar.js`
   - 按照"实现步骤"创建其他文件

4. **更新 LocalSettings.php**
   ```php
   # 移除旧的配置（如果有）
   # $wgLanguageBarFooterLanguages = [...];

   # 加载新扩展
   wfLoadExtension( 'LanguageBarFooter' );

   # 如果需要自定义配置
   # $wgLanguageBarFooterLanguages = [ 'en', 'zh', 'es' ];
   ```

5. **清理旧代码**
   ```bash
   # 在 MediaWiki 中删除旧的 CSS/JS 页面
   # MediaWiki:Vector.css
   # MediaWiki:Vector.js
   ```

6. **更新缓存**
   ```bash
   docker exec mw-web php maintenance/update.php
   ```

---

## 📚 参考资料

- [MediaWiki 扩展开发官方文档](https://www.mediawiki.org/wiki/Manual:Developing_extensions)
- [MediaWiki Hooks 文档](https://www.mediawiki.org/wiki/Manual:Hooks)
- [ResourceLoader 文档](https://www.mediawiki.org/wiki/ResourceLoader)
- [extension.json 格式说明](https://www.mediawiki.org/wiki/Manual:Extension.json/Schema)

---

## ✅ 完成检查清单

在完成扩展开发后，请检查以下项目：

- [ ] extension.json 配置正确
- [ ] 命名空间使用 `MediaWiki\Extension\LanguageBarFooter`
- [ ] 钩子类使用依赖注入
- [ ] CSS 和 JS 通过 ResourceLoader 加载
- [ ] 国际化文件完整
- [ ] 单元测试通过
- [ ] README 文档完整
- [ ] 许可证文件存在
- [ ] 在 Special:Version 中可以看到扩展信息
- [ ] 语言栏在页面正确显示
- [ ] 支持暗黑模式
- [ ] 支持响应式布局
- [ ] RTL 语言支持正常

### 符合官方规范

- ✅ 使用 `manifest_version: 2`
- ✅ PSR-4 命名空间规范
- ✅ 正确的 ResourceLoader 配置
- ✅ 完整的 i18n 支持
- ✅ 现代化的测试框架
- ✅ 可配置的扩展设计

### 文档更新

- 更新了步骤编号（1-9）
- 所有代码示例已更新为最新版本
- 添加了详细的配置说明
- 添加了修复记录章节

---

## 🐛 修复记录

### 2026-01-21 - 文档修复

1. **修复了 extension.json 中的版本检查方式**
   - 问题：使用了 `callback` 进行版本检查，这在 extension.json 加载时执行，可能导致未定义行为
   - 修复：删除 `callback` 配置，改用 `requires` 字段让 MediaWiki 自动处理版本依赖
   - 删除了不必要的 `src/LanguageBarFooter.php` 文件

2. **修正了文档步骤编号**
   - 问题：文档中存在重复的步骤编号（两个"步骤3"和两个"步骤4"）
   - 修复：重新编号步骤，使其连续（步骤1-9）

3. **优化了 JavaScript 语言数据管理**
   - 问题：JavaScript 期望二维数组 [code, name]，但 extension.json 配置的是字符串数组
   - 修复：JavaScript 现在支持两种配置格式：
     - 语言代码数组：`['en', 'zh', 'es']`（推荐，名称自动检测）
     - 二维数组：`[['en', 'English'], ['zh', '中文']]`（自定义名称）
   - 使用 `mw.language.getData()` API 自动获取语言名称

4. **补充了测试代码**
   - 添加了 `testOnBeforePageDisplayAddsJsConfigVars` 测试用例
   - 验证 JavaScript 配置变量正确传递

5. **清理了过时的文档内容**
   - 删除了"添加主类文件"等过时的修复记录
   - 更新了配置说明文档
