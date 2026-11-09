# Google 日历 · 紧凑界面

油猴脚本：`google-calendar-compact.user.js`，版本 **0.2.2**。

## 当前效果

- 顶栏缩小至 80%。
- 创建按钮：左栏展开时保留「创建」文字与下拉箭头，两端全圆；收起时是正圆，加号居中。
- **保留原生左侧栏宽度**，不再提供「左侧日历栏宽度」设置。小月历向右铺开，去掉其右侧多余留白；不整体缩放侧栏。
- 创建按钮到月历导航行的间距缩至 8px。
- 左侧日历列表 12px、小月历 11px，隐藏「找人」及其占位。
- 右侧插件图标栏 40px，移除前方额外的 16px 空白，图标居中；插件内容区保留原生宽度。
- 取消折叠左栏时拉伸日历文字的横向缩放动画，保留日程原字号与原生按钮事件。

## 安装与调整

- **一键安装 / 更新**：在装有 Tampermonkey 的浏览器中直接打开 [`google-calendar-compact.user.js` (Raw)](https://raw.githubusercontent.com/chasezhang1999/google-calendar-compact/main/google-calendar-compact.user.js)，油猴会自动弹出安装或升级界面；日常也可通过 Tampermonkey「检查更新」自动拉取最新版。
- **手动覆盖**：油猴「添加新脚本」，粘贴完整 `.user.js`，保存并刷新日历。已有旧版时直接覆盖原脚本。

油猴菜单可调整：

| 项目 | 默认值 | 范围 |
| --- | --- | --- |
| 顶部工具栏缩放 | 80% | 60–100% |
| 创建按钮缩放 | 75% | 50–100% |
| 左侧日历列表字号 | 12px | 10–16px |
| 左侧小月历字号 | 11px | 9–14px |
| 右侧插件栏宽度 | 40px | 36–56px |

修改后立即生效并保存；可恢复默认尺寸。关闭脚本并刷新即可恢复原样。

## 实现与维护

只注入一份 CSS，无全页扫描、MutationObserver、鼠标/键盘拦截或网络请求。不进入 Tasks iframe。

2026-10-29 在用户登录的真实页面核对：

| 部件 | 定位与调整 |
| --- | --- |
| 顶栏 | `header#gb`，局部 zoom |
| 创建区域 / 占位 | `.dwlvNd` / `.QQYuzf .LXjtcc`，基础按钮高 36px；占位为缩放后按钮高度 + 8px |
| 创建菜单触发器 | `.dwlvNd button[jsname="todz4c"]` |
| 展开 / 收起的创建按钮 | `.gPr58d` / `.WFZWpc`（Google 会替换整颗按钮） |
| 展开内容 / 收起图标容器 | `.x5FT4e`、`.bjMtic` / `.t9Sj3d-Q0XOV` |
| 左栏 / 滚动内容 | `.QQYuzf` / `.hEtGGf`，不覆盖原生栏宽及折叠位移 |
| 小月历 | `#drawerMiniMonthNavigator .iGiNKd`，左边距 12px、右边距 0；表格 `.ei1jbe` 占满内容宽度 |
| 月历上方间距 | 清除 `#drawerMiniMonthNavigator` 的顶边距、顶内边距，以及 `.iGiNKd` 的顶内边距 |
| 找人整块 | `.QQYuzf .qXIcZc:has(.TBA7qc)`，隐藏整块及占位 |
| 插件图标栏 | `.gboEAb`，包含 `[role=tablist]` 和 `[role=tab]` |
| 插件内容面板 | `.dOqRGf`，仅清除左外边距，不缩放内容 |
| 右下角开关 | `.Kk7lMc-QWPxkf-LgbsSe-haAclf` / `.Kk7lMc-QWPxkf-LgbsSe` |

Google 使用 Web Animations 对 `.lYYbjc` 做 scaleX，导致文字被横向压缩再回弹；用 `transform: none !important` 保持真实比例。左栏自身的变换也禁用，原生显示/隐藏照常执行。

设置迁移标记为 `sizes.layoutVersion: 2`。旧的 leftWidth 设置被移除；上一版的 32px 右栏恢复为 40px，其余自定义尺寸保留。
保持 @name 和 @namespace 不变，便于覆盖旧版。Google 内部类名可能随版本变化。

## 验证（2026-10-29）

通过 Chrome Apple Events 检查真实 DOM、计算样式、矩形和点击命中，并操作原生控件。

- 左侧栏恢复原生 256px；小月历表格宽 236px，最右侧日期按钮到侧栏边缘空白约 12.9px，全部日期按钮完整显示。
- 创建按钮到月历导航行间距为 8px；无整体横向溢出。
- 右侧图标栏 40px，前方无额外空白，图标水平居中。
- 折叠时采样 40 帧，日历外层 transform 均为 none，20 个抽样文字节点字号不变。
- 继承此前真实页面验证：创建菜单可打开；收起按钮为 27×27px，图标横纵中心误差为 0；Keep 内容面板保持原生 320px 宽。
- 油猴保存后刷新，重新核验原生栏宽、日期右侧空白、上下间距与右栏尺寸。
- Node.js 语法检查通过。

`output/playwright/` 里的截图是早期 0.1.x 模拟页面，不能代表 0.2.x 的真实效果。
