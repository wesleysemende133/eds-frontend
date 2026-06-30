# ⚡ Guia Rápido - EDS Frontend

Comece a usar o EDS Frontend em menos de 5 minutos!

## 🚀 Início Rápido

### 1️⃣ Clone e Instale
```bash
git clone https://github.com/seu-usuario/eds-frontend.git
cd eds-frontend
pnpm install
```

### 2️⃣ Configure o Ambiente
```bash
cp .env.example .env.local
# Edite .env.local se necessário
```

### 3️⃣ Inicie o Servidor
```bash
pnpm dev
```

Acesse `http://localhost:3000` no navegador!

## 📝 Credenciais de Teste

Use estas credenciais para testar (após conectar backend real):

```
Email: teste@example.com
Senha: Senha123!
```

## 📖 Principais URLs

| URL | Descrição |
|-----|-----------|
| `/` | Redirecionamento automático |
| `/login` | Página de login |
| `/registrar` | Página de registro |
| `/dashboard` | Dashboard principal |
| `/faturas` | Listagem de faturas |
| `/faturas/upload` | Upload de fatura |
| `/faturas/:id` | Detalhes da fatura |
| `/perfil` | Perfil do usuário |

## 🎯 Fluxo Básico

```
1. Acesse http://localhost:3000
2. Clique em "Cadastre-se aqui" 
   OU
   Faça login com credenciais válidas
3. Será redirecionado para o Dashboard
4. Explore as funcionalidades:
   - Upload de Fatura
   - Ver Faturas
   - Editar Perfil
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev          # Iniciar servidor
pnpm build        # Build para produção
pnpm preview      # Preview do build

# Linting
pnpm lint         # Verificar código

# Limpeza
pnpm clean        # Remover cache
```

## 🐛 Troubleshooting Rápido

### Porta 3000 em uso?
```bash
pnpm dev -- --port 3001
```

### Backend não responde?
Verifique se está rodando em `http://localhost:8080`

### Dependências quebradas?
```bash
pnpm install --force
```

### Limpar tudo e começar?
```bash
rm -rf node_modules pnpm-lock.yaml dist
pnpm install
```

## 📱 Testar Responsividade

Abra as DevTools (F12) e teste em:
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1920px)

## 🌐 Variáveis de Ambiente

Default (funcionará sem edições):
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=EDS - Enterprise Document System
```

## 📦 Build para Produção

```bash
pnpm build
```

A pasta `dist/` conterá os arquivos prontos para deploy!

## 🚀 Deploy Rápido

### Vercel (Mais Fácil)
```bash
npm i -g vercel
vercel
```

### Netlify
1. Conecte seu repo no [Netlify](https://netlify.com)
2. Build command: `pnpm build`
3. Publish directory: `dist`

## 📚 Próximos Passos

1. **Ler Documentação Completa**
   - [README.md](./README.md) - Documentação principal
   - [FEATURES.md](./FEATURES.md) - Todas as funcionalidades
   
2. **Integrar com Backend**
   - Configure `VITE_API_BASE_URL` para seu backend
   - Teste as requisições de API

3. **Deploy**
   - Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para detalhes

4. **Contribuir**
   - Veja [CONTRIBUTING.md](./CONTRIBUTING.md)

## ❓ Dúvidas?

- 📖 Consulte [README.md](./README.md)
- 🎯 Veja [FEATURES.md](./FEATURES.md)
- 🚀 Para deploy, leia [DEPLOYMENT.md](./DEPLOYMENT.md)
- 👥 Para contribuir, leia [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Tudo funcionando?** 🎉 Continue explorando e faça contribuições!
