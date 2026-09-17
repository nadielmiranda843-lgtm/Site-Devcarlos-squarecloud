RUNTIME=nodejs
VERSION=recommended
MEMORY=950
DISPLAY_NAME=DealHunter
DESCRIPTION=Caçador de ofertas, alertas e comparação de preços
START=export PORT=80 HOST=0.0.0.0 && npx --yes pnpm@10.4.1 install --frozen-lockfile --prod=false && npx --yes pnpm@10.4.1 run build && node dist/index.js
AUTORESTART=true
