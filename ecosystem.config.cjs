module.exports = {
  apps: [{
    name: "coach-manager-production",
    script: "dist/index.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    },
    watch: false,
    exp_backoff_restart_delay: 2000,
    max_memory_restart: "512M",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true,
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: "10s",
    // Production optimizations
    node_args: "--max-old-space-size=512",
    kill_timeout: 5000,
    listen_timeout: 8000,
    // Health monitoring
    health_check_grace_period: 10000,
    health_check_fatal_exceptions: true
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'root',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/sahidx/saroyar.git',
      path: '/var/www/saroyar',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production=false && npm run build && pm2 reload ecosystem.config.cjs --env production && pm2 save',
      'pre-setup': 'mkdir -p /var/www/saroyar/logs'
    }
  }
}
