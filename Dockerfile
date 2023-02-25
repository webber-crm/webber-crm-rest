FROM --platform=linux/amd64 node:18.14.0-alpine AS webber-crm
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 webber

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

COPY . .

USER webber
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "--", "run", "start"]

