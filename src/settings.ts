export const SITE_TITLE = '网站导航';
export const SITE_DESCRIPTION = '在线网址导航';
export const SITE_FAVICON = '/images/favicon.png';
// 明暗模式下的logo
export const SITE_LOGO = '/images/logo.png';
export const SITE_LOGO_DARK = '/images/logo.png';

// - 仅 SEARCH_BG ：顶部有图，下面保留网格
// - SEARCH_BG + CONTENT_BG ：顶部与内容各自用图，不显示网格
// - 仅 CONTENT_BG ：整页全屏图
// - 夜间模式同理，若配置了 _DARK 变量则使用夜间图，否则自动回退到浅色图

export const SEARCH_BG = '';
export const CONTENT_BG = 'http://gcore.jsdelivr.net/gh/Keduoli03/My_img@main/image/好朋友.png';
export const SEARCH_BG_DARK = '';
export const CONTENT_BG_DARK = 'http://gcore.jsdelivr.net/gh/Keduoli03/My_img@main/image/tree.jpg';

// 背景毛玻璃强度（单位：px）
export const SEARCH_BG_BLUR = 0;
export const CONTENT_BG_BLUR = 4;
export const SEARCH_BG_BLUR_DARK = 0;
export const CONTENT_BG_BLUR_DARK = 6;

export const SITE_BG = CONTENT_BG;
// 侧边栏背景毛玻璃强度（px）
export const SIDEBAR_BLUR = 12; 
// 浅色模式下侧边栏背景透明度（0~1，越小越透明）
export const SIDEBAR_OPACITY = 0.65; 
// 暗色模式下侧边栏背景透明度（0~1）
export const SIDEBAR_OPACITY_DARK = 0.55; 
export const SIDEBAR_POPUP_OPACITY = 0.75; // 浅色模式下侧边栏弹出菜单背景透明度（0~1）
export const SIDEBAR_POPUP_OPACITY_DARK = 0.7; // 暗色模式下侧边栏弹出菜单背景透明度（0~1）
export const SIDEBAR_BORDER_COLOR_LIGHT = 'rgba(0,0,0,0.06)'; // 浅色模式侧边栏边框/分隔线颜色
export const SIDEBAR_BORDER_COLOR_DARK = 'rgba(255,255,255,0.06)'; // 暗色模式侧边栏边框/分隔线颜色