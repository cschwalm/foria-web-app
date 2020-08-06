import React, {Component} from "react";
import {initiateMusicFetch as initiateMusicFetchAction, UserTopArtistsResponse} from "../redux/apiSaga";
import {byLayout as byLayoutWrapper, Layout} from "../layout";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import {initiateLogin as initiateLoginAction, initiateSpotifyLogin as initiateSpotifyAction} from "../redux/auth0Saga";
import {resetError as resetErrorAction} from "../redux/reducers/event";
import {antiFlashWhite, vividRaspberry, white} from "../utils/colors";
import Ellipsis from "../icons/Ellipsis";
import {BODY_WIDTH, BUTTON_HEIGHT, FONT_5, FONT_6, MAX_BUTTON_WIDTH} from "../utils/constants";

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
    headerTextBlack: {
        textAlign: 'center' as const,
        color: 'black',
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginBottom: '18px'
    },
    artistRow: {
        display: "flex",
        alignItems: 'center',
        paddingBottom: '1.5em'
    },
    artistTextMobile: {
        color: vividRaspberry,
        fontWeight: 700,
        fontSize: `${FONT_5}px`,
        marginLeft: '0.5em',
        width: '40px'
    },
    artistTextDesktop: {
        color: vividRaspberry,
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginLeft: '1em',
        width: '80px'
    }
}

interface MusicResultsProps {
    layout: Layout;
    byLayout: <A, B>(a: A, b: B) => A | B;
    permalink: string | null;
    initiateMusicFetch: (permalinkUUID: string | null) => void;
    userTopArtists?: UserTopArtistsResponse;
}

class MusicResults extends Component<MusicResultsProps> {

    componentDidMount() {
        let {initiateMusicFetch, permalink} = this.props;

        //API call to populate userTopArtists.
        initiateMusicFetch(permalink);
    }

    renderArtistRow = (item : any, index : number) => {

        return (
            <div className='row' key={item.id} style={styles.artistRow} >
                <img src={item.image_url} alt={item.name} width="100" height="100"/>
                <div style={this.props.byLayout(styles.artistTextMobile,styles.artistTextDesktop)}>
                    #{index+1}
                </div>
                <div style={this.props.byLayout(styles.artistTextMobile,styles.artistTextDesktop)}>
                    {item.name}
                </div>
            </div>
        );
    }
    
    renderArtistList = () => {
        let {userTopArtists} = this.props;

        if (userTopArtists === null || userTopArtists === undefined) {
            return (<Ellipsis style={{fontSize: FONT_6, textAlign: 'center'}} />);
        }
        return (
            <div>
                {userTopArtists.spotify_artist_list.map((item, index) => this.renderArtistRow(item,index))}
            </div>
        );
    }

    render() {

        let {layout, byLayout, permalink} = this.props;

        const resultsButton = (
            <div
                className="row"
                style={styles.buttonStyle}
                onClick={() => window.location.search = ''}
            >
                See your results
            </div>
        );
        ///TODO: add share with friends functionality
        const shareButton = (
            <div
                className="row"
                style={styles.buttonStyle}
                onClick={() => console.log('Share with friends button click')}
            >
                Share with friends
            </div>
        );

        let button = shareButton;

        if (permalink != null && layout === Layout.Desktop) {
            button = (
                <div className='row'>
                    <div style={{width: '50%'}}> {shareButton} </div>
                    <div style={{width: '1em'}}/>
                    <div style={{width: '50%'}}> {resultsButton} </div>
                </div>
            );
        } else if (permalink != null && layout === Layout.Mobile){
            button = (
                <div>
                    {shareButton}
                    {resultsButton}
                </div>
            );
        }

        return (
            <div style={{backgroundColor: antiFlashWhite}}>
                <div style={styles.bodyContainer}>
                    <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                        <div style={styles.headerTextBlack}>
                            We've ranked your favorite artists!
                        </div>
                        <div style={{paddingBottom: '1em'}}>
                            {button}
                        </div>
                        {this.renderArtistList()}
                    </div>
                </div>
            </div>
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
)(MusicResults);