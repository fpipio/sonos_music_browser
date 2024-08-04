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
        console.log("doMessageForUpdate(changedEvent)")
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

export default SpotifyAPI;

