# base stage
FROM node:20 AS base

# development stage
FROM base AS development
ARG APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .