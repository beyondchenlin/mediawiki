# MediaWiki 多语言底部链接栏

与官方 mediawiki.org 完全一致的底部语言链接栏。

## 效果预览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Languages: English • Afrikaans • العربية • asturianu • azərbaycanca • ...    │
│ български • বাংলা • bosanski • català • čeština • dansk • Deutsch • ...      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 安装步骤

### 步骤 1：添加 CSS 样式

1. 以管理员身份登录 MediaWiki
2. 访问 `http://localhost:8081/index.php/MediaWiki:Vector.css`
3. 点击「创建」或「编辑」
4. 复制 `language-bar.css` 的全部内容粘贴进去
5. 保存页面

### 步骤 2：添加 JavaScript

1. 访问 `http://localhost:8081/index.php/MediaWiki:Vector.js`
2. 点击「创建」或「编辑」
3. 复制 `language-bar.js` 的全部内容粘贴进去
4. 保存页面

### 步骤 3：清除缓存

1. 访问 `http://localhost:8081/index.php/Special:Version`
2. 按 `Ctrl + Shift + R` 强制刷新浏览器缓存
3. 或在 LocalSettings.php 中运行：`$wgResourceLoaderStorageVersion++;`

## 文件说明

| 文件 | 用途 |
|------|------|
| `language-bar.css` | 样式代码 → 复制到 MediaWiki:Vector.css |
| `language-bar.js` | 脚本代码 → 复制到 MediaWiki:Vector.js |

## 自定义

### 修改语言列表

编辑 `language-bar.js` 中的 `languages` 数组：

```javascript
var languages = [
    ['en', 'English'],
    ['zh', '中文'],
    // 添加或删除语言...
];
```

### 修改样式

编辑 `language-bar.css`：

- 边框颜色：修改 `.mw-language-bar-footer` 中的 `border: 1px solid var(--border-color-base, #a2a9b1);`
- 背景颜色：修改 `.mw-language-bar-footer` 的 `background: #f8f9fa;` 和 `.mw-language-bar-header` 的 `background: #eaecf0;`
- 内边距：修改 `.mw-language-bar-header` 和 `.mw-language-bar-text` 的 `padding: 4px 0.5em;`

## 技术说明

- **位置**：自动插入到 footer 上方
- **兼容性**：Vector 2022 皮肤
- **点击行为**：通过 `?uselang=xx` 参数切换界面语言
- **不影响**：右侧的「Add languages」按钮保持不变
