import { GLState } from './gl/gl-state';
import { REGLLoader } from './gl/regl';
import { GameInput } from './game-input';

export class GameState {
    public glState:GLState;
    public input:GameInput;
    constructor(spec:{
        regl:any,
        reglLoader:REGLLoader,
        canvas:HTMLCanvasElement,
    }) {
        this.input = new GameInput({
            canvas: spec.canvas,
        });
        this.glState = new GLState({
            regl: spec.regl,
            reglLoader: spec.reglLoader,
            input: this.input,
        });
    }

    public interpolate(frameTime:number) {
        const dt = frameTime;
        this.input.interpolate(frameTime);
        this.glState.interpolate(dt, this);
    }
}