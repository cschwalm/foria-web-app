import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import {byLayout as byLayoutWrapper} from "../layout";
import {BUTTON_HEIGHT, BUTTON_WIDTH, FONT_4, FONT_6} from "../utils/constants";
import {vividRaspberry, white} from "../utils/colors";
import {initiateLogin as initiateLoginAction} from "../redux/auth0Saga";
import {AuthenticationStatus} from "../redux/reducers/root";

interface SignUpScreenProps {
    byLayout: <A, B>(a: A, b: B) => A | B;
    initiateLogin: () => void;
    authenticationStatus: AuthenticationStatus;
}

const styles = {
    buttonStyle: {
        cursor: "pointer",
        height: BUTTON_HEIGHT,
        width: BUTTON_WIDTH,
        flex: `0 0 ${BUTTON_HEIGHT}`,
        backgroundColor: vividRaspberry,
        borderRadius: "5px",
        color: white,
        fontWeight: 600,
        justifyContent: "center",
        alignItems: "center",
        margin: '0 auto'
    },
    backgroundImage: {
        height: '100%',
        background: `linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5))
                ,url(https://foriatickets.com/img/background.jpg) no-repeat`,
        backgroundPosition: "center",
        backgroundSize: "cover",
    },
    headerText: {
        textAlign: 'center' as const,
        color: 'white',
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginBottom: '18px'
    },
    subtitleText: {
        textAlign: 'center' as const,
        color: 'white',
        fontSize: `${FONT_4}px`,
        fontWeight: 500,
        margin: '36px auto',
        maxWidth: '600px'
    },
    mobileContainer: {
        top: '15%',
        margin: '0 10%',
        position: 'absolute' as const
    },
    desktopContainer: {
        top: '50%',
        left:'50%',
        transform: 'translate(-50%, -50%)' as const,
        position: 'absolute' as const
    }
}

class SignUpScreen extends Component<SignUpScreenProps> {

    render () {

        let {byLayout, authenticationStatus} = this.props;

        let renderBody;

        const signUpComponent = (
            <div style={styles.backgroundImage}>
                <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                    <div style={styles.headerText}>
                        Discover amazing events. Access personalized discounts.</div>
                    <div style={styles.subtitleText}>
                        Foria curates events based on your music taste and enables organizers to offer
                        personalized discounts to the people they want in their crowd</div>
                    <div
                        className="row"
                        style={styles.buttonStyle}
                        onClick={() => this.props.initiateLogin()}
                    >
                        Join The Foria Family
                    </div>
                </div>

            </div>
        );

        const accountCreated = (
            <div style={styles.backgroundImage}>
                <div style={{top: '30%', position: 'absolute', width: '100%'}}>
                    <div style={styles.headerText}>
                        Welcome To The Family!
                    </div>
                    <div style={styles.subtitleText}>
                        Curated events are coming to your inbox!
                    </div>
                </div>

            </div>
        );

        switch (authenticationStatus) {
            case AuthenticationStatus.Pending:
                renderBody = accountCreated;
                break;
            case AuthenticationStatus.NoAuth:
                renderBody = signUpComponent;
                break;
            case AuthenticationStatus.Auth:
                renderBody = accountCreated;
                break;
            default:
                throw new Error(
                    "Unhandled AuthenticationStatus when generating login link"
                );
        }

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
            authenticationStatus: root.authenticationStatus
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
    })
)(SignUpScreen);