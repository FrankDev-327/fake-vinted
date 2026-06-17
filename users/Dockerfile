FROM node:alpine as development
WORKDIR /usr/src/app
# Copy all config files in one line
COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.build.json orm.ts ./
RUN npm install -g pnpm@8.6.7 && pnpm install 

COPY . ./
RUN pnpm run build

FROM node:alpine as prod
ARG NODE_ENV=prod
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app

RUN npm install -g pnpm@8.6.7

COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=development /usr/src/app/orm.ts ./orm.ts
COPY --from=development /usr/src/app/dist ./dist

COPY package.json ./

EXPOSE 4000
CMD pnpm run migration:run && echo "Migration done!" && node dist/src/main