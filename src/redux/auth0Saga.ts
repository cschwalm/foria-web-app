import Auth0Lock from "auth0-lock";
import {eventChannel} from "redux-saga";
import {call, put, fork, take, takeEvery, race} from "redux-saga/effects";
import {Dispatch} from "redux";

import Action from "./Action";
import {spotifyGreen, vividRaspberry, white} from "../colors";
import spotifyIcon from "../assets/Spotify_Icon_RGB_White.png";
import * as localStorage from 'local-storage';

export enum ActionType {
  CheckLogin = "CheckLogin",
  InitiateLogin = "InitiateLogin",
  InitiateLogout = "InitiateLogout",

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

function createLock() {
  return new Auth0Lock(
    process.env.REACT_APP_AUTH0_CLIENTID as string,
    process.env.REACT_APP_AUTH0_DOMAIN as string,
    {
      // It is necessary that we do NOT use autoClose. Auto closing prevents
      // us from distinguishing between a user close, and a close following
      // authentication.
      // https://github.com/auth0/lock/issues/1713
      autoclose: false,
      configurationBaseUrl: process.env
        .REACT_APP_AUTH0_CONFIGURATION_BASE_URL as string,
      auth: {
        responseType: "token",
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

function* checkAlreadyLoggedIn() {
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

function* saga() {
  yield fork(checkAlreadyLoggedIn);
  yield takeEvery(ActionType.CheckLogin, checkAlreadyLoggedIn);
  yield takeEvery(ActionType.InitiateLogin, login);
  yield takeEvery(ActionType.InitiateLogout, logout);
}

export default saga;
