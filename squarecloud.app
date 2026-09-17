RUNTIME=nodejs
VERSION=recommended
MEMORY=950
DISPLAY_NAME=DealHunter
DESCRIPTION=Caçador de ofertas, alertas e comparação de preços
START=pnpm install --frozen-lockfile --prod=false && pnpm run build && pnpm run start
AUTORESTART=true
