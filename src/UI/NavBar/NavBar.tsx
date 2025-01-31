import {trolleyGray, white} from "../../utils/colors";
import {BODY_WIDTH} from "../../utils/constants";
import foriaLogo from "../../assets/foria_logo.png";
import React from "react";
import LoginToggle from "./LoginToggle";

const NavBar = (byLayout: <A, B>(a: A, b: B) => A | B) => {
    let styles = {
        header: {
            backgroundColor: white,
            boxShadow: "0px 0px 2px 3px #ccc"
        },
        logo: {
            height: byLayout("2em", "2.6em"),
            cursor: "pointer"
        },
        helpAnchor: {
            color: trolleyGray,
            fontFamily: "Roboto",
            cursor: "pointer",
            textDecoration: "none",
            marginLeft: "1.5em"
        }
    };

    return (
        <div style={styles.header}>
            <div
                style={{
                    maxWidth: `${BODY_WIDTH}px`,
                    margin: "auto",
                    display: "flex",
                    alignItems: "center",
                    padding: byLayout("1em", "1em 1.5em"),
                    boxSizing: "border-box"
                }}>
                <a
                    style={{display: "flex", flex: 1}}
                    href="/">
                    <img src={foriaLogo} alt="Foria Logo" style={styles.logo} />
                </a>
                <div
                    style={{
                        display: "flex",
                        flex: 3,
                        alignItems: "center",
                        justifyContent: "flex-end"
                    }}>
                    <a
                        style={styles.helpAnchor}
                        href="/about">
                        About
                    </a>
                    <a
                        style={styles.helpAnchor}
                        href="https://foriatickets.com/contact-us.html">
                        Help
                    </a>
                    <LoginToggle/>
                </div>
            </div>
        </div>
    );
};

export default NavBar;