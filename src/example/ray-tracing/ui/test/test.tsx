import * as React from 'react';

const testStyle = require('./test.scss');

type MainProps = {

};

type MainState = {

};

export class TestComponent extends React.Component<MainProps, MainState> {
    public render() {
        return (
            <div className={testStyle.container}>
                <span>test</span>
                <div className={testStyle.test2}>test 2</div>
            </div>
        );
    }
}