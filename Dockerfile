FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef 
WORKDIR /source

# Using a separate prepare stage here to cache our dependencies
FROM chef AS build-server-prepare
COPY ./server-rs .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build-server
COPY --from=build-server-prepare /source/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

COPY ./server-rs .
RUN cargo build --config 'env.VERSION = "${VERSION}"' --release


FROM node:20 AS build-ui

WORKDIR /source

COPY ./ui/package.json package.json
COPY ./ui/package-lock.json package-lock.json
RUN npm install
COPY ui .
RUN npm run build


FROM debian:bookworm-slim AS runtime

WORKDIR /app
COPY --from=build-server /source/target/release .
COPY --from=build-ui /source/dist wwwroot

ENTRYPOINT ["./server-rs"]