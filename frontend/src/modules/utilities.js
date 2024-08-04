// modules/utilities.js

// Funzione per formattare la durata in ore, minuti e secondi
export function formatDuration(duration) {
    const days = Math.floor(duration / 86400000); // 24 * 60 * 60 * 1000
    const hours = Math.floor((duration % 86400000) / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    let formattedDuration = '';

    // Se ci sono giorni, li aggiungiamo al formato
    if (days > 0) {
        formattedDuration += `${days}d `;
    }

    // Se ci sono ore, le aggiungiamo al formato
    if (hours > 0) {
        formattedDuration += `${hours}:`;
    }

    // Aggiungiamo i minuti al formato (anche se le ore sono 0)
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    formattedDuration += `${formattedMinutes}:`;

    // Aggiungiamo i secondi al formato
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    formattedDuration += formattedSeconds;

    return formattedDuration;
}



export async function playOnSonos(hass, config, machineIdentifier, type, id) {
    if (config.musicProvider.provider === 'plex') {
        try {
            console.log("Config", config.musicProvider.provider);
            await hass.callService('media_player', 'play_media', {
                entity_id: hass.states[config.player.activePlayer].state,
                media_content_type: 'music',
                media_content_id: `plex://${machineIdentifier}/${id}`
            });
        } catch (error) {
            console.error(`Error playing track:`, error);
        }
    
    } else if (config.musicProvider.provider === 'spotify') {
        try {
            await hass.callService('media_player', 'play_media', {
                entity_id: hass.states[config.player.activePlayer].state,
                media_content_type: type,
                media_content_id: `https://open.spotify.com/${type}/${id}`
            });
        } catch (error) {
            console.error(`Error playing playlist:`, error);
        }


    }
}

 
export async function playSpotifyOnSonos(hass, config, type, id) {
    try {
        await hass.callService('media_player', 'play_media', {
            entity_id: hass.states[config.player.activePlayer].state,
            media_content_type: 'playlist',
            media_content_id: `https://open.spotify.com/${type}/${id}`
        });
    } catch (error) {
        console.error(`Error playing playlist:`, error);
    }
}
