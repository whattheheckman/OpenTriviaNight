FROM rust:latest AS build-server

WORKDIR /source

COPY ./server-rs .
RUN cargo build --release

FROM node:20 AS build-ui

WORKDIR /source

COPY ./ui/package.json package.json
COPY ./ui/package-lock.json package-lock.json
RUN npm install
COPY ui .
RUN npm run build

FROM rust:latest

WORKDIR /app
COPY --from=build-server /source/target/release .
COPY --from=build-ui /source/dist wwwroot

ENTRYPOINT ["./server-rs"]