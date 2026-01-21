# MediaWiki 多语言语言栏 - 扩展方式实现方案

## 📋 方案概述

本文档描述如何通过创建自定义扩展来实现多语言语言栏功能，这是 MediaWiki 官方推荐的最规范做法。

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
    │   ├── LanguageBarFooter.php    # 主类文件
    │   ├── resources/
    │   │   ├── language-bar.css    # CSS 样式
    │   │   └── language-bar.js     # JavaScript 脚本
    │   └── hooks/
    │       └── BeforePageDisplayHook.php  # 钩子实现
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
        "MediaWiki": ">= 1.39.0"
    },
    "AutoloadNamespaces": {
        "MediaWiki\\Extensions\\LanguageBarFooter\\": "src/"
    },
    "Hooks": {
        "BeforePageDisplay": "MediaWiki\\Extensions\\LanguageBarFooter\\Hooks\\BeforePageDisplayHook::onBeforePageDisplay"
    },
    "ResourceModules": {
        "ext.languageBarFooter.styles": {
            "localBasePath": "src/resources",
            "remoteExtPath": "LanguageBarFooter/src/resources",
            "styles": [
                "language-bar.css"
            ],
            "position": "top"
        },
        "ext.languageBarFooter.scripts": {
            "localBasePath": "src/resources",
            "remoteExtPath": "LanguageBarFooter/src/resources",
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

**文件路径**: `src/resources/language-bar.css`

```css
/**
 * MediaWiki Language Bar - Footer Styles
 * Extension: LanguageBarFooter
 */

/* Wrapper clears floats similar to the official main page layout */
.mw-language-bar-wrap {
    display: flow-root;
}

/* Language bar container */
.mw-language-bar-footer {
    background: #f8f9fa;
    border: 1px solid var(--border-color-base, #a2a9b1);
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
    border-top: 1px solid var(--border-color-base, #a2a9b1);
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
        border-right: 1px solid var(--border-color-base, #a2a9b1);
        width: 1%;
    }

    .mw-language-bar-footer .mw-language-bar-text {
        border-top: none;
        display: table-cell;
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

**文件路径**: `src/resources/language-bar.js`

```javascript
/**
 * MediaWiki Language Bar - Footer Script
 * Extension: LanguageBarFooter
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

        if ( footer && footer.parentNode ) {
            footer.parentNode.insertBefore( languageBarElement, footer );
        } else if ( contentArea.parentNode ) {
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
```

### 步骤 5：创建钩子实现

**文件路径**: `src/hooks/BeforePageDisplayHook.php`

```php
<?php

namespace MediaWiki\Extensions\LanguageBarFooter\Hooks;

use OutputPage;
use Skin;

/**
 * Hook handler for BeforePageDisplay
 */
class BeforePageDisplayHook {

    /**
     * Add CSS and JS to the page
     *
     * @param OutputPage $out
     * @param Skin $skin
     * @return void
     */
    public static function onBeforePageDisplay( OutputPage $out, Skin $skin ): void {
        // Only load on Vector skin
        if ( $skin->getSkinName() !== 'vector' && $skin->getSkinName() !== 'vector-2022' ) {
            return;
        }

        // Add CSS and JS modules
        $out->addModuleStyles( 'ext.languageBarFooter.styles' );
        $out->addModules( 'ext.languageBarFooter.scripts' );
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
- ✅ No database changes required
- ✅ Compatible with Vector 2022 skin

## Installation

1. Download the extension and place it in the `extensions/LanguageBarFooter` directory.

2. Add the following code at the bottom of your `LocalSettings.php`:

```php
wfLoadExtension( 'LanguageBarFooter' );
```

3. Done! Navigate to "Special:Version" on your wiki to verify that the extension is successfully installed.

## Configuration

No configuration is required. The extension works out of the box.

## Customization

### Modifying the language list

Edit `src/resources/language-bar.js` and modify the `languages` array:

```javascript
var languages = [
    ['en', 'English'],
    ['zh', '中文'],
    // Add or remove languages...
];
```

### Modifying styles

Edit `src/resources/language-bar.css` to customize the appearance.

## License

MIT License
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

namespace MediaWiki\Extensions\LanguageBarFooter\Tests;

use MediaWiki\Extensions\LanguageBarFooter\Hooks\BeforePageDisplayHook;
use MediaWikiTestCase;

/**
 * @covers \MediaWiki\Extensions\LanguageBarFooter\Hooks\BeforePageDisplayHook
 */
class LanguageBarFooterTest extends MediaWikiTestCase {

    public function testOnBeforePageDisplayAddsModules() {
        $out = $this->getMockBuilder( OutputPage::class )
            ->disableOriginalConstructor()
            ->getMock();

        $out->expects( $this->once() )
            ->method( 'addModuleStyles' )
            ->with( 'ext.languageBarFooter.styles' );

        $out->expects( $this->once() )
            ->method( 'addModules' )
            ->with( 'ext.languageBarFooter.scripts' );

        $skin = $this->getMockBuilder( Skin::class )
            ->disableOriginalConstructor()
            ->getMock();

        $skin->method( 'getSkinName' )
            ->willReturn( 'vector' );

        BeforePageDisplayHook::onBeforePageDisplay( $out, $skin );
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
        "mediawiki/mediawiki": ">= 1.39.0"
    },
    "autoload": {
        "psr-4": {
            "MediaWiki\\Extensions\\LanguageBarFooter\\": "src/"
        }
    },
    "extra": {
        "installer-name": "LanguageBarFooter"
    }
}
```

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

2. **创建扩展**
   - 按照上述步骤创建扩展结构

3. **启用扩展**
   ```php
   // 在 LocalSettings.php 中添加
   wfLoadExtension( 'LanguageBarFooter' );
   ```

4. **清理旧配置**
   - 删除 `MediaWiki:Vector.css` 中的语言栏样式
   - 删除 `MediaWiki:Vector.js` 中的语言栏脚本

5. **验证**
   - 访问任意页面，确认语言栏正常显示
   - 检查浏览器控制台，确认没有错误

---

## 📊 性能优化

### ResourceLoader 优势

1. **自动压缩和合并**
   - CSS 和 JS 会被自动压缩
   - 多个模块可以合并为一个请求

2. **缓存策略**
   - 资源会被浏览器缓存
   - 版本变化时自动失效

3. **按需加载**
   - 只在需要的页面加载
   - 减少不必要的请求

4. **依赖管理**
   - 自动处理模块依赖
   - 确保正确的加载顺序

---

## 🎯 最佳实践

1. **遵循 PSR-4 自动加载**
   - 使用命名空间
   - 正确组织目录结构

2. **编写单元测试**
   - 测试钩子逻辑
   - 确保代码质量

3. **国际化**
   - 提供多语言翻译
   - 使用 i18n 系统

4. **文档完善**
   - README 文件
   - 代码注释
   - API 文档

5. **版本控制**
   - 使用语义化版本
   - 维护 CHANGELOG

---

## 📚 参考资料

- [MediaWiki 扩展开发指南](https://www.mediawiki.org/wiki/Manual:Extension_development)
- [ResourceLoader 文档](https://www.mediawiki.org/wiki/ResourceLoader)
- [Hooks 文档](https://www.mediawiki.org/wiki/Manual:Hooks)
- [皮肤开发指南](https://www.mediawiki.org/wiki/Manual:Skin_development)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License
