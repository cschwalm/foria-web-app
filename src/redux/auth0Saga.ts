import Auth0Lock from "auth0-lock";
import {call, put, race, takeEvery} from "redux-saga/effects";
import {Dispatch} from "redux";

import Action from "./Action";

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

  // Login success refers to our ability to get back a profile
  LoginSuccess = "LoginSuccess",
  LoginError = "LoginError",
  Logout = "Logout"
}

export const initiateLogin = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogin});

export const initiateLogout = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogout});

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
        redirect: false
      },
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
        title: "",
        signUpTitle: "",
        signUpTerms:
          'By signing up, you agree to our <a href="https://foriatickets.com/terms-of-use.html" target="_blank">terms of service</a> and <a href="https://foriatickets.com/privacy-policy.html" target="_blank">privacy policy</a>.'
      },
      loginAfterSignUp: true,
      theme: {
        logo: "https://foriatickets.com/img/foria-logo-color.png",
        primaryColor: "#FF0266"
      }
    }
  );
}

const didAuthenticate = (lock: Auth0LockStatic) =>
  new Promise(resolve => lock.on("authenticated", resolve));

const didAuthError = (lock: Auth0LockStatic) =>
  new Promise(resolve => lock.on("authorization_error", resolve));

const didUnrecoverableError = (lock: Auth0LockStatic) =>
  new Promise(resolve => lock.on("unrecoverable_error", resolve));

const didHide = (lock: Auth0LockStatic) =>
  new Promise(resolve => lock.on("hide", resolve));

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
  let didAuthenticatePromise = didAuthenticate(lock);
  let didAuthErrorPromise = didAuthError(lock);
  let didUnrecoverableErrorPromise = didUnrecoverableError(lock);
  let didHidePromise = didHide(lock);
  lock.show();

  let [authResult, error, unrecoverable /*hidden*/] = yield race([
    didAuthenticatePromise,
    didAuthErrorPromise,
    didUnrecoverableErrorPromise,
    didHidePromise
  ]);

  if (error || unrecoverable) {
    yield put({
      type: ActionType.AuthenticationError,
      data: error || unrecoverable
    });
    return;
  }

  if (!authResult) {
    yield put({
      type: ActionType.AuthenticationCancelled
    });
    return;
  }

  lock.hide();

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
  let lock = createLock();
  lock.logout({returnTo: process.env.REACT_APP_AUTH0_RETURN_TO as string});
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
  yield takeEvery(ActionType.CheckLogin, checkAlreadyLoggedIn);
  yield takeEvery(ActionType.InitiateLogin, login);
  yield takeEvery(ActionType.InitiateLogout, logout);
}

export default saga;
