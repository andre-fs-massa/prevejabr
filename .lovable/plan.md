

## Correção do Botão "Como Funciona"

### Problema Identificado

O link "Como Funciona" no Header usa `<a href="#como-funciona">` que tem as seguintes limitações:

1. **Não funciona em outras páginas** - O link de âncora só funciona se o usuário já estiver na página inicial. Em outras páginas, ele não faz nada útil.

2. **Header fixo cobre o conteúdo** - Quando o browser faz scroll para a âncora, o topo da seção fica escondido atrás do header fixo (64-80px de altura).

3. **Sem scroll suave** - O comportamento é um salto brusco, não uma transição suave.

### Solução

Modificar o comportamento para:
- Navegar para a página inicial se o usuário estiver em outra página
- Fazer scroll suave até a seção "Como Funciona"
- Compensar a altura do header fixo

### Mudanças Necessárias

**1. Adicionar scroll-behavior smooth ao CSS** (`src/index.css`)
```css
html {
  scroll-behavior: smooth;
}
```

**2. Adicionar scroll-margin-top à seção** (`src/components/HowItWorks.tsx`)
```css
scroll-margin-top: 6rem; /* Compensa o header fixo */
```

**3. Atualizar os links no Header** (`src/components/Header.tsx`)

Substituir os links `<a href="#como-funciona">` por um componente que:
- Verifica se está na página inicial
- Se estiver, faz scroll suave para a seção
- Se não estiver, navega para `/#como-funciona` e depois faz scroll

### Detalhes Técnicos

A implementação usará:
- `useLocation` do React Router para detectar a rota atual
- `useNavigate` para navegação programática quando necessário
- `scrollIntoView` com comportamento suave como fallback
- CSS `scroll-margin-top` para compensar o header fixo

O código do link será algo como:
```tsx
const handleComoFuncionaClick = (e: React.MouseEvent) => {
  e.preventDefault();
  if (location.pathname === '/') {
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
  } else {
    navigate('/', { state: { scrollTo: 'como-funciona' } });
  }
};
```

E na página inicial, um `useEffect` verificará se há um `scrollTo` no state e fará o scroll após a navegação.

