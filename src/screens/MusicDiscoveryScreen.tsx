import React, {Component} from "react";

import backgroundImage from "../assets/background.jpg";
import {AuthenticationStatus} from "../redux/reducers/root";
import {AppState} from "../redux/store";
import {connect} from "react-redux";
import {byLayout as byLayoutWrapper, Layout} from "../layout";
import {
    initiateLogin as initiateLoginAction,
    initiateSpotifyLogin as initiateSpotifyAction,
} from "../redux/auth0Saga";
import {initiateMusicFetch as initiateMusicFetchAction, UserTopArtistsResponse} from "../redux/apiSaga";
import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import SpotifyButton from "../UI/SpotifyButton";
import {BODY_WIDTH, BUTTON_HEIGHT, FONT_4, FONT_6, MAX_BUTTON_WIDTH} from "../utils/constants";
import {vividRaspberry, white} from "../utils/colors";
import ErrorOverlay from "../UI/ErrorOverlay";
import {resetError as resetErrorAction} from "../redux/reducers/event";
import MusicResults from "../UI/MusicResults";

interface MusicDiscoveryScreenProps {
    layout: Layout;
    byLayout: <A, B>(a: A, b: B) => A | B;
    initiateLogin: () => void;
    authenticationStatus: AuthenticationStatus;
    initiateSpotifyLogin: () => void;
    isSpotifyLinked: boolean;
    permalink: string | null;
    initiateMusicFetch: (permalinkUUID: string | null) => void;
    userTopArtists?: UserTopArtistsResponse;
    error?: any;
    resetError: () => void;
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
        margin: '1em auto',
    },
    backgroundImage: {
        height: '100%',
        background: `linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5))
                ,url(${backgroundImage}) no-repeat`,
        backgroundPosition: "center",
        backgroundSize: "cover",
    },
    headerTextWhite: {
        textAlign: 'center' as const,
        color: 'white',
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginBottom: '18px'
    },
    mobileContainer: {
        padding: '5em 1em 1em 1em',
    },
    desktopContainer: {
        padding: '8em 1.5em 1em 1.5em',
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

enum DiscoveryView {
    Login,
    SpotifyCheck,
    MusicResults
}

class MusicDiscoveryScreen extends Component<MusicDiscoveryScreenProps> {

    renderErrorOverlay() {
        let {error, resetError} = this.props;
        if (!error) {
            return;
        }
        return (<div> {ErrorOverlay(error,resetError)} </div>);
    }

    render() {

        let {byLayout, authenticationStatus, isSpotifyLinked, permalink} = this.props;
        let view = DiscoveryView.SpotifyCheck;
        let renderBody;

        ///TODO: handle Auth pending case
        if (permalink != null) {
            view = DiscoveryView.MusicResults;
        } else if (authenticationStatus === AuthenticationStatus.Auth && isSpotifyLinked) {
            view = DiscoveryView.MusicResults;
        } else if (authenticationStatus === AuthenticationStatus.Auth) {
            view = DiscoveryView.SpotifyCheck
        } else if (authenticationStatus === AuthenticationStatus.NoAuth) {
            view = DiscoveryView.Login
        } else {
            throw new Error(
                "Unhandled AuthenticationStatus when generating login link"
            );
        }

        const spotifyScreen = (
            <div style={styles.backgroundImage}>
                <div style={styles.bodyContainer}>
                    <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                        <div style={styles.headerTextWhite}>
                            Want to find out your top music artists and share them with friends?
                        </div>
                        <p style={styles.bodyText}>
                            It’s a breeze with Foria, simply create an account and connect with Spotify
                        </p>
                        {SpotifyButton(() => this.props.initiateSpotifyLogin())}
                    </div>
                </div>
            </div>
        );

        const signUpComponent = (
            <div style={styles.backgroundImage}>
                <div style={styles.bodyContainer}>
                    <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                        <div style={styles.headerTextWhite}>
                            Want to find out your top music artists and share them with friends?
                        </div>
                        <p style={styles.bodyText}>
                            It’s a breeze with Foria, simply create an account and connect with Spotify
                        </p>
                        <div
                            className="row"
                            style={styles.buttonStyle}
                            onClick={() => this.props.initiateLogin()}
                        >
                            Join The Foria Family
                        </div>
                    </div>
                </div>
            </div>
        );

        switch (view) {
            case DiscoveryView.Login:
                renderBody = signUpComponent;
                break;
            case DiscoveryView.MusicResults:
                renderBody = (<MusicResults/>);
                break;
            case DiscoveryView.SpotifyCheck:
                renderBody = spotifyScreen;
                break;
            default:
                renderBody = signUpComponent;
        }

        return (
            <>
                {NavBar(this.props.byLayout)}
                {renderBody}
                {Footer(this.props.byLayout)}
                {this.renderErrorOverlay()}
            </>
        );
    }
}

export default connect(
    (state: AppState) => {
        let {root, event} = state;
        return {
            layout: root.layout,
            byLayout: byLayoutWrapper(root.layout),
            authenticationStatus: root.authenticationStatus,
            isSpotifyLinked: root.isSpotifyLinked,
            permalink: root.permalink,
            userTopArtists: root.userTopArtists,
            error: event.error
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
        initiateSpotifyLogin: initiateSpotifyAction(dispatch),
        initiateMusicFetch: initiateMusicFetchAction(dispatch),
        resetError: resetErrorAction(dispatch)
    })
)(MusicDiscoveryScreen);