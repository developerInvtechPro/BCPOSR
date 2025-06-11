module.exports = {
  apps: [{
    name: 'pos-honduras',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
