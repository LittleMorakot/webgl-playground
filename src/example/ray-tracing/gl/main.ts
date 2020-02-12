import { mat4, vec3, vec2 } from 'gl-matrix';
import { REGLLoader } from '../../../base-game/gl/regl';
import { GLState } from '../../../base-game/gl/gl-state';
import { GameState } from '../../../base-game/state';

import glRayTracing = require('./ray-tracing');

export = function (regl, loader:REGLLoader) {
    const drawRayTracing = loader.require(glRayTracing);

    const modelMatrix = mat4.identity(mat4.create());

    const setup = loader.profile('main:setup', {
        context: {
            model: modelMatrix,
        },
        uniforms: {
            model: modelMatrix,

            eye: regl.prop('camera.eye'),
            view: regl.prop('camera.view'),
            projection: regl.prop('camera.projection'),
            viewProj: regl.prop('camera.viewProjection'),
            invView: regl.prop('camera.invView'),
            invProjection: regl.prop('camera.invProjection'),
            bounds: (context, props) => vec2.fromValues(props.camera.viewportWidth, props.camera.viewportHeight),
        },
    });

    function draw (state:GameState) {
        const glState = <GLState>state.glState;
        setup(glState, (context) => {
            regl.clear({
                depth: 1,
            });
            drawRayTracing();
        });
    }

    return {
        draw,
    };
};