export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@formkit/auto-animate/nuxt',
    '@nuxtjs/mdc',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    'nuxt-svgo',
    '@nuxtjs/i18n'
  ],

  ssr: false,
  devtools: { enabled: true },

  // 应用配置
  app: {
    buildAssetsDir: '/nuxt/', // 相对路径，注意不要以斜杠开头
    pageTransition: {
      name: 'slide',
      mode: 'out-in' // default
    }
  },
  css: ['~/assets/css/main.css'],

  // Markdown配置
  mdc: {
    headings: {
      anchorLinks: false
    },
    highlight: {
      // noApiRoute: true
      shikiEngine: 'javascript'
    }
  },

  // 实验性功能
  experimental: {
    viewTransition: true,
    // 禁用有效负载提取，避免生成_payload.json文件
    payloadExtraction: false
  },
  compatibilityDate: '2025-01-21',

  // Nitro配置
  nitro: {
    devProxy: {
      '/api': {
        target: import.meta.env.VITE_API_PROXY_URL, // 这里是接口地址
        changeOrigin: true,
        prependPath: true
      }
    },
    prerender: {
      crawlLinks: true,
      ignore: [],
      failOnError: false
    }
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }

    }
  }
})
