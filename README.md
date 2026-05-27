# eevex v1

App simples para emissão segura de ingressos com Next.js + PostgreSQL.

## Recursos

- Login de operador
- Cadastro de eventos
- Emissão de ingressos com CV, nome, CPF e telefone opcional
- QR Code com payload assinado (HMAC-SHA256)
- Impressão em formato A4 e térmica 80mm
- API de validação de QR pronta para fase 2

## Setup local

1. Copie o ambiente:

```bash
cp .env.example .env
```

2. Suba banco local:

```bash
docker compose up -d db
```

3. Rode migração e seed de admin:

```bash
npx prisma migrate dev --name init
```

4. Rode o app:

```bash
npm run dev
```

Login padrão: `DEFAULT_ADMIN_USER` / `DEFAULT_ADMIN_PASSWORD`.

## Deploy no Railway via GitHub

1. Suba este repositório para o GitHub.
2. No Railway, crie um projeto e um serviço Web apontando para este repo.
3. No GitHub, configure os secrets do repositório:

- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_ID`
- `RAILWAY_ENVIRONMENT_ID`

4. O workflow [`deploy-railway.yml`](.github/workflows/deploy-railway.yml) fará deploy automático a cada push na `main`.
5. No Railway, use o comando de start padrão do projeto (`npm start`).

### Variáveis de ambiente no Railway

Defina no serviço Railway:

- `DATABASE_URL` (Neon/Postgres)
- `APP_SECRET` (string forte com 32+ chars)
- `ENCRYPTION_KEY` (64 hex chars)
- `DEFAULT_ADMIN_USER`
- `DEFAULT_ADMIN_PASSWORD`

### Prisma em produção

O projeto já executa `prisma migrate deploy` automaticamente no `npm start`.
Se quiser rodar manualmente no shell do Railway:

```bash
npx prisma migrate deploy
```

## Regra operacional deste projeto

- Sempre realizar `git push` na `main` após concluir alterações, para manter o deploy automático do Railway atualizado.

Você pode executar esse comando no Railway Shell após o primeiro deploy.
# eevex
