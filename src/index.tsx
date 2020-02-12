import * as React from 'react';
import * as ReactDOM from 'react-dom';

type MainProps = {

};

type MainState = {

};

export class Main {
    public react_el:HTMLElement;
    constructor() {
        this.react_el = document.createElement('div');
        this.react_el.id = 'main';
        document.body.appendChild(this.react_el);
        this.renderDom();
    }

    public renderDom() {
        ReactDOM.render(
            <div>home</div>,
            this.react_el,
        );
    }
}

new Main();