import Auth0Lock from "auth0-lock";
import {call, put, takeEvery} from "redux-saga/effects";
import { auth0 as Auth0Config} from '../Config.json'

import {ActionType as RootActionType} from "./reducers/root";
import {ActionType as HomeActionType} from "./reducers/home";

function createLock() {
  return new Auth0Lock(
    Auth0Config.clientId,
    Auth0Config.domain,
    {
      configurationBaseUrl: Auth0Config.configurationBaseUrl,
      auth: {responseType: "token", audience: Auth0Config.authAudience }
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
  let authResult;
  try {
    authResult = yield authenticatePromise;
  } catch (err) {
    yield put({
      type: RootActionType.AuthenticationError,
      data: err
    });
    return;
  }

  yield put({
    type: RootActionType.AuthenticationSuccess,
    data: authResult.accessToken
  });

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

function handleLogout() {
  let lock = createLock();
  lock.logout({ redirectTo: Auth0Config.redirectTo });
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

function* auth0Saga() {
  yield call(checkAlreadyLoggedIn);
  yield takeEvery(HomeActionType.InitiateLogin, handleLogin);
  yield takeEvery(HomeActionType.InitiateLogout, handleLogout);
}

export default auth0Saga;
