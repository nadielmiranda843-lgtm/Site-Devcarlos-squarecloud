# DealHunter

Aplicação web responsiva para descobrir ofertas, comparar preços e acompanhar oportunidades. O produto atual usa uma sidebar no desktop, navegação compacta no celular, catálogo persistente, favoritos, Drop Alerts, ranking, área Premium, lotes B2B, cálculo de frete e PWA.

## Funcionalidades atuais

A experiência pública inclui busca por produto, filtros por categoria, ordenação por preço, desconto ou avaliação, ofertas demonstrativas, favoritos vinculados à conta e alertas persistentes. O acesso possui login, cadastro, logout, perfil, suporte e política de privacidade. O painel administrativo permanece protegido por função e reúne visão geral, usuários, fontes, logs e configurações disponíveis no backend.

## Acesso inicial

O administrador inicial é criado a partir de `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_NAME`. Altere a senha antes de disponibilizar o serviço publicamente. Não armazene credenciais no repositório.

## Desenvolvimento

Requer Node.js e pnpm.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm exec vitest run --pool=threads --poolOptions.threads.singleThread
pnpm build
pnpm dev
```

O comando de produção limita o heap do Node a 768 MB. O arquivo `squarecloud.app` configura o serviço com limite de 950 MB para evitar atingir o teto de 1024 MB da VPS.

## Estrutura principal

- `client/src/components/DealsLayout.tsx`: navegação DealHunter, sidebar desktop e menu mobile.
- `client/src/pages/DealsPages.tsx`: radar, ofertas, alertas, ranking, Premium, lotes, frete e extensão.
- `client/src/pages/CentralPages.tsx`: autenticação, perfil, suporte e privacidade.
- `server/db.ts`: persistência local e helpers de ofertas, favoritos, alertas, usuários e logs.
- `server/routers.ts`: contratos tRPC, autenticação, rate limit e operações administrativas.
- `client/public/manifest.json` e `client/public/sw.js`: instalação e cache da PWA.
- `squarecloud.app`: configuração de execução na VPS.

Arquivos de banco local e variáveis de ambiente não devem ser apagados sem backup, pois podem conter dados atuais da aplicação.
