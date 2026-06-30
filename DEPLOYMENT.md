# Guia de Deploy - EDS Frontend

Este documento descreve como fazer deploy do EDS Frontend em diferentes plataformas.

## Build para Produção

```bash
pnpm build
```

Isso criará uma pasta `dist/` com os arquivos otimizados prontos para deploy.

## Vercel (Recomendado)

### Setup Inicial

1. **Instale o Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Faça login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

### Configuração Automática

O Vercel detectará automaticamente que é um projeto Vite e configurará:
- Build command: `pnpm build`
- Output directory: `dist`
- Install command: `pnpm install`

### Variáveis de Ambiente

No dashboard do Vercel:
1. Vá para Projeto → Settings → Environment Variables
2. Adicione:
   ```
   VITE_API_BASE_URL=https://seu-api.com/api
   ```

### Deploy Automático com GitHub

1. **Conecte seu repositório** ao Vercel
2. **Configurações**: 
   - Framework Preset: `Vite`
   - Build Command: `pnpm build`
   - Output Directory: `dist`

Cada push para `main` fará deploy automático!

## Netlify

### Setup Inicial

1. **Conecte seu repositório** no Netlify
2. **Build Settings**:
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: `18`

### netlify.toml

Crie um arquivo `netlify.toml` na raiz:

```toml
[build]
command = "pnpm build"
publish = "dist"

[build.environment]
NODE_VERSION = "18"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### Variáveis de Ambiente

1. Site settings → Build & deploy → Environment
2. Adicione suas variáveis

## GitHub Pages

### Configuração

1. **Update `vite.config.js`**
```javascript
export default {
  base: '/eds-frontend/', // seu-repo-name
  // ... resto da config
}
```

2. **Create `deploy.yml`** em `.github/workflows/`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000"]
```

### Build e Run

```bash
# Build image
docker build -t eds-frontend:latest .

# Run container
docker run -p 3000:3000 eds-frontend:latest

# Com variáveis de ambiente
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=https://api.example.com \
  eds-frontend:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://backend:8080/api
    depends_on:
      - backend

  backend:
    image: seu-backend:latest
    ports:
      - "8080:8080"
```

## AWS S3 + CloudFront

### S3 Setup

1. **Crie um bucket S3**
   ```bash
   aws s3 mb s3://seu-bucket-eds-frontend
   ```

2. **Configure para website hosting**
   ```bash
   aws s3 website s3://seu-bucket-eds-frontend \
     --index-document index.html \
     --error-document index.html
   ```

3. **Faça upload dos arquivos**
   ```bash
   aws s3 sync dist/ s3://seu-bucket-eds-frontend/ \
     --delete \
     --cache-control "max-age=31536000,public" \
     --exclude "index.html"
   
   aws s3 sync dist/ s3://seu-bucket-eds-frontend/ \
     --delete \
     --cache-control "no-cache,public" \
     --include "index.html"
   ```

### CloudFront Distribution

1. Crie uma distribution apontando para seu bucket S3
2. Configure behaviors:
   - Default TTL: 86400 (1 dia)
   - Max TTL: 31536000 (1 ano)

3. Configure error handling:
   - 403 → index.html
   - 404 → index.html

## Nginx

### nginx.conf

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/eds-frontend;
    index index.html index.htm;

    # Compression
    gzip on;
    gzip_types text/plain text/css text/javascript 
               application/json application/javascript 
               application/x-javascript text/xml application/xml;

    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (opcional)
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Checklist de Deploy

- [ ] Build completa sem erros: `pnpm build`
- [ ] Variáveis de ambiente configuradas
- [ ] API backend acessível
- [ ] SSL/HTTPS ativado
- [ ] CORS configurado corretamente
- [ ] Headers de segurança definidos
- [ ] Compressão gzip ativada
- [ ] Cache estratégico configurado
- [ ] Testes de funcionalidade completos
- [ ] Monitoramento e logs ativados

## Performance

### Dicas de Otimização

1. **Enable Compression**
   ```
   Content-Encoding: gzip
   ```

2. **Cache Headers**
   ```
   Cache-Control: public, max-age=31536000
   ```

3. **CDN**
   - Use CloudFront, Cloudflare ou similar
   - Distribua assets por múltiplas regiões

4. **HTTP/2**
   - Ative em servidores que suportam

## Monitoring

### Ferramentas Recomendadas

- **Sentry**: Error tracking
- **LogRocket**: User session recording
- **DataDog**: APM e monitoring
- **Uptime Robot**: Uptime monitoring

## Rollback

### Se algo der errado

1. **Vercel**: Clique em "Deployments" e selecione versão anterior
2. **Netlify**: Clique em "Deploys" e escolha uma versão estável
3. **Manual**: Re-faça deploy de versão anterior do código

---

Dúvidas? Abra uma issue ou contacte a equipe de DevOps.
