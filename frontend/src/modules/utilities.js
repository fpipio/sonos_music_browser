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


export async function playOnSonos(hass, config, machineIdentifier, type, id, name = '', favicon = '') {
    const entityId = hass.states[config.player.activePlayer].state;
    console.log("Player state:", hass.states[entityId]);

    let serviceData;

    if (config.musicProvider.provider === 'radio') {
        serviceData = {
            entity_id: entityId,
            media_content_id: `media-source://radio_browser/${id}`,
            media_content_type: 'music',
            extra: {
                metadata: {
                    title: name,
                    media_class: 'music',
                    children_media_class: null
                }
            }
        };
    } else if (config.musicProvider.provider === 'plex') {
        serviceData = {
            entity_id: entityId,
            media_content_id: `plex://${machineIdentifier}/${id}`,
            media_content_type: type
        };
    } else if (config.musicProvider.provider === 'spotify') {
        serviceData = {
            entity_id: entityId,
            media_content_id: `spotify:${type}:${id}`,
            media_content_type: type
        };
    } else {
        throw new Error(`Unsupported music provider: ${config.musicProvider.provider}`);
    }

    console.log("Service data:", serviceData);

    try {
        console.log("Chiamata al servizio media_player.play_media");
        await hass.callService('media_player', 'play_media', serviceData);
        console.log("Chiamata al servizio completata");

        // Imposta radio_thumbnail e radio_name
        if (config.musicProvider.provider === 'radio') {
            console.log("Impostazione di radio_thumbnail e radio_name");
            await hass.callService('sonos_helper', 'set_radio_thumbnail', {
                entity_id: entityId,
                thumbnail: favicon
            });
            await hass.callService('sonos_helper', 'set_radio_name', {
                entity_id: entityId,
                name: name
            });
            console.log("Radio thumbnail e name impostati:", favicon, name);
        }

        // Verifica lo stato del player dopo la riproduzione
        setTimeout(async () => {
            const updatedState = hass.states[entityId];
            console.log("Stato del player dopo la riproduzione:", updatedState);
        }, 2000);
    } catch (error) {
        console.error(`Error playing ${type}:`, error);
        throw error;
    }
}