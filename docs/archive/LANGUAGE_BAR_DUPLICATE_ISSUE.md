# MediaWiki 语言栏重复显示问题 - 技术总结

> ??????????
> ?????? MediaWiki:Common.js ??????? footer ????? LanguageBarFooter ?????
> ????? MediaWiki:Common.js ????? page_touched????????? `?debug=true`?
> ???2026-01-22


## 问题描述

在 MediaWiki 页面底部出现**两个**语言栏，导致用户体验不佳。

### 当前状态（2026-01-22）

访问 http://localhost:8081 时，页面显示两个语言栏：

1. **第一个语言栏**（ref=e122）
   - 位置：在页面主内容区域底部
   - 显示完整语言名称：English, Afrikaans, العربية...
   - 使用官方 MediaWiki nmbox 样式（table-cell 布局）
   - 由 **LanguageBarFooter 扩展**通过 JavaScript 动态生成

2. **第二个语言栏**（ref=e247）
   - 位置：在页面 footer 区域
   - 显示完整语言名称：English, Afrikaans, العربية...
   - 使用相同的样式
   - **来源不明**（服务器端渲染，在 JavaScript 运行前就存在于 HTML 中）

---

## 技术细节

### LanguageBarFooter 扩展信息

**扩展位置：** `D:\demo\demo1\mediawiki-master\extensions\LanguageBarFooter\`

**核心文件：**
- `extension.json` - 扩展配置
- `src/Hooks.php` - PHP Hook 处理器（只加载 CSS/JS 模块，不渲染 HTML）
- `resources/language-bar.js` - JavaScript 生成语言栏
- `resources/language-bar.css` - 样式文件

**工作原理：**
1. PHP Hook (`BeforePageDisplay`) 加载 CSS 和 JS 模块
2. JavaScript 在 `DOMContentLoaded` 时动态生成语言栏 HTML
3. 插入到页面指定位置（footer 或 content 区域）

**JavaScript 已有的清理逻辑：**
```javascript
// Remove any old language bars (from other sources) FIRST
var oldBars = document.querySelectorAll( '.mw-language-bar-footer' );
oldBars.forEach( function ( bar ) {
    if ( !bar.closest( '.mw-language-bar-wrap' ) ) {
        bar.remove();
    }
} );
```

**问题：** 这段代码在客户端执行，但第二个语言栏是服务器端渲染的，在 JavaScript 运行时已经存在于 DOM 中。虽然 JavaScript 尝试删除它，但由于某种原因没有成功删除。

---

## 已尝试的解决方案

### ✅ 已完成的排查和修复

1. **清空 MediaWiki:Vector.js 和 MediaWiki:Vector.css**
   - 方法：直接在数据库中清空 `text` 表对应记录
   - 结果：问题依然存在

2. **禁用可能冲突的扩展**
   - 在 `LocalSettings.php` 中注释掉：
     - `UniversalLanguageSelector`
     - `Translate`
   - 结果：问题依然存在

3. **清除所有缓存**
   - 删除 `objectcache` 表所有记录
   - 删除 `cache/l10n_cache-*.cdb` 文件
   - 删除 `page_props` 表中的 translate 相关属性
   - 结果：问题依然存在

4. **验证 LanguageBarFooter 扩展代码**
   - 检查 `src/Hooks.php` - 确认只加载模块，不渲染 HTML
   - 检查 `resources/language-bar.js` - 确认有删除旧语言栏的逻辑
   - 结果：扩展代码本身没有问题

5. **搜索本地文件**
   - 使用 `grep` 搜索 `mw-language-bar-footer` 相关代码
   - 搜索范围：`extensions/` 目录
   - 结果：只找到 LanguageBarFooter 扩展的代码，没有其他来源

### ❌ 已拒绝的方案

**CSS 隐藏方案**（用户明确拒绝）
- 方法：使用 CSS `display: none !important` 隐藏第二个语言栏
- 拒绝原因：这不是从源头解决问题，只是掩盖症状

---

## 第二个语言栏的特征

### DOM 结构分析

通过 Playwright 分析，第二个语言栏（ref=e247）的特征：

```yaml
- generic [ref=e247]:
  - text: "Languages:"
  - generic [ref=e248]:
    - link "English" [ref=e249]
    - text: •
    - link "Afrikaans" [ref=e250]
    - text: •
    - link "العربية" [ref=e251]
    # ... 更多语言链接
```

### 关键特征

1. **渲染时机：** 服务器端渲染（在 JavaScript 运行前就存在）
2. **HTML 结构：** 与 LanguageBarFooter 扩展生成的结构相似
3. **位置：** 在页面 footer 区域（`contentinfo` 元素之前）
4. **样式：** 使用相同的 CSS 类名和样式

### 可能的来源

由于本地文件搜索没有找到相关代码，第二个语言栏可能来自：

1. **MediaWiki 核心代码**
   - 可能在 `includes/` 目录中
   - 可能在 `skins/Vector/` 目录中
   - 需要搜索 MediaWiki 核心代码库

2. **Vector 皮肤模板**
   - 可能在皮肤的 PHP 模板文件中
   - 需要检查 `skins/Vector/includes/` 目录

3. **其他系统页面**
   - MediaWiki:Common.js
   - MediaWiki:Common.css
   - MediaWiki:Vector-2022.js
   - MediaWiki:Vector-2022.css

4. **数据库中的其他配置**
   - 可能在 `page` 表的其他 namespace
   - 可能在其他配置表中

---

## 下一步建议

### 方案 1：搜索 MediaWiki 核心代码

```bash
# 在 MediaWiki 根目录执行
grep -r "mw-language-bar-footer" includes/ skins/
grep -r "Languages:" includes/ skins/ | grep -i "language.*bar"
```

### 方案 2：检查数据库中的所有系统页面

```sql
-- 查看所有 MediaWiki namespace (8) 的页面
SELECT page_id, page_title, page_namespace
FROM page
WHERE page_namespace = 8
ORDER BY page_title;

-- 查看这些页面的内容
SELECT p.page_title, t.old_text
FROM page p
JOIN text t ON p.page_latest = t.old_id
WHERE p.page_namespace = 8
AND t.old_text LIKE '%language%'
ORDER BY p.page_title;
```

### 方案 3：检查 Vector 皮肤模板

```bash
# 搜索 Vector 皮肤目录
grep -r "language" skins/Vector/includes/
grep -r "Languages:" skins/Vector/
```

### 方案 4：使用浏览器开发者工具追踪

1. 打开浏览器开发者工具
2. 在 Network 面板查看 HTML 响应
3. 搜索第二个语言栏的 HTML 代码
4. 确认它是否在服务器返回的 HTML 中

### 方案 5：临时禁用 LanguageBarFooter 扩展

```php
# 在 LocalSettings.php 中注释掉
# wfLoadExtension( 'LanguageBarFooter' );
```

然后访问页面，看第二个语言栏是否还存在。如果还存在，说明它确实来自其他地方。

---

## 环境信息

- **MediaWiki 版本：** >= 1.44.0
- **皮肤：** Vector / Vector-2022
- **URL：** http://localhost:8081
- **扩展目录：** `D:\demo\demo1\mediawiki-master\extensions\LanguageBarFooter\`
- **数据库：** MySQL (mediawiki)

---

## 相关文件清单

### LanguageBarFooter 扩展文件

```
extensions/LanguageBarFooter/
├── extension.json              # 扩展配置
├── src/
│   └── Hooks.php              # PHP Hook 处理器
├── resources/
│   ├── language-bar.js        # JavaScript 生成语言栏
│   └── language-bar.css       # 样式文件
└── i18n/
    └── en.json                # 国际化文件
```

### 已修改的配置文件

- `LocalSettings.php` - 禁用了 UniversalLanguageSelector 和 Translate 扩展

### 已清空的系统页面

- `MediaWiki:Vector.js` - 已清空
- `MediaWiki:Vector.css` - 已清空

---

## 联系信息

如需进一步协助，请提供：

1. MediaWiki 核心代码搜索结果
2. Vector 皮肤模板文件内容
3. 数据库中所有 MediaWiki namespace 页面列表
4. 浏览器开发者工具中的 HTML 源码截图

---

**文档创建时间：** 2026-01-22
**问题状态：** 未解决 - 需要找到第二个语言栏的服务器端渲染来源
