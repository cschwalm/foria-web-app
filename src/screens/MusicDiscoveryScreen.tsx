import React, {Component} from "react";
import {AuthenticationStatus} from "../redux/reducers/root";
import {AppState} from "../redux/store";
import {connect} from "react-redux";
import {byLayout as byLayoutWrapper, Layout} from "../layout";
import {initiateLogin as initiateLoginAction, initiateSpotifyLogin as initiateSpotifyAction} from "../redux/auth0Saga";
import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import SpotifyButton from "../UI/SpotifyButton";
import {BODY_WIDTH, BUTTON_HEIGHT, FONT_4, FONT_5, FONT_6, MAX_BUTTON_WIDTH} from "../utils/constants";
import {antiFlashWhite, vividRaspberry, white} from "../utils/colors";
import Ellipsis from "../icons/Ellipsis";

interface MusicDiscoveryScreenProps {
    layout: Layout;
    byLayout: <A, B>(a: A, b: B) => A | B;
    initiateLogin: () => void;
    authenticationStatus: AuthenticationStatus;
    initiateSpotifyLogin: () => void;
    isSpotifyLinked: boolean;
    location: object,
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
                ,url(https://foriatickets.com/img/background.jpg) no-repeat`,
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
    headerTextBlack: {
        textAlign: 'center' as const,
        color: 'black',
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginBottom: '18px'
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
    },
    artistRow: {
        display: "flex",
        alignItems: 'center',
        paddingBottom: '1.5em'
    }
}

enum DiscoveryView {
    Login,
    SpotifyCheck,
    UserResults,
    PermalinkResults
}

const getPermalinkFromUrl = (): string | null => {
    let params = new URLSearchParams(window.location.search);
    let permalink = params.get("permalink");
    if (permalink != null) {
        return permalink;
    } else {
        return null;
    }
};

class MusicDiscoveryScreen extends Component<MusicDiscoveryScreenProps> {

    ///TODO: have API call set loading to true
    state = {
        areArtistsLoading: false,
    };

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

