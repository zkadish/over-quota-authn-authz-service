module.exports = {
  apps : [{
    name   : "over-quota-authn-authz-service",
    script : "./server/bin/www"
  }],
  env_production: {
    NODE_ENV: "production"
  },
  env_development: {
    NODE_ENV: "development"
  },
};
