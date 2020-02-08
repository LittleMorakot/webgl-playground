import { mat4, mat3, vec4, vec3, quat, vec2 } from 'gl-matrix';
import { Frustum } from '../../utils/frustum';
import { halton } from '../../utils/halton';
import { GameInput } from '../../input';
import { Keys } from '../../input/keyBindings';

const CameraAxis = vec3.create();
const scratchVec4 = vec4.create();
const scratchMat3 = mat3.create();
const scratchMat4 = mat4.create();

const UP = vec3.fromValues(0, 1, 0);

const SPEED = 0.01;
const MOUSE_SENSITIVITY = 5;

const DEFAULT_FOV_Y = Math.PI / 4;
const DEFAULT_Z_NEAR = 0.00001;
const DEFAULT_Z_FAR = 512;
const DEFAULT_GAMMA = 2.2;
const DEFAULT_DISTANCE = 10.2;
const MIN_DISTANCE = 1.01;

const MAX_RAY_LENGTH = 64;
const NUM_SCREEN_SAMPLES = 16;
const NUM_SPHERE_SAMPLES = 48;
const NUM_EXPOSURE_SAMPLES = NUM_SCREEN_SAMPLES + NUM_SPHERE_SAMPLES + 1;

const _origin = vec3.create();
const _ray = vec3.create();
const _eye = vec3.create();
const _lookTarget = vec3.create();

const SAMPLE_POINTS:vec2[] = new Array(NUM_SCREEN_SAMPLES);
SAMPLE_POINTS[0] = vec2.create();
for (let i = 1; i < NUM_SCREEN_SAMPLES; ++i) {
    SAMPLE_POINTS[i] = vec2.fromValues(
        halton(i + 10, 2),
        halton(i + 10, 3));
}

const SPHERE_SAMPLES:vec3[] = new Array(NUM_SPHERE_SAMPLES);
for (let i = 0; i < NUM_SPHERE_SAMPLES; ++i) {
    const v = vec3.create();
    while (true) {
        vec3.random(v);
        v[1] = Math.abs(v[1]);
        vec3.normalize(v, v);
        let minDist = Infinity;
        for (let k = 0; k < i; ++k) {
            minDist = Math.min(minDist, vec3.dist(v, SPHERE_SAMPLES[k]));
        }
        if (minDist > 1 / NUM_SPHERE_SAMPLES) {
            break;
        }
    }
    SPHERE_SAMPLES[i] = v;
}

export class GLCamera {
    public viewportWidth = 1;
    public viewportHeight = 1;

    public input:GameInput;
    public cameraPos:vec3;
    public cameraAxis:{
        yaw:number,
        pitch:number,
    };

    public view = mat4.create();
    public projection = mat4.create();
    public viewProjection = mat4.create();

    public invView = mat4.create();
    public invProjection = mat4.create();
    public invViewProjection = mat4.create();

    public eye = vec3.create();
    public rotation = quat.create();
    private distance = window.innerWidth / window.innerHeight * DEFAULT_DISTANCE;

    public targetEye = vec3.create();
    public targetRotation = quat.create();

    public fovY = DEFAULT_FOV_Y;
    public zNear = DEFAULT_Z_NEAR;
    public zFar = DEFAULT_Z_FAR;
    public gamma = DEFAULT_GAMMA;

    public canvas:HTMLCanvasElement;
    public frustum = new Frustum();

    public underwater = false;

    public focalDistance = 8;
    public crosshairSeparation = 0;

    public targetExposure = 1 / 100;
    public currentExposure = 1 / 100;

    public currentBrightness = vec4.fromValues(0.2, 0.4, 0.6, 0.8);
    public targetBrightness = vec4.fromValues(0.2, 0.4, 0.6, 0.8);

    private exposureSamples:number[] = new Array(NUM_EXPOSURE_SAMPLES + 1);

    constructor (spec:{
        regl:any,
        input:GameInput,
    }) {
        this.input = spec.input;
        for (let i = 0; i <= NUM_EXPOSURE_SAMPLES; ++i) {
            this.exposureSamples[i] = 0;
        }
        this.canvas = spec.regl._gl.canvas;
        this.cameraPos = vec3.fromValues(3, 2, 2);
        this.cameraAxis = {
            yaw: 0.49,
            pitch: 0.52,
        };
        this.reset();
    }

    private calcProjection () {
        mat4.perspective(
            this.projection,
            this.fovY,
            this.viewportWidth / this.viewportHeight,
            this.zNear,
            this.zFar);
        mat4.invert(
            this.invProjection,
            this.projection);
    }

    public setDistance (dist) {
        this.distance = Math.max(MIN_DISTANCE, dist);
    }
    public getDistance () {
        return this.distance;
    }

    private calcView () {
        const {
            eye,
            view,
            rotation,
        } = this;
        mat4.fromQuat(view, rotation);
        for (let i = 0; i < 3; ++i) {
            let v = 0;
            for (let j = 0; j < 3; ++j) {
                v += eye[j] * view[4 * j + i];
            }
            this.view[12 + i] = -v;
        }
        mat4.invert(this.invView, this.view);
    }

    private recalc () {
        const {
            viewProjection,
            invViewProjection,
            projection,
            view,
        } = this;

        this.calcView();
        this.calcProjection();

        mat4.mul(viewProjection, projection, view);
        mat4.invert(invViewProjection, viewProjection);
        // this.frustum.setMatrix(viewProjection, invViewProjection);
    }

    public reset () {
        vec3.set(this.eye, 0, 0, 0);
        quat.identity(this.rotation);
        this.fovY = DEFAULT_FOV_Y;
        this.zNear = DEFAULT_Z_NEAR;
        this.zFar = DEFAULT_Z_FAR;
        this.gamma = DEFAULT_GAMMA;
        this.distance = window.innerWidth / window.innerHeight * DEFAULT_DISTANCE;
        this.recalc();
    }

    public interpolate (dt:number) {
        this.zFar = 10000;

        this.updateCamera();

        const testPos = vec3.fromValues(0, 0, 1);

        const axis = this.getCameraAxis();
        const eye = vec3.copy(_eye, this.cameraPos);
        // const eye = vec3.copy(_eye, testPos);
        const target = vec3.scaleAndAdd(
            axis,
            eye,
            vec3.negate(axis, axis),
            1,
        );
        this.lookAt(eye, target);

        // FIXME: apply some easing here
        vec3.copy(this.eye, this.targetEye);
        quat.copy(this.rotation, this.targetRotation);
        this.recalc();
    }

    public pixelToRay (pixelX:number, pixelY:number) : vec3 {
        const ratio = window.devicePixelRatio;
        return this.screenToRay(
            2 * pixelX / (this.viewportWidth / ratio) - 1,
            1 - 2 * pixelY / (this.viewportHeight / ratio));
    }

    public screenToRay (screenX:number, screenY:number, out?:vec3) : vec3 {
        vec4.set(
            scratchVec4,
            screenX,
            screenY,
            1,
            1);
        vec4.transformMat4(
            scratchVec4,
            scratchVec4,
            this.invProjection);
        scratchVec4[3] = 0;
        vec4.transformMat4(
            scratchVec4,
            scratchVec4,
            this.invView);
        return vec3.normalize(
            out || vec3.create(),
            scratchVec4 as any);
    }

    public lookAt (eye:vec3, target:vec3, up?:vec3) {
        vec3.copy(this.targetEye, eye);
        quat.fromMat3(
            this.targetRotation,
            mat3.fromMat4(
                scratchMat3,
                mat4.lookAt(
                    scratchMat4,
                    eye,
                    target,
                    up || vec3.fromValues(0, 1, 0))));
    }

    public updateCamera() {
        const {width, height} = this.canvas.getBoundingClientRect();
        const mouseX = this.input.keyState[Keys.LeftClick] ? this.input.mousePositionChange[0] : 0;
        const mouseY = this.input.keyState[Keys.LeftClick] ? this.input.mousePositionChange[1] : 0;

        this._handleAxis(
            mouseX / width * MOUSE_SENSITIVITY,
            mouseY / height * MOUSE_SENSITIVITY,
        );

        const forward = this.input.keyState[Keys.Up];
        const backward = this.input.keyState[Keys.Down];
        const left = this.input.keyState[Keys.Left];
        const right = this.input.keyState[Keys.Right];
        const up = this.input.keyState[Keys.Space];
        const down = this.input.keyState[Keys.Crouch];

        // forward and backward
        const _axis = vec3.clone(CameraAxis);
        const move = vec3.create();
        vec3.scale(move, _axis, backward - forward);

        // left and right
        const horizontal = left - right;
        const dx = Math.sin(this.cameraAxis.pitch);
        const dz = Math.cos(this.cameraAxis.pitch);
        move[0] -= dx * horizontal;
        move[2] += dz * horizontal;

        // up and down
        const vertical = up - down;
        move[1] += vertical;

        vec3.normalize(move, move);
        vec3.scale(move, move, SPEED);

        vec3.add(this.cameraPos, this.cameraPos, move);

    }

    public _handleAxis(dx:number, dy:number) {
        this.cameraAxis.pitch += dx;
        this.cameraAxis.yaw = Math.max(-0.5 * Math.PI + 0.001, Math.min(0.5 * Math.PI - 0.001, this.cameraAxis.yaw + dy));
    }

    private getCameraAxis () {
        const { pitch, yaw } = this.cameraAxis;
        CameraAxis[0] = Math.cos(pitch) * Math.cos(yaw);
        CameraAxis[1] = Math.sin(yaw);
        CameraAxis[2] = Math.sin(pitch) * Math.cos(yaw);
        return vec3.clone(CameraAxis);
    }
}
