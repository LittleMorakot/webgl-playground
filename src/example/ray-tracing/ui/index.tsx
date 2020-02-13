import * as React from 'react';

const mainStyle = require('./index.scss');

type MainProps = {
};

type MainState = {

};

export class MainComponent extends React.Component<MainProps, MainState> {
    public render() {
        return (
            <div className={mainStyle.container}>
            </div>
        );
    }
}