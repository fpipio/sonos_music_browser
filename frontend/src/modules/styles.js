export const styles = `

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


`;