    resultsScreen = (isPermalink : boolean) => {

        const resultsButton = (
            <div
                className="row"
                style={{...styles.buttonStyle,}}
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

        let {layout, byLayout} = this.props;
        let button = shareButton;

        if (isPermalink && layout === Layout.Desktop) {
            button = (
                <div className='row'>
                    <div style={{width: '50%'}}> {shareButton} </div>
                    <div style={{width: '1em'}}/>
                    <div style={{width: '50%'}}> {resultsButton} </div>
                </div>
            );
        } else if (isPermalink && layout === Layout.Mobile){
            button = (
                <div>
                    {shareButton}
                    {resultsButton}
                </div>
            );
        }

        const artistList = dummyData.spotify_artist_list.map((item, index) => this.renderArtistRow(item,index));

        return (
            <div style={{backgroundColor: antiFlashWhite}}>
                <div style={styles.bodyContainer}>
                    <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                        <div style={styles.headerTextBlack}>
                            Here are your results!
                        </div>
                        <div >
                            {button}
                        </div>
                        {this.state.areArtistsLoading ? <Ellipsis style={{fontSize: FONT_6, textAlign: 'center'}} /> : artistList}
                    </div>
                </div>
            </div>
        );
    }

    render() {

        let {byLayout, authenticationStatus, isSpotifyLinked} = this.props;
        let view = DiscoveryView.SpotifyCheck;
        let renderBody;

        ///TODO: handle Auth pending case
        if (getPermalinkFromUrl() != null) {
            ///TODO:insert user permalink call here?
            view = DiscoveryView.PermalinkResults;
        } else if (authenticationStatus === AuthenticationStatus.Auth && isSpotifyLinked) {
            ///TODO:insert user API call here?
            view = DiscoveryView.UserResults;
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
            case DiscoveryView.UserResults:
                renderBody = this.resultsScreen(false);
                break;
            case DiscoveryView.SpotifyCheck:
                renderBody = spotifyScreen;
                break;
            case DiscoveryView.PermalinkResults:
                renderBody = this.resultsScreen(true);
                break;
            default:
                renderBody = signUpComponent;
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
            authenticationStatus: root.authenticationStatus,
            isSpotifyLinked: root.isSpotifyLinked,
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
        initiateSpotifyLogin: initiateSpotifyAction(dispatch),
    })
)(MusicDiscoveryScreen);

const dummyData = {
    "user_id": "02fc66be-0919-4034-bf0d-7350ac4d7ba6",
    "timestamp": "2020-07-29",
    "permalink_uuid": "9c159801-2022-4ef9-92d2-8c72657326da",
    "spotify_artist_list": [
        {
            "id": "2KsP6tYLJlTBvSUxnwlVWa",
            "name": "Mike Posner",
            "image_url": "https://i.scdn.co/image/271f32661dd63fa214d6a4657c8856e5d5f65f9f",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/2KsP6tYLJlTBvSUxnwlVWa"
        },
        {
            "id": "23fqKkggKUBHNkbKtXEls4",
            "name": "Kygo",
            "image_url": "https://i.scdn.co/image/eee84c026e93f6d970fdc82c5010c45219530577",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/23fqKkggKUBHNkbKtXEls4"
        },
        {
            "id": "2ZRQcIgzPCVaT9XKhXZIzh",
            "name": "Gryffin",
            "image_url": "https://i.scdn.co/image/4d581cbbac339906b4de7580064f0cd38ad5cc12",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/2ZRQcIgzPCVaT9XKhXZIzh"
        },
        {
            "id": "3iri9nBFs9e4wN7PLIetAw",
            "name": "gnash",
            "image_url": "https://i.scdn.co/image/078bc7ec593bf6da34297a5192d2eb3cf79842f4",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/3iri9nBFs9e4wN7PLIetAw"
        },
        {
            "id": "69GGBxA162lTqCwzJG5jLp",
            "name": "The Chainsmokers",
            "image_url": "https://i.scdn.co/image/960547a625bc2eb742bb3dd170cbc049d2e94cf9",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/69GGBxA162lTqCwzJG5jLp"
        },
        {
            "id": "6t1gpxYbY8OlLA7D2RiikQ",
            "name": "Loud Luxury",
            "image_url": "https://i.scdn.co/image/6e02aa6759a9e7621afaa04e8270369fa0060a27",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/6t1gpxYbY8OlLA7D2RiikQ"
        },
        {
            "id": "5jAMCwdNHWr7JThxtMuEyy",
            "name": "NOTD",
            "image_url": "https://i.scdn.co/image/d5adf11173d9cd55bedbe0efb2e3c5f6aaf079df",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/5jAMCwdNHWr7JThxtMuEyy"
        },
        {
            "id": "0X2BH1fck6amBIoJhDVmmJ",
            "name": "Ellie Goulding",
            "image_url": "https://i.scdn.co/image/fdc30f0bdec92a3821fb0dde9a69dd0b8de9275a",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/0X2BH1fck6amBIoJhDVmmJ"
        },
        {
            "id": "1HBjj22wzbscIZ9sEb5dyf",
            "name": "Jonas Blue",
            "image_url": "https://i.scdn.co/image/72d5c9a2f49c49a4128bcc325a6bd10b1f188827",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/1HBjj22wzbscIZ9sEb5dyf"
        },
        {
            "id": "5iNrZmtVMtYev5M9yoWpEq",
            "name": "Seeb",
            "image_url": "https://i.scdn.co/image/84b28aa1b9c490755900beb9cfa5b9a6cac7aa0e",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/5iNrZmtVMtYev5M9yoWpEq"
        },
        {
            "id": "20gsENnposVs2I4rQ5kvrf",
            "name": "Sam Feldt",
            "image_url": "https://i.scdn.co/image/7d85234afc83df9951394e9d6cb76d1fe983e0fb",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/20gsENnposVs2I4rQ5kvrf"
        },
        {
            "id": "6cEuCEZu7PAE9ZSzLLc2oQ",
            "name": "R3HAB",
            "image_url": "https://i.scdn.co/image/a157c6e13ffffd135f1465d18103c774d20d053b",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/6cEuCEZu7PAE9ZSzLLc2oQ"
        },
        {
            "id": "3PlRvQnVE3XAbtHUNc4nic",
            "name": "GATTÃœSO",
            "image_url": "https://i.scdn.co/image/9bdc1550510d9ff22e9091acdf1edbb83c48b6c9",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/3PlRvQnVE3XAbtHUNc4nic"
        },
        {
            "id": "3TVXtAsR1Inumwj472S9r4",
            "name": "Drake",
            "image_url": "https://i.scdn.co/image/60cfab40c6bb160a1906be45276829d430058005",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4"
        },
        {
            "id": "4ehtJnVumNf6xzSCDk8aLB",
            "name": "Martin Jensen",
            "image_url": "https://i.scdn.co/image/aa7eacb7370cb7d8dfbf054d3e9bfb3f8926d65d",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/4ehtJnVumNf6xzSCDk8aLB"
        },
        {
            "id": "4sTQVOfp9vEMCemLw50sbu",
            "name": "Galantis",
            "image_url": "https://i.scdn.co/image/2df5fb887384d10f117938d67e09d955b7291821",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/4sTQVOfp9vEMCemLw50sbu"
        },
        {
            "id": "64KEffDW9EtZ1y2vBYgq8T",
            "name": "Marshmello",
            "image_url": "https://i.scdn.co/image/b378853a6838299aeb068851850dfa8f5d18832a",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/64KEffDW9EtZ1y2vBYgq8T"
        },
        {
            "id": "6LuN9FCkKOj5PcnpouEgny",
            "name": "Khalid",
            "image_url": "https://i.scdn.co/image/05da6a798c59e8ab7102d77c8deb79d67a1360ed",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/6LuN9FCkKOj5PcnpouEgny"
        },
        {
            "id": "6x2LnllRG5uGarZMsD4iO8",
            "name": "Thomas Rhett",
            "image_url": "https://i.scdn.co/image/ae406c9213a87f7ae2db5851285afa2e9867ff50",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/6x2LnllRG5uGarZMsD4iO8"
        },
        {
            "id": "1vCWHaC5f2uS3yhpwWbIA6",
            "name": "Avicii",
            "image_url": "https://i.scdn.co/image/81b19a403109c4fe528ee3972137127b85be9519",
            "image_height": 640,
            "image_width": 640,
            "bio_url": "https://open.spotify.com/artist/1vCWHaC5f2uS3yhpwWbIA6"
        }
    ]
}