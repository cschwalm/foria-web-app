import {eventChannel} from "redux-saga";
import {call, put, take, fork} from "redux-saga/effects";
import {throttle} from "lodash";
import {ActionType as RootActionType} from "./reducers/root";
import auth0Saga from "./auth0Saga";
import apiSaga from "./apiSaga";
import stripeSaga from "./stripeSaga";
import eventSaga from "./eventSaga";

function createWindowWidthChannel() {
  return eventChannel(emitter => {
    // Throttle resize events, only call once in any 250ms window
    let handler = throttle(() => emitter({}), 250);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });
}

function* handleResizeSaga() {
  let channel = yield call(createWindowWidthChannel);
  while (true) {
    yield take(channel);
    yield put({
      type: RootActionType.Resize
    });
  }
}

function* saga() {
  yield fork(apiSaga);
  yield fork(stripeSaga);
  yield fork(handleResizeSaga);
  yield fork(auth0Saga);
  yield fork(eventSaga);
}

export default saga;
