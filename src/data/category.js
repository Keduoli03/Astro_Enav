export const CATEGORY_CONFIG = {
  common: {
    name: '常用工具',
    icon: 'far fa-star',
    subItems: [
      {
        id: 'common',
        name: '常用工具',
        icon: 'iconfont icon-heart'
      }
    ]
  },
  movie: {
    name: '影视资源',
    icon: 'fa fa-film',
    subItems: [
      {
        id: 'anime',
        name: '动漫网站',
        icon: 'fa fa-film'
      },
      {
        id: '影视网站',
        name: '影视网站',
        icon: 'fa fa-film'
      },
      {
        id: 'subtitle',
        name: '字幕资源',
        icon: 'iconfont icon-tag'
      }
    ]
  },
  music: {
    name: '音乐资源',
    icon: 'fas fa-music',
    subItems: [
      {
        id: 'musictool',
        name: '音乐工具',
        icon: 'fas fa-music'
      },
    ]
  },
  reader: {
    name: '阅读',
    icon: 'fas  fa-book',
    subItems: [
      {
        id: 'reader',
        name: '电子书',
        icon: 'fas  fa-book'
       }
    ]
  },
  website: {
    name: '网站工具',
    icon: 'fas fa-globe',
    subItems: [
      {
        id: 'website',
        name: '网站',
        icon: 'fas fa-globe'
      },
    ]
  },
  animephoto: {
    name: '壁纸网站',
    icon: 'fas  fa-camera',
    subItems: [
      {
        id: 'animephoto',
        name: '动漫壁纸',
        icon: 'iconfont icon-tag'
       }
    ]
  },
  cloud: {
    name: '网盘搜索',
    icon: 'fas fa-cloud',
    subItems: [
      {
        id: 'cloud',
        name: '网盘搜索',
        icon: 'fas fa-cloud'
      },
    ]
  },
  editor: {
    name: '编程资源',
    icon: 'fa fa-desktop',
    subItems: [
      {
        id: 'editor',
        name: '编程资源',
        icon: 'fa fa-desktop'
       }
    ]
  },
  picturetool: {
    name: '图片工具',
    icon: 'fas fa-image',
    subItems: [
      {
        id: 'picturetool',
        name: '图片工具',
        icon: 'fas fa-image'
      },
    ]
  }
};

// 辅助方法
export const getCategoryList = () => Object.entries(CATEGORY_CONFIG);
export const getSubItems = (categoryId) => CATEGORY_CONFIG[categoryId]?.subItems || [];

// 新增获取名称和图标的专用方法
export const getCategoryName = (key) => CATEGORY_CONFIG[key]?.name || key;
export const getCategoryIcon = (key) => CATEGORY_CONFIG[key]?.icon || 'fas fa-circle';


