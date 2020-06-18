import Auth0Lock from "auth0-lock";
import {eventChannel} from "redux-saga";
import {call, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import {Dispatch} from "redux";

import Action from "./Action";
import {spotifyGreen, vividRaspberry, white} from "../utils/colors";
import spotifyIcon from "../assets/Spotify_Icon_RGB_White.png";
import {Auth0DecodedHash, AuthOptions, WebAuth} from "auth0-js";
import {setLocalStorage} from "./selectors";
import {ActionType as ApiActionType} from "./apiSaga";

export enum ActionType {
  CheckLogin = "CheckLogin",
  InitiateLogin = "InitiateLogin",
  InitiateLogout = "InitiateLogout",
  InitiateSpotifyLogin = "InitiateSpotifyLogin",

  // checkSession yielded no existing session
  NoExistingSession = "NoExistingSession",

  // Authentication success indicates presence of accessToken
  AuthenticationSuccess = "AuthenticationSuccess",
  AuthenticationError = "AuthenticationError",
  AuthenticationCancelled = "AuthenticationCancelled",
  UnrecoverableError = "UnrecoverableError",

  // Login success refers to our ability to get back a profile
  LoginSuccess = "LoginSuccess",
  LoginError = "LoginError"
}

export const initiateLogin = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogin});

export const initiateLogout = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogout});

export const initiateSpotifyLogin = (dispatch: Dispatch<Action>) => () =>
    dispatch({type: ActionType.InitiateSpotifyLogin});

export function* initiateLoginIfNotLoggedInSaga() {
  // Initiate a login if they are not logged in
  yield put({type: ActionType.CheckLogin});
  let [success, noSession /*,error*/] = yield race([
    take(ActionType.AuthenticationSuccess),
    take(ActionType.NoExistingSession),
    take(ActionType.AuthenticationError)
  ]);

  if (noSession) {
    // We attempt to login the user
    yield put({type: ActionType.InitiateLogin});
    [success /*,canceled,unrecoverable*/] = yield race([
      take(ActionType.AuthenticationSuccess),
      take(ActionType.AuthenticationCancelled),
      take(ActionType.UnrecoverableError)
    ]);
  }

  if (!success) {
    throw new Error("Login failed");
  }
}

/**
 * Start Spotify login flow.
 */
function* redirectToSpotifyLogin() {

    const auth = createWebAuth();
    yield select(setLocalStorage);

    //Fire the redirect to Spotify.
    auth.authorize({
        connection: "spotify",
        state: "spotify"
    });
}

/**
 * Lib for manual token operations.
 */
function createWebAuth() {

    const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN as string;
    const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENTID as string;
    const auth0Audience = process.env.REACT_APP_AUTH0_AUDIENCE as string;

    const authOptions : AuthOptions = {
        domain: auth0Domain,
        clientID: auth0ClientId,
        audience: auth0Audience,
        redirectUri: window.location.href,
        responseType: "token id_token",
        scope: "openid profile email"
    };

    return new WebAuth(authOptions);
}

function createLock() {
  return new Auth0Lock(
    process.env.REACT_APP_AUTH0_CLIENTID as string,
    process.env.REACT_APP_AUTH0_DOMAIN as string,
    {
      // It is necessary that we do NOT use autoClose. Auto closing prevents
      // us from distinguishing between a user close, and a close following
      // authentication.
      // https://github.com/auth0/lock/issues/1713
      allowedConnections: [
        "Username-Password-Authentication"
      ],
      autoclose: false,
      configurationBaseUrl: process.env
        .REACT_APP_AUTH0_CONFIGURATION_BASE_URL as string,
      auth: {
        responseType: "id_token token",
        params: {
            scope: "openid profile email"
        },
        audience: process.env.REACT_APP_AUTH0_AUDIENCE as string,
        redirect: true,
        redirectUrl: window.location.href
      },
      initialScreen: "signUp",
      additionalSignUpFields: [
        {
          name: "given_name",
          placeholder: "First Name",
          icon: "https://foriatickets.com/img/user-tag-solid.png"
        },
        {
          name: "family_name",
          placeholder: "Last Name",
          icon: "https://foriatickets.com/img/user-tag-solid.png"
        }
      ],
      languageDictionary: {
        emailInputPlaceholder: "john@foriatickets.com",
        passwordInputPlaceholder: "password",
        title: "Login | New Customers",
        signUpTitle: "Signup | Existing Customers",
        signUpTerms:
          'By signing up, you agree to our <a href="https://foriatickets.com/terms-of-use.html" target="_blank">terms of service</a> and <a href="https://foriatickets.com/privacy-policy.html" target="_blank">privacy policy</a>.'
      },
      loginAfterSignUp: true,
      theme: {
        logo: "https://foriatickets.com/img/foria-logo-color.png",
        primaryColor: vividRaspberry,
          authButtons: {
              "spotify": {
                  displayName: "Spotify",
                  primaryColor: spotifyGreen,
                  foregroundColor: white,
                  icon: spotifyIcon
              }
          }
      }
    }
  );
}

function createLockEventChannel(lock: Auth0LockStatic) {
  return eventChannel(emitter => {
    let subscribed = true;
    lock.on("authenticated", d => subscribed && emitter([d, null, null, null]));
    lock.on(
      "authorization_error",
      d => subscribed && emitter([null, d, null, null])
    );
    lock.on(
      "unrecoverable_error",
      d => subscribed && emitter([null, null, d, null])
    );
    lock.on("hide", () => subscribed && emitter([null, null, null, true]));
    return () => (subscribed = false);
  });
}

function getUserInfo(lock: Auth0LockStatic, accessToken: string) {
  return new Promise((resolve, reject) =>
    lock.getUserInfo(accessToken, (err, profile) =>
      err ? reject(err) : resolve(profile)
    )
  );
}

function checkSession(lock: Auth0LockStatic) {
  return new Promise((resolve, reject) =>
    lock.checkSession({}, (err, authResult) =>
      err ? reject(err) : resolve(authResult)
    )
  );
}

function* login() {
  let lock = createLock();
  let channel = yield call(createLockEventChannel, lock);
  lock.show();

  let authResult, error, unrecoverable, hidden;
  while (true) {
    [authResult, error, unrecoverable, hidden] = yield take(channel);

    if (authResult) {
      break;
    }

    if (unrecoverable) {
      yield put({
        type: ActionType.UnrecoverableError,
        data: unrecoverable
      });
      break;
    }

    if (hidden) {
      yield put({
        type: ActionType.AuthenticationCancelled
      });
      break;
    }

    if (error) {
      yield put({
        type: ActionType.AuthenticationError,
        data: error
      });
    }
  }

  // No harm in doing this explicitly
  channel.close();

  if (!hidden) {
    lock.hide();
  }

  if (!authResult) {
    return;
  }

  yield put({
    type: ActionType.AuthenticationSuccess,
    data: authResult.accessToken
  });

  let profile;
  try {
    profile = yield call(getUserInfo, lock, authResult.accessToken);
  } catch (err) {
    yield put({
      type: ActionType.LoginError,
      data: err
    });
    return;
  }

  yield put({
    type: ActionType.LoginSuccess,
    data: profile
  });
}

function logout() {

    localStorage.clear();
    let lock = createLock();

    // Auth0 requires a redirect for logout, redirect back to the current page
    lock.logout({returnTo: window.location.href});
}

/**
 * Checks URL hash to see if an Auth0 token is present. If so, it checks the state param to see if it is the result
 * of a Spotify social link. If so, the account linking event is processed and the hash is removed to prevent account logout.
 */
function* checkForSpotifyHash() {

    let decodedHash : Auth0DecodedHash | null = null;
    try {
        decodedHash = yield call(decodeHash);
    } catch (ex) {
        console.error(ex.error);
    }

    if (decodedHash == null) {
        console.debug("No Auth0 hash found in URL.");
        return;
    }

    if (decodedHash.state === "spotify") {
        console.log("Spotify response detected. Processing account linking.");
        console.log(decodedHash.idToken);

        console.log("Sending event");
        localStorage.clear();
        yield put({
            type: ApiActionType.LinkAccount,
            data: decodedHash.idToken
        });
    }
}

/**
 * Handles the decode. Error thrown if verifications fails.
 */
function decodeHash() {

    const auth = createWebAuth();
    return new Promise((resolve, reject) =>
        auth.parseHash({}, (err, tokenPayload) =>
            err ? reject(err) : resolve(tokenPayload)
        )
    );
}

function* checkAlreadyLoggedIn() {

    yield call(checkForSpotifyHash);

  const lock = createLock();
  let authResult;
  try {
    authResult = yield call(checkSession, lock);
  } catch (err) {
    // User needs to authenticate first
    if (err.code === "login_required") {
      yield put({
        type: ActionType.NoExistingSession
      });
    } else {
      yield put({
        type: ActionType.AuthenticationError,
        data: err
      });
    }
    return;
  }

  yield put({
    type: ActionType.AuthenticationSuccess,
    data: authResult.accessToken
  });

  let profile = authResult.idTokenPayload;
  console.log(`Logged in userID: ${profile.sub} - ${profile.name}`);

  yield put({
    type: ActionType.LoginSuccess,
    data: profile
  });
}

function* saga() {
  yield fork(checkAlreadyLoggedIn);
  yield takeEvery(ActionType.CheckLogin, checkAlreadyLoggedIn);
  yield takeEvery(ActionType.InitiateLogin, login);
  yield takeEvery(ActionType.InitiateLogout, logout);
  yield takeEvery(ActionType.InitiateSpotifyLogin, redirectToSpotifyLogin);
}

export default saga;
