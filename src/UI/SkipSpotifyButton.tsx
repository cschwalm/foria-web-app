import React from "react";
import {BUTTON_HEIGHT} from "../utils/constants";
import {spotifyGreen} from "../utils/colors";

const SkipSpotifyButton = (onClick : () => void) => {

    const styles = {
        skipButton: {
            margin: "0.5em 0em 0em 0em",
            cursor: "pointer",
            height: BUTTON_HEIGHT,
            maxWidth: '400px',
            flex: `0 0 ${BUTTON_HEIGHT}`,
            borderRadius: "5px",
            border:"2px solid " + spotifyGreen,
            color: spotifyGreen,
            fontWeight: 500,
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box" as "border-box"
        },
    }

    return (
        <div
            className="row"
            style={styles.skipButton}
            onClick={() => onClick()}>
            Skip
        </div>
    )
}

export default SkipSpotifyButton;