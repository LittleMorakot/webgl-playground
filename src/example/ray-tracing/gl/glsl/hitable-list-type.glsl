struct Hitable_list {
    vec3 center;
    float radius;
    int list_size;
};

#pragma glslify:export(Hitable_list)