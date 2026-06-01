param(
  [string]$HostName = "47.83.144.162",
  [string]$User = "admin"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$package = ".analysis\fencingai-deploy.tar.gz"
tar -czf $package package.json server.mjs web tools data docs deploy
scp $package "${User}@${HostName}:/tmp/fencingai-deploy.tar.gz"

ssh "${User}@${HostName}" @'
set -e
rm -rf /tmp/fencingai-unpack
mkdir -p /tmp/fencingai-unpack
tar -xzf /tmp/fencingai-deploy.tar.gz -C /tmp/fencingai-unpack
mkdir -p /var/www/fencingai/data/analysis /tmp/fencingai-backups
if [ -d /var/www/fencingai/data ]; then
  tar -czf /tmp/fencingai-backups/data-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www/fencingai data
fi
rsync -a --delete --exclude data /tmp/fencingai-unpack/ /var/www/fencingai/
cd /var/www/fencingai
node --check server.mjs
node --check web/viewer.js
node --check web/admin-import.js
sudo systemctl restart fencingai-web
sleep 1
sudo systemctl is-active fencingai-web
'@
