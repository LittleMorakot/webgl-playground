import { vec3 } from 'gl-matrix';
import * as dat from 'dat.gui';
import { hsv2rgb } from '../../utils/hsv2rgb';
import { snoise2d as noise2d } from '../../utils/noise';

const DEFAULT_COLOR = vec3.set(vec3.create(), 1, 1, 1);
const POINT_AMOUNT = 36 * 1e4;
const VERT_SIZE = 4 * (4 + 4 + 3);

export = function (regl) {

    class GuiData {
        public red = .2;
        public green = .2;
        public blue = 1;

        public size = 1;

        public center = .3;
        public blur = .3;
    }

    const data = new GuiData();
    const gui = new dat.GUI();
    gui.add(data, 'red', 0, 1);
    gui.add(data, 'green', 0, 1);
    gui.add(data, 'blue', 0, 1);
    gui.add(data, 'size', 0, 5);
    gui.add(data, 'center', 0, 1);
    gui.add(data, 'blur', 0, 1);

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
            (Math.random() * .5 + .3) * 2,
            // color
            color[0] / 255, color[1] / 255, color[2] / 255,
        ];
    }));

    const drawPoint = regl({
        frag: `
        precision mediump float;

        uniform lowp vec3 _color;
        uniform lowp float center;
        uniform lowp float blur;
        uniform float time;

        varying vec3 fragColor;
        varying vec4 pointPhase;
        varying vec4 pointFreq;
        void main () {
            if (length(gl_PointCoord.xy - 0.5) > 0.45) {
                discard;
            }
            float _center = center * cos(pointFreq.w * time + pointPhase.w);
            vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.5;
            float len = length(toCenter);
            float centerAlpha = 1. - smoothstep(_center - blur, _center + blur, len);
            float alpha = clamp(centerAlpha + (1. - len), 0., 1.);

            float a = 1.0 - len;
            gl_FragColor = vec4(_color.rgb, alpha);
        }`,

        vert: `
        precision mediump float;
        attribute vec4 freq, phase;
        attribute vec3 color;

        uniform mat4 projection, view;
        uniform float time;
        uniform vec3 point;
        uniform float radius;
        uniform vec3 eye;

        varying vec3 fragColor;
        varying vec4 pointPhase;
        varying vec4 pointFreq;

        void main() {
            vec3 position = freq.xyz / 10.;

            vec4 viewPosition = view * vec4(position, 1.0);
            float disScale = 1. / length(vec3(viewPosition));
            gl_PointSize = radius * disScale * freq.w;

            gl_Position = projection * viewPosition;
            fragColor = color;
            pointPhase = phase;
            pointFreq = freq;
        }
        `,

        uniforms: {
            'point': regl.prop('point'),
            'radius': ({ pixelRatio }, { radius }) => pixelRatio * radius,
            '_color': regl.prop('color'),
            'center': regl.prop('center'),
            'blur': regl.prop('blur'),
            time: ({tick}) => tick * 0.01,
        },

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
        count: POINT_AMOUNT,
        primitive: 'points',
        offset: 0,

        blend: {
            enable: true,
            func: {
                src: 'src alpha',
                dst: 'dst alpha',
            },
            equation: 'add',
        },
        depth: {
            enable: true,
            mask: false,
            func: '<=',
        },
        cull: {
            enable: true,
            face: 'back',
        },
    });

    return function (point:vec3) {
        drawPoint({
            point,
            radius: data.size,
            color: vec3.set(vec3.create(), data.red, data.green, data.blue),
            center: data.center,
            blur: data.blur,
        });
    };
};