# Link2QR · 链接转二维码（Chrome 插件）

类似草料的链接转二维码 Chrome 扩展：一键把**当前网页链接**或**任意文本**生成二维码，支持下载 PNG、复制图片/内容、右键菜单生成，可调颜色与导出尺寸。

## 功能

- **点击扩展图标**：自动读取当前标签页 URL 生成二维码（打开即出码）
- **手动输入**：粘贴任意链接 / 文本，实时重绘
- **右键菜单**：对链接 / 页面 / 选中文字 →「生成二维码」，在新标签页打开大图
- **下载 PNG**：按所选尺寸（256 / 512 / 1024 / 2048px）导出，模块整数对齐不糊
- **复制图片 / 复制内容** 到剪贴板
- **颜色可调**：二维码前景色、底色（本地存储记忆）
- 支持中文、Emoji（UTF-8 字节模式），容错级别 M

## 安装（开发者模式）

1. 打开 `chrome://extensions`
2. 右上角打开「开发者模式」
3. 「加载已解压的扩展程序」→ 选择本目录（`link2qr`）
4. 工具栏点图标即可使用

## 目录结构

```
link2qr/
├── manifest.json      # MV3 清单
├── popup.html/css/js  # 弹窗（右键生成时也复用此页，?t= 文本参数）
├── background.js      # 右键菜单 service worker
├── lib/qrcode.js      # qrcode-generator 1.4.4（MIT, Kazuhikoarase）
├── tests/jsQR.js      # jsQR（MIT）——仅验证用，不参与运行
└── icons/             # 16/48/128 图标
```

## 权限说明

| 权限 | 用途 |
| --- | --- |
| activeTab | 读取当前标签页 URL（点开弹窗时） |
| contextMenus | 右键「生成二维码」菜单 |
| storage | 记住颜色 / 导出尺寸偏好 |
| clipboardWrite | 复制图片到剪贴板 |

无任何 host 权限，不访问网页内容。

## 飞书项目

「开发项目」表记录 `reczz28JKHXwHb8Z`（base `KOIrbt4YqaWl05sXdjwczIJ5nei` / 表 `tblWEJxknewXos0D`）。
