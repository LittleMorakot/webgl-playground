const ray_tracing_frag = require('./glsl/ray-tracing_frag.glsl');

export = function (regl) {
    return regl({
        frag: ray_tracing_frag,

        vert: `
        precision highp float;
        attribute vec2 position;
        varying vec2 coord;
        void main() {
            gl_Position = vec4(position, 0, 1);
            coord = gl_Position.xy;
        }`,

        uniforms: {
            // 'bounds[0]': regl.prop('bounds[0]'),
            // 'bounds[1]': regl.prop('bounds[1]'),
            // 'model': (context, props) => props.model || context.model,
            // time: ({tick}) => tick * 0.01,
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