# Deploy — Cajuína (Frontend)

CI/CD via GitHub Actions. O CI roda lint + testes + build em cada push/PR; o deploy faz SSH
na VPS após o CI passar na `main`. O Next roda containerizado (build `standalone`).

## 1. Setup inicial da VPS (uma vez)

Pré-requisitos: Docker + Docker Compose plugin. A rede `cajuina-net` é criada pelo repo da
API — se ainda não existir:

```bash
docker network create cajuina-net   # ignore se já existir

git clone <url-do-repo-cajuina> /opt/cajuina
cd /opt/cajuina

cp .env.example .env
nano .env   # defina NEXT_PUBLIC_API_URL com a URL pública da API
```

> `NEXT_PUBLIC_API_URL` é embutida no build. Mudou a URL? É preciso rebuildar (o deploy
> já faz `--build`).

## 2. Secrets do GitHub (repo cajuina)

Em **Settings → Secrets and variables → Actions**:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | IP ou hostname da VPS |
| `VPS_USER` | usuário SSH |
| `VPS_SSH_KEY` | chave **privada** SSH |
| `VPS_PROJECT_PATH` | caminho do repo na VPS (ex.: `/opt/cajuina`) |

E em **Settings → Secrets and variables → Actions → Variables** (não é secret):

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL pública da API usada no build do CI (ex.: `https://api.cajuina.com.br/api/v1`) |

## 3. Deploy

Push na `main` (ou rode o workflow **Deploy** manualmente). O deploy faz `git reset --hard`
e `docker compose -f docker-compose.prod.yml up -d --build`.

## 4. Nginx (exemplo)

Container exposto apenas em `127.0.0.1:3000`:

```nginx
server {
    listen 80;
    server_name cajuina.com.br www.cajuina.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use Certbot (`certbot --nginx`) para o TLS.

## Comandos úteis

```bash
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml ps
```
