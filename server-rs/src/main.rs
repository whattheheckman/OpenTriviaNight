mod actions;
mod background;
mod dto;
mod models;
mod ws;

use std::{net::SocketAddr, sync::Arc};

use actions::GameError;
use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use dashmap::DashMap;
use dto::{CreateGameRequest, StatsResponse};
use models::{AppState, Game};

use tower_http::{
    services::{ServeDir, ServeFile},
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState {
        games: Arc::new(DashMap::new()),
    };

    background::start_cleanup_old_games(state.clone());

    let serve_dir =
        ServeDir::new("wwwroot").not_found_service(ServeFile::new("wwwroot/index.html"));

    let app = Router::new()
        .nest_service("/", serve_dir.clone())
        .route("/api/stats", get(get_stats))
        .route("/api/games", post(create_game))
        .route(
            "/api/stream/games/:game_id/:role/:username",
            get(ws::join_game),
        )
        .route("/api/games/:game_id", get(get_game))
        .fallback_service(serve_dir)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        )
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

async fn get_stats(State(state): State<AppState>) -> StatsResponse {
    return StatsResponse {
        games_count: state.games.len(),
    };
}

async fn create_game(
    State(state): State<AppState>,
    Json(new_game): Json<CreateGameRequest>,
) -> Result<Game, GameError> {
    return state.create_game(new_game);
}

async fn get_game(
    Path(game_id): Path<String>,
    State(state): State<AppState>,
) -> Result<Game, GameError> {
    match state.games.get(&game_id.to_ascii_uppercase()) {
        Some(x) => return Ok(x.value().game.clone()),
        None => return Err(GameError::GameNotFound),
    }
}
