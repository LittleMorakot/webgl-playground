import { vec3, mat4 } from 'gl-matrix';
import { hsv2rgb } from '../../../../utils/hsv2rgb';
// const noiseVert = require('../glsl/test.glsl');
import { snoise as noise3d } from '../../../../utils/noise3d';
import { snoise2d as noise2d } from '../../../../utils/noise';

const DEFAULT_COLOR = vec3.set(vec3.create(), 0, 0, 0);
const POINT_AMOUNT = 36 * 1e4;
const VERT_SIZE = 4 * (4 + 4 + 3);

export = function (regl) {

    const pointBuffer = regl.buffer(Array(POINT_AMOUNT).fill(0).map((item, index) => {
        const color = hsv2rgb(Math.random() * 360, 0.6, 1);
        const x = Math.random() * 10;
        const z = Math.random() * 10;
        const y = noise2d(x, z);
        return [
            // freq
            x, //x
            y * .1, //y
            z, //z
            (Math.random() * .5 + .3) * 2,
            // phase
            2.0 * Math.PI * Math.random(),
            2.0 * Math.PI * Math.random(),
            2.0 * Math.PI * Math.random(),
            2.0 * Math.PI * Math.random(),
            // color
            color[0] / 255, color[1] / 255, color[2] / 255,
        ];
    }));

    const drawPoint = regl({
        frag: `
        precision lowp float;
        varying vec3 fragColor;
        void main() {
            if (length(gl_PointCoord.xy - 0.5) > 0.5) {
                discard;
            }
            gl_FragColor = vec4(fragColor, 1);
        }`,

        vert: `
        precision mediump float;
        attribute vec4 freq, phase;
        attribute vec3 color;
        uniform float time;
        uniform mat4 view, projection;
        varying vec3 fragColor;
        void main() {
            vec3 position = freq.xyz / 10.;
            gl_PointSize = 5.0 * (1.0 + cos(freq.w * time + phase.w));
            gl_Position = projection * view * vec4(position, 1);
            fragColor = color;
        }`,

        attributes: {
            freq: {
                buffer: pointBuffer,
                stride: VERT_SIZE,
                offset: 0,
            },
            phase: {
                buffer: pointBuffer,
                stride: VERT_SIZE,
                offset: 16,
            },
            color: {
                buffer: pointBuffer,
                stride: VERT_SIZE,
                offset: 32,
            },
        },

        uniforms: {
            time: ({tick}) => tick * 0.001,
        },

        count: POINT_AMOUNT,
        primitive: 'points',
    });

    return function (radius?:number, color?:vec3) {
        drawPoint({
            radius: (radius || 8),
            color: color || DEFAULT_COLOR,
        });
    };
};