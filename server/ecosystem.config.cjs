module.exports = {
  apps: [
    {
      name: 'ksm-api',
      script: 'server.js',
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 1000,
      kill_timeout: 6000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001
      }
    }
  ]
};
