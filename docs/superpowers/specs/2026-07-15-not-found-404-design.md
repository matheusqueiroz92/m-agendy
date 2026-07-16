# Página 404 personalizada (not-found)

**Data:** 2026-07-15  
**Status:** Aprovado para implementação  
**Escopo:** Página global de “não encontrado” da aplicação M.Agendy

## Objetivo

Substituir a 404 padrão do Next.js por uma página alinhada ao design system existente (padrão visual de `clinic-suspended`), com CTA de saída inteligente conforme autenticação e ação secundária de voltar no histórico.

## Decisões

| Tema | Decisão |
|------|----------|
| Layout | Card central (`bg-muted/40`), tela cheia centralizada |
| CTA principal | Inteligente: `/entrar` se autenticado, `/` se visitante |
| CTA secundário | Botão “Voltar” via `router.back()` |
| Abordagem | Server Component + Client Component só para Voltar |
| Escopo | Apenas `not-found` global; sem 404 por segmento, i18n ou analytics |

## Arquitetura

### Arquivos

1. `src/app/not-found.tsx` — Server Component  
   - Lê sessão com `auth.api.getSession({ headers })`  
   - Define `homeHref`: sessão presente → `/entrar`, senão → `/`  
   - Renderiza Card, ícone, copy e CTAs  

2. `src/app/_components/not-found-back-button.tsx` — Client Component  
   - `Button` variant `outline`  
   - `onClick` → `router.back()`  

### Fluxo

```
URL inexistente
    → Next.js renderiza not-found.tsx (root layout)
    → getSession()
    → CTA "Ir para o início" → /entrar | /
    → "Voltar" → histórico do navegador
```

Usuários autenticados passam por `/entrar`, que já resolve dashboard, portal, onboarding, clínica bloqueada, etc. (`resolveLandingRoute`).

## UI e copy

Espelhar `src/app/clinic-suspended/page.tsx`:

- Container: `flex min-h-screen items-center justify-center p-6`
- `Card` com `className="w-full max-w-md bg-muted/40"`
- Ícone Lucide `FileQuestion` em círculo com `border` muted — **não** usar tom `destructive`
- Título: **Página não encontrada**
- Parágrafos:
  - *A página que você procura não existe ou foi movida.*
  - *Verifique o endereço ou volte para continuar navegando.*
- Ações em `flex gap-2`:
  - `Button` as `Link` → “Ir para o início” (mesmo label para ambos os destinos)
  - `NotFoundBackButton` → “Voltar”

## Comportamento e edge cases

- Visitante: CTA → `/`
- Logado: CTA → `/entrar`
- Voltar: `router.back()` sem fallback customizado se não houver histórico
- Sem ThemeToggle dedicado (usa o root layout / tema global)
- Sem logo na página (consistente com clinic-suspended)

## Fora de escopo

- `not-found.tsx` aninhado em route groups
- Página `error.tsx` / error boundary
- Tracking / analytics de 404
- Internacionalização
- Lógica especial quando `history.length <= 1`

## Critérios de aceite

1. Acessar uma URL inexistente (ex.: `/rota-que-nao-existe`) exibe o card customizado, não a 404 default do Next.
2. Deslogado: “Ir para o início” navega para `/`.
3. Logado: “Ir para o início” navega para `/entrar` (e em seguida para a rota de aterrissagem correta).
4. “Voltar” usa o histórico do navegador.
5. Visual coerente com clinic-suspended (card, tipografia, espaçamento, ShadCN Button/Card).

## Teste manual

- [ ] URL inexistente sem sessão → home `/`
- [ ] URL inexistente com sessão → `/entrar` → destino esperado
- [ ] Botão Voltar após navegar de uma página válida para URL inválida
- [ ] Light e dark mode (tokens do tema)
