use std::time::Duration;

use tokio::time::Instant;

use crate::models::AppState;

pub fn start_cleanup_old_games(state: AppState) {
    tokio::spawn(async move {
        // Cleanup old games on a schedule
        let mut interval = tokio::time::interval(Duration::from_secs(60));
        loop {
            interval.tick().await;
            tracing::debug!("Searching for stale games to remove");
            let now = Instant::now();
            // Find games that haven't been updated in more than 30 mins
            let stale_games: Vec<String> = state
                .games
                .iter()
                .filter(|x| now.duration_since(x.last_updated) > Duration::from_secs(1800))
                .map(|x| x.key().clone())
                .collect();

            for game_id in stale_games {
                tracing::info!("Removing game {game_id} as it is stale");
                state.games.remove(&game_id);
            }
        }
    });
}
