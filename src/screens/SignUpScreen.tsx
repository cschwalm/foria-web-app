import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import {byLayout as byLayoutWrapper} from "../layout";
import {BODY_WIDTH, BUTTON_HEIGHT, FONT_4, FONT_6, MAX_BUTTON_WIDTH} from "../utils/constants";
import {vividRaspberry, white} from "../utils/colors";
import {initiateLogin as initiateLoginAction, initiateSpotifyLogin as initiateSpotifyAction} from "../redux/auth0Saga";
import {AuthenticationStatus} from "../redux/reducers/root";
import SpotifyButton from "../UI/SpotifyButton";
import SkipSpotifyButton from "../UI/SkipSpotifyButton";

interface SignUpScreenProps {
    byLayout: <A, B>(a: A, b: B) => A | B;
    initiateLogin: () => void;
    authenticationStatus: AuthenticationStatus;
    initiateSpotifyLogin: () => void;
    isSpotifyLinked: boolean;
}

const styles = {
    buttonStyle: {
        cursor: "pointer",
        height: BUTTON_HEIGHT,
        maxWidth: MAX_BUTTON_WIDTH,
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
        padding: '5em 1em 1em 1em',
    },
    desktopContainer: {
        padding: '8em 1.5em 1em 1.5em',
    },
    desktopCenter: {
        top: '50%',
        left:'50%',
        transform: 'translate(-50%, -50%)' as const,
        position: 'absolute' as const,
    },
    bodyContainer: {
        flex: 1,
        flexDirection: "column" as const,
        display: "flex",
        maxWidth: `${BODY_WIDTH}px`,
        margin: "0em auto",
    },
    bodyText: {
        color: 'white',
        fontSize: `${FONT_4}px`,
        fontWeight: 500,
    }
}

class SignUpScreen extends Component<SignUpScreenProps> {

    state = {
        didUserSkipSpotify: false
    };

    accountCreated = () => {

        let content;
        if (this.props.isSpotifyLinked || this.state.didUserSkipSpotify) {
            content = (
                <div>
                    <div style={styles.subtitleText}>
                        Curated events are coming to your inbox!
                    </div>
                    <div
                        className="row"
                        style={styles.buttonStyle}
                        onClick={() => this.props.initiateLogin()}
                    >
                        See your top artists
                    </div>
                </div>
            );
        } else {
            content = (
                <div>
                    <p style={styles.bodyText}>
                        Next step: connect your Spotify
                    </p>
                    {SpotifyButton(() => this.props.initiateSpotifyLogin())}
                    {SkipSpotifyButton(()=> this.setState({didUserSkipSpotify: true}))}
                    <div style={{...styles.bodyText, paddingTop: '1em'}}>
                        Why connect?
                        <ol>
                            <li>
                                Improved curation of events and discounts
                            </li>
                            <li>
                                Foria can rank your favorite music artists and you can share them with friends + your friends can share theirs back!
                            </li>
                        </ol>
                    </div>
                </div>
            );
        }

        return (
            <div style={styles.bodyContainer}>
                <div style={this.props.byLayout(styles.mobileContainer, styles.desktopContainer)}>
                    <div style={styles.headerText}>
                        Welcome To The Family!
                    </div>
                    {content}
                </div>
            </div>
        );
    }

    render () {

        let {byLayout, authenticationStatus} = this.props;
        let renderBody;

        const signUpComponent = (
            <div style={byLayout(styles.mobileContainer, styles.desktopCenter)}>
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
        );

        switch (authenticationStatus) {
            case AuthenticationStatus.Pending:
                renderBody = this.accountCreated();
                break;
            case AuthenticationStatus.NoAuth:
                renderBody = signUpComponent;
                break;
            case AuthenticationStatus.Auth:
                renderBody = this.accountCreated();
                break;
            default:
                throw new Error(
                    "Unhandled AuthenticationStatus when generating login link"
                );
        }

        return (
            <>
                {NavBar(this.props.byLayout)}
                <div style={styles.backgroundImage}>
                    {renderBody}
                </div>
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
            authenticationStatus: root.authenticationStatus,
            isSpotifyLinked: root.isSpotifyLinked,
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
        initiateSpotifyLogin: initiateSpotifyAction(dispatch),
    })
)(SignUpScreen);