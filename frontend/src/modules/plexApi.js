export function getMachineIdentifier(plexServerUrl, authToken) {
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


export async function getMusicLibraries(plexServerUrl, authToken) {
    try {
        const response = await fetch(`${plexServerUrl}/library/sections`, {
            headers: {
                "X-Plex-Token": authToken,
            },
        });

        if (!response.ok) {
            throw new Error("Errore durante il recupero della lista delle librerie");
        }

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const libraries = xmlDoc.querySelectorAll('Directory[type="artist"]');

        const musicLibraries = [];
        libraries.forEach(library => {
            const libraryName = library.getAttribute("title");
            const libraryId = library.getAttribute("key");
            const libraryData = {
                libraryName: libraryName,
                libraryId: libraryId
            };
            musicLibraries.push(libraryData);
        });

        return musicLibraries;
    } catch (error) {
        console.error("Errore durante il recupero delle librerie musicali:", error);
        throw error;
    }
}



export function getMusicLibraryId(plexServerUrl, authToken, activeLibrary) {
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

        // Continua a costruire il resto della tua card qui...
        const cardContent = document.createElement("div");
        cardContent.classList.add("card-content");
        // Etc...
    })
    .catch(error => {
        console.error("Errore durante il recupero dell'ID della libreria della musica:", error);
    });
}

export async function getArtistLibrary(musicLibraryId, plexServerUrl, authToken) {
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
export async function getArtistAlbums(artistKey, plexServerUrl, authToken) {
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
export async function getAlbumTracks(albumKey, plexServerUrl, authToken) {
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


export async function getPlexPlaylists(plexServerUrl, authToken) {
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
export async function getPlaylistTracks(playlistId, plexServerUrl, authToken) {
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


