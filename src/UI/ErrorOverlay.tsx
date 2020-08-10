import React from "react";
import {BUTTON_HEIGHT, FONT_4, TICKET_OVERLAY_WIDTH} from "../utils/constants";
import {black, white} from "../utils/colors";

const ErrorOverlay = (error: any, resetError: () => void) => {

    const styles = {
        container: {
            position: "fixed" as "fixed",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        innerContainer: {
            margin: "1em",
            width: TICKET_OVERLAY_WIDTH + "px",
            backgroundColor: white,
            padding: "1em",
            borderRadius: "5px",
            borderBottom: `1px solid #B5B5B5`,
            boxShadow: "rgb(199, 199, 199) 0 2px 3px 0px",
            overflow: "hidden"
        },
        headerStyle: {
            fontSize: `${FONT_4}px`,
            marginBottom: "16px",
            lineHeight: "1.2em",
            fontWeight: 600
        },
        body: {
            lineHeight: "1.4em",
            color: black,
            marginBottom: "16px",
            overflowWrap: "break-word" as "break-word"
        },
        buttonContainer: {
            cursor: "pointer",
            height: BUTTON_HEIGHT,
            flex: `0 0 ${BUTTON_HEIGHT}`,
            borderRadius: "5px",
            fontWeight: 500,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: black,
            backgroundColor: "#EDEDED"
        }
    };

    let errorMessage: string;
    if (typeof error === "string") {
        errorMessage = error;
    } else if (error.message && typeof error.message === "string") {
        errorMessage = error.message;
    } else {
        errorMessage = JSON.stringify(error);
    }

    return (
        <div style={styles.container}>
            <div style={styles.innerContainer}>
                <div style={styles.headerStyle}>Oops!</div>
                <p style={{...styles.body, maxHeight: "150px", overflowY: "auto"}}>
                    {errorMessage}
                </p>
                <p style={styles.body}>Please try again.</p>
                <div onClick={resetError} style={styles.buttonContainer}>
                    Okay
                </div>
            </div>
        </div>
    );
}

export default ErrorOverlay;
