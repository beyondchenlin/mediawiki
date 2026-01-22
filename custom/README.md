# MediaWiki 多语言底部链接栏

已从“手动复制到 MediaWiki:Vector.css / MediaWiki:Vector.js”的方式迁移到扩展方案。
本目录不再包含 `language-bar.css` / `language-bar.js`，请使用 `extensions/LanguageBarFooter`。

## 使用方式

1. 确保扩展目录存在：`extensions/LanguageBarFooter`
2. 在 `LocalSettings.php` 中启用扩展：
```php
wfLoadExtension( 'LanguageBarFooter' );
```
3. 可选配置示例：
```php
$wgLanguageBarFooterLanguages = [ 'en', 'zh', 'es' ];
$wgLanguageBarFooterPosition = 'footer';
$wgLanguageBarFooterEnabledSkins = [ 'vector', 'vector-2022' ];
```

## 自定义

- 样式：`extensions/LanguageBarFooter/resources/language-bar.css`
- 脚本：`extensions/LanguageBarFooter/resources/language-bar.js`

## 参考

- `custom/EXTENSION_IMPLEMENTATION_PLAN.md`
