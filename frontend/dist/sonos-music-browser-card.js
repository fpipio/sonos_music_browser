const styles = `

.value {
    padding-left: 0.5em;
    display: flex;
    align-content: center;
    flex-wrap: wrap;
}

form {
    display: table;
}

.row {
    display: table-row;
}

.label, .value {
    display: table-cell;
    padding: 0.5em;
}

.media-type {
    margin-bottom: 20px;
}

.artist-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 10px;
}

.artist-item {
    border: 1px solid #ccc;
    text-align: left;
    white-space: nowrap;
}

.artist-detail-header, .album-detail-header {
    display: flex;
    margin-bottom: 20px;
}

.artist-detail-header-info, .album-detail-header-info {
    margin-left: 20px;
}

.artist-name, .album-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.artist-name {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
}

.artist-image, .album-image {
    max-width: 145px;
    max-height: 145px;
    object-fit: cover;
    aspect-ratio: 1 / 1;
}

.search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    margin-bottom: 5px;
}

.album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 10px;
}

.album-item {
    border: 1px solid #ccc;
    padding: 10px;
}

.album-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    aspect-ratio: 1 / 1;
}

.album-title {
    font-weight: bold;
    margin-top: 5px;
}

.album-year {
    color: #888;
    font-size: 0.9em;
}

.album-detail {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.track-container {
    margin-top: 20px;
}

.track-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 5px;
}

.track-item:last-child {
    border-bottom: none;
}

.track-item:hover {
    background-color: #f0f0f0;
}

.track-duration {
    float: right;
    font-size: 14px;
    color: #666;
    margin-left: auto;
}

.triangle-icon,
.track-name {
    margin-right: 10px;
}

.playlist-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    grid-gap: 10px;
}

.playlist-item {
    border: 1px solid #ccc;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.playlist-item:hover {
    transform: translateY(-5px);
}

.playlist-name {
    font-weight: bold;
}

.tracks-count, .total-duration {
    margin-top: 5px;
    font-size: 0.9em;
    color: #666;
}

.playlist-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.playlist-image {
    width: 145px;
    height: auto;
    margin-right: 10px;
    object-fit: cover;
    aspect-ratio: 1 / 1;
}

.playlist-title {
    font-size: 20px;
    font-weight: bold;
}

.total-duration {
    margin-left: auto;
}

.track-details {
    display: flex;
    flex-direction: column;
}

.track-title {
    font-weight: bold;
    padding-right: 5px;
}

.author-album {
    font-style: italic;
    padding-right: 5px;
}

.playlist-type {
    font-size: 14px;
    font-style: italic;
    margin-bottom: 5px;
}

.play-button {
    margin-left: auto;
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.play-button:hover {
    background-color: #0056b3;
}


.radio-station-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    width: 100px;
    margin: 10px;
    text-align: center;
}

.radio-station-image-container {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.radio-station-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
}

.radio-station-name {
    font-size: 14px;
    word-wrap: break-word;
    max-width: 100%;
}

.playlist-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
}

`;

function getMachineIdentifier(plexServerUrl, authToken) {
    return fetch(`${plexServerUrl}/identity`, {
        headers: {
            "X-Plex-Token": authToken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Errore durante la richiesta delle sezioni della libreria");
        }
        return response.text();
    })
    .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const machineIdentity = xmlDoc.querySelector("MediaContainer");
        const machineIdentifier = machineIdentity.getAttribute("machineIdentifier");
        return machineIdentifier;

    })
    .catch(error => {
        console.error("Errore durante il recupero dell'ID della libreria della musica:", error);
    });
}



function getMusicLibraryId(plexServerUrl, authToken, activeLibrary) {
    return fetch(`${plexServerUrl}/library/sections`, {
        headers: {
            "X-Plex-Token": authToken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Errore durante la richiesta delle sezioni della libreria");
        }
        return response.text();
    })
    .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const musicSection = xmlDoc.querySelector(`Directory[type="artist"][title="${activeLibrary}"]`);
        const musicLibraryId = musicSection.getAttribute("key");

        return musicLibraryId;
        // Etc...
    })
    .catch(error => {
        console.error("Errore durante il recupero dell'ID della libreria della musica:", error);
    });
}

async function getArtistLibrary(musicLibraryId, plexServerUrl, authToken) {
    try {
        const response = await fetch(`${plexServerUrl}/library/sections/${musicLibraryId}/all`, {
            headers: {
                "X-Plex-Token": authToken,
            },
        });

        if (!response.ok) {
            throw new Error("Errore durante la richiesta degli artisti della libreria");
        }

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const artists = xmlDoc.querySelectorAll('Directory[type="artist"]');

        const artistLibrary = [];
        const linkTrascode = "/photo/:/transcode?width=200&height=220&minSize=1&upscale=1&url=";
        artists.forEach(artist => {
            const artistName = artist.getAttribute("title");
            const artistImage = artist.getAttribute("thumb"); // Assume che ci sia un attributo 'thumb' nell'elemento artista che contenga l'URL dell'immagine dell'artista
            const artistKey = artist.getAttribute("ratingKey"); // Assume che ci sia un attributo 'thumb' nell'elemento artista che contenga l'URL dell'immagine dell'artista
            const artistImageUrl = 
            plexServerUrl +
            linkTrascode +
            artistImage +
            "&X-Plex-Token=" +
            authToken;

            const artistData = {
                name: artistName,
                image: artistImageUrl,
                artistKey: artistKey
            };
            artistLibrary.push(artistData);
        });

        return artistLibrary;
    } catch (error) {
        throw new Error("Errore durante il recupero degli artisti della libreria:", error);
    }
}



// Definisci la funzione getArtistAlbums
async function getArtistAlbums(artistKey, plexServerUrl, authToken) {
    try {
        // Effettua la richiesta API per ottenere la lista degli album dell'artista
        // Utilizza fetch o una libreria per effettuare la richiesta HTTP
        const response = await fetch(`${plexServerUrl}/library/metadata/${artistKey}/children`, {
            headers: {
                "X-Plex-Token": authToken,
            },
        });

        // Controlla lo stato della risposta
        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }

        // Estrai i dati JSON dalla risposta

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const albums = xmlDoc.querySelectorAll('Directory[type="album"]');




        const albumList = [];
        const linkTrascode = "/photo/:/transcode?width=200&height=220&minSize=1&upscale=1&url=";
        albums.forEach(album => {
            const albumName = album.getAttribute("title");
            const albumImage = album.getAttribute("thumb"); // Assume che ci sia un attributo 'thumb' nell'elemento artista che contenga l'URL dell'immagine dell'artista
            const albumKey = album.getAttribute("ratingKey"); // Assume che ci sia un attributo 'thumb' nell'elemento artista che contenga l'URL dell'immagine dell'artista
            const albumYear = album.getAttribute("year"); // Assume che ci sia un attributo 'thumb' nell'elemento artista che contenga l'URL dell'immagine dell'artista
            const parentTitle = album.getAttribute("parentTitle");
            const albumImageUrl = 
            plexServerUrl +
            linkTrascode +
            albumImage +
            "&X-Plex-Token=" +
            authToken;

            const albumData = {
                name: albumName,
                image: albumImageUrl,
                albumKey: albumKey,
                year: albumYear,
                parentTitle: parentTitle
            };
            albumList.push(albumData);
        });

        return albumList;
        




    } catch (error) {
        // Gestisci gli errori
        console.error('Errore durante il recupero degli album dell\'artista:', error);
        throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
}


// Definisci la funzione getAlbumTracks
async function getAlbumTracks(albumKey, plexServerUrl, authToken) {
    try {
        // Effettua la richiesta API per ottenere la lista delle tracce dell'album
        // Utilizza fetch o una libreria per effettuare la richiesta HTTP
        const response = await fetch(`${plexServerUrl}/library/metadata/${albumKey}/children`, {
            headers: {
                "X-Plex-Token": authToken,
            },
        });
        // Controlla lo stato della risposta
        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }

        // Estrai i dati JSON dalla risposta

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const tracks = xmlDoc.querySelectorAll("Track");

        const trackList = [];
//        const linkTrascode = "/photo/:/transcode?width=200&height=220&minSize=1&upscale=1&url=";
        tracks.forEach(track => {
            const trackName = track.getAttribute("title");
            const trackDuration = track.getAttribute("duration");
            const trackId = track.getAttribute("ratingKey");

            const trackData = {
                name: trackName,
                duration: trackDuration,
                trackId: trackId
            };
            trackList.push(trackData);
        });

        return trackList;
        
    } catch (error) {
        // Gestisci gli errori
        console.error('Errore durante il recupero delle tracce dell\'album:', error);
        throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
}


async function getPlexPlaylists(plexServerUrl, authToken) {
    try {
        const response = await fetch(`${plexServerUrl}/playlists`, {
            headers: {
                "X-Plex-Token": authToken,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch Plex playlists");
        }

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const playlists = xmlDoc.querySelectorAll('Playlist');



        const playlistList = [];
        const linkTrascode = "/photo/:/transcode?width=200&height=220&minSize=1&upscale=1&url=";
        playlists.forEach(playlist => {
        const playlistsName = playlist.getAttribute("title");
        const playlistDuration = playlist.getAttribute("duration");
        const playlistId = playlist.getAttribute("ratingKey");
        const playlistLength = playlist.getAttribute("leafCount");
        const playlistImage = playlist.getAttribute("composite");
        const playlistImageUrl = 
        plexServerUrl +
        linkTrascode +
        playlistImage +
        "&X-Plex-Token=" +
        authToken;

        const playlistData = {
            playlistName: playlistsName,
            playlistDuration: playlistDuration,
            playlistId: playlistId,
            playlistLength: playlistLength,
            playlistImageUrl: playlistImageUrl
        };
            playlistList.push(playlistData);
        });
        return playlistList;
    } catch (error) {
        throw new Error(`Error fetching Plex playlists: ${error.message}`);
    }
}


// Definisci la funzione PlaylistTracks
async function getPlaylistTracks(playlistId, plexServerUrl, authToken) {
    try {
        // Effettua la richiesta API per ottenere la lista delle tracce dell'album
        // Utilizza fetch o una libreria per effettuare la richiesta HTTP
        const response = await fetch(`${plexServerUrl}/playlists/${playlistId}/items`, {
            headers: {
                "X-Plex-Token": authToken,
            },
        });
        // Controlla lo stato della risposta
        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }

        // Estrai i dati JSON dalla risposta

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const tracks = xmlDoc.querySelectorAll("Track");

        const trackList = [];
//        const linkTrascode = "/photo/:/transcode?width=200&height=220&minSize=1&upscale=1&url=";
        tracks.forEach(track => {
            const trackName = track.getAttribute("title");
            const trackDuration = track.getAttribute("duration");
            const trackParentTitle = track.getAttribute("parentTitle");
            const trackGrandparentTitle = track.getAttribute("grandparentTitle");
            const trackId = track.getAttribute("ratingKey");

            const trackData = {
                name: trackName,
                duration: trackDuration,
                trackId: trackId,
                albumName: trackParentTitle ,
                authorName: trackGrandparentTitle

            };
            trackList.push(trackData);
        });

        return trackList;
        
    } catch (error) {
        // Gestisci gli errori
        console.error('Errore durante il recupero delle tracce dell\'album:', error);
        throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
}

class SonosMusicBrowserEditor extends HTMLElement {
    // Proprietà private
    _config;
    _hass;
    _elements = {};

    // Ciclo di vita
    constructor() {
        super();
        this.doEditor();
        this.doStyle();
        this.doAttach();
        this.doQueryElements();
        this.doListen();
    }

    setConfig(config) {

        this._config = config;
        // Se activePlayer non è definito o è vuoto, impostalo al valore predefinito
        if (!this._config.player || !this._config.player.activePlayer) {
            this._config.player = this._config.player || {};
            this._config.player.activePlayer = 'input_text.active_player';
        }
        this.doUpdateConfig();
    }

    set hass(hass) {
        this._hass = hass;
        this.doUpdateHass();
    }

    onChanged(event) {
        this.doMessageForUpdate(event);
    }

    // Azioni
    doEditor() {
        this._elements.editor = document.createElement("form");
        this._elements.editor.innerHTML = `
            <div class="grid-container">
                <div class="grid-item">
                    <label class="label" for="activePlayer">Active Player:</label>
                    <input class="value" id="activePlayer"></input>
                </div>
                <div class="grid-item">
                    <label class="label" for="musicProvider">Music Provider:</label>
                    <select class="value" id="musicProvider">
                        <option value="plex">Plex</option>
                        <option value="spotify">Spotify</option>
                        <option value="radio">Radio</option>
                    </select>
                </div>
                <div class="grid-item plex-only">
                    <label class="label" for="plexServerUrl">Plex Server URL:</label>
                    <input class="value" id="plexServerUrl"></input>
                </div>
                <div class="grid-item plex-only">
                    <label class="label" for="authToken">Auth Token:</label>
                    <input class="value" id="authToken"></input>
                </div>
                <div class="grid-item plex-only">
                    <label class="label" for="sourceType">Source Type:</label>
                    <select class="value" id="sourceType">
                        <option value="">Select Source Type</option>
                        <option value="library">Library</option>
                        <option value="playlist">Playlist</option>
                    </select>
                </div>
                <div class="grid-item plex-only" id="activeLibraryRow" style="display: none;">
                    <label class="label" for="activeLibrary">Active Library:</label>
                    <input class="value" id="activeLibrary"></input>
                </div>
                <div class="grid-item spotify-only" id="spotifyFields" style="display: none;">
                    <label class="label" for="clientId">Client ID:</label>
                    <input class="value" id="clientId"></input>
                    <label class="label" for="clientSecret">Client Secret:</label>
                    <input class="value" id="clientSecret"></input>
                    <label class="label" for="redirectUri">Redirect URI:</label>
                    <input class="value" id="redirectUri"></input>
                    <label class="label" for="refreshToken">Refresh Token:</label>
                    <input class="value" id="refreshToken"></input>
                </div>
            </div>
        `;
    }

    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = `
            .grid-container {
                display: grid;
                grid-template-columns: repeat(1, .7fr);
                gap: 1em;
                align-items: center;
            }
            .grid-item {
                display: flex;
                flex-direction: column;
            }
            .label, .value {
                display: block;
            }
            .plex-only {
                margin-left: 50px;
            }
        `;
    }

    doAttach() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(this._elements.style, this._elements.editor);
    }

    doQueryElements() {
        this._elements.activePlayer = this._elements.editor.querySelector("#activePlayer");
        this._elements.musicProvider = this._elements.editor.querySelector("#musicProvider");
        this._elements.plexServerUrl = this._elements.editor.querySelector("#plexServerUrl");
        this._elements.authToken = this._elements.editor.querySelector("#authToken");
        this._elements.sourceType = this._elements.editor.querySelector("#sourceType");
        this._elements.activeLibrary = this._elements.editor.querySelector("#activeLibrary");
        this._elements.activeLibraryRow = this._elements.editor.querySelector("#activeLibraryRow");
        this._elements.clientId = this._elements.editor.querySelector("#clientId");
        this._elements.clientSecret = this._elements.editor.querySelector("#clientSecret");
        this._elements.redirectUri = this._elements.editor.querySelector("#redirectUri");
        this._elements.refreshToken = this._elements.editor.querySelector("#refreshToken");
        this._elements.spotifyFields = this._elements.editor.querySelector(".spotify-only");
    }

    doListen() {
        this._elements.activePlayer.addEventListener("focusout", this.onChanged.bind(this));
        this._elements.musicProvider.addEventListener("change", this.onChanged.bind(this));
        this._elements.plexServerUrl.addEventListener("focusout", this.onChanged.bind(this));
        this._elements.authToken.addEventListener("focusout", this.onChanged.bind(this));
        this._elements.sourceType.addEventListener("change", this.onChanged.bind(this));
        this._elements.activeLibrary.addEventListener("focusout", this.onChanged.bind(this));
        this._elements.clientId.addEventListener("focusout", this.onChanged.bind(this)); 
        this._elements.clientSecret.addEventListener("focusout", this.onChanged.bind(this));
        this._elements.redirectUri.addEventListener("focusout", this.onChanged.bind(this)); 
        this._elements.refreshToken.addEventListener("focusout", this.onChanged.bind(this));

        this._elements.musicProvider.addEventListener("change", this.updateVisibility.bind(this));
        this._elements.sourceType.addEventListener("change", this.updateVisibility.bind(this));
    }

    doUpdateConfig() {
        this._elements.activePlayer.value = this._config.player && this._config.player.activePlayer ? this._config.player.activePlayer : 'input_text.active_player';
        this._elements.musicProvider.value = this._config.musicProvider && this._config.musicProvider.provider ? this._config.musicProvider.provider : '';
        this._elements.plexServerUrl.value = this._config.plexServerUrl || '';
        this._elements.authToken.value = this._config.authToken || '';
        this._elements.sourceType.value = this._config.sourceType || '';
        this._elements.activeLibrary.value = this._config.activeLibrary || '';
        this._elements.clientId.value = this._config.clientId || '';
        this._elements.clientSecret.value = this._config.clientSecret || '';
        this._elements.redirectUri.value = this._config.redirectUri || '';
        this._elements.refreshToken.value = this._config.refreshToken || '';

        this.updateVisibility();
    }

    updateVisibility() {
        const isPlex = this._elements.musicProvider.value === 'plex';
        const isSpotify = this._elements.musicProvider.value === 'spotify';
        const isLibrary = this._elements.sourceType.value === 'library';
        const isPlaylist = this._elements.sourceType.value === 'playlist';
    
        this._elements.editor.querySelectorAll('.plex-only').forEach(el => {
            el.style.display = isPlex ? 'table-row' : 'none';
        });
    
        if (this._elements.activeLibraryRow) {
            this._elements.activeLibraryRow.style.display = isPlex && isLibrary && !isPlaylist ? 'table-row' : 'none'; // Aggiunto la condizione !isPlaylist
        }
    
    
        if (isSpotify) {
            this._elements.spotifyFields.style.display = 'table-row';
        } else {
            this._elements.spotifyFields.style.display = 'none';
        }
    }
    
    

    doUpdateHass() {
    }

    doMessageForUpdate(changedEvent) {
        const newConfig = Object.assign({}, this._config);
        if (changedEvent.target.id == "activePlayer") {
            newConfig.player = newConfig.player || {};
            newConfig.player.activePlayer = changedEvent.target.value;
        } else if (changedEvent.target.id == "musicProvider") {
            newConfig.musicProvider = newConfig.musicProvider || {};
            newConfig.musicProvider.provider = changedEvent.target.value;
        } else if (changedEvent.target.id == "plexServerUrl") {
            newConfig.plexServerUrl = changedEvent.target.value;
        } else if (changedEvent.target.id == "authToken") {
            newConfig.authToken = changedEvent.target.value;
        } else if (changedEvent.target.id == "sourceType") {
            newConfig.sourceType = changedEvent.target.value;
        } else if (changedEvent.target.id == "activeLibrary") {
            newConfig.activeLibrary = changedEvent.target.value;
        } else if (changedEvent.target.id == "clientId") {
            newConfig.clientId = changedEvent.target.value;
        } else if (changedEvent.target.id == "clientSecret") {
            newConfig.clientSecret = changedEvent.target.value;
        } else if (changedEvent.target.id == "redirectUri") {
            newConfig.redirectUri = changedEvent.target.value;
        } else if (changedEvent.target.id == "refreshToken") {
            newConfig.refreshToken = changedEvent.target.value;
        }
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }
}

// modules/utilities.js

// Funzione per formattare la durata in ore, minuti e secondi
function formatDuration(duration) {
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


async function playOnSonos(hass, config, machineIdentifier, type, id, name = '', favicon = '') {
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

class SpotifyAPI {
    constructor(spClientId, spClientSecret, spRedirectUri, spRefreshToken) {

        this.clientId = spClientId;
        this.clientSecret = spClientSecret;
        this.redirectUri = spRedirectUri;
        this.refreshToken = spRefreshToken;
        this.accessToken = null;
        
        
    }

    async authenticate() {
        try {
            const authHeader = 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`);

            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Errore durante l\'ottenimento del nuovo access token: ' + response.statusText);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
        } catch (error) {
            console.error('Errore durante l\'ottenimento del nuovo access token:', error);
            throw error;
        }
    }

    async getPlaylists() {
        try {
            if (!this.accessToken) {
                throw new Error('Token di accesso non valido. Esegui prima l\'autenticazione.');
            }

            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken
                }
            });

            if (!response.ok) {
                throw new Error('Errore durante il recupero delle playlist da Spotify: ' + response.statusText);
            }

            const data = await response.json();
            const playlists = data.items.map(item => {
                return {
                    playlistId: item.id,
                    playlistName: item.name,
                    description: item.description,
                    playlistLength: item.tracks.total,
                    playlistImageUrl: item.images[0].url
                };
            });

            return playlists;
        } catch (error) {
            console.error('Errore durante il recupero delle playlist da Spotify:', error);
            throw error;
        }
    }

    async getPlaylistTracks(playlistId) {
        try {
            if (!this.accessToken) {
                throw new Error('Token di accesso non valido. Esegui prima l\'autenticazione.');
            }

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken
                }
            });

            if (!response.ok) {
                throw new Error('Errore durante il recupero delle tracce della playlist da Spotify: ' + response.statusText);
            }

            const data = await response.json();
            const tracks = data.items.map(item => {
                return {
                    trackId: item.track.id,
                    name: item.track.name,
                    authorName: item.track.artists[0].name,
                    albumName: item.track.album.name,
                    duration: item.track.duration_ms
                };
            });

            return tracks;
        } catch (error) {
            console.error('Errore durante il recupero delle tracce della playlist da Spotify:', error);
            throw error;
        }
    }
    doMessageForUpdate(changedEvent) {
        console.log("doMessageForUpdate(changedEvent)");
        const newConfig = Object.assign({}, this._config);
        if (changedEvent.target.id == "activePlayer") {
            newConfig.player = newConfig.player || {};
            newConfig.player.activePlayer = changedEvent.target.value;
        } else if (changedEvent.target.id == "musicProvider") {
            newConfig.musicProvider = newConfig.musicProvider || {};
            newConfig.musicProvider.provider = changedEvent.target.value;
        } else if (changedEvent.target.id == "plexServerUrl") {
            newConfig.plexServerUrl = changedEvent.target.value;
        } else if (changedEvent.target.id == "authToken") {
            newConfig.authToken = changedEvent.target.value;
        } else if (changedEvent.target.id == "sourceType") {
            newConfig.sourceType = changedEvent.target.value;
        } else if (changedEvent.target.id == "activeLibrary") {
            newConfig.activeLibrary = changedEvent.target.value;
        } else if (changedEvent.target.id == "clientId") {
            newConfig.clientId = changedEvent.target.value;
        } else if (changedEvent.target.id == "clientSecret") {
            newConfig.clientSecret = changedEvent.target.value;
        } else if (changedEvent.target.id == "redirectUri") {
            newConfig.redirectUri = changedEvent.target.value;
        } else if (changedEvent.target.id == "refreshToken") {
            newConfig.refreshToken = changedEvent.target.value;
        }
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }


}

class SonosMusicBrowser extends HTMLElement {

    // private properties
    _config;
    _hass;
    _elements = {};
    _machineIdentifier;

    // lifecycle
    constructor() {
        super();
        this.doCard();
        this.doStyle();
        this.doAttach();
        this.doQueryElements();
    }    

    async setConfig(config) {
        this._config = config;
        
        if (!this._config.musicProvider || !this._config.musicProvider.provider) {
            throw new Error("La configurazione del provider musicale è mancante");
        }
        
        if (this._config.musicProvider.provider === 'radio' && (!this._config.radioStations || !Array.isArray(this._config.radioStations))) {
            throw new Error("La configurazione delle stazioni radio non è valida");
        }
        
        this.doCheckConfig();
        this.doUpdateConfig();
    
        try {
            await this.handleProvider();
        } catch (error) {
            console.error("Errore durante la configurazione della card:", error);
        }
    }
    

    set hass(hass) {
        this._hass = hass;
    }

    async handleProvider() {
        switch (this._config.musicProvider.provider) {
            case "plex":
                await this.handlePlexProvider();
                break;
            case "spotify":
                this.handleSpotifyProvider();
                break;
            case "radio":
                await this.handleRadioProvider();
                break;
            default:
                console.error("Provider non supportato:", this._config.provider);
        }
    }

    async handleRadioProvider() {
        console.log("Gestione provider radio");
        
        if (!this._config.radioStations || !Array.isArray(this._config.radioStations)) {
            console.error("Nessuna stazione radio configurata");
            return;
        }

        if (!(await this.checkNetworkConnection())) {
            console.error("Nessuna connessione di rete attiva");
            return;
        }

        this.showLoadingIndicator();

        const stationPromises = this._config.radioStations.map(station => this.fetchRadioStationDetails(station));
        const results = await Promise.allSettled(stationPromises);
        
        const stationDetails = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);

        this.hideLoadingIndicator();
        this.populateRadioStationList(stationDetails);
    }

    async fetchRadioStationDetails(station, maxRetries = 3) {
        const apiUrl = `https://de1.api.radio-browser.info/json/stations/byuuid/${station.uuid}`;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    return {
                        name: data[0].name,
                        url: data[0].url,
                        favicon: station.favicon || data[0].favicon,
                        stationUuid: station.uuid
                    };
                }
            } catch (error) {
                console.error(`Tentativo ${attempt + 1} fallito per la stazione ${station.uuid}:`, error);
                if (attempt === maxRetries - 1) {
                    console.error(`Impossibile recuperare i dettagli per la stazione ${station.uuid} dopo ${maxRetries} tentativi`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000)); // Attendi 1 secondo prima di riprovare
            }
        }
        return null;
    }

    populateRadioStationList(stations) {
        this.hideSearchInput();
        const radioContainer = this._elements.playlistContainer;
        if (!radioContainer) {
            console.error("Elemento radio-container non trovato.");
            return;
        }
    
        radioContainer.innerHTML = "";
    
        stations.forEach(station => {
            const stationItem = document.createElement("div");
            stationItem.classList.add("radio-station-item");
    
            const stationImageContainer = document.createElement("div");
            stationImageContainer.classList.add("radio-station-image-container");
    
            const stationImage = document.createElement("img");
            stationImage.classList.add("radio-station-image");
            stationImage.src = station.favicon || 'path/to/default/radio/icon.png';
            stationImage.alt = station.name;
            stationImageContainer.appendChild(stationImage);
    
            const stationName = document.createElement("div");
            stationName.classList.add("radio-station-name");
            stationName.textContent = station.name;
    
            stationItem.appendChild(stationImageContainer);
            stationItem.appendChild(stationName);
    
            stationItem.addEventListener("click", () => {
                this.playRadioStation(station);
            });
    
            radioContainer.appendChild(stationItem);
        });
    }

    playRadioStation(station) {
        console.log("playRadioStation chiamato con:", station);
        station.favicon;
        try {
            if (!station || !station.stationUuid) {
                console.error("Dati della stazione non validi:", station);
                return;
            }
            console.log("Tentativo di riproduzione della stazione:", station.name);
    
            playOnSonos(
                this._hass, 
                this._config, 
                this._machineIdentifier, 
                "radio", 
                station.stationUuid, 
                station.name, 
                station.favicon || '' // Usa una stringa vuota se la favicon non è disponibile
            );
        } catch (error) {
            console.error("Error playing radio station:", error);
        }
    }

    async checkNetworkConnection() {
        try {
            const response = await fetch('https://www.google.com', { mode: 'no-cors' });
            return true;
        } catch (error) {
            console.error('Errore di connessione:', error);
            return false;
        }
    }    


    showLoadingIndicator() {
        const radioContainer = this._elements.playlistContainer;
        radioContainer.innerHTML = "<div>Caricamento stazioni radio...</div>";
    }
    
    
    hideLoadingIndicator() {
        const radioContainer = this._elements.playlistContainer;
        radioContainer.innerHTML = "";
    }

    async handlePlexProvider() {
        await this.retrieveMachineIdentifier();
        try {
            if (this._config.sourceType === "library") {
                const musicLibraryId = await this.retrieveMusicLibraryId();
                const artistLibrary = await this.retrieveArtistLibrary(musicLibraryId);
                this.populateArtistList(artistLibrary);
            } else if (this._config.sourceType === "playlist") {
                const playlists = await this.retrievePlexPlaylists();
                this.populatePlaylistList(playlists);
            }
        } catch (error) {
            console.error("Errore durante il recupero della libreria musicale o delle playlist:", error);
        }
    }
    
    async handleSpotifyProvider() {
        try {
            // Autenticazione con Spotify
            const spClientId=this._config.clientId;
            const spClientSecret=this._config.clientSecret; 
            const spRedirectUri=this._config.redirectUri;
            const spRefreshToken=this._config.refreshToken;

            
            const spotifyAPI = new SpotifyAPI(spClientId, spClientSecret, spRedirectUri, spRefreshToken);
            await spotifyAPI.authenticate();

            // Ottenere le playlist dell'utente
            const playlists = await spotifyAPI.getPlaylists();
            // Popolare la lista delle playlist nell'interfaccia
            this.populatePlaylistList(playlists);
        } catch (error) {
            console.error("Errore durante il recupero delle playlist da Spotify:", error);
        }
    }



    async retrieveMachineIdentifier() {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;

        try {
            // Effettua la chiamata alle API di Plex per ottenere la lista degli album dell'artista
            const machineIdentifier = await getMachineIdentifier(confPlexServerUrl, confAuthToken);
            this._machineIdentifier = machineIdentifier;
        } catch (error) {
            console.error("Errore durante il recupero degli album dell'artista:", error);
            throw error;
        }
    }

    onClicked() {
        this.doToggle();
    }

    getHeader() {
        return this._config.header;
    }

    getEntityID() {
        return this._config.entity;
    }

    getState() {
        return this._hass.states[this.getEntityID()];
    } 

    getAttributes() {
        return this.getState().attributes
    }

    getName() {
        const friendlyName = this.getAttributes().friendly_name;
        return friendlyName ? friendlyName : this.getEntityID();
    }


    doCheckConfig() {

//        if (!this._config || !this._config.player || !this._config.player.activePlayer) {
//            throw new Error("Please define an activePlayer!");
//        }
    }


    doQueryElements() {
        const card = this._elements.card;
        this._elements.artistContainer = card.querySelector(".artist-container");
        this._elements.playlistContainer = card.querySelector(".playlist-container");
        this._elements.searchInput = card.querySelector(".search-input");
        this._elements.searchInput.addEventListener("input", () => {
            this.filterArtistList(this._elements.searchInput.value);
        });
    }



    doCard() {
        this._elements.card = document.createElement("ha-card");
    
        // Creazione degli elementi HTML utilizzando JavaScript
        const cardContent = document.createElement("div");
        cardContent.classList.add("card-content");
    
        // Aggiungi un div artists-card
        const artistsCard = document.createElement("div");
        artistsCard.classList.add("artists-card");

        // Aggiungi un div playlists-card
        const playlistsCard = document.createElement("div");
        playlistsCard.classList.add("playlists-card");        
    
        // Aggiungi un input per la casella di ricerca
        const searchInput = document.createElement("input");
        searchInput.classList.add("search-input");
        searchInput.setAttribute("type", "text");
        searchInput.setAttribute("placeholder", "Search artists...");
        artistsCard.appendChild(searchInput);
    
        // Aggiungi un div per contenere la lista degli artisti
        const artistContainer = document.createElement("div");
        artistContainer.classList.add("artist-container");
        artistsCard.appendChild(artistContainer);

        // Aggiungi un div per contenere la lista delle playlist
        const playlistContainer = document.createElement("div");
        playlistContainer.classList.add("playlist-container");
        playlistsCard.appendChild(playlistContainer);
        
    
        // Aggiungi artists-card a cardContent
        cardContent.appendChild(artistsCard);

        // Aggiungi artists-card a cardContent
        cardContent.appendChild(playlistsCard);
        

        // Aggiungi cardContent all'elemento card
        this._elements.card.appendChild(cardContent);

    }

    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = styles; // Utilizza lo stile importato
    }

    doAttach() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(this._elements.style, this._elements.card);
    }

//    doQueryElements() {
//        const card = this._elements.card;
//        this._elements.artistContainer = card.querySelector(".artist-container");
//        this._elements.playlistContainer = card.querySelector(".playlist-container");
//    }

    doUpdateConfig() {
        this._elements.card.removeAttribute("header");
    }

    async retrieveMusicLibraryId() {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;
        const confActiveLibrary = this._config.activeLibrary;

        try {
            const musicLibraryId = await getMusicLibraryId(confPlexServerUrl, confAuthToken, confActiveLibrary);
            return musicLibraryId;
        } catch (error) {
            console.error("Errore durante il recupero dell'ID della libreria della musica:", error);
        }
    }

    async retrievePlexPlaylists() {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;
    
        try {
            // Effettua la chiamata alle API di Plex per ottenere la lista delle playlist
            const playlists = await getPlexPlaylists(confPlexServerUrl, confAuthToken);
            return playlists;
        } catch (error) {
            console.error("Errore durante il recupero delle playlist da Plex:", error);
            throw error;
        }
    }
    


    async retrieveArtistLibrary(musicLibraryId) {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;

        try {
            const artistLibrary = await getArtistLibrary(musicLibraryId, confPlexServerUrl, confAuthToken);
            return artistLibrary;
        } catch (error) {
            console.error("Errore durante il recupero dell'ID della libreria della musica:", error);
        }
    }

    populateArtistList(artistLibrary) {
        const artistContainer = this._elements.artistContainer;
        if (!artistContainer) {
            console.error("Elemento artist-container non trovato. Assicurati che esista nell'HTML.");
            return;
        }

        artistContainer.innerHTML = "";

        artistLibrary.forEach(artist => {
            const artistItem = document.createElement("div");
            artistItem.classList.add("artist-item");

            const artistImage = document.createElement("img");
            artistImage.classList.add("artist-image");
            artistImage.src = artist.image;
            artistImage.alt = artist.name;
            artistItem.appendChild(artistImage);

            const artistName = document.createElement("div");
            artistName.classList.add("artist-name");
            artistName.textContent = artist.name;
            artistItem.appendChild(artistName);

            artistItem.addEventListener("click", () => {
                this.showArtistDetail(artist);
            });

            artistContainer.appendChild(artistItem);
        });
    }

    populatePlaylistList(playlists) {
        this.hideSearchInput();
        const playlistContainer = this._elements.playlistContainer;
        if (!playlistContainer) {
            console.error("Elemento playlist-container non trovato. Assicurati che esista nell'HTML.");
            return;
        }
    
        // Cancella il contenuto dell'elemento playlistContainer
        playlistContainer.innerHTML = "";
    
        // Itera attraverso le playlist e crea elementi HTML per ognuna
        playlists.forEach(playlist => {
            //elimino la playlist di plex "All Music", troppo grande e non ha senso
            if (playlist.playlistLength > 0 && playlist.playlistName !== "All Music") {
                const playlistItem = document.createElement("div");
                playlistItem.classList.add("playlist-item");
    
                // Immagine della playlist
                const playlistImage = document.createElement("img");
                playlistImage.classList.add("playlist-image");
                playlistImage.src = playlist.playlistImageUrl;
                playlistItem.appendChild(playlistImage);
    
                // Nome della playlist
                const playlistName = document.createElement("div");
                playlistName.classList.add("playlist-name");
                playlistName.textContent = playlist.playlistName;
                playlistItem.appendChild(playlistName);
    
                // Numero di tracce nella playlist
                const tracksCount = document.createElement("div");
                tracksCount.classList.add("tracks-count");
                tracksCount.textContent = `Tracks: ${playlist.playlistLength}`;
                playlistItem.appendChild(tracksCount);
    
                // Durata totale della playlist
                if (this._config.musicProvider.provider == "plex") {
                    const totalDuration = document.createElement("div");
                    totalDuration.classList.add("total-duration");
                    totalDuration.textContent = `Duration: ${formatDuration(playlist.playlistDuration)}`;
                    playlistItem.appendChild(totalDuration);
                }
    
                // Aggiungi un gestore di eventi al clic sulla playlist
                playlistItem.addEventListener("click", () => {
                    this.showPlaylistDetail(playlist);
                });
    
                playlistContainer.appendChild(playlistItem);
            }
        });
    }


    
        

    
    async showArtistDetail(artist) {
        const cardContent = this._elements.card.querySelector(".card-content");
        const artistsCard = this._elements.card.querySelector(".artists-card");
    
        artistsCard.style.display = "none";
    
        const artistDetail = document.createElement("div");
        artistDetail.classList.add("artist-detail");
    
        // Aggiungi il div artist-detail-header
        const artistDetailHeader = document.createElement("div");
        artistDetailHeader.classList.add("artist-detail-header");
    
        // Aggiungi l'immagine dell'artista all'interno di artist-detail-header
        const artistImage = document.createElement("img");
        artistImage.classList.add("artist-image");
        artistImage.src = artist.image; // Assumi che ci sia un campo 'image' nell'oggetto artista che contenga l'URL dell'immagine
        artistDetailHeader.appendChild(artistImage);
    
    
        // Aggiungi artistDetailHeaderInfo a artist-detail-header
        const artistDetailHeaderInfo = document.createElement("div");
        artistDetailHeaderInfo.classList.add("artist-detail-header-info");

        // Aggiungi artistName a artist-detail-header
        const artistName = document.createElement("div");
        artistName.classList.add("artist-name");
        artistName.textContent = artist.name; // Assumi che ci sia un campo 'name' nell'oggetto artista che contenga il nome dell'artista
        artistDetailHeaderInfo.appendChild(artistName);        


       // Aggiungi "Artista"  a artist-detail-header
       const mediaType = document.createElement("div");
       mediaType.classList.add("media-type");
       mediaType.textContent = "Artista";
       artistDetailHeaderInfo.appendChild(mediaType);        


        // Aggiungi il pulsante "Riproduci"
        const playButton = document.createElement("button");
        playButton.classList.add("play-button");
        playButton.textContent = "Riproduci";
        playButton.addEventListener("click", (event) => {
            event.stopPropagation();
            playOnSonos(this._hass, this._config, this._machineIdentifier, "music", artist.artistKey);
        });
        artistDetailHeaderInfo.appendChild(playButton);
    
        artistDetailHeader.appendChild(artistDetailHeaderInfo);
    
        // Aggiungi artist-detail-header a artist-detail
        artistDetail.appendChild(artistDetailHeader);
    
        // Effettua la chiamata alle API di Plex per ottenere la lista degli album dell'artista
        try {
            const albums = await this.retrieveArtistAlbums(artist.artistKey);
    
            if (albums && Array.isArray(albums)) {
                // Crea una griglia per gli album
                const albumGrid = document.createElement("div");
                albumGrid.classList.add("album-grid");
    
                // Aggiungi ogni album alla griglia
                albums.forEach(album => {
                    const albumItem = document.createElement("div");
                    albumItem.classList.add("album-item");
    
                    // Aggiungi l'immagine dell'album
                    const albumImage = document.createElement("img");
                    albumImage.classList.add("album-image");
                    albumImage.src = album.image; // Assumi che ci sia un campo 'image' nell'oggetto album che contenga l'URL dell'immagine
                    albumItem.appendChild(albumImage);
    
                    // Aggiungi il titolo dell'album
                    const albumTitle = document.createElement("div");
                    albumTitle.classList.add("album-title");
                    albumTitle.textContent = album.name; // Assumi che ci sia un campo 'title' nell'oggetto album che contenga il titolo dell'album
                    albumItem.appendChild(albumTitle);
    
                    // Aggiungi l'anno dell'album
                    const albumYear = document.createElement("div");
                    albumYear.classList.add("album-year");
                    albumYear.textContent = album.year; // Assumi che ci sia un campo 'year' nell'oggetto album che contenga l'anno di uscita dell'album
                    albumItem.appendChild(albumYear);
    
                    // Aggiungi un gestore di eventi per il clic sull'album
                    albumItem.addEventListener("click", (event) => {
                        event.stopPropagation();
                        this.showAlbumDetail(album); 
                        // Inserisci qui la gestione del clic sull'album
                    });
    
                    // Aggiungi l'elemento dell'album alla griglia
                    albumGrid.appendChild(albumItem);               
                });
    
                // Aggiungi la griglia degli album all'elemento artistDetail
                artistDetail.appendChild(albumGrid);
            } else {
                const noAlbumsMessage = document.createElement("div");
                noAlbumsMessage.textContent = "No albums found";
                artistDetail.appendChild(noAlbumsMessage);
            }
        } catch (error) {
            console.error("Errore durante il recupero degli album dell'artista:", error);
            const errorElement = document.createElement("div");
            errorElement.textContent = "Failed to retrieve albums";
            artistDetail.appendChild(errorElement);
        }
    
        // Aggiungi un gestore di eventi per nascondere l'elemento quando ci si clicca sopra
        artistDetail.addEventListener("click", () => {
            this.hideArtistDetail();
        });
    
        cardContent.appendChild(artistDetail);
    }


    

    async showAlbumDetail(album) {
        const cardContent = this._elements.card.querySelector(".card-content");
        const artistDetail = this._elements.card.querySelector(".artist-detail");
        artistDetail.style.display = "none";

        const albumDetail = document.createElement("div");
        albumDetail.classList.add("album-detail");



        const albumDetailHeader = document.createElement("div");
        albumDetailHeader.classList.add("album-detail-header");

        // Aggiungi l'immagine dell'album
        const albumImage = document.createElement("img");
        albumImage.classList.add("album-image");
        albumImage.src = album.image; 
        albumDetailHeader.appendChild(albumImage);

        const albumDetailHeaderInfo = document.createElement("div");
        albumDetailHeaderInfo.classList.add("album-detail-header-info");

        // Aggiungi il nome dell'album
        const albumName = document.createElement("div");
        albumName.classList.add("album-name");
        albumName.textContent = album.name + " - " + album.parentTitle;
        albumDetailHeaderInfo.appendChild(albumName);

       // Aggiungi "Artista"  a artist-detail-header
       const mediaType = document.createElement("div");
       mediaType.classList.add("media-type");
       mediaType.textContent = "Album";
       albumDetailHeaderInfo.appendChild(mediaType);                

        // Aggiungi il pulsante "Riproduci"
        const playButton = document.createElement("button");
        playButton.classList.add("play-button");
        playButton.textContent = "Riproduci";
        playButton.addEventListener("click", (event) => {
            event.stopPropagation();
            playOnSonos(this._hass, this._config, this._machineIdentifier, "music", album.albumKey);
        });
        albumDetailHeaderInfo.appendChild(playButton);


        albumDetailHeader.appendChild(albumDetailHeaderInfo);
        albumDetail.appendChild(albumDetailHeader);

        // Effettua la chiamata alle API di Plex per ottenere la lista dei brani dell'album
        try {
            const tracks = await this.retrieveAlbumTracks(album.albumKey);
            
            if (tracks && Array.isArray(tracks)) {
                // Crea un div per contenere la lista dei brani
                const trackContainer = document.createElement("div");
                trackContainer.classList.add("track-container");

                tracks.forEach(track => {
                    // Crea un div per ogni brano
                    const trackItem = document.createElement("div");
                    trackItem.classList.add("track-item");

                    // Aggiungi l'icona "&#9654" prima del nome della traccia
                    const triangleIcon = document.createElement("div");
                    triangleIcon.classList.add("triangle-icon");
                    triangleIcon.textContent = "\u25B6";
                    trackItem.appendChild(triangleIcon);

                    // Aggiungi il nome della traccia
                    const trackName = document.createElement("div");
                    trackName.classList.add("track-name");
                    trackName.textContent = track.name;
                    trackItem.appendChild(trackName);

                    // Aggiungi un gestore di eventi al clic sull'icona per gestire l'evento clic sulla traccia
                    triangleIcon.addEventListener("click", (event) => {
                        event.stopPropagation();
                        playOnSonos(this._hass, this._config, this._machineIdentifier, "music", track.trackId);
                    });

                    // Aggiungi la durata della traccia
                    const trackDuration = document.createElement("div");
                    trackDuration.classList.add("track-duration");
                    trackDuration.textContent = formatDuration(track.duration);
                    trackItem.appendChild(trackDuration);

                    trackContainer.appendChild(trackItem);
                });

                albumDetail.appendChild(trackContainer);
            }    

        } catch (error) {
            console.error("Errore durante il recupero dei brani dell'album:", error);
        }




        // Aggiungi un gestore di eventi per nascondere l'elemento quando ci si clicca sopra
        albumDetail.addEventListener("click", (event) => {
            // Controlla se il click è avvenuto sull'icona o sul nome dell'album, altrimenti ignora l'evento
            if (!event.target.classList.contains("triangle-icon") && !event.target.classList.contains("album-name")) {
                this.hideAlbumDetail();
            }
        });

        cardContent.appendChild(albumDetail);
    }

    
    async showPlaylistDetail(playlist) {
        const cardContent = this._elements.card.querySelector(".card-content");
        const playlistsCard = this._elements.card.querySelector(".playlists-card");
        playlistsCard.style.display = "none";
    
        const playlistDetail = document.createElement("div");
        playlistDetail.classList.add("playlist-detail");
    
        // Aggiungi l'intestazione della playlist
        const playlistHeader = document.createElement("div");
        playlistHeader.classList.add("playlist-header");
    
        // Immagine della playlist
        const playlistImage = document.createElement("img");
        playlistImage.classList.add("playlist-image");
        playlistImage.src = playlist.playlistImageUrl;
        playlistHeader.appendChild(playlistImage);
    
        // Raggruppa playlist-title, playlist-type e play-button in un unico div
        const playlistInfo = document.createElement("div");
        playlistInfo.classList.add("playlist-info");
    
        // Titolo della playlist
        const playlistTitle = document.createElement("div");
        playlistTitle.classList.add("playlist-title");
        playlistTitle.textContent = playlist.playlistName;
        playlistInfo.appendChild(playlistTitle);
    
        // Aggiungi la scritta "Playlist" sotto il titolo della playlist
        const playlistType = document.createElement("div");
        playlistType.classList.add("playlist-type");
        playlistType.textContent = "Playlist";
        playlistInfo.appendChild(playlistType);
    
        // Aggiungi il tasto "Riproduci"
        const playButton = document.createElement("button");
        playButton.classList.add("play-button");
        playButton.textContent = "Riproduci";
    
        playButton.addEventListener("click", (event) => {
            event.stopPropagation();
            playOnSonos(this._hass, this._config, this._machineIdentifier, "playlist", playlist.playlistId);
        });
    
        playlistInfo.appendChild(playButton);
        playlistHeader.appendChild(playlistInfo);
        playlistDetail.appendChild(playlistHeader);
    
        let tracks;
        try {
            if (this._config.musicProvider.provider === 'plex') {
                tracks = await this.retrievePlaylistTracks(playlist.playlistId);
            } else if (this._config.musicProvider.provider === 'spotify') {
                const spClientId=this._config.clientId;
                const spClientSecret=this._config.clientSecret; 
                const spRedirectUri=this._config.redirectUri;
                const spRefreshToken=this._config.refreshToken;
    
                const spotifyAPI = new SpotifyAPI(spClientId, spClientSecret, spRedirectUri, spRefreshToken);
                await spotifyAPI.authenticate();
    
                tracks = await spotifyAPI.getPlaylistTracks(playlist.playlistId);
            } else {
                console.error("Provider non supportato:", this._config.musicProvider.provider);
            }
    
            if (tracks && Array.isArray(tracks)) {
                const trackList = document.createElement("div");
                trackList.classList.add("track-list");
    
                tracks.forEach(track => {
                    const trackItem = document.createElement("div");
                    trackItem.classList.add("track-item");
    
                    const triangleIcon = document.createElement("div");
                    triangleIcon.classList.add("triangle-icon");
                    triangleIcon.textContent = "\u25B6";
                    trackItem.appendChild(triangleIcon);
    
                    const trackDetails = document.createElement("div");
                    trackDetails.classList.add("track-details");
    
                    const trackTitle = document.createElement("div");
                    trackTitle.classList.add("track-title");
                    trackTitle.textContent = track.name;
                    trackDetails.appendChild(trackTitle);
    
                    const authorAlbum = document.createElement("div");
                    authorAlbum.classList.add("author-album");
                    authorAlbum.textContent = `${track.authorName || ''} - ${track.albumName || ''}`;
                    trackDetails.appendChild(authorAlbum);
    
                    trackItem.appendChild(trackDetails);
    
                    const trackDuration = document.createElement("div");
                    trackDuration.classList.add("track-duration");
                    trackDuration.textContent = formatDuration(track.duration || 0);
                    trackItem.appendChild(trackDuration);

                                       
                    triangleIcon.addEventListener("click", (event) => {
                        event.stopPropagation();
                            playOnSonos(this._hass, this._config, this._machineIdentifier, "track", track.trackId);
                    });
    
                    trackList.appendChild(trackItem);
                });
    
                playlistDetail.appendChild(trackList);
            } else {
                console.error("Nessuna traccia trovata o il formato delle tracce non è un array.");
            }
        } catch (error) {
            console.error("Errore durante il recupero delle tracce della playlist:", error);
        }
    
        playlistDetail.addEventListener("click", () => {
            this.hidePlaylistDetail();
        });
    
        cardContent.appendChild(playlistDetail);
    }
    
 
    

    async retrieveArtistAlbums(artistId) {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;

        try {
            const albums = await getArtistAlbums(artistId, confPlexServerUrl, confAuthToken);
            return albums;
        } catch (error) {
            console.error("Errore durante il recupero degli album dell'artista:", error);
            throw error;
        }
    }

    async retrieveAlbumTracks(albumKey) {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;

        try {
            const tracks = await getAlbumTracks(albumKey, confPlexServerUrl, confAuthToken);
            return tracks;
        } catch (error) {
            console.error("Errore durante il recupero delle tracce dell'album:", error);
            throw error;
        }
    }



    async retrievePlaylistTracks(playlistId) {
        const confPlexServerUrl = this._config.plexServerUrl;
        const confAuthToken = this._config.authToken;

        try {
            const tracks = await getPlaylistTracks(playlistId, confPlexServerUrl, confAuthToken);
            return tracks;
        } catch (error) {
            console.error("Errore durante il recupero delle tracce dell'album:", error);
            throw error;
        }
    }

    hideArtistDetail() {
        const artistsCard = this._elements.card.querySelector(".artists-card");
        const artistDetail = this._elements.card.querySelector(".artist-detail");
        artistsCard.style.display = "block";
        artistDetail.parentNode.removeChild(artistDetail);
    }

    hidePlaylistDetail() {
        const playlistsCard = this._elements.card.querySelector(".playlists-card");
        const playlistDetail = this._elements.card.querySelector(".playlist-detail");
        playlistsCard.style.display = "block";
        playlistDetail.parentNode.removeChild(playlistDetail);
    }


    hideAlbumDetail() {
        const artistDetail = this._elements.card.querySelector(".artist-detail");
        const albumDetail = this._elements.card.querySelector(".album-detail");
        artistDetail.style.display = "block";
        albumDetail.parentNode.removeChild(albumDetail);
    }





    
    filterArtistList(searchTerm) {
        const artistItems = this._elements.card.querySelectorAll(".artist-item");

        artistItems.forEach(artistItem => {
            const artistName = artistItem.querySelector(".artist-name").textContent.toLowerCase();

            if (artistName.includes(searchTerm.toLowerCase())) {
                artistItem.style.display = "block";
            } else {
                artistItem.style.display = "none";
            }
        });
    }

    hideSearchInput() {
        const searchInput = this._elements.card.querySelector(".search-input");
        searchInput.remove();
    }

    // configuration defaults
    static getStubConfig() {
        return { entity: "input_boolean.tcwsd" }
    }

    // card configuration
    static getConfigElement() {
        return document.createElement("my-music-card-editor");
    }
}

customElements.define('sonos-music-browser-card', SonosMusicBrowser);
customElements.define("sonos-music-browser-card-editor", SonosMusicBrowserEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "sonos-music-browser",
    name: "Vanilla Js my Music Card With Shadow DOM",
    description: "Sonos Music Browser"
});
