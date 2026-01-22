# 删除旧语言栏代码 - 解决重复显示问题

> ???????????
> ????????????? MediaWiki:Common.js ?????????? Vector.js/Vector.css ????????
> ???? `LANGUAGE_BAR_DUPLICATE_ISSUE.md` ???????????
> ???2026-01-22


## 问题诊断

通过 Playwright 分析发现，页面上显示了**两个**语言栏：

1. **旧代码**（在 MediaWiki:Vector.js 和 MediaWiki:Vector.css 中）
   - 显示语言代码（en, af, ar...）
   - 使用旧的 HTML 结构

2. **新扩展**（LanguageBarFooter 扩展）
   - 显示完整语言名称（English, Afrikaans, العربية...）
   - 使用官方 nmbox 样式

## 解决方案

需要删除 `MediaWiki:Vector.js` 和 `MediaWiki:Vector.css` 中的旧代码。

---

## 方法 1：通过 MediaWiki 界面删除（需要管理员权限）

### 步骤 1：登录管理员账号

1. 访问：http://localhost:8081/index.php/Special:UserLogin
2. 使用管理员账号登录

### 步骤 2：清空 MediaWiki:Vector.js

1. 访问：http://localhost:8081/index.php?title=MediaWiki:Vector.js&action=edit
2. **删除所有内容**（整个页面清空）
3. 在编辑摘要中填写：`删除旧语言栏代码，改用 LanguageBarFooter 扩展`
4. 点击「发布更改」

### 步骤 3：清空 MediaWiki:Vector.css

1. 访问：http://localhost:8081/index.php?title=MediaWiki:Vector.css&action=edit
2. **删除所有内容**（整个页面清空）
3. 在编辑摘要中填写：`删除旧语言栏样式，改用 LanguageBarFooter 扩展`
4. 点击「发布更改」

### 步骤 4：清除缓存并验证

1. 强制刷新浏览器：`Ctrl + Shift + R`（Windows/Linux）或 `Cmd + Shift + R`（Mac）
2. 访问任意页面，应该只看到**一个**语言栏

---

## 方法 2：通过数据库直接删除（推荐，无需登录）

### 步骤 1：连接到 MySQL 数据库

```bash
# 如果使用 Docker
docker exec -it <mysql-container-name> mysql -u root -p

# 或者直接连接
mysql -h localhost -u root -p
```

### 步骤 2：选择 MediaWiki 数据库

```sql
USE mediawiki;  -- 或者您的数据库名称
```

### 步骤 3：查看当前内容（可选）

```sql
-- 查看 MediaWiki:Vector.js 的内容
SELECT page_id, page_title
FROM page
WHERE page_namespace = 8 AND page_title = 'Vector.js';

-- 查看对应的文本内容
SELECT old_id, old_text
FROM text
WHERE old_id IN (
    SELECT page_latest
    FROM page
    WHERE page_namespace = 8 AND page_title = 'Vector.js'
);
```

### 步骤 4：删除旧内容

```sql
-- 删除 MediaWiki:Vector.js 的内容
UPDATE text
SET old_text = ''
WHERE old_id IN (
    SELECT page_latest
    FROM page
    WHERE page_namespace = 8 AND page_title = 'Vector.js'
);

-- 删除 MediaWiki:Vector.css 的内容
UPDATE text
SET old_text = ''
WHERE old_id IN (
    SELECT page_latest
    FROM page
    WHERE page_namespace = 8 AND page_title = 'Vector.css'
);
```

### 步骤 5：清除 MediaWiki 缓存

```bash
# 在 MediaWiki 根目录执行
php maintenance/rebuildLocalisationCache.php

# 或者删除缓存文件
rm -rf cache/*.cdb
```

### 步骤 6：验证结果

1. 强制刷新浏览器：`Ctrl + Shift + R`
2. 访问：http://localhost:8081
3. 应该只看到**一个**语言栏，显示完整语言名称

---

## 方法 3：通过 MediaWiki API（需要 API 权限）

```bash
# 获取编辑令牌
curl -X POST "http://localhost:8081/api.php" \
  -d "action=query&meta=tokens&type=csrf&format=json" \
  --cookie-jar cookies.txt

# 清空 MediaWiki:Vector.js
curl -X POST "http://localhost:8081/api.php" \
  -d "action=edit&title=MediaWiki:Vector.js&text=&summary=删除旧语言栏代码&token=YOUR_TOKEN&format=json" \
  --cookie cookies.txt

# 清空 MediaWiki:Vector.css
curl -X POST "http://localhost:8081/api.php" \
  -d "action=edit&title=MediaWiki:Vector.css&text=&summary=删除旧语言栏样式&token=YOUR_TOKEN&format=json" \
  --cookie cookies.txt
```

---

## 验证修复成功

访问任意页面后，应该看到：

✅ **只有一个语言栏**（不再重复）
✅ **显示完整语言名称**（English, Afrikaans, العربية...）
✅ **样式匹配官方 MediaWiki**（灰色背景，table-cell 布局）
✅ **深色模式正常**（如果启用）

---

## 故障排除

### 问题：删除后仍然看到两个语言栏

**解决方案：**
1. 清除浏览器缓存：`Ctrl + Shift + Delete`
2. 清除 MediaWiki 缓存：`php maintenance/rebuildLocalisationCache.php`
3. 在 URL 后添加 `?debug=true` 禁用 ResourceLoader 缓存

### 问题：无法连接数据库

**解决方案：**
1. 检查 `LocalSettings.php` 中的数据库配置
2. 确认 MySQL 容器正在运行：`docker ps`
3. 查看数据库日志：`docker logs <mysql-container-name>`

### 问题：删除后页面报错

**解决方案：**
1. 检查 LanguageBarFooter 扩展是否已启用
2. 查看 `LocalSettings.php` 中是否有：
   ```php
   wfLoadExtension( 'LanguageBarFooter' );
   ```
3. 检查扩展文件是否完整：
   ```bash
   ls -la extensions/LanguageBarFooter/
   ```

---

## 为什么会出现重复？

- **历史原因**：之前使用的是直接复制代码到 MediaWiki:Vector.js/css 的方式
- **新实现**：现在改用了 LanguageBarFooter 扩展（更规范、更易维护）
- **冲突**：两套代码同时运行，导致显示两个语言栏

删除旧代码后，只会保留扩展版本，问题就解决了。

---

## 推荐方案

**推荐使用方法 2（数据库直接删除）**，因为：
- 无需登录管理员账号
- 操作简单直接
- 不受 MediaWiki 权限限制
- 可以批量处理

如果您不熟悉数据库操作，可以使用方法 1（需要先创建管理员账号）。
