export const CATEGORY_CONFIG = {
  common: {
    name: "常用工具",
    icon: "ri:apps-2-line",
    subItems: [
      {
        id: "common",
        name: "常用工具",
        icon: "ri:heart-line",
      },
    ],
  },
  media: {
    name: "影音资源",
    icon: "ri:film-line",
    subItems: [
      {
        id: "anime",
        name: "动漫网站",
        icon: "ri:image-line",
      },
      {
        id: "影视网站",
        name: "影视网站",
        icon: "ri:movie-line",
      },
      {
        id: "subtitle",
        name: "字幕资源",
        icon: "ri:price-tag-3-line",
      },
      {
        id: "musictool",
        name: "音乐工具",
        icon: "ri:music-2-line",
      },
      {
        id: "animephoto",
        name: "动漫壁纸",
        icon: "ri:price-tag-3-line",
      },
    ],
  },
  search: {
    name: "资源搜索",
    icon: "ri:search-line",
    subItems: [
      {
        id: "cloud",
        name: "网盘搜索",
        icon: "ri:cloud-line",
      },
      {
        id: "reader",
        name: "电子书",
        icon: "ri:book-line",
      },
    ],
  },
  webdev: {
    name: "网站与开发",
    icon: "ri:code-box-line",
    subItems: [
      {
        id: "website",
        name: "站点检测",
        icon: "ri:global-line",
      },
      {
        id: "editor",
        name: "编程资源",
        icon: "ri:macbook-line",
      },
      {
        id: "api",
        name: "API工具",
        icon: "ri:code-line",
      },
    ],
  },
  creative: {
    name: "创作工具",
    icon: "ri:palette-line",
    subItems: [
      {
        id: "picturetool",
        name: "图片工具",
        icon: "ri:image-line",
      },
      {
        id: "videotool",
        name: "视频工具",
        icon: "ri:video-line",
      },
      {
        id: "drawing",
        name: "绘图工具",
        icon: "ri:image-edit-line",
      },
    ],
  },
  system: {
    name: "系统工具",
    icon: "ri:computer-line",
    subItems: [
      {
        id: "windows",
        name: "Windows 工具",
        icon: "ri:windows-line",
      },
    ],
  },
  ai: {
    name: "AI 工具",
    icon: "ri:robot-2-line",
    subItems: [
      {
        id: "ai-model",
        name: "模型与运行",
        icon: "ri:cpu-line",
      },
      {
        id: "ai-generate",
        name: "AI 生成",
        icon: "ri:magic-line",
      },
      {
        id: "ai-chat",
        name: "AI 对话",
        icon: "ri:chat-voice-line",
      },
    ],
  },
  tools: {
    name: "实用工具",
    icon: "ri:tools-line",
    subItems: [
      {
        id: "tools",
        name: "实用工具",
        icon: "ri:apps-line",
      },
    ],
  },
};

// 辅助方法
export const getCategoryList = () => Object.entries(CATEGORY_CONFIG);
export const getSubItems = (categoryId) =>
  CATEGORY_CONFIG[categoryId]?.subItems || [];

// 新增获取名称和图标的专用方法
export const getCategoryName = (key) => CATEGORY_CONFIG[key]?.name || key;
export const getCategoryIcon = (key) =>
  CATEGORY_CONFIG[key]?.icon || "ri:apps-2-line";
