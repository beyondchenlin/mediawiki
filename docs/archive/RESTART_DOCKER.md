# Docker 重启和验证指南

> ???????????????
> ??????????????????????
> ???2026-01-22


## 1. 查看运行中的容器

```bash
docker ps
```

找到你的 MediaWiki 容器名称或 ID。

## 2. 重启 Docker 容器

### 方法 A: 重启单个容器
```bash
# 使用容器名称
docker restart <container-name>

# 或使用容器 ID
docker restart <container-id>
```

### 方法 B: 如果使用 docker-compose
```bash
# 在包含 docker-compose.yml 的目录中
docker-compose restart

# 或者重新构建并启动
docker-compose down
docker-compose up -d
```

## 3. 清除 MediaWiki 缓存

### 选项 1: 删除缓存文件（最彻底）
```bash
# 在容器内
docker exec -it <container-name> rm -rf /var/www/html/cache/*

# 或在宿主机（如果 cache 目录已挂载）
rm -rf D:\demo\demo1\mediawiki-master\cache\*.cdb
```

### 选项 2: 运行维护脚本
```bash
# 重建本地化缓存
docker exec -it <container-name> php maintenance/rebuildLocalisationCache.php

# 清除所有缓存
docker exec -it <container-name> php maintenance/purgeList.php --all
```

### 选项 3: 在 MediaWiki 中手动清除
1. 登录 MediaWiki 管理员账户
2. 访问 `Special:Version` 页面
3. 点击 "清除缓存" 或访问 `index.php?title=Special:BlankPage&action=purge`

## 4. 浏览器强制刷新

重启后，在浏览器中访问你的 MediaWiki 站点并强制刷新：

- **Windows/Linux**: `Ctrl + Shift + R` 或 `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

## 5. 验证修复

访问任意 MediaWiki 页面，检查：

✅ **语言栏只显示一次**（不再重复）
✅ **样式匹配官方 MediaWiki**（灰色背景，左侧标签，右侧语言链接）
✅ **响应式布局正常**（桌面端左右分栏，移动端上下堆叠）
✅ **深色模式正常**（如果启用）

## 6. 调试（如果问题仍存在）

### 检查浏览器控制台
```
F12 → Console 标签
查看是否有 JavaScript 错误
```

### 检查 ResourceLoader 是否加载了新文件
```
F12 → Network 标签 → 刷新页面
查找 language-bar.js 和 language-bar.css
检查文件内容是否是最新的
```

### 强制 MediaWiki 重新加载资源
在 URL 后添加 `?debug=true`：
```
http://localhost/index.php?debug=true
```

这会禁用 ResourceLoader 的缓存和压缩。

## 7. 常见问题

**Q: 重启后仍然看到重复的语言栏？**
A: 清除浏览器缓存（Ctrl+Shift+Delete）并强制刷新

**Q: 样式没有更新？**
A: 检查 ResourceLoader 缓存，运行 `php maintenance/rebuildLocalisationCache.php`

**Q: Docker 容器无法启动？**
A: 检查日志 `docker logs <container-name>`
