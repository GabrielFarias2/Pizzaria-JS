FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro para aproveitar o cache
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências (npm ci é mais rápido e confiável para builds)
RUN npm ci

# Gera o cliente do Prisma
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Expõe a porta que a aplicação usa
EXPOSE 8081

# Comando para iniciar a aplicação
# Nota: Em produção, migrações geralmente devem ser rodadas em um passo separado ou job de release
CMD ["npm", "start"]