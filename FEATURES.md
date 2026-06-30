# Funcionalidades do EDS Frontend

Documentação completa das funcionalidades implementadas no EDS.

## 🔐 Autenticação

### Login
- **URL**: `/login`
- **Funcionalidades**:
  - Campo de email com validação
  - Campo de senha com máscara
  - Botão "Entrar" com validação de formulário
  - Link para página de registro
  - Armazenamento de token JWT no localStorage
  - Tratamento de erros com feedback visual

### Registro
- **URL**: `/registrar`
- **Funcionalidades**:
  - Campo de nome completo
  - Campo de email com validação
  - Campo de senha com requisitos de segurança
  - Campo de confirmação de senha com match validation
  - Termos de serviço
  - Link para página de login
  - Validação em tempo real

## 📊 Dashboard

### Visão Geral
- **URL**: `/dashboard`
- **Funcionalidades**:
  - Proteção por autenticação (ProtectedRoute)
  - 4 cards de estatísticas:
    - Total de Faturas
    - Faturas Pendentes
    - Faturas Processadas
    - Faturas Rejeitadas
  - Cores diferentes por status
  - Ícones descritivos

### Ações Rápidas
- **Links para**:
  - Upload de Fatura
  - Ver Todas as Faturas
- **Design**: Cards clicáveis com ícones

### Faturas Recentes
- **Exibição**: Tabela com últimas 5 faturas
- **Colunas**: ID, Número, Status, Data, Ações
- **Ações**: 
  - Ver detalhes (link)
  - Deletar (com confirmação)

## 📤 Upload de Fatura

### Funcionalidades
- **URL**: `/faturas/upload`
- **Métodos**:
  - Drag & Drop de arquivos
  - Clique para selecionar arquivo
  
### Validações
- **Tipos aceitos**: PDF, JPEG, PNG
- **Tamanho máximo**: 10MB
- **Feedback visual**: 
  - Zona de drop ativa (hover)
  - Progresso de upload
  - Mensagens de erro/sucesso

### Processamento
- **Preview**: Imagens são exibidas antes do upload
- **Redirecionamento**: Após sucesso, vai para `/faturas`
- **Cancelamento**: Volta para dashboard

## 📋 Gerenciamento de Faturas

### Listagem
- **URL**: `/faturas`
- **Funcionalidades**:
  - Tabela completa de faturas
  - Informações: ID, Número, Fornecedor, Valor, Status, Data
  - Botão "+ Upload de Fatura" (canto superior direito)
  - Paginação (se muitos registros)
  - Búsca/filtro dinâmico

### Filtros por Status
- **Botões**:
  - Todos (padrão)
  - Pendente (laranja)
  - Processada (verde)
  - Rejeitada (vermelho)
- **Funcionamento**: Filtro dinâmico em tempo real

### Ações na Listagem
- **Ver Detalhes**: Link para `/faturas/{id}`
- **Deletar**: 
  - Confirmação antes de deletar
  - Feedback visual de sucesso
  - Remove da tabela automaticamente

### Estados da UI
- **Carregando**: Spinner animado
- **Vazio**: Mensagem "Nenhuma fatura encontrada"
- **Erro**: Mensagem de erro com retry

## 🔍 Detalhes da Fatura

### Informações Básicas
- **URL**: `/faturas/:id`
- **Exibição**:
  - ID da Fatura
  - Número da Fatura
  - Status (badge colorida)

### Dados Financeiros
- **Campos**:
  - Valor total
  - Fornecedor/Emitente
  - Data de emissão
  - Data de vencimento
  - Categoria

### Descrição e Metadados
- **Descrição**: Texto completo
- **Metadados adicionais**:
  - Referência
  - Notas

### Ações
- **Download**: Baixar arquivo original
- **Deletar**: Com confirmação
- **Voltar**: Retorna para listagem

### Visual
- **Status Badge**: Cor diferente por status
- **Ícones**: Lucide icons para cada campo
- **Responsivo**: Adapta-se a mobile/tablet

## 👤 Perfil do Usuário

### Informações Pessoais
- **URL**: `/perfil`
- **Campos**:
  - Nome completo
  - Email
  - Telefone
  - Departamento
- **Edição**: Modo edit com botão "Salvar"

