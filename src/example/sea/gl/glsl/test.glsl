#pragma glslify: noise = require('./noise.glsl')

precision mediump float;
uniform mat4 projection, view;
// attribute float p;
uniform float radius;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main () {
    // float x = rand(vec2(0.1, 0.1));
    // float y = rand(vec2(0.2, 0.2));
    // float z = rand(vec2(0.3, 0.3));

    gl_PointSize = radius;
    gl_Position = projection * view * vec4(x, y, z, 1);
}