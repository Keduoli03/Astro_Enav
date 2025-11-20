export const CATEGORY_CONFIG = {
  common: {
    name: '常用工具',
    icon: 'ri:apps-2-line',
    subItems: [
      {
        id: 'common',
        name: '常用工具',
        icon: 'ri:heart-line'
      }
    ]
  },
  movie: {
    name: '影视资源',
    icon: 'ri:movie-2-line',
    subItems: [
      {
        id: 'anime',
        name: '动漫网站',
        icon: 'ri:image-line'
      },
      {
        id: '影视网站',
        name: '影视网站',
        icon: 'ri:movie-line'
      },
      {
        id: 'subtitle',
        name: '字幕资源',
        icon: 'ri:price-tag-3-line'
      }
    ]
  },
  music: {
    name: '音乐资源',
    icon: 'ri:music-2-line',
    subItems: [
      {
        id: 'musictool',
        name: '音乐工具',
        icon: 'ri:music-2-line'
      },
    ]
  },
  reader: {
    name: '阅读',
    icon: 'ri:book-line',
    subItems: [
      {
        id: 'reader',
        name: '电子书',
        icon: 'ri:book-line'
       }
    ]
  },
  website: {
    name: '网站工具',
    icon: 'ri:global-line',
    subItems: [
      {
        id: 'website',
        name: '网站',
        icon: 'ri:global-line'
      },
    ]
  },
  animephoto: {
    name: '壁纸网站',
    icon: 'ri:image-line',
    subItems: [
      {
        id: 'animephoto',
        name: '动漫壁纸',
        icon: 'ri:price-tag-3-line'
       }
    ]
  },
  cloud: {
    name: '网盘搜索',
    icon: 'ri:cloud-line',
    subItems: [
      {
        id: 'cloud',
        name: '网盘搜索',
        icon: 'ri:cloud-line'
      },
    ]
  },
  editor: {
    name: '编程资源',
    icon: 'ri:macbook-line',
    subItems: [
      {
        id: 'editor',
        name: '编程资源',
        icon: 'ri:macbook-line'
       }
    ]
  },
  picturetool: {
    name: '图片工具',
    icon: 'ri:image-line',
    subItems: [
      {
        id: 'picturetool',
        name: '图片工具',
        icon: 'ri:image-line'
      },
    ]
  }
};

// 辅助方法
export const getCategoryList = () => Object.entries(CATEGORY_CONFIG);
export const getSubItems = (categoryId) => CATEGORY_CONFIG[categoryId]?.subItems || [];

// 新增获取名称和图标的专用方法
export const getCategoryName = (key) => CATEGORY_CONFIG[key]?.name || key;
export const getCategoryIcon = (key) => CATEGORY_CONFIG[key]?.icon || 'ri:apps-2-line';


