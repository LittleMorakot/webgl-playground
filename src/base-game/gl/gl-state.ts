import { GLCamera } from './camera';
import { REGLLoader } from './regl';
import { GameState } from '../state';
import { GameInput } from '../game-input';
export class GLState {
    public regl:any;
    public reglLoader:REGLLoader;

    public camera:GLCamera;

    public tick:number = 0;

    constructor (spec:{
        regl:any,
        reglLoader:REGLLoader,
        input:GameInput,
    }) {
        this.regl = spec.regl;
        this.reglLoader = spec.reglLoader;
        this.camera = new GLCamera({
            regl: spec.regl,
            input: spec.input,
        });
    }

    public interpolate (dt:number, state:GameState) {
        this.camera.viewportWidth = this.regl._gl.drawingBufferWidth;
        this.camera.viewportHeight = this.regl._gl.drawingBufferHeight;

        this.tick += dt;
        this.camera.interpolate(dt);
    }
}