### Configurações da Conta
- **Tema**:
  - Light (padrão)
  - Dark
- **Notificações**:
  - Email
  - Push (se disponível)
- **Idioma**: Português

### Zona de Perigo
- **Ações**:
  - Alterar senha
  - Deletar conta (com confirmação dupla)
- **Confirmação**: Requer senha atual

### Estados
- **Loading**: Ao salvar mudanças
- **Success**: Feedback visual ao salvar
- **Error**: Mensagens de erro

## 🧭 Navegação

### Navbar
- **Localização**: Topo fixo
- **Elementos**:
  - Logo "EDS" (link para dashboard)
  - Nome do usuário (dropdown)
  - Ícone de perfil
  - Botão logout

### Menu Dropdown
- **Usuário**:
  - Meu Perfil
  - Configurações
  - Logout

### Rotas Protegidas
- **ProtectedRoute**: Redireciona para login se não autenticado
- **Token**: Verificado a cada acesso
- **Interceptor**: Adiciona token automaticamente em requests

## 🎨 Design & Styling

### Paleta de Cores
- **Primária**: #1e40af (Azul)
- **Secundária**: #64748b (Cinza)
- **Sucesso**: #10b981 (Verde)
- **Aviso**: #f59e0b (Laranja)
- **Erro**: #ef4444 (Vermelho)
- **Fundo**: #f8fafc

### Tipografia
- **Headings**: Negrito, tamanho maior
- **Body**: Tamanho padrão, legível
- **Monospace**: Para IDs, códigos
- **Font**: Sistema de fontes padrão

### Componentes
- **Botões**: 
  - Primário (azul)
  - Secundário (cinza)
  - Danger (vermelho)
- **Inputs**:
  - Borda fina, padding confortável
  - Focus state azul
  - Validação em tempo real
- **Cards**:
  - Sombra sutil
  - Rounded corners
  - Hover effect
- **Badges**:
  - Status de cores
  - Rounded
  - Contraste alto

### Responsividade
- **Mobile** (< 640px): Stack vertical, fonte menor
- **Tablet** (640px - 1024px): 2 colunas onde aplicável
- **Desktop** (> 1024px): Layout completo, múltiplas colunas

## 🔄 Fluxos de Usuário

### 1. Novo Usuário
1. Acessa `/`
2. Redireciona para `/login`
3. Clica em "Cadastre-se aqui"
4. Preenche formulário de registro
5. Clica "Cadastrar"
6. Redireciona para `/dashboard`

### 2. Upload de Fatura
1. No dashboard, clica "Upload de Fatura"
2. Vai para `/faturas/upload`
3. Faz drag & drop ou clica para selecionar
4. Arquivo é carregado
5. Redireciona para `/faturas`
6. Nova fatura aparece na listagem

### 3. Visualizar Detalhes
1. Em `/faturas`, clica em fatura
2. Vai para `/faturas/:id`
3. Vê detalhes completos
4. Pode baixar ou deletar
5. Clica voltar para retornar à listagem

### 4. Editar Perfil
1. Clica no ícone de usuário
2. Clica "Meu Perfil"
3. Vai para `/perfil`
4. Clica "Editar"
5. Modifica informações
6. Clica "Salvar"
7. Feedback de sucesso

## 🚀 Performance

### Otimizações
- CSS crítico inline (parcial)
- Lazy loading de imagens
- Minimização de bundle size
- Tree-shaking de dependências não usadas
- Compressão gzip

### Métricas
- FCP (First Contentful Paint): < 2s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 5s

## 🔒 Segurança

### Implementado
- HTTPS (em produção)
- JWT tokens com expiração
- Sanitização de inputs
- CSRF protection (via token)
- XSS prevention (React escape)
- CORS configurado
- Rate limiting (backend)

### Não Implementado (Backend)
- 2FA
- OAuth/SSO
- Biometric auth
- Magic links

## 📱 Acessibilidade

### Implementado
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast WCAG AA
- Focus indicators
- Screen reader support
- Forms bem estruturados

### Suporta
- Mobile browsers (iOS 12+, Android 8+)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets
- Assistive technology

---

Para mais informações, veja [README.md](./README.md) ou abra uma issue.
