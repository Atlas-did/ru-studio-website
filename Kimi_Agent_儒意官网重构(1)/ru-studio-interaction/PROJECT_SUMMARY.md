# RU STUDIO 网站项目完整总结

> 项目地址：https://ru-studio-website-production.up.railway.app
> 管理后台：https://ru-studio-website-production.up.railway.app/#/admin
> GitHub：https://github.com/Atlas-did/ru-studio-website
> Gitee：https://gitee.com/Atlas_fay/ru-studio-website

---

## 一、项目概况

"儒意 · RU STUDIO" 儒家文化影像文创品牌官网。技术栈：

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Tailwind CSS + shadcn/ui + GSAP + Lenis |
| 后端 | Express 5 + Node.js 内置 SQLite (node:sqlite) |
| 部署 | Railway.app（免费套餐每月 $5 额度） |
| 域名 | `ru-studio-website-production.up.railway.app`（Railway 免费子域名） |

---

## 二、已完成功能清单

### 前端页面
| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero CRT 画布 + 核心概念 + 精选作品 + 视差条 + 日志预览 + CTA |
| 关于 | `/about` | 品牌使命/愿景/业务/规划（后台可编辑） |
| 作品收藏 | `/collection` | 分类筛选 + 作品卡片 |
| 作品详情 | `/collection/:slug` | 大图 + 标签 + 长文介绍 |
| 宣发日志 | `/journal` | 日志列表 |
| 日志详情 | `/journal/:slug` | 完整文章页（像公众号图文） |
| 合作联系 | `/cooperation` | 联系表单（存入数据库） |

### 管理后台 (`/admin`)
| 页面 | 路由 | 功能 |
|------|------|------|
| 登录 | `/admin/login` | JWT 认证 |
| 仪表盘 | `/admin` | 数据统计概览 |
| 站点配置 | `/admin/config` | 品牌名、标语、邮箱 |
| 关于页面 | `/admin/about` | 编辑使命/愿景/业务/规划 |
| 核心概念 | `/admin/concepts` | 增删改查 4 个概念 |
| 作品收藏 | `/admin/collection` | 增删改 + 图片上传 + 详情编辑 |
| 宣发日志 | `/admin/journal` | 增删改 + 封面图上传 + 正文编辑 |

### 视觉特效
- Hero 区域 CRT 画布（扫描线 + 噪点 + 色差 + 荧光 + 鼠标跟随暗角）
- 段落间渐变过渡（墨水晕染效果）
- 双重视差文字条（两层反向滚动）
- 3D 倾斜卡片（TiltCard 鼠标跟随透视）
- 自定义光标（朱红色圆点，悬停放大）
- 滚动进度条（页面顶部朱红色线）
- 按钮点击缩放微交互
- Footer 底部径向渐变淡出

### 后端 API
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/site-config` | GET | 获取品牌配置 |
| `/api/concepts` | GET | 获取核心概念 |
| `/api/collection` | GET | 获取作品列表 |
| `/api/journal` | GET | 获取日志列表 |
| `/api/about` | GET | 获取关于页面章节 |
| `/api/contact` | POST | 提交联系表单 |
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/*` | CRUD | 各类资源的增删改查 |
| `/api/admin/upload` | POST | 图片上传 |

---

## 三、重要注意事项

### 1. 管理员密码
- **默认密码**：`admin123`
- **登录地址**：`/#/admin`
- ⚠️ 密码存储在数据库中，修改密码需要直接改数据库或通过 API
- ⚠️ 建议在 Railway 环境变量中设置 `JWT_SECRET` 增强安全性

### 2. 邮箱配置
联系表单的数据**始终会存入数据库**（可在管理后台查看）。
但要收到邮件通知，需要在 Railway 设置 SMTP 环境变量：

| 变量名 | 说明 |
|--------|------|
| `SMTP_HOST` | SMTP 服务器地址（如 smtp.qq.com） |
| `SMTP_PORT` | 端口（如 587） |
| `SMTP_USER` | 发件邮箱 |
| `SMTP_PASS` | 邮箱授权码 |
| `SMTP_SECURE` | 是否 SSL（填 `true` 或 `false`） |
| `NOTIFY_EMAIL` | 收通知的邮箱 |

### 3. 字体
当前使用 Google Fonts CDN（Playfair Display、Inter、Noto Serif SC）。
⚠️ **Google Fonts 在中国大陆可能被屏蔽**，建议下载 .woff2 字体文件放入 `public/fonts/` 并修改 `src/index.css` 添加 `@font-face` 声明。

### 4. 数据库持久化
- Railway 免费套餐下，每次重新部署**数据库会重置**（SQLite 文件不持久化）
- 升级 Railway 套餐或使用 Volume 挂载可以解决
- 当前种子数据会在首次启动时自动填充

### 5. 关于 Gitee
- 代码也推送到了 Gitee（`Atlas_fay/ru-studio-website`）
- Gitee 可以作为 GitHub 的国内镜像
- Gitee Pages 可以作为静态备用镜像（`*.gitee.io` 免费域名）

### 6. 部署流程
1. 本地修改代码
2. `git add -A && git commit -m "message"`
3. `git push`（推送到 GitHub）
4. Railway 自动检测并重新部署（约 2-3 分钟）
5. 查看 Railway Dashboard → Deployments 确认部署成功

### 7. Node.js 版本
- Railway 使用 Node.js v22.22.3
- 本地开发使用 Node.js v25.8.0
- 使用 Node.js 内置 `node:sqlite` 模块（v22.5+ 可用），不需要 `better-sqlite3`

---

## 四、踩过的坑 & 犯过的错

### 🔴 错误 1：Express 5 的路由通配符语法变了
- **现象**：`app.get('*', ...)` 报错 `Missing parameter name at index 1: *`
- **原因**：Express 5 使用新版 path-to-regexp，`*` 不再是合法语法
- **修复**：改成 `app.get('/{*path}', ...)`
- **文件**：`server/index.js`

### 🔴 错误 2：TypeScript 类型语法写进了 .js 文件
- **现象**：Railway 崩溃，报 `SyntaxError: Unexpected identifier 'as'` 和 `Missing initializer in const declaration`
- **原因**：在 `server/routes/public.js` 里写了 `(emailErr as Error).message`（TypeScript 的 `as` 类型断言），在 `server/db.js` 里写了 `const contentMap: Record<string, string>`（TypeScript 的类型标注）。`.js` 文件在 Node.js 中不能使用 TypeScript 语法！
- **修复**：
  - `(emailErr as Error).message` → `emailErr.message`
  - `const contentMap: Record<string, string> = {` → `const contentMap = {`
- **教训**：写 `.js` 文件时要完全用纯 JavaScript，不能用任何 TypeScript 语法

### 🔴 错误 3：ES Module 中 `__dirname` 不可用
- **现象**：`ReferenceError: __dirname is not defined in ES module scope`
- **原因**：`package.json` 里有 `"type": "module"`，所有 `.js` 文件被当成 ES Module 处理，`__dirname` 只在 CommonJS 中可用
- **修复**：在每个需要 `__dirname` 的文件顶部加上：
  ```js
  import { fileURLToPath } from 'url';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  ```
- **文件**：`server/db.js`、`server/index.js`、`server/routes/admin.js`

### 🔴 错误 4：API 数据覆盖了前端的初始数据导致内容"闪现消失"
- **现象**：点开日志详情页，文章内容闪了一下就消失
- **原因**：前端组件用 `initialData` 渲染了完整的硬编码内容，然后 `useSiteData` Hook 从 API 获取了数据库中的数据。但数据库里的旧数据 `content` 字段是空的（因为 `ALTER TABLE` 只是加了列，没填充已存在的行），空内容覆盖了前端初始完整内容
- **修复**：
  1. 在 `server/db.js` 中添加数据库迁移：对已存在的行用 UPDATE 填充 content
  2. 在 `src/hooks/useSiteData.ts` 中添加合并逻辑：如果 API 返回空字段而初始数据有值，保留初始数据
- **教训**：给数据库表加新列后，需要考虑已存在的数据行

### 🔴 错误 5：没有检查推送状态就以为是新代码的问题
- **现象**：改完代码提交了，但 Railway 还是报同样的错误
- **原因**：只做了 `git commit`，忘记 `git push`。GitHub 上还是旧代码，Railway 部署的还是旧代码
- **教训**：改完代码后立即 `git push` 并用 `git log --oneline` 确认最新提交已推送

### 🟡 注意 6：`better-sqlite3` 需要原生编译
- **现象**：`npm install better-sqlite3` 失败
- **原因**：`better-sqlite3` 包含 C++ 代码需要通过 node-gyp 编译，但编译环境中 node 不在 PATH
- **解决**：改用 Node.js 内置的 `node:sqlite` 模块（v22.5+），完全不需要编译

### 🟡 注意 7：Git Bash 环境中基础命令缺失
- **现象**：`ls`、`grep`、`mkdir`、`sleep`、`head`、`curl` 等命令都不可用
- **解决**：使用 Node.js 脚本来代替 shell 命令，或直接使用工具对应的功能（Grep、Glob、Write 等）

---

## 五、常用命令速查

```bash
# 启动 Vite 开发服务器（仅前端，用硬编码数据）
npm run dev

# 启动完整后端服务器（前端 + API + 数据库）
node server/index.js

# TypeScript 类型检查 + 构建
npm run build

# Git 提交并推送
git add -A
git commit -m "描述改动"
git push

# 查看最近的提交
git log --oneline -5

# 查看 Git 状态
git status

# 同时推送到 Gitee（如果已配置 remote）
git push gitee main
```

---

## 六、下一步可做的

- [ ] 把 Google Fonts 换成本地字体文件（解决国内加载慢的问题）
- [ ] 配置 SMTP 环境变量让联系表单真正发邮件
- [ ] 给日志添加更多图片上传（目前只支持一张封面图）
- [ ] 添加图片优化（压缩、WebP 转换）
- [ ] 设置 Railway Volume 让数据库持久化
- [ ] 给 Gitee Pages 配置静态部署作为备用镜像
- [ ] 添加网站访问统计
- [ ] SEO 优化（meta 标签、sitemap）
