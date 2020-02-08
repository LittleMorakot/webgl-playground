import { GLCamera } from './camera';
// import { GLVoxelModelCache } from './model';
// import { GLShadow } from './shadow';
// import { GLPostProcess } from './post';
// import { GLVoxel } from './voxel';
// import { ClientVoxel } from '../../voxel/client';
import { REGLLoader } from '../regl';
import { GameState } from '../../state';
import { GameInput } from '../../input';
// import { GLPlayerSkinCache } from './skin';
// import { MuClient } from 'mudb/client';
// import { MuSocketState } from 'mudb/socket';
// import { GLWeather } from './weather';
// import { ClientState } from '../../state/client';
// import { GLBreakEffect } from './effect';
// import { GLReflectionProbe } from './reflection';
// import { GameSettingsType, GameSettingsSchema } from '../../settings';
// import { ContentResolver } from '../../../content-server/content-fetch';

// function mockClient () {
//     return new MuClient({
//         open: () => {},
//         sessionId: 'x',
//         send: () => {},
//         close: () => {},
//         state: MuSocketState.CLOSED,
//     });
// }

// export type CustomRendering = () => {
//     modelShadowHook?:(regl:any, loader:REGLLoader) => (state:ClientState) => void,
//     modelHook?:(regl:any, loader:REGLLoader) => (state:ClientState) => void,
//     transparentModelHook?:(regl:any, loader:REGLLoader) => (state:ClientState) => void,
//     postProcessHook?:(regl:any, loader:REGLLoader) => (state:ClientState) => void,
//     noPostProcessHook?:(regl:any, loader:REGLLoader) => (state:ClientState) => void,
// };

export class GLState {
    public regl:any;
    public reglLoader:REGLLoader;
    // public input:GameInput;

    // public settings:GameSettingsType;

    public camera:GLCamera;
    // public models:GLVoxelModelCache;
    // public shadows:GLShadow;
    // public postProcess:GLPostProcess;
    // public voxels:GLVoxel;
    // public skins:GLPlayerSkinCache;
    // public weather:GLWeather;
    // public breakEffect:GLBreakEffect;
    // public reflection:GLReflectionProbe;
    // public customRendering?:CustomRendering;

    public tick:number = 0;

    // public postProcessEnabled () {
    //     return this.postProcess.supported && this.settings.postprocess;
    // }

    constructor (spec:{
        regl:any,
        reglLoader:REGLLoader,
        input:GameInput,
        // settings?:GameSettingsType,
        // voxels?:ClientVoxel,
        // content:ContentResolver,
    }) {
        // this.settings = spec.settings || GameSettingsSchema.clone(GameSettingsSchema.identity);
        this.regl = spec.regl;
        this.reglLoader = spec.reglLoader;
        // this.input = spec.input;
        // const settings = this.settings;
        // const voxels = spec.voxels || new ClientVoxel({
        //     client: mockClient(),
        // });
        // this.voxels = new GLVoxel({
        //     regl: spec.regl,
        //     voxels,
        // });
        this.camera = new GLCamera({
            regl: spec.regl,
            input: spec.input,
            // settings,
            // voxels: this.voxels,
        });
        // this.weather = new GLWeather({
        //     camera: this.camera,
        // });
        // this.shadows = new GLShadow({
        //     settings,
        //     regl: spec.regl,
        //     weather: this.weather,
        //     camera: this.camera,
        // });
        // this.postProcess = new GLPostProcess({
        //     regl: spec.regl,
        //     loader: spec.reglLoader,
        // });
        // this.models = new GLVoxelModelCache(spec.regl, spec.content);
        // this.skins = new GLPlayerSkinCache(this.models, spec.content);
        // this.breakEffect = new GLBreakEffect(voxels);
        // this.reflection = new GLReflectionProbe({
        //     regl: spec.regl,
        //     reglLoader: spec.reglLoader,
        // });
    }

    public interpolate (dt:number, state:GameState) {
        // const postProcessEnabled =
        //     this.postProcess.supported;
        this.camera.viewportWidth = this.regl._gl.drawingBufferWidth;
            // postProcessEnabled ? this.regl._gl.drawingBufferWidth : this.regl._gl.drawingBufferWidth * this.postProcess.pixelRatio;
        this.camera.viewportHeight = this.regl._gl.drawingBufferHeight;
            // postProcessEnabled ? this.regl._gl.drawingBufferHeight : this.regl._gl.drawingBufferHeight * this.postProcess.pixelRatio;

        this.tick += dt;
        // this.breakEffect.interpolate(this.tick);
        // this.weather.interpolate(dt, state.weather);
        this.camera.interpolate(dt);
        // this.shadows.interpolate();
        // this.camera.calcExposure(this.weather);
        // this.voxels.interpolate();
    }

    public destroy () {
        // this.voxels.destroy();
        // this.skins.destroy();
        // this.models.destroy();
        // this.shadows.destroy();
    }

    public restore () {
        // this.models.restore();
        // this.voxels.restore();
        // this.postProcess.restore();
    }

    // public getCustomRendering() {
    //     return this.customRendering;
    // }

    // public setCustomRendering(cb:CustomRendering) {
    //     this.customRendering = cb;
    // }
}
