import {AuthenticationStatus} from "../../redux/reducers/root";
import React, {Component} from "react";
import Ellipsis from "../../icons/Ellipsis";
import {vividRaspberry} from "../../utils/colors";
import {connect} from "react-redux";
import {AppState} from "../../redux/store";
import {byLayout as byLayoutWrapper} from "../../layout";
import {initiateLogin as initiateLoginAction, initiateLogout as initiateLogoutAction} from "../../redux/auth0Saga";
import {Auth0UserProfile} from "auth0-js";

interface LoginProps {
    byLayout: <A, B>(a: A, b: B) => A | B;
    authenticationStatus: AuthenticationStatus;
    profile?: Auth0UserProfile;
    initiateLogin: () => void;
    initiateLogout: () => void;
}

class LoginToggle extends Component<LoginProps> {

    render() {
        let loginAnchorStyle = {
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "Roboto",
            fontSize: "1em",
            lineHeight: "1.2em",
            cursor: "pointer",
            color: vividRaspberry,
            marginLeft: this.props.byLayout("1.5em", "3em")
        };
        let boldLoginAnchorStyle = {
            ...loginAnchorStyle,
            fontWeight: "bold" as "bold"
        };

        const email = this.props.profile?.email;
        let logoutText;
        if (email === null || email === "undefined") {
            logoutText = 'Log Out';
        } else {
            logoutText = 'Log Out (' + email + ')';
        }

        switch (this.props.authenticationStatus) {
            case AuthenticationStatus.Pending:
                return <Ellipsis style={boldLoginAnchorStyle} />;
            case AuthenticationStatus.NoAuth:
                return (
                    <button onClick={() => this.props.initiateLogin()} style={loginAnchorStyle}>
                        {this.props.byLayout("Sign In", "Sign Up/Sign In")}
                    </button>
                );
            case AuthenticationStatus.Auth:
                return (
                    <button onClick={() => this.props.initiateLogout()} style={loginAnchorStyle}>
                        {logoutText}
                    </button>
                );
            default:
                throw new Error(
                    "Unhandled AuthenticationStatus when generating login link"
                );
        }
    }
}

export default connect(
    (state: AppState) => {
        let {root} = state;
        return {
            byLayout: byLayoutWrapper(root.layout),
            authenticationStatus: root.authenticationStatus,
            profile: root.profile,
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
        initiateLogout: initiateLogoutAction(dispatch),
    })
)(LoginToggle);