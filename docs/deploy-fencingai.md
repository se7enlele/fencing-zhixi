# Deploy FencingAI To Aliyun ECS

Target server:

- Host: `47.83.144.162`
- User: `admin`
- Domain: `fencingai.uk`
- App directory: `/var/www/fencingai`
- Node port: `5188`
- Systemd service: `fencingai-web`

This deployment should not modify the existing `university-collab-web` service for `acadmap.com`.

## Server Commands

```bash
sudo mkdir -p /var/www/fencingai
sudo chown -R admin:admin /var/www/fencingai
```

Upload project files to `/var/www/fencingai`, then:

Important: do not wipe `/var/www/fencingai/data` during routine deploys. The
admin import page writes live score data into `data/analysis`, so deployments
must preserve that directory unless you are intentionally restoring a data
snapshot.

Safe update pattern:

```bash
mkdir -p /tmp/fencingai-backups
tar -czf /tmp/fencingai-backups/data-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www/fencingai data
rsync -a --delete --exclude data /tmp/fencingai-unpack/ /var/www/fencingai/
mkdir -p /var/www/fencingai/data/analysis
```

```bash
cd /var/www/fencingai
node tools/smoke-test.mjs
sudo cp deploy/fencingai.service /etc/systemd/system/fencingai-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now fencingai-web
sudo systemctl status fencingai-web --no-pager
```

Nginx:

```bash
sudo cp deploy/nginx-fencingai.conf /etc/nginx/sites-available/fencingai.uk
sudo ln -sfn /etc/nginx/sites-available/fencingai.uk /etc/nginx/sites-enabled/fencingai.uk
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS, if Certbot is installed:

```bash
sudo certbot --nginx -d fencingai.uk -d www.fencingai.uk
```

## Verify

```bash
curl -I http://127.0.0.1:5188/viewer
curl -I http://fencingai.uk/viewer
```
