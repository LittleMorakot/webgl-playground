import * as React from 'react';
import * as ReactDOM from 'react-dom';
import glMain from './gl/main';
import { Game } from '../../base-game/game';
import { MainComponent } from './ui/index';

const style = require('./index.scss');

type MainProps = {

};

type MainState = {

};

export class RayTracingExample {
    public react_el:HTMLElement;
    private _game:Game;
    private _reglContainer:HTMLDivElement;
    constructor() {
        this.react_el = document.createElement('div');
        this.react_el.id = 'main';
        document.body.appendChild(this.react_el);
        this.renderDom();
        this._reglContainer = document.createElement('div');
        this._reglContainer.setAttribute('style', 'width: 800px; height: 400px; position: relative');
        this.react_el.appendChild(this._reglContainer);
        document.body.appendChild(this.react_el);
        this._game = new Game(glMain, this._reglContainer);
    }

    public renderDom() {
        ReactDOM.render(
            <MainComponent
            />,
            this.react_el,
        );
    }
}

new RayTracingExample();