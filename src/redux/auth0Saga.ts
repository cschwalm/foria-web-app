import Auth0Lock from "auth0-lock";
import {call, fork, put, takeEvery} from "redux-saga/effects";

import {ActionType as RootActionType} from "./reducers/root";
import {ActionType as HomeActionType} from "./reducers/home";

function createLock() {

  let primaryColor = '#fec700' as string;

  return new Auth0Lock(
    process.env.REACT_APP_AUTH0_CLIENTID as string,
    process.env.REACT_APP_AUTH0_DOMAIN as string,
    {
      configurationBaseUrl: process.env
        .REACT_APP_AUTH0_CONFIGURATION_BASE_URL as string,
      auth: {
        responseType: "token",
        audience: process.env.REACT_APP_AUTH0_AUDIENCE as string
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
        title: 'For the Fans',
        signUpTerms: "By signing up, you agree to our <a href=\"https://foriatickets.com/terms-of-use.html\" target=\"_blank\">terms of service</a> and <a href=\"https://foriatickets.com/privacy-policy.html\" target=\"_blank\">privacy policy</a>."
      },
      loginAfterSignUp: true,
      theme: {
        logo:            'https://foriatickets.com/img/foria-logo-color.png',
        primaryColor:    primaryColor
      },
    }
  );
}

function authenticate(lock: Auth0LockStatic) {
  return new Promise((resolve, reject) => {
    lock.on("authenticated", resolve);
    lock.on("authorization_error", reject);
    lock.on("unrecoverable_error", reject);
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

function* handleLogin() {
  let lock = createLock();
  let authenticatePromise = authenticate(lock);
  lock.show();
  try {
    // On authentication we will be redirected, so we don't need the return
    // value here
    yield authenticatePromise;
  } catch (err) {
    yield put({
      type: RootActionType.AuthenticationError,
      data: err
    });
    return;
  }
}

function handleLogout() {
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
    return;
  }

  let profile;
  try {
    profile = yield call(getUserInfo, lock, authResult.accessToken);
  } catch (err) {
    yield put({
      type: RootActionType.LoginError,
      data: err
    });
    return;
  }

  yield put({
    type: RootActionType.LoginSuccess,
    data: profile
  });
}

function* saga() {
  yield fork(checkAlreadyLoggedIn);
  yield takeEvery(HomeActionType.InitiateLogin, handleLogin);
  yield takeEvery(HomeActionType.InitiateLogout, handleLogout);
}

export default saga;
