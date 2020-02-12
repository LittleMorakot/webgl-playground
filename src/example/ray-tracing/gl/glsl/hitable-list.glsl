// #pragma glslify: Hit_record = require('./hitable.glsl')
// #pragma glslify: Sphere = require('./sphere-type.glsl')
// #pragma glslify: hit = require('./sphere.glsl')

// bool list_hit (Sphere sphere[2], vec3 ray_origin, vec3 ray_direction, float t_min, float t_max, inout Hit_record rec) {
//     Hit_record temp_rec;
//     bool hit_anything = false;
//     float closest_so_far = t_max;

//     for (int i = 0; i < 2; i++) {
//         bool hit_res = hit(sphere[i], ray_origin, ray_direction, t_min, closest_so_far, temp_rec);
//         if (hit_res) {
//             hit_anything = true;
//             closest_so_far = temp_rec.t;
//             rec = temp_rec;
//         }
//     }

//     return hit_anything;
// }

// #pragma glslify:export(list_hit)