# Stage 1: Build dependencies
FROM alpine AS builder

RUN apk add --update nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Stage 2: Create lightweight production image
FROM alpine

RUN apk add --update nodejs npm

WORKDIR /app
COPY --from=builder /app .
COPY /src ./src

CMD ["npm", "run", "start-prod"]