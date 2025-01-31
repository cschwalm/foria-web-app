import React, {Component} from "react";
import {initiateMusicFetch as initiateMusicFetchAction, UserTopArtistsResponse} from "../redux/apiSaga";
import {byLayout as byLayoutWrapper, Layout} from "../layout";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import {antiFlashWhite, trolleyGray, vividRaspberry, white} from "../utils/colors";
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
    subHeaderText: {
        textAlign: 'center' as const,
        color: trolleyGray,
        fontSize: `${FONT_5}px`,
        marginBottom: '1.5em'
    },
    artistRow: {
        display: "flex",
        alignItems: 'center',
        paddingBottom: '1.5em'
    },
    artistTextMobile: {
        color: trolleyGray,
        fontWeight: 700,
        fontSize: `${FONT_5}px`,
        marginLeft: '0.5em'
    },
    pinkArtistTextMobile: {
        color: vividRaspberry,
        fontWeight: 700,
        fontSize: `${FONT_5}px`,
        marginLeft: '0.5em'
    },
    artistTextDesktop: {
        color: trolleyGray,
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginLeft: '1em'
    },
    pinkArtistTextDesktop: {
        color: vividRaspberry,
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginLeft: '1em'
    }
}

const disabledButtonStyle = {
    ...styles.buttonStyle,
    backgroundColor: trolleyGray
}

interface MusicResultsProps {
    layout: Layout;
    byLayout: <A, B>(a: A, b: B) => A | B;
    permalink: string | null;
    initiateMusicFetch: (permalinkUUID: string | null) => void;
    userTopArtists?: UserTopArtistsResponse;
    firstName?: string;
}

class MusicResults extends Component<MusicResultsProps> {

    state = {
        isTextCopied: false
    }

    componentDidMount() {
        let {initiateMusicFetch, permalink} = this.props;

        //API call to populate userTopArtists.
        initiateMusicFetch(permalink);
    }

    renderArtistRow = (item : any, index : number) => {
        let {byLayout} = this.props;

        return (
            <div className='row' key={item.id} style={styles.artistRow} >
                <img src={item.image_url} alt={item.name} width="100" height="100"/>
                <div style={byLayout(styles.artistTextMobile,styles.artistTextDesktop)}>
                    #{index+1}
                </div>
                <a
                    style={{cursor: 'pointer', ...byLayout(styles.pinkArtistTextMobile,styles.pinkArtistTextDesktop)}}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={item.bio_url}>
                    {item.name}
                </a>
            </div>
        );
    }
    
    renderArtistList = () => {
        let userTopArtists = this.props.userTopArtists?.spotify_artist_list;

        if (userTopArtists === null || userTopArtists === undefined) {
            return (<Ellipsis style={{fontSize: FONT_6, textAlign: 'center'}} />);
        }

        /// Clones the artist array then takes the top 10
        let topSevenArtists = [...userTopArtists].splice(0,7);

        return (
            <div>
                {topSevenArtists.map((item, index) => this.renderArtistRow(item,index))}
            </div>
        );
    }

    shareFunction = () => {

        let {firstName, userTopArtists} = this.props;
        const sharePermalink = userTopArtists?.permalink_uuid;

        if (firstName === undefined) {
            firstName = "Your friend";
        }

        if (sharePermalink === null || sharePermalink === undefined) {
            return;
        }

        const shareLink = `${window.location.protocol}//${window.location.host}${window.location.pathname}?permalink=${sharePermalink}`;

        if (navigator.share) {

            navigator.share({
                title: `${firstName}'s Music Interests`,
                text: 'Check out my top 7 artists of quarantine!',
                url: shareLink,
            }).then(
                () => console.log('Successful sharing of music interests.')
            ).catch(
                (error) => console.log('Error sharing music interests.', error)
            );
        } else if (document.queryCommandSupported('copy')) {

            let link = document.createElement('textarea');
            link.innerText = shareLink;
            document.body.appendChild(link);
            link.select();
            document.execCommand('copy');
            link.remove();
            this.setState({isTextCopied: true});
        }
    }

    renderButtons = () => {

        let {layout, permalink, userTopArtists} = this.props;
        let sharePermalink = userTopArtists?.permalink_uuid;
        let resultsButton = null;
        let shareButton = null;

        if (permalink != null ) {
            resultsButton = (
                <div
                    className="row"
                    style={styles.buttonStyle}
                    onClick={() => window.location.search = ''}
                >
                    See your top artists
                </div>
            );
        }

        if (sharePermalink != null
            && (navigator.share || document.queryCommandSupported('copy'))) {
            shareButton = (
                <div
                    className="row"
                    style={styles.buttonStyle}
                    onClick={() => this.shareFunction()}
                >
                    Share
                </div>
            );
        }

        if (this.state.isTextCopied) {
            shareButton = (
                <div
                    className="row"
                    style={disabledButtonStyle}
                    onClick={() => this.shareFunction()}
                >
                    Link copied!
                </div>
            );
        }

        if (shareButton && resultsButton && layout === Layout.Desktop) {
            return (
                <div className='row'>
                    <div style={{width: '50%'}}> {shareButton} </div>
                    <div style={{width: '1em'}}/>
                    <div style={{width: '50%'}}> {resultsButton} </div>
                </div>
            );
        } else if (shareButton || resultsButton){
            return (
                <div>
                    {shareButton}
                    {resultsButton}
                </div>
            );
        } else {
            return  null;
        }
    }

    render() {

        let {byLayout, permalink} = this.props;
        let friend;
        if (permalink) {
            friend = " Friend's";
        }

        return (
            <div style={{backgroundColor: antiFlashWhite}}>
                <div style={styles.bodyContainer}>
                    <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                        <div style={styles.headerTextBlack}>
                            Your{friend} Top 7 Artists
                        </div>
                        <div style={styles.subHeaderText}>
                            We've ranked your{friend} favorite artists from the last month
                        </div>
                        <div style={{paddingBottom: '2em'}}>
                            {this.renderButtons()}
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
            permalink: root.permalink,
            userTopArtists: root.userTopArtists,
            firstname: root.profile?.given_name,
            error: event.error
        };
    },
    dispatch => ({
        initiateMusicFetch: initiateMusicFetchAction(dispatch),
    })
)(MusicResults);