FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

RUN yarn install --frozen-lockfile

COPY apps/backend/ ./apps/backend/

# building
RUN cd apps/backend && npx prisma generate
RUN yarn workspace backend build

EXPOSE 3000

# running
CMD ["sh", "-c", "npx prisma migrate deploy --schema ./apps/backend/prisma/schema.prisma && node ./apps/backend/dist/main"]
