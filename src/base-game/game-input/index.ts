import { Keys, KeyBindings } from './keyBindings';

export enum MouseState {
    MouseReleased = 0,
    MousePressed = 1,
}

export class GameInput {
    private _canvas:HTMLCanvasElement;
    public mousePos:[number, number] = [0, 0];
    public keyState:number[];
    private _inputPaused:boolean = false;

    private _lastMousePos:[number, number] = [0, 0];
    public mousePositionChange:[number, number] = [0, 0];

    constructor(spec:{
        canvas:HTMLCanvasElement,
    }) {
        this._canvas = spec.canvas;
        this.keyState = new Array(Keys.KeyCount).fill(0);

        this._bindEvent();
    }

    private _bindEvent() {
        this._canvas.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        this._canvas.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        this._canvas.addEventListener('mouseup', this.handleMouseUp.bind(this), true);

        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.addEventListener('keyup', this.handleKeyUp.bind(this), true);

        document.addEventListener('wheel', this.handleWheel.bind(this), true);
    }

    private _unBingEvent() {
        this._canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this), true);
        this._canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this), true);
        this._canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this), true);

        document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.removeEventListener('keyup', this.handleKeyUp.bind(this), true);

        document.removeEventListener('wheel', this.handleWheel.bind(this), true);
    }

    public pauseInput() {
        this._inputPaused = true;
    }

    public unpauseInput() {
        this._inputPaused = false;
    }

    private handleMouseDown(e:MouseEvent) {
        if (this._inputPaused) {
            return;
        }
        this.mousePos[0] = e.clientX;
        this.mousePos[1] = e.clientY;
        if (e.button === 2) { // right click
            this.keyState[Keys.RightClick] = 1;
        } else {
            this.keyState[Keys.LeftClick] = 1;
        }
    }

    private handleMouseMove(e:MouseEvent) {
        if (this._inputPaused) {
            return;
        }
        this.mousePos[0] = e.clientX;
        this.mousePos[1] = e.clientY;
    }

    private handleMouseUp(e:MouseEvent) {
        if (this._inputPaused) {
            return;
        }
        if (e.button === 2) {
            this.keyState[Keys.RightClick] = 0;
        } else {
            this.keyState[Keys.LeftClick] = 0;
        }
    }

    private handleKeyDown(e:KeyboardEvent) {
        if (this._inputPaused) {
            return;
        }
        const code = e.keyCode;
        if (code in KeyBindings) {
            const key = KeyBindings[code];
            this.keyState[key] = 1;
        }
    }

    private handleKeyUp(e:KeyboardEvent) {
        if (this._inputPaused) {
            return;
        }
        const code = e.keyCode;
        if (code in KeyBindings) {
            const key = KeyBindings[code];
            this.keyState[key] = 0;
        }
    }

    private handleWheel() {
        if (this._inputPaused) {
            return;
        }
    }

    public interpolate(t) {
        this.mousePositionChange[0] = this.mousePos[0] - this._lastMousePos[0];
        this.mousePositionChange[1] = this.mousePos[1] - this._lastMousePos[1];

        this._lastMousePos[0] = this.mousePos[0];
        this._lastMousePos[1] = this.mousePos[1];
    }
}