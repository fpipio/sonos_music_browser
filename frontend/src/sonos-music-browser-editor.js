import { styles } from './modules/styles.js';
import { getMusicLibraries } from './modules/plexApi.js';

export class SonosMusicBrowserEditor extends HTMLElement {
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
