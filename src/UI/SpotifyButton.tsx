import React from "react";
import spotifyIcon from "../assets/Spotify_Icon_RGB_White.png";
import RightChevron from "../icons/rightChevron";
import {BUTTON_HEIGHT, MAX_BUTTON_WIDTH} from "../utils/constants";
import {spotifyGreen, white} from "../utils/colors";

const SpotifyButton = (onClick : () => void) => {

    const styles = {
        spotifyButton: {
            cursor: "pointer",
            height: BUTTON_HEIGHT,
            maxWidth: MAX_BUTTON_WIDTH,
            flex: `0 0 ${BUTTON_HEIGHT}`,
            backgroundColor: spotifyGreen,
            borderRadius: "5px",
            padding: "7px 10px",
            color: white,
            fontWeight: 500,
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box" as "border-box"
        }
    }

    return (
        <div
            className="row"
            style={styles.spotifyButton}
            onClick={() => onClick()}>
            <img src={spotifyIcon} style={{height: '100%'}} alt="Spotify Icon"/>
            Connect with Spotify
            <RightChevron />
        </div>
    )
}

export default SpotifyButton;