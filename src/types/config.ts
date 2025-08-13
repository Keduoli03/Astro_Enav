export type LIGHT_DARK_MODE = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: LIGHT_DARK_MODE;
  hue?: number;
}

export interface ThemeTransitionOptions {
  duration?: number;
  easing?: string;
}