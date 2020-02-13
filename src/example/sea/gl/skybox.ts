import { REGL, REGLLoader } from '../../../base-game/gl/regl';

// const skyBoxFrag = require('./glsl/sky_frag.glsl');
// const skyBoxVert = require('./glsl/sky_vert.glsl');

export = function (regl:REGL, loader:REGLLoader) {

    const drawSky = regl({
        frag: `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0., 0., .1, 1.);
        }
        `,
        vert: `
        precision mediump float;
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0, 1);
        }`,

        attributes: {
            position: [
                -4, -4,
                -4, 4,
                8, 0,
            ],
        },

        depth: {
            mask: false,
            enable: false,
        },

        count: 3,
    });

    return {
        sky: drawSky,
    };
};