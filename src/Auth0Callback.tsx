import React from "react";
import auth0 from "auth0-js";

const Auth0Callback = () => {

    const webAuth = new auth0.WebAuth({
        domain: process.env.REACT_APP_AUTH0_DOMAIN as string,
        clientID: process.env.REACT_APP_AUTH0_CLIENTID as string,
    });

    webAuth.popup.callback({
        hash: window.location.hash,
        state: "12345"
    });

    return (
      <h1>You may now close this window.</h1>
    );
};

export default Auth0Callback;