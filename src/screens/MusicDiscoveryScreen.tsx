import React, {Component} from "react";

import backgroundImage from "../assets/background.jpg";
import shieldImage from "../assets/shield.png";
import {AuthenticationStatus} from "../redux/reducers/root";
import {AppState} from "../redux/store";
import {connect} from "react-redux";
import {byLayout as byLayoutWrapper, Layout} from "../layout";
import {
    initiateLogin as initiateLoginAction,
    initiateSpotifyLogin as initiateSpotifyAction,
} from "../redux/auth0Saga";
import {UserTopArtistsResponse} from "../redux/apiSaga";
import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import SpotifyButton from "../UI/SpotifyButton";
import {BODY_WIDTH, BUTTON_HEIGHT, FONT_4, FONT_6, MAX_BUTTON_WIDTH} from "../utils/constants";
import {vividRaspberry, white} from "../utils/colors";
import ErrorOverlay from "../UI/ErrorOverlay";
import {resetError as resetErrorAction} from "../redux/reducers/event";
import MusicResults from "../UI/MusicResults";
import {Helmet} from "react-helmet";

interface MusicDiscoveryScreenProps {
    layout: Layout;
    byLayout: <A, B>(a: A, b: B) => A | B;
    initiateLogin: () => void;
    authenticationStatus: AuthenticationStatus;
    initiateSpotifyLogin: () => void;
    isSpotifyLinked: boolean;
    permalink: string | null;
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
        textAlign: 'center' as const,
        color: 'white',
        fontSize: `${FONT_4}px`,
        fontWeight: 500,
    },
    shieldText: {
        textAlign: 'center' as const,
        alignItems: 'center',
        justifyContent: 'center',
        margin: "0 auto",
        color: white,
        maxWidth: '400px'
    }
}

enum DiscoveryView {
    Login,
    SpotifyCheck,
    MusicResults
}

class MusicDiscoveryScreen extends Component<MusicDiscoveryScreenProps> {

    renderMetadata = () => {
        let {permalink, userTopArtists} = this.props;
        let title = "Can you guess your top Spotify artists?";
        let description = "Find out and share them with Foria";
        let imageUrl;

        if (permalink) {
            title = "My top 7 artists of quarantine"
            description = "Check them out and share yours back!"
        }

        if (userTopArtists?.spotify_artist_list[0]?.image_url != null) {
            imageUrl = userTopArtists.spotify_artist_list[0].image_url;
        }

        return (
            <div className="application">
                <Helmet
                    title={title}
                    meta={[
                        {property: "og:type", content: "website"},
                        {property: "og:image", content: imageUrl},
                        {property: "og:title", content: title},
                        {property: "og:url", content: window.location.href},
                        {property: "og:description", content: description},
                        {property: "og:site_name", content: "Foria"},
                        {property: "fb:app_id", content: "695063607637402"}
                    ]}
                />
            </div>
        );
    };

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

        if (permalink != null) {
            view = DiscoveryView.MusicResults;
        } else if (authenticationStatus === AuthenticationStatus.Auth && isSpotifyLinked) {
            view = DiscoveryView.MusicResults;
        } else if (authenticationStatus === AuthenticationStatus.Auth) {
            view = DiscoveryView.SpotifyCheck
        } else if (authenticationStatus === AuthenticationStatus.NoAuth || authenticationStatus === AuthenticationStatus.Pending) {
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
                            One last step, connect your Spotify
                        </div>
                        <div style={{marginTop: '2em'}}>
                            {SpotifyButton(() => this.props.initiateSpotifyLogin())}
                            <div className="row" style={styles.shieldText} >
                                <img src={shieldImage} style={{height: '1.5em', marginRight: '0.5em'}} alt="Shield"/>
                                We will never sell your information.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        const signUpComponent = (
            <div style={styles.backgroundImage}>
                <div style={styles.bodyContainer}>
                    <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                        <div style={styles.headerTextWhite}>
                            Can you guess your top Spotify artists?
                        </div>
                        <p style={styles.bodyText}>
                            Continue to reveal your top artists and share them!
                        </p>
                        <div style={{marginTop: '3em'}}>
                            <div
                                className="row"
                                style={styles.buttonStyle}
                                onClick={() => this.props.initiateLogin()}
                            >
                                Continue
                            </div>
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
                {this.renderMetadata()}
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
            firstName: root.profile?.given_name,
            error: event.error
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
        initiateSpotifyLogin: initiateSpotifyAction(dispatch),
        resetError: resetErrorAction(dispatch)
    })
)(MusicDiscoveryScreen);