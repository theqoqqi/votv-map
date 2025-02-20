
import Map from './map.js';

window.map = new Map('mapCanvas', {
    background: {
        url: 'https://questwalker.github.io/votv-map/map-264888.webp',
        offsetInImagePixels: {
            x: 0,
            y: -1,
        },
        worldSize: {
            x: 1490.5,
            y: 1490.5,
        },
    },
    zoom: {
        initial: 1,
        min: 0.5,
        max: 10,
    },
    points: [],
});
