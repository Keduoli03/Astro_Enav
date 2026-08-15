import purgeCss from '@fullhuman/postcss-purgecss';

const productionPlugins = process.env.NODE_ENV === 'production'
  ? [
      purgeCss({
        content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
        // Two extractors unioned. The first is the original word-ish pass that
        // the Bootstrap/global CSS relies on. The second is Tailwind's own
        // permissive pass, needed because `[\w-/:]+` cannot see `.` `[` `]`
        // `(` — so every arbitrary-value and decimal utility (`h-[30px]`,
        // `gap-3.5`, `bg-[color-mix(...)]`) was being purged away.
        defaultExtractor: (content) => [
          ...(content.match(/[\w-/:]+(?<!:)/g) || []),
          ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
        ],
        keyframes: true,
        safelist: {
          standard: [
            'active',
            'close',
            'collapsing',
            'd-none',
            'expanding',
            'fade',
            'fallback',
            'io-black-mode',
            'io-grey-mode',
            'is-loading',
            'is-ready',
            'loaded',
            'loading',
            'modal-open',
            'open',
            'page-loading',
            'show',
          ],
          deep: [
            /^astro-/,
            /^css-/,
            /^header-/,
            /^icon-/,
            /^io-/,
            /^modal-/,
            /^search-/,
            /^sidebar-/,
            /^site-/,
            /^tool-/,
            /^url-/,
          ],
        },
      }),
    ]
  : [];

export default { plugins: productionPlugins };
