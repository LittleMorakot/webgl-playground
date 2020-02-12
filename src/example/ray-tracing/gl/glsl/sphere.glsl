#pragma glslify: Hit_record = require('./hitable.glsl')
#pragma glslify: Sphere = require('./sphere-type.glsl')

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
            return true;
        }
        temp = (-b + sqrt(b * b - a * c)) / a;
        if (temp < t_max && temp > t_min) {
            rec.t = temp;
            rec.p = ray_origin + temp * ray_direction;
            rec.normal = (rec.p - sphere.center) / sphere.radius;
            return true;
        }
    }
    return false;
}

#pragma glslify:export(hit)