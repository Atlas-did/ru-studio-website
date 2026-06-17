# 儒意 · RU STUDIO — 视觉资产指南

> 统一调性，确保每一件视觉资产都承载品牌质感。

---

## 1. 图片风格规范

### 1.1 色调方向

| 维度 | 要求 |
|------|------|
| 饱和度 | 低饱和，整体偏灰调 |
| 色温 | 暖调偏黄，如宣纸、旧书页 |
| 对比度 | 中高对比，暗部深邃但不死黑 |
| 质感 | 胶片颗粒感、轻微噪点 |
| 光线 | 自然光为主，侧光或逆光营造层次感 |

### 1.2 构图原则

- **留白优先**：画面中至少30%为负空间
- **非对称平衡**：元素不居中，遵循黄金分割
- **纵深层次**：前景-中景-后景至少三个层次
- **纹理细节**：可见材质纹理（纸张纤维、金属光泽、木纹）

### 1.3 禁忌

- 不使用高饱和荧光色
- 不使用纯黑（#000000）背景
- 不出现水印、Logo、UI界面
- 不出现现代电器、塑料感材质
- 不堆砌元素，保持克制

---

## 2. 各场景图片需求

### 2.1 Hero 首屏背景

**当前使用**：`/assets/hero-still-life.jpg`
**建议升级**：
- 一张高质量的静物摄影，展现文房四宝与现代设计工具的并置
- 构图：俯视角度，物品散落但有韵律感
- 光线：柔和侧光，宣纸质感清晰可见
- 色调：暖黄宣纸白 + 墨黑 + 微暖高光

**AI生成提示词模板**：
```
Top-down still life photography, traditional Chinese scholars desk 
objects: ink brush, inkstone, rice paper, bamboo ruler, 
beside modern geometric metal tools. Warm natural side lighting, 
low saturation, film grain texture, cream and ink black color 
palette, 35mm film aesthetic, shallow depth of field, 
minimalist composition with 40% negative space, 
professional product photography, 8k
```

### 2.2 作品展示图

**当前使用**：`/assets/work-bookmark.jpg`, `/assets/crt-temple-texture.jpg`
**建议升级**：

**书签系列**（work-bookmark.jpg）：
- 青铜质感书签的微距摄影
- 背景为宣纸或木质桌面
- 浅景深，焦点在书签雕刻细节

**孔庙墨影**（crt-temple-texture.jpg）：
- 孔庙建筑的黑白摄影
- 强调飞檐、斗拱的线条美感
- 高对比度黑白，胶片颗粒

### 2.3 日志封面图

为每篇日志配一张头图：
- 与日志内容相关的场景
- 统一使用相同的色调处理
- 可添加微妙的paper grain纹理

---

## 3. 视频素材建议

### 3.1 Hero 视频方案（可选升级）

如果未来要使用视频背景：

**参数**：
- 时长：15-20秒循环
- 分辨率：1920x1080 或更高
- 帧率：24fps（电影感）
- 编码：H.264, MP4

**内容方向**：
- 墨水在宣纸上缓缓晕染的延时摄影
- 毛笔书写「儒」字的慢动作
- 孔庙建筑在晨雾中的空镜
- 茶烟袅袅、光影流转

**处理**：
- 叠加轻微噪点
- 色调整体偏暖
- 添加暗角（vignette）
- 视频上方叠加半透明暗色遮罩确保文字可读

---

## 4. SVG 图标规范

- 线条粗细：1px 为主，1.5px 为强调
- 线端样式：round
- 描边而非填充
- 颜色：继承当前文本色

---

## 5. 字体文件

已使用 Google Fonts 加载：
- Playfair Display (300, 400, 500, 600, italic)
- Noto Serif SC (300, 400, 500, 600, 700)
- Inter (300, 400, 500, 600)

如需离线使用，可下载 WOFF2 格式字体文件放入 `/public/fonts/` 目录。

---

## 6. 图片尺寸规范

| 用途 | 推荐尺寸 | 格式 | 文件大小 |
|------|----------|------|----------|
| Hero背景 | 1920x1080 | JPG | < 300KB |
| 作品封面 | 800x600 | JPG | < 150KB |
| 日志头图 | 1200x630 | JPG | < 200KB |
| 缩略图 | 400x300 | JPG | < 50KB |

---

## 7. 批量处理建议

使用以下工具批量统一图片风格：

1. **Lightroom**: 批量应用预设（低饱和、暖调、加颗粒）
2. **Photoshop**: 动作脚本添加paper grain纹理
3. **TinyPNG**: 压缩图片大小
4. **Vite**: 构建时自动处理图片资源

---

*Version: 2.0*
*Last updated: 2026-06-16*
