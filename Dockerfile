# syntax=docker/dockerfile:1

# Dockerfile multi-stage para produção. Usa o output "standalone" do Next.js
# (ver next.config.ts) para gerar uma imagem final mínima — só o server.js e
# os node_modules realmente usados, sem o restante do node_modules de dev.
#
# Build:
#   docker build -t m-agendy .
# Run:
#   docker run -p 3000:3000 --env-file .env m-agendy
#
# Variáveis de ambiente: veja docs/03-variaveis-de-ambiente.md. Todas devem
# ser injetadas em runtime (--env-file, secrets do orquestrador, etc.), exceto
# NEXT_PUBLIC_* que precisam existir também em build time (ver estágio
# "builder" abaixo).

ARG NODE_VERSION=22-alpine

# ---------------------------------------------------------------------------
# 1) deps: instala dependências isoladas, para cachear entre builds
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# .npmrc tem legacy-peer-deps=true (necessário para o conjunto atual de
# dependências); copiar antes do install para o npm respeitar a config.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ---------------------------------------------------------------------------
# 2) builder: compila a aplicação (Next.js build)
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# O `next build` não executa queries reais (não conecta no banco), mas
# `src/db/index.ts` monta o client do Drizzle no import — precisa de uma
# DATABASE_URL sintaticamente válida para não quebrar o build. Não é usada
# para conectar em nada; a URL real vem em runtime via --env-file/secret.
ARG DATABASE_URL="postgresql://user:password@localhost:5432/m_agendy_build"
ENV DATABASE_URL=${DATABASE_URL}

# Variáveis NEXT_PUBLIC_* são embutidas no bundle do cliente durante o build,
# então precisam ser passadas como build args caso os valores de produção
# sejam diferentes do padrão abaixo.
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=""
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=${NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# 3) runner: imagem final, mínima, roda como usuário não-root
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Output standalone já traz um node_modules mínimo com só o que é usado em
# runtime — não precisa (nem deve) copiar o node_modules completo do builder.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
