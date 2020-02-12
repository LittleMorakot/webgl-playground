precision highp float;
varying vec2 coord;
uniform float time;
uniform vec2 bounds;

#pragma glslify: Hit_record = require('./hitable.glsl')
#pragma glslify: Sphere = require('./sphere-type.glsl')
#pragma glslify: hit = require('./sphere.glsl')
#pragma glslify: list_hit = require('./hitable-list.glsl')

float random(vec2 co){
    return 2. * fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453) - 1.;
}

// ray
vec3 ray_origin;
vec3 ray_direction;
vec3 point_at_t (float t) {
    return ray_origin + t * ray_direction;
}

// screen position
vec2 screenPos;

vec3 drawBackground(vec2 screenPos) {
    vec3 unit_direction = normalize(ray_direction);
    float t = .5 * (unit_direction.y + 1.);
    return (1. - t) * vec3(1., 1., 1.) + t * vec3(.5, .7, 1.);
}

vec3 random_in_unit_sphere() {
    vec3 p;
    float r1 = random(coord.xy / bounds);
    float r2 = random(vec2(0, r1));
    float r3 = random(vec2(0, r2));
    p = vec3(r1, r2, r3);
    return p;
}

vec3 color(vec3 _ray_origin, vec3 _ray_direction, Sphere sphere_list[2], Hit_record rec) {
    bool list_hit_res = list_hit(sphere_list, ray_origin, ray_direction, 0., 99999999., rec);
    vec3 bgColor = drawBackground(screenPos);
    vec3 _color;
    if (list_hit_res) {
        vec3 target = rec.p + rec.normal + random_in_unit_sphere();
        _color = (.5 * (rec.normal + 1.));
    } else {
        _color = bgColor;
    }
    return _color;
}

void main() {
    // screen position:
    //
    //   -400, 200          400, 200
    //      --------------------
    //      |                  |
    //      |         .        |
    //      |        0, 0      |
    //      |                  |
    //      --------------------
    //   -400, -200         400, -200
    screenPos = coord * bounds / 2.; 

    // ray initialize
    ray_origin = vec3(0., 0., 0.);
    ray_direction = vec3(screenPos, -1. * bounds.y / 2.);

    // spheres
    vec3 sphere_center = vec3(0., 0., -1.);
    float sphere_radius = .5;
    Sphere sphere_1 = Sphere(sphere_center, sphere_radius);

    vec3 sphere_2_center = vec3(0., -100.5, -1.);
    float sphere_2_radius = 100.;
    Sphere sphere_2 = Sphere(sphere_2_center, sphere_2_radius);

    Sphere sphere_list[2];
    sphere_list[0] = sphere_1;
    sphere_list[1] = sphere_2;

    // world hit record
    Hit_record rec;

    // get color
    vec3 color = color(ray_origin, ray_direction, sphere_list, rec);
    gl_FragColor = vec4(color, 1.);
}