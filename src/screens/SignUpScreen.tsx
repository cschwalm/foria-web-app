import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import {byLayout as byLayoutWrapper} from "../layout";

interface SignUpScreenProps {
    byLayout: <A, B>(a: A, b: B) => A | B;
}

class SignUpScreen extends Component<SignUpScreenProps> {

    render () {

        const renderBody = (
            <p>test</p>
        );

        return (
            <>
                {NavBar(this.props.byLayout)}
                {renderBody}
                {Footer(this.props.byLayout)}
            </>    );
    }
}

export default connect(
    (state: AppState) => {
        let {root} = state;
        return {
            layout: root.layout,
            byLayout: byLayoutWrapper(root.layout),
        };
    },
)(SignUpScreen);