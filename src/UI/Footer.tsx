import {BODY_WIDTH, FONT_2, FONT_3, LINK_FORIA_TERMS, LINK_FORIA_PRIVACY} from "../utils/constants";
import {antiFlashWhite, trolleyGray} from "../utils/colors";
import React from "react";


const Footer = (byLayout: <A, B>(a: A, b: B) => A | B) => {

    const styles = {
        footerLink: {
            color: trolleyGray,
            fontFamily: "Roboto",
            letterSpacing: "0.4px",
            fontSize: `${FONT_2}px`,
            lineHeight: "1.2em",
            textDecoration: "none",
            backgroundColor: "initial",
            cursor: "pointer"
        },
        copyright: {
            color: trolleyGray,
            fontFamily: "Roboto",
            letterSpacing: "0.4px",
            fontSize: `${FONT_2}px`,
            lineHeight: "1.2em"
        },
    }

    return (
        <div
            style={{
                flex: 1,
                flexDirection: "column",
                display: "flex",
                maxWidth: `${BODY_WIDTH}px`,
                backgroundColor: antiFlashWhite,
                position: "relative",
                margin: "0 auto"
            }}>
            <div
                className="column"
                style={{padding: "0 4px", margin: byLayout("1em", "2em 1.5em")}}>
                <div className="row" style={{marginBottom: "0.6em"}}>
                    <a
                        href={LINK_FORIA_PRIVACY}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.footerLink}>
                        Privacy Policy
                    </a>
                    <span
                        style={{
                            color: trolleyGray,
                            fontFamily: "Roboto",
                            margin: "0 0.4em"
                        }}>
              |
            </span>
                    <a
                        href={LINK_FORIA_TERMS}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.footerLink}>
                        Terms of Use
                    </a>
                </div>
                <div style={styles.copyright}>
                    &copy; 2020 Foria Technologies, Inc. All Rights Reserved.
                </div>
            </div>
            <div
                style={{
                    // Create an empty rectangle the size of the collapsed pull up menu,
                    // so that the footer is not hidden beneath the menu
                    height: `${5 * FONT_3}px`
                }}
            />
        </div>
    );
};

export default Footer;