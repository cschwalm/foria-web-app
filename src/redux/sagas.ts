import {eventChannel} from "redux-saga";
import {call, put, take, fork} from "redux-saga/effects";
import {throttle} from "lodash";
import {ActionType as RootActionType} from "./reducers/root";
import auth0Saga from "./auth0Saga";

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
  yield fork(handleResizeSaga);
  yield fork(auth0Saga);
}

export default saga;
