# LanguageBarFooter

A MediaWiki extension that adds a multilingual language bar at the footer, matching the official mediawiki.org styling.

## Features

- Matches official mediawiki.org nmbox styling
- Supports 56 languages
- Responsive design (mobile and desktop)
- Dark mode support
- RTL support for right-to-left languages
- No database changes required
- Compatible with Vector 2022 skin
- Configurable language list and position

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