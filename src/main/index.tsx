import * as React from 'react';
import * as CSSModels from 'react-css-modules';
import { Game } from '../index';

type MainProps = {

};

type MainState = {

};

const mainStyle = require('./index.scss');

export class MainComponent extends React.Component<MainProps, MainState> {
    private _game:Game;
    constructor(props, context) {
        super(props, context);
        this._game = new Game();
    }
    public render() {
        return (
            <div className="container">
            </div>
        );
    }
}