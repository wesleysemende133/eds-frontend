# EDS - Enterprise Document System (Frontend)

Um frontend completo para o Sistema de Gestão de Documentos Empresariais (EDS), construído com **Vite + React + React Router**.

## 🎯 Funcionalidades

### ✅ Autenticação
- Login com email e senha
- Registro de novos usuários
- Token JWT armazenado localmente
- Proteção de rotas

### 📊 Dashboard
- Visão geral com estatísticas (Total, Pendentes, Processadas, Rejeitadas)
- Ações rápidas (Upload e Ver Faturas)
- Listagem das 5 faturas mais recentes

### 📄 Gerenciamento de Faturas
- Listagem completa com filtros por status
- Busca/filtro dinâmico
- Upload via Drag & Drop
- Detalhes da fatura
- Deleção com confirmação

### 👤 Perfil do Usuário
- Informações pessoais
- Configurações da conta
- Tema (claro/escuro)
- Notificações

### 🎨 Interface Profissional
- Design responsivo (mobile, tablet, desktop)
- Paleta de cores corporate (Azul primário)
- Badges de status coloridas
- Ícones intuitivos
- Animações suaves

## 📦 Instalação

### Pré-requisitos
- Node.js 16+
- npm ou pnpm

### Passos

1. **Clonar o repositório**
```bash
git clone <seu-repo>
cd eds-frontend
```

2. **Instalar dependências**
```bash
pnpm install
# ou
npm install
```

3. **Iniciar servidor de desenvolvimento**
```bash
pnpm dev
# ou
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 🚀 Build para Produção

```bash
pnpm build
# ou
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 🌐 Configuração do Backend

O frontend se conecta ao backend Spring Boot através de proxy configurado no `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

### Endpoints Esperados

**Autenticação**
- `POST /api/auth/login` - Login
- `POST /api/auth/registrar` - Registro

**Faturas**
- `GET /api/faturas` - Listar todas
- `GET /api/faturas/status/{status}` - Filtrar por status
- `GET /api/faturas/{id}` - Obter detalhes
- `POST /api/faturas/upload` - Upload de fatura
- `DELETE /api/faturas/{id}` - Deletar fatura

**Perfil**
- `GET /api/usuario/perfil` - Obter dados do usuário
- `PUT /api/usuario/perfil` - Atualizar dados

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Navbar.jsx          # Barra de navegação
│   ├── Navbar.css
│   └── ProtectedRoute.jsx  # Rota protegida por autenticação
├── pages/
│   ├── Login.jsx           # Página de login
│   ├── Register.jsx        # Página de registro
│   ├── Dashboard.jsx       # Dashboard principal
│   ├── Invoices.jsx        # Listagem de faturas
│   ├── InvoiceUpload.jsx   # Upload de fatura
│   ├── InvoiceDetail.jsx   # Detalhes da fatura
│   ├── Profile.jsx         # Perfil do usuário
│   └── *.css               # Estilos específicos de cada página
├── hooks/
│   ├── useAuth.js          # Hook para autenticação
│   └── useInvoices.js      # Hook para gerenciamento de faturas
├── store/
│   └── authStore.js        # Zustand store para auth
├── lib/
│   └── axios.js            # Configuração do axios com interceptors
├── App.jsx                 # Componente raiz
├── index.css               # Estilos globais
└── main.jsx                # Ponto de entrada

public/
└── [assets]

.gitignore
.eslintrc.cjs
package.json
vite.config.js
index.html
```

## 🎨 Paleta de Cores

- **Primária**: `#1e40af` (Azul)
- **Secundária**: `#64748b` (Cinza)
- **Sucesso**: `#10b981` (Verde)
- **Aviso**: `#f59e0b` (Laranja)
- **Erro**: `#ef4444` (Vermelho)
- **Fundo**: `#f8fafc` (Branco/Cinza claro)
- **Texto**: `#1e293b` (Cinza escuro)

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=EDS
```

## 🔐 Segurança

- Tokens JWT armazenados em localStorage
- Interceptor automático que adiciona token em todas as requisições
- Redirecionamento para login em caso de 401 (Unauthorized)
- Validação de formulários
- Proteção de rotas com `ProtectedRoute`

## 🛠️ Tecnologias Utilizadas

- **React 18** - UI library
- **Vite 4** - Build tool
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Zustand 4** - State management
- **Lucide React** - Icons
- **CSS Modular** - Styling

## 📱 Suporte a Dispositivos

- ✅ Desktop (1920x1080+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

## 🐛 Troubleshooting

### Porta 3000 já em uso
```bash
# Linux/Mac: Matar processo na porta 3000
kill -9 $(lsof -t -i :3000)

# Ou executar em outra porta
pnpm dev -- --port 3001
```

### API não responde
Verifique se o backend está rodando em `http://localhost:8080`

```bash
curl http://localhost:8080/api/auth/login
```

### Erros de módulo
```bash
# Limpar cache e reinstalar
pnpm install
# ou
rm -rf node_modules package-lock.json && npm install
```

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

## 📄 Licença

MIT License - veja LICENSE.md para detalhes
# eds-frontend
