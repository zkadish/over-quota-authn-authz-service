module.exports = {
  apps : [{
    name   : "dev.auth.service.overquota.io",
    script : "./server/bin/www"
  }],
  env_development: {
    NODE_ENV: "production",
    MODE: "dev",
  },
  env_production: {
    NODE_ENV: "production"
  },
};
