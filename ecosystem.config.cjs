module.exports = {
  apps: [
    {
      name: "account-vault",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/account-vault",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
