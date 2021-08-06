const Encore = require('@symfony/webpack-encore')

if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev')
}

Encore
  .enableSingleRuntimeChunk()

  .setOutputPath(`docs/build`)
  .setPublicPath(`/build`)

  .cleanupOutputBeforeBuild()
  .addEntry('index', './docs/index.js')

  .enableVueLoader(
    () => {
    },
    {
      runtimeCompilerBuild: false
    }
  )

  .configureDefinePlugin((options) => {
    options.__VUE_OPTIONS_API__ = true
    options.__VUE_PROD_DEVTOOLS__ = false
  })

module.exports = Encore.getWebpackConfig()
