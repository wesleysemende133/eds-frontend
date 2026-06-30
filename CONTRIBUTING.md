# Guia de Contribuição - EDS Frontend

Obrigado por considerar contribuir para o EDS! Este documento fornece diretrizes e instruções para contribuidores.

## Começando

### Ambiente de Desenvolvimento

1. **Fork o repositório** no GitHub
2. **Clone o seu fork**
   ```bash
   git clone https://github.com/seu-usuario/eds-frontend.git
   cd eds-frontend
   ```

3. **Adicione o repositório original como upstream**
   ```bash
   git remote add upstream https://github.com/original/eds-frontend.git
   ```

4. **Instale as dependências**
   ```bash
   pnpm install
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

## Processo de Desenvolvimento

### Branching

- Sempre crie um branch a partir de `main`
- Nomeie seu branch descritivamente: `feature/nome-feature` ou `fix/nome-bug`

```bash
git checkout -b feature/adicionar-dashboard-financeiro
```

### Commits

- Use mensagens de commit claras e descritivas
- Comece com um verbo no imperativo: "Add", "Fix", "Update", "Remove"
- Faça commits pequenos e focados

```bash
git commit -m "Add invoice status filter to list page"
git commit -m "Fix loading spinner animation"
```

### Pull Requests

1. **Atualize seu branch com o upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push para seu fork**
   ```bash
   git push origin feature/seu-feature
   ```

3. **Abra um Pull Request** no GitHub com:
   - Título descritivo
   - Descrição clara do que foi alterado
   - Referência a issues relacionadas (ex: `Closes #123`)
   - Screenshots de mudanças na UI

## Padrões de Código

### Estrutura de Componentes

```jsx
import { useState } from 'react'
import './ComponentName.css'

export function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(null)

  const handleAction = () => {
    setState(true)
  }

  return (
    <div className="component-container">
      <h1>Title</h1>
      <button onClick={handleAction}>Click Me</button>
    </div>
  )
}
```

### Nomeação

- **Componentes**: PascalCase (`LoginForm.jsx`, `UserCard.jsx`)
- **Variáveis/Funções**: camelCase (`getUserData`, `isLoading`)
- **CSS Classes**: kebab-case (`.login-form`, `.user-card`)
- **Hooks**: Comece com `use` (`useAuth`, `useInvoices`)

### CSS

- Use CSS Modular (um arquivo `.css` por página/componente)
- Organize por: layout → tipografia → cores → estados
- Use variáveis CSS para cores e espaçamento

```css
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}
```

### Performance

- Use lazy loading para rotas quando apropriado
- Evite renderizações desnecessárias
- Memorize componentes heavy com `useMemo` se necessário
- Otimize imagens

## Testes

Antes de submeter um PR:

1. **Teste manualmente**
   - Verifique a funcionalidade em desktop e mobile
   - Teste diferentes estados da UI
   - Verifique console para warnings/errors

2. **Verifique linting**
   ```bash
   npm run lint
   ```

3. **Build de produção**
   ```bash
   npm run build
   ```

## Reportar Bugs

Abra uma issue com:
- Título descritivo
- Descrição clara do bug
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots/screenrecordings
- Versão do navegador

## Sugestões de Features

Abra uma issue com:
- Título claro da feature
- Descrição detalhada
- Caso de uso
- Mock-ups/wireframes se possível
- Discuss trade-offs

## Padrões de Projeto

### Hierarquia de Rotas

```
/
├── /login
├── /registrar
└── /dashboard (protegido)
    ├── /faturas
    ├── /faturas/upload
    ├── /faturas/:id
    └── /perfil
```

### Estado Global

Use Zustand para estado global:

```javascript
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

### API Calls

Use axios com interceptors já configurados:

```javascript
import api from '@/lib/axios'

const fetchInvoices = async () => {
  try {
    const { data } = await api.get('/faturas')
    return data
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
}
```

## Checklist para PR

- [ ] Código segue os padrões do projeto
- [ ] Testado em desktop e mobile
- [ ] Sem console warnings/errors
- [ ] Build passa sem erros
- [ ] Commit messages são claros
- [ ] README atualizado se necessário
- [ ] Documentação inline adicionada
- [ ] Issues relacionadas linkadas

## Ferramentas Recomendadas

- **Editor**: VS Code com extensões:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  
- **Browser DevTools**
  - React Developer Tools
  - Redux DevTools (quando applicable)

## Dúvidas?

- Abra uma issue com a tag `[QUESTION]`
- Verifique issues/discussions existentes
- Contacte os maintainers

---

Obrigado por contribuir! 🎉
