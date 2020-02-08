import { vec3, mat4 } from 'gl-matrix';
// const simpleNoise2D = require('../glsl/simpleNoise2D.glsl');
const simpleNoise3D = require('../glsl/simpleNoise3D.glsl');
// const classicNoise2D = require('../glsl/classicNoise2D.glsl');

export = function (regl) {
    return regl({
        frag: `
        precision highp float;
        varying vec2 coord;
        uniform float time;

        ${simpleNoise3D}

        void main() {
            vec3 testCoord = vec3(coord.x, coord.y, time);
            float noise_value = snoise(testCoord);
            gl_FragColor = vec4(.3, .6, .7, 1.) * (noise_value + 1.) / 2.;
        }`,

        vert: `
        precision highp float;
        attribute vec2 position;
        varying vec2 coord;
        void main() {
            gl_Position = vec4(position, 0, 1);
            coord = gl_Position.xy;
        }`,

        uniforms: {
            'bounds[0]': regl.prop('bounds[0]'),
            'bounds[1]': regl.prop('bounds[1]'),
            'model': (context, props) => props.model || context.model,
            time: ({tick}) => tick * 0.01,
        },

        attributes: {
            position: regl.buffer([
                [-1, -1],
                [1, -1],
                [1,  1],
                [-1, 1],
            ]),
        },
        primitive: 'triangle fan',
        count: 4,
    });
};