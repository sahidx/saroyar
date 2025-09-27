module.exports = {
  apps: [{
    name: "saroyar",
    script: "dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: "3001"
      // Other environment variables will be read from .env file
    },
    watch: false,
    instances: 1,
    exp_backoff_restart_delay: 2000,
    max_memory_restart: "512M",
    max_restarts: 10,
    min_uptime: "10s",
    kill_timeout: 5000,
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true
  }]
}
