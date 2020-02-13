precision highp float;
varying vec2 coord;
uniform float time;
uniform vec2 bounds;

// #pragma glslify: Hit_record = require('./hitable.glsl')
// #pragma glslify: Sphere = require('./sphere-type.glsl')
// #pragma glslify: hit = require('./sphere.glsl')
// #pragma glslify: list_hit = require('./hitable-list.glsl')

float random(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

const int mat_dielectric = 3;
const int mat_metal = 2;
const int mat_lambert = 1;
const float t_min = 0.00001;
const float t_max = 999999.9;

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Material {
    vec3 albedo;
    float fuzz;
    float ref_idx;

    /* scatter function can be:
        1 = lambert
        2 = metal
        3 = dielectric
        */
    int scatter_function;
};

Material gray_metal = Material(vec3(0.8, 0.8, 0.8), 0.0001, 0.0, mat_metal);
Material gold_metal = Material(vec3(0.8, 0.6, 0.2), 0.0001, 0.0, mat_metal);
Material dielectric = Material(vec3(0),                0.0, 1.5, mat_dielectric);
Material lambert    = Material(vec3(0.8, 0.8, 0.0),    0.0, 0.0, mat_lambert);

struct Hit_record {
    float t;
    vec3 p;
    vec3 normal;
    Material mat;
};

struct Sphere {
    vec3 center;
    float radius;
    Material mat;
};

bool hit (Sphere sphere,vec3 ray_origin, vec3 ray_direction, float t_min, float t_max, inout Hit_record rec) {
    vec3 oc = ray_origin - sphere.center;
    float a = dot(ray_direction, ray_direction);
    float b = dot(oc, ray_direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float hit = b * b - a * c;
    if (hit > 0.) {
        float temp = (-b - sqrt(b * b - a * c)) / a;
        if (temp < t_max && temp > t_min) {
            rec.t = temp;
            rec.p = ray_origin + temp * ray_direction;
            rec.normal = (rec.p - sphere.center) / sphere.radius;
            rec.mat = sphere.mat;
            return true;
        }
        temp = (-b + sqrt(b * b - a * c)) / a;
        if (temp < t_max && temp > t_min) {
            rec.t = temp;
            rec.p = ray_origin + temp * ray_direction;
            rec.normal = (rec.p - sphere.center) / sphere.radius;
            rec.mat = sphere.mat;
            return true;
        }
    }
    return false;
}

bool list_hit (Sphere sphere[3], vec3 ray_origin, vec3 ray_direction, float t_min, float t_max, inout Hit_record rec) {
    Hit_record temp_rec;
    bool hit_anything = false;
    float closest_so_far = t_max;

    for (int i = 0; i < 3; i++) {
        bool hit_res = hit(sphere[i], ray_origin, ray_direction, t_min, closest_so_far, temp_rec);
        if (hit_res) {
            hit_anything = true;
            closest_so_far = temp_rec.t;
            rec = temp_rec;
        }
    }

    return hit_anything;
}

vec3 point_at_t (Ray r, float t) {
    return r.origin + t * r.direction;
}

// screen position
vec2 screenPos;

vec3 drawBackground(Ray r, vec2 screenPos) {
    vec3 unit_direction = normalize(r.direction);
    float t = .5 * (unit_direction.y + 1.);
    return (1. - t) * vec3(1., 1., 1.) + t * vec3(.5, .7, 1.);
}

vec3 random_in_unit_sphere(vec3 p) {
    float r1 = 2. * random(p.xy) - 1.;
    float r2 = 2. * random(p.zy) - 1.;
    float r3 = 2. * random(p.xz) - 1.;
    p = vec3(r1, r2, r3);
    return p;
}

bool lambertian_scatter(in Material mat, in Ray r, in Hit_record hit, out vec3 attenuation, out Ray scattered) {
    vec3 target = hit.p + hit.normal + random_in_unit_sphere(hit.p);
    scattered = Ray(hit.p, target - hit.p);
    attenuation = mat.albedo;
    return true;
}

// vec3 reflect(in vec3 v, in vec3 n) {
//     return v - 2. * dot(v, n) * n;
// }

bool metal_scatter(in Material mat, in Ray r, in Hit_record hit, out vec3 attenuation, out Ray scattered) {
    vec3 reflected = reflect(normalize(r.direction), hit.normal);
    scattered = Ray(hit.p, reflected + mat.fuzz * random_in_unit_sphere(hit.p));
    attenuation = mat.albedo;
    return (dot(scattered.direction, hit.normal) > 0.);
}

float schlick(in float cosine, in float ref_idx) {
    float r0 = (1. - ref_idx) / (1. + ref_idx);
    r0 = r0 * r0;
    return r0 + (1. - r0) * pow((1. - cosine), 5.);
}

bool refract(in vec3 v, in vec3 n, in float ni_over_nt, out vec3 refracted) {
    vec3 uv = normalize(v);
    float dt = dot(uv, n);
    float discriminant = 1. - ni_over_nt * ni_over_nt * (1. - dt * dt);
    if (discriminant > 0.) {
        refracted = ni_over_nt * (uv - n * dt) - n * sqrt(discriminant);
        return true;
    } else {
        return false;
    }
}

bool dielectric_scatter(in Material mat, in Ray r, in Hit_record hit, out vec3 attenuation, out Ray scattered) {
    vec3 outward_normal;
    vec3 reflected = reflect(r.direction, hit.normal);
    float ni_over_nt;
    attenuation = vec3(1.0, 1.0, 1.0);
    vec3 refracted;
    float reflect_prob;
    float cosine;
    if (dot(r.direction, hit.normal) > 0.) {
        outward_normal = - hit.normal;
        ni_over_nt = mat.ref_idx;
        cosine = mat.ref_idx * dot(r.direction, hit.normal) / length(r.direction);
    } else {
        outward_normal = hit.normal;
        ni_over_nt = 1. / mat.ref_idx;
        cosine = - dot(r.direction, hit.normal) / length(r.direction);
    }
    if (refract(r.direction, outward_normal, ni_over_nt, refracted)) {
        reflect_prob = schlick(cosine, mat.ref_idx);
    } else {
        reflect_prob = 1.;
    }

    if (random(r.direction.xy) < reflect_prob) {
        scattered = Ray(hit.p, reflected);
    } else {
        scattered = Ray(hit.p, refracted);
    }
    return true;
}

bool dispatch_scatter(in Ray r, Hit_record hit, out vec3 attenuation, out Ray scattered) {
    if(hit.mat.scatter_function == mat_dielectric) {
        return dielectric_scatter(hit.mat, r, hit, attenuation, scattered);
    } else if (hit.mat.scatter_function == mat_metal) {
        return metal_scatter(hit.mat, r, hit, attenuation, scattered);
    } else {
        return lambertian_scatter(hit.mat, r, hit, attenuation, scattered);
    }
}

vec3 color(Ray r, Sphere sphere_list[3]) {
    Hit_record rec;
    vec3 _color;
    vec3 total_attenuation = vec3(1., 1., 1.);
    for (int bounce = 0; bounce < 16; bounce++) {
        if (list_hit(sphere_list, r.origin, r.direction, t_min, t_max, rec)) {
            Ray scattered;
            vec3 local_attenuation;

            if (dispatch_scatter(r, rec, local_attenuation, scattered)) {
                total_attenuation *= local_attenuation;
                r = scattered;
            } else {
                total_attenuation *= vec3(0., 0., 0.);
            }
        } else {
            _color = total_attenuation * drawBackground(r, screenPos);
            break;
        }
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

    // spheres
    vec3 sphere_center = vec3(0.3, 0., -1.);
    float sphere_radius = .5;
    Sphere sphere_1 = Sphere(sphere_center, sphere_radius, gray_metal);

    vec3 sphere_2_center = vec3(0., -60.5, -2.);
    float sphere_2_radius = 60.;
    Sphere sphere_2 = Sphere(sphere_2_center, sphere_2_radius, gold_metal);

    vec3 sphere_3_center = vec3(-0.6, 0., -1.);
    float sphere_3_radius = .3;
    Sphere sphere_3 = Sphere(sphere_3_center, sphere_3_radius, gold_metal);

    Sphere sphere_list[3];
    sphere_list[0] = sphere_1;
    sphere_list[1] = sphere_2;
    sphere_list[2] = sphere_3;
    

    // get color
    const int nsamples = 64;
    const float d = sqrt(float(nsamples));
    float u, v;
    Ray ray;
    vec3 _color = vec3(0., 0., 0.);
    for (int i = 0; i < nsamples; i++) {
        float x = floor(float(nsamples) / d) / d;
        float y = fract(float(nsamples) / d);
        u = screenPos.x + x;
        v = screenPos.y + y;

        u = screenPos.x + random(_color.xy + float(i));
        v = screenPos.y + random(_color.xy + float(i));
        ray = Ray(vec3(0., 0., 0.), vec3(vec2(u, v), -1. * bounds.y / 2.));
        _color += color(ray, sphere_list);
    }
    _color /= float(nsamples);

    gl_FragColor = vec4(_color, 1.);
}