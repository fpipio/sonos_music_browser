import replace from '@rollup/plugin-replace'; // Assicurati di aver installato questo plugin tramite npm

export default {
    input: {
        card: 'frontend/src/sonos-music-browser.js',
//        editor: 'src/MyMusicCardEditor.js',
    },
    output: {
        dir: 'frontend/dist/', // Il percorso del file di output
        format: 'es', // Il formato del bundle (es. iife, esm, cjs)
        entryFileNames: 'sonos-music-browser-card.js',
    },
    plugins: [
        replace({
          preventAssignment: true,
          TIMESTAMP: Date.now()
        })
      ]
};

