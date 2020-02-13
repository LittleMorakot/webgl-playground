import * as React from 'react';
import { Game } from '../../../base-game/game';
import glMain from '../gl/main';

type MainProps = {

};

type MainState = {

};

const mainStyle = require('./index.scss');

export class MainComponent extends React.Component<MainProps, MainState> {
    private _game:Game;
    constructor(props, context) {
        super(props, context);
        this._game = new Game(glMain);
    }
    public render() {
        return (
            <div className={'container'}>
            </div>
        );
    }
}