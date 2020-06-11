import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import {byLayout as byLayoutWrapper} from "../layout";
import {BUTTON_HEIGHT, BUTTON_WIDTH} from "../utils/constants";
import {vividRaspberry, white} from "../utils/colors";

interface SignUpScreenProps {
    byLayout: <A, B>(a: A, b: B) => A | B;
}

class SignUpScreen extends Component<SignUpScreenProps> {

    render () {

        const buttonStyle = {
            cursor: "pointer",
            height: BUTTON_HEIGHT,
            width: BUTTON_WIDTH,
            flex: `0 0 ${BUTTON_HEIGHT}`,
            backgroundColor: vividRaspberry,
            borderRadius: "5px",
            color: white,
            fontWeight: 500,
            justifyContent: "center",
            alignItems: "center",
            margin: '0 auto'
        }

        const renderBody = (
            <div
                style={{
                    height: '100%',
                    background: `url(https://foriatickets.com/img/background.jpg) no-repeat`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    alignItems: 'center'
                }}
            >
                <div style={{margin: '0 10%'}}>
                    <p style={{textAlign: 'center'}}>Discover amazing events. Access personalized discounts.</p>
                    <p>Foria curates events based on your music taste and enables organizers to offer
                        personalized discounts to the people they want in their crowd</p>
                    <div
                        style={buttonStyle}
                    >
                        Join The Foria Family
                    </div>
                </div>

            </div>
        );

        return (
            <>
                {NavBar(this.props.byLayout)}
                {renderBody}
                {Footer(this.props.byLayout)}
            </>
        );
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