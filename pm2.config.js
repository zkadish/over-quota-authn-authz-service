module.exports = {
  apps : [
    {
      name   : "dev.auth.service.viewportmedia.org",
      script : "./server/bin/www",
      env_development: {
        NODE_ENV: "development",
        MODE: "dev",
      },
      env_production: {
        NODE_ENV: "production",
        MODE: "prod"
      },
    },
  ],
};
