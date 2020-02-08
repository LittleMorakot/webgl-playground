import { mat4, vec3 } from 'gl-matrix';
import { REGLLoader } from './regl';
import { GLState } from './state/state';
import { GameState } from '../state';

import glDebugBox = require('./debug/box');
import glDebug2d = require('./debug/2d');
import glDebugPoint = require('./debug/point');
import glStylePoint = require('./debug/stylePoint');
import glDebugNoisePoint = require('./debug/noisePoint');
import glSky = require('./skybox');

export = function (regl, loader:REGLLoader) {
    const drawDebugBox = loader.require(glDebugBox);
    const drawDebug2d = loader.require(glDebug2d);
    const drawDebugPoint = loader.require(glDebugPoint);
    const drawDebugNoisePoint = loader.require(glDebugNoisePoint);
    const drawStylePoint = loader.require(glStylePoint);
    const drawSky = loader.require(glSky);

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
        },
    });

    function draw (state:GameState) {
        const glState = <GLState>state.glState;
        setup(glState, (context) => {
            regl.clear({
                depth: 1,
            });
            drawSky.sky();
            // drawDebug2d();
            // drawDebugBox({
            //     bounds: [[0, 0, 0], [1, 1, 1]],
            //     color: [1, .2, .2],
            // });

            // drawDebugPoint(vec3.fromValues(0, 0, 0), undefined, vec3.fromValues(0, 0, 0));
            // drawDebugPoint(vec3.fromValues(1, 0, 0), undefined, vec3.fromValues(1, 0, 0));
            // drawDebugPoint(vec3.fromValues(0, 1, 0), undefined, vec3.fromValues(0, 1, 0));
            // drawDebugPoint(vec3.fromValues(0, 0, 1), undefined, vec3.fromValues(0, 0, 1));

            // drawDebugNoisePoint();

            drawStylePoint(vec3.fromValues(0, 0, 0));
        });
    }

    return {
        draw,
    };
};