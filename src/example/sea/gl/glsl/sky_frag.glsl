precision mediump float;

varying vec2 uv;

uniform mat4 invProjection, invView;

uniform sampler2D nightSampler, skySampler;
uniform float time, timeOfDay, lunarPhase;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
uniform LightProperties light;
uniform PostData post;

#ifdef REFLECTION_PASS
uniform float zFar;
#endif

#pragma glslify: sampleAtmosphere = require('./atmosphere.glsl')
#pragma glslify: toneMapping = require('./tone_mapping.glsl')
#pragma glslify: applyLUT = require('./lut.glsl')

void main() {
    vec4 farRay = invView * invProjection * vec4(uv, 1, 1);
    vec4 nearRay = invView * invProjection * vec4(uv, 0, 1);
    vec3 position = normalize(farRay.xyz * nearRay.w - nearRay.xyz * farRay.w);

    vec3 c = sampleAtmosphere (  
                              position,
                              light.color,
                              timeOfDay,
                              lunarPhase,
                              time, 
                              nightSampler,
                              skySampler,
                              light.skyTop,
                              light.skyBottom,
                              light.skyLeft,
                              light.skyRight,
                              light.skySide);

    float brightness = 0.3 * (light.skyTop.x + light.skyTop.y + light.skyTop.z) * post.exposure;
    float fogExposure = 1. / max(1., brightness);
    vec3 ambientColor = (fogExposure / (abs(position.x) + abs(position.y) + abs(position.z))) * (
        max( position.x, 0.) * light.skyLeft +
        max(-position.x, 0.) * light.skyRight +
        max( position.y, 0.) * light.skyTop +
        max(-position.y, 0.) * light.skyBottom +
        abs(position.z) * light.skySide);
    c += max(-position.y, 0.) * ambientColor;

    #ifdef REFLECTION_PASS
        gl_FragColor = vec4(c, 65500.);
    #else
        #ifdef HDR
            gl_FragColor = vec4(c, 1);
        #else
            c = toneMapping(c * post.exposure);
            #ifdef COLOR_LUT
                c = applyLUT(c, post.lut);
            #endif
            gl_FragColor = vec4(pow(c, vec3(1. / post.gamma)), 1);
        #endif
    #endif
}