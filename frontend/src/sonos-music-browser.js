import { styles } from './modules/styles.js';

import { SonosMusicBrowserEditor } from './sonos-music-browser-editor.js';
import { getMusicLibraryId } from './modules/plexApi.js'; 
import { getArtistLibrary} from './modules/plexApi.js'; 
import { getArtistAlbums } from './modules/plexApi.js';
import { getAlbumTracks } from './modules/plexApi.js';
import { getPlexPlaylists } from './modules/plexApi.js';
import { getPlaylistTracks } from './modules/plexApi.js';
import { getMachineIdentifier } from './modules/plexApi.js';
import { playOnSonos } from './modules/utilities.js';
import { formatDuration } from './modules/utilities.js';
import SpotifyAPI from './modules/SpotifyAPI.js';




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
        station.favicon
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
            const spClientId=this._config.clientId
            const spClientSecret=this._config.clientSecret 
            const spRedirectUri=this._config.redirectUri
            const spRefreshToken=this._config.refreshToken

            
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
       mediaType.textContent = "Artista"
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
       mediaType.textContent = "Album"
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
                const spClientId=this._config.clientId
                const spClientSecret=this._config.clientSecret 
                const spRedirectUri=this._config.redirectUri
                const spRefreshToken=this._config.refreshToken
    
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
