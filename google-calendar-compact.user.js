// ==UserScript==
// @name         Google 日历 · 紧凑界面
// @namespace    chase.google-calendar-compact
// @version      0.2.2
// @description  紧凑顶栏、圆形/胶囊创建按钮、窄侧栏及小字号，隐藏找人；尺寸可在油猴菜单调整。
// @license      MIT
// @match        https://calendar.google.com/calendar/*
// @run-at       document-start
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @homepageURL  https://github.com/chasezhang1999/google-calendar-compact
// @supportURL   https://github.com/chasezhang1999/google-calendar-compact/issues
// @updateURL    https://raw.githubusercontent.com/chasezhang1999/google-calendar-compact/main/google-calendar-compact.user.js
// @downloadURL  https://raw.githubusercontent.com/chasezhang1999/google-calendar-compact/main/google-calendar-compact.user.js
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'chase-calendar-compact-style';
  const OPTIONS = {
    header: { label: '顶部工具栏缩放', value: 80, min: 60, max: 100, unit: '%' },
    create: { label: '创建按钮缩放', value: 75, min: 50, max: 100, unit: '%' },
    sidebar: { label: '左侧日历列表字号', value: 12, min: 10, max: 16, unit: 'px' },
    mini: { label: '左侧小月历字号', value: 11, min: 9, max: 14, unit: 'px' },
    rightWidth: { label: '右侧插件栏宽度', value: 40, min: 36, max: 56, unit: 'px' },
  };
  let saved = {};
  try {
    saved = GM_getValue('sizes', {}) || {};
  } catch (error) {
    console.warn('[日历紧凑界面] 读取设置失败，使用默认尺寸。', error);
  }
  // 恢复原生左栏宽度；升级时把上一版过窄的右栏恢复为 40px。
  const migrate = saved.layoutVersion !== 2;
  if (migrate && saved.rightWidth === 32) saved.rightWidth = OPTIONS.rightWidth.value;
  const sizes = Object.fromEntries(Object.entries(OPTIONS).map(([key, option]) => {
    const value = saved[key];
    return [key, typeof value === 'number' && Number.isFinite(value) &&
      value >= option.min && value <= option.max ? value : option.value];
  }));

  if (migrate) GM_setValue('sizes', { ...sizes, layoutVersion: 2 });

  let style;
  function render() {
    if (!document.documentElement) return;
    style = document.getElementById(STYLE_ID) || document.createElement('style');
    style.id = STYLE_ID;
    // 顶栏用局部 zoom；创建按钮同时压缩高度与侧栏预留位置。
    // 不对 body、主日程网格、弹出的事件编辑器或 Tasks 内嵌页缩放。
    // #gb 是 Google 顶栏；QQYuzf / dwlvNd 是日历左栏 / 创建区域。
    style.textContent = `
header#gb {
  zoom: ${sizes.header / 100} !important;
}
.dwlvNd {
  zoom: ${sizes.create / 100} !important;
  left: ${16 / (sizes.create / 100)}px !important;
  width: max-content !important;
  height: 36px !important;
  min-height: 0 !important;
  margin-block: 0 !important;
  padding-block: 0 !important;
  border-radius: 999px !important;
}
/* todz4c 是原生创建菜单的触发器；不改菜单里的控件。 */
.dwlvNd button[jsname="todz4c"] {
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: auto !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  min-width: 0 !important;
  padding: 0 12px !important;
  border-radius: 999px !important;
  font-size: 14px !important;
  line-height: normal !important;
}
.dwlvNd button[jsname="todz4c"] > .x5FT4e {
  padding: 0 !important;
}
.dwlvNd .bjMtic {
  gap: 6px !important;
}
/* 收起左栏后 Google 换成另一种按钮，宽高和内部图标必须一起重置。 */
.dwlvNd button[jsname="todz4c"].WFZWpc {
  width: 36px !important;
  padding: 0 !important;
}
.dwlvNd button[jsname="todz4c"] > .t9Sj3d-Q0XOV {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: static !important;
  width: 20px !important;
  height: 20px !important;
  margin: 0 !important;
  padding: 0 !important;
}
.dwlvNd button[jsname="todz4c"] .google-material-icons {
  font-size: 20px !important;
  line-height: 1 !important;
}
.dwlvNd button[jsname="todz4c"] > :is(.UTNHae, .XjoK4b) {
  border-radius: inherit !important;
}
/* 创建按钮是独立浮层时，左栏仍有原生占位；它必须一起变矮。 */
.QQYuzf .LXjtcc,
.LXjtcc:has(.dwlvNd) {
  box-sizing: border-box !important;
  height: ${36 * sizes.create / 100 + 8}px !important;
  min-height: 0 !important;
  flex: 0 0 auto !important;
  margin-block: 0 !important;
  padding-block: 0 !important;
}
.QQYuzf {
  padding-top: 0 !important;
}
/* 原生 scaleX 动画会把日历文字拉扁；保持原尺寸直接重排。 */
.QQYuzf,
.lYYbjc {
  transform: none !important;
  transition: none !important;
  animation: none !important;
}
.QQYuzf > .YO50ue {
  width: 100% !important;
  min-width: 0 !important;
}
.QQYuzf .hEtGGf {
  width: auto !important;
  min-width: 0 !important;
}
/* 保留原生左栏宽度，让小月历向右铺开，去掉其右侧多余留白。 */
#drawerMiniMonthNavigator {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
#drawerMiniMonthNavigator .iGiNKd {
  box-sizing: border-box !important;
  width: calc(100% - 12px) !important;
  min-width: 0 !important;
  margin-inline-start: 12px !important;
  margin-inline-end: 0 !important;
  padding-inline: 0 !important;
  padding-top: 0 !important;
}
#drawerMiniMonthNavigator .ei1jbe {
  width: 100% !important;
}
#drawerMiniMonthNavigator .ei1jbe td {
  padding-inline: 0 !important;
}
/* 整块隐藏找人，同时移除它的上下占位。 */
.QQYuzf .qXIcZc:has(.TBA7qc) {
  display: none !important;
}
/* 内容面板关闭时也会留下原生 16px 外边距，要一起移除。 */
.dOqRGf {
  margin-inline-start: 0 !important;
}
/* 只缩插件图标轨道，保留点开后的插件内容面板。 */
.gboEAb,
.gboEAb > .Kk7lMc-DWWcKd-OomVLb-Ku9FSb-haAclf,
.gboEAb [role="tablist"],
.gboEAb [role="tab"],
.Kk7lMc-QWPxkf-LgbsSe-haAclf,
.Kk7lMc-QWPxkf-LgbsSe {
  width: ${sizes.rightWidth}px !important;
  min-width: 0 !important;
}
.gboEAb [role="tab"],
.Kk7lMc-QWPxkf-LgbsSe-haAclf,
.Kk7lMc-QWPxkf-LgbsSe {
  height: 40px !important;
}
.gboEAb > .Kk7lMc-DWWcKd-OomVLb-Ku9FSb-haAclf {
  margin-bottom: 40px !important;
}
:is(.gboEAb [role="tab"], .Kk7lMc-QWPxkf-LgbsSe) >
:is(.DWWcKd-OomVLb-LgbsSe-Bz112c-haAclf, .DWWcKd-OomVLb-LgbsSe-Bz112c-AHe6Kc) {
  width: ${Math.min(32, sizes.rightWidth)}px !important;
  height: 32px !important;
  left: calc(50% - ${Math.min(32, sizes.rightWidth) / 2}px) !important;
  top: 4px !important;
}
.gboEAb [role="separator"] {
  width: 20px !important;
  margin-inline: auto !important;
}
/* 用明确字号缩小文字，保留原生滚动和菜单开关。 */
.QQYuzf :is(div, span, label, button, a, input, td, th, h1, h2, h3, h4, h5, h6):not(
  .dwlvNd, .dwlvNd *,
  [class*="material-icons"], [class*="material-symbols"],
  [class*="material-icons"] *, [class*="material-symbols"] *,
  [role="tooltip"], [role="tooltip"] *,
  [role="dialog"], [role="dialog"] *,
  [role="menu"], [role="menu"] *
) {
  font-size: ${sizes.sidebar}px !important;
}
.QQYuzf [role="grid"] :is(div, span, button, a, td, th):not(
  [class*="material-icons"], [class*="material-symbols"],
  [class*="material-icons"] *, [class*="material-symbols"] *
),
.QQYuzf [role="gridcell"],
.QQYuzf [role="columnheader"] {
  font-size: ${sizes.mini}px !important;
}
`;
    if (!style.isConnected) document.documentElement.append(style);
  }

  function save() {
    GM_setValue('sizes', { ...sizes, layoutVersion: 2 });
    render();
    // 提醒依赖顶栏高度的页面布局重新测量；不改日历自身设置。
    window.dispatchEvent(new Event('resize'));
  }

  for (const [key, option] of Object.entries(OPTIONS)) {
    GM_registerMenuCommand(`${option.label}…`, () => {
      const answer = window.prompt(
        `${option.label}（${option.min}–${option.max}${option.unit}）\n默认 ${option.value}${option.unit}，保存后立即生效。`,
        String(sizes[key])
      );
      if (answer === null) return;
      const value = Number(answer.trim());
      if (!answer.trim() || !Number.isFinite(value) || value < option.min || value > option.max) {
        window.alert(`请输入 ${option.min}–${option.max} 之间的数字。`);
        return;
      }
      sizes[key] = value;
      save();
    });
  }
  GM_registerMenuCommand('恢复默认尺寸', () => {
    for (const [key, option] of Object.entries(OPTIONS)) sizes[key] = option.value;
    save();
  });

  // CSS 自动作用于 Google 后续重绘的节点，无需全页 MutationObserver。
  render();
  if (!document.documentElement) {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  }
})();
