import I18nKey from './i18nKey';

const translations = {
  [I18nKey.lightMode]: '浅色模式',
  [I18nKey.darkMode]: '深色模式',
  [I18nKey.autoMode]: '跟随系统'
};

export function i18n(key: I18nKey): string {
  return translations[key] || key;
}