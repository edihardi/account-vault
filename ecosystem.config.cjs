module.exports = {
  apps: [
    {
      name: "akunku",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/akunku",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
    },
  ],
};
