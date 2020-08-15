import React, {Component} from "react";
import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import {AppState} from "../redux/store";
import {byLayout as byLayoutWrapper, Layout} from "../layout";
import {connect} from "react-redux";
import fansImage from "../assets/FTF_collage.jpg";
import {BODY_WIDTH, FONT_4, FONT_6} from "../utils/constants";
import {antiFlashWhite, trolleyGray, vividRaspberry, white} from "../utils/colors";

interface AboutScreenProps {
    byLayout: <A, B>(a: A, b: B) => A | B;
    layout: Layout;
}

const styles = {
    headerText: {
        textAlign: 'center' as const,
        color: vividRaspberry,
        fontWeight: 700,
        fontSize: `${FONT_6}px`,
        marginBottom: '1.5em'
    },
    mobileContainer: {
        padding: '5em 1em 1em 1em',
    },
    desktopContainer: {
        padding: '2em 1.5em 1em 1.5em',
    },
    bodyContainer: {
        flex: 1,
        flexDirection: "column" as const,
        display: "flex",
        maxWidth: `${BODY_WIDTH}px`,
        margin: "0em auto",
        backgroundColor: white
    },
    bodyText: {
        fontSize: `${FONT_4}px`,
        color: trolleyGray,
        lineHeight: "1.2em"
    }
}

class AboutScreen extends Component<AboutScreenProps>  {

    render() {

        let {byLayout, layout} = this.props;

        const image = (<img style={{display: "block",margin: "1em auto"}} src={fansImage} alt="For The Fans" width="60%" height="100%"/>);
        const bodyText = (
            <div style={styles.bodyText}>
                <p>Foria curates events based on your music taste and enables event organizers to offer personalized discounts to the people they want in their crowd. We’re also making it easier for you to discover great music and share it, because events are all about sharing great experiences.
                </p>
                <p>Our vision is to build a platform that truly puts you, the fan, first without all the frustrations that come with ticketing. We’d love for you to join us on this ride and hear from you along the way!
                </p>
            </div>
        );

        let content = (
          <>
              <div className='row' style={{padding: '2em 0', display: "flex",
                  alignItems: 'center'}}>
                  <div style={{width: '50%'}}> {bodyText} </div>
                  <div style={{width: '1em'}}/>
                  <div style={{width: '50%'}}> {image} </div>
              </div>
          </>
        );


        if (layout === Layout.Mobile) {
            content = (
              <>
                  {bodyText}
                  {image}
              </>
            );
        }


        const body = (
            <div style={styles.bodyContainer}>
                <div style={byLayout(styles.mobileContainer, styles.desktopContainer)}>
                    <div style={styles.headerText}>
                        Foria helps fans discover amazing events and access personalized discounts
                    </div>
                    {content}
                </div>
            </div>
        );

        return (
            <div
                style={{
                    // Using vh, so that we can work around the fact that we're not
                    // setting the height on all ancester elements
                    height: "100vh",
                    backgroundColor: antiFlashWhite,
                    position: "relative",
                }}>
                {NavBar(this.props.byLayout)}
                <div style={{height: '2em'}}/>
                {body}
                {Footer(this.props.byLayout)}
            </div>
        );
    }
}

export default connect(
    (state: AppState) => {
        let {root} = state;
        return {
            layout: root.layout,
            byLayout: byLayoutWrapper(root.layout)
        };
    }
)(AboutScreen);