import {AuthenticationStatus} from "../../redux/reducers/root";
import React from "react";
import Ellipsis from "../../icons/Ellipsis";
import {vividRaspberry} from "../../utils/colors";
import {connect} from "react-redux";
import {AppState} from "../../redux/store";
import {byLayout as byLayoutWrapper} from "../../layout";
import {initiateLogin as initiateLoginAction, initiateLogout as initiateLogoutAction} from "../../redux/auth0Saga";

interface LoginPropsT {
    byLayout: <A, B>(a: A, b: B) => A | B;
    authenticationStatus: AuthenticationStatus;
    initiateLogin: () => void;
    initiateLogout: () => void;
}

const _LoginToggle = (props : LoginPropsT) => {

    let loginAnchorStyle = {
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "Roboto",
            fontSize: "1em",
            lineHeight: "1.2em",
            cursor: "pointer",
            color: vividRaspberry,
            marginLeft: props.byLayout("1.5em", "3em")
    };
    let boldLoginAnchorStyle = {
        ...loginAnchorStyle,
        fontWeight: "bold" as "bold"
    };

    switch (props.authenticationStatus) {
        case AuthenticationStatus.Pending:
            return <Ellipsis style={boldLoginAnchorStyle} />;
        case AuthenticationStatus.NoAuth:
            return (
                <button onClick={() => props.initiateLogin()} style={loginAnchorStyle}>
                    {props.byLayout("Sign In", "Sign Up/Sign In")}
                </button>
            );
        case AuthenticationStatus.Auth:
            return (
                <button onClick={() => props.initiateLogout()} style={loginAnchorStyle}>
                    Log Out
                </button>
            );
        default:
            throw new Error(
                "Unhandled AuthenticationStatus when generating login link"
            );
    }
};

const LoginToggle = connect(
    (state: AppState) => {
        let {root} = state;
        return {
            byLayout: byLayoutWrapper(root.layout),
            authenticationStatus: root.authenticationStatus,
        };
    },
    dispatch => ({
        initiateLogin: initiateLoginAction(dispatch),
        initiateLogout: initiateLogoutAction(dispatch),
    })
)(_LoginToggle);

export default LoginToggle;