import createREGL = require('regl');
import { GameState } from './state';
import { createREGLCache, REGLLoader } from './gl/regl';
// import glMain = require('../gl/main');

const FULLSCREEN_STYLE = {
    border: 0,
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
};

export class Game {
    private _regl?;
    private _tick;
    private _canvas:HTMLCanvasElement;
    private _state:GameState;
    private _reglLoader?:REGLLoader;
    private _glMain;
    private _element:HTMLDivElement;

    constructor(glMain, containerElement?:HTMLDivElement) {
        if (containerElement) {
            this._element = containerElement;
        } else {
            this._element = document.createElement('div');
            Object.assign(this._element.style, FULLSCREEN_STYLE);
            document.body.appendChild(this._element);
        }
        this._canvas = this._createREGL(glMain);
        if (!this._regl || !this._reglLoader) {
            throw new Error('failed to initialize');
        }
        this._state = new GameState({
            regl: this._regl,
            reglLoader: this._reglLoader,
            canvas: this._canvas,
        });

        this.start();
    }

    private _createREGL(glMain) {
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, FULLSCREEN_STYLE);
        this._element.appendChild(canvas);
        this._regl = createREGL({
            extensions: [
                'OES_element_index_uint',
            ],
            optionalExtensions: [
                'OES_standard_derivatives',
                'OES_texture_float',
                'OES_texture_float_linear',
                'OES_texture_half_float',
                'OES_texture_half_float_linear',
                'WEBGL_depth_texture',
                'EXT_shader_textture_lod',
                'EXT_disjoint_imer_query',
            ],
            canvas,
        });

        this._reglLoader = createREGLCache(this._regl, true);
        this._glMain = this._reglLoader.require(glMain);

        return canvas;
    }

    public start () {
        const {_regl, _reglLoader, _canvas, _element, _state, _glMain} = this;
        if (!_regl || !_reglLoader || !_canvas || !_element) {
            return;
        }
        let contextLost = false;
        _regl.on('lost', () => {
            contextLost = true;
        });
        _regl.on('restore', () => {
            // TODO: restore
            // contextLost = false;
            // (_state.glState as GLState).restore();
        });

        let lastTime = 0;
        this._tick = this._regl.frame((context) => {
            const start = 1000. * context.time;
            const deltaTime = start - lastTime;
            lastTime = start;

            // update window size
            if (!contextLost) {
                const bounds = this._element.getBoundingClientRect();
                const targetWidth = Math.ceil(bounds.width);
                const targetHeight = Math.ceil(bounds.height);
                if (_canvas.width !== targetWidth || _canvas.height !== targetHeight) {
                    _canvas.width = targetWidth;
                    _canvas.height = targetHeight;
                }
            }

            // tick game and render everything
            _state.interpolate(deltaTime);
            if (!contextLost) {
                _glMain.draw(_state);
            }
        });
    }
}
