import {call, select, put, takeEvery, actionChannel} from "redux-saga/effects";

import Action from "./Action";
import {getBranchPhoneNumber, getEventId, getOrderNumber} from "./selectors";
import {ActionType as HomeActionType} from "./reducers/home";

export enum ActionType {
  SendMeAppSuccess = "SendMeAppSuccess",
  SendMeAppError = "SendMeAppError"
}

function initializeBranch() {
  // https://docs.branch.io/web/text-me-the-app/#insert-sendsms-snippet-into-your-page

  // prettier-ignore
  // @ts-ignore
  (function(b, r, a, n, c, h, _, s, d, k) { if (!b[n] || !b[n]._q) { for (; s < _.length; ) c(h, _[s++]); d = r.createElement(a); d.async = 1; d.src = "https://cdn.branch.io/branch-latest.min.js"; k = r.getElementsByTagName(a)[0]; k.parentNode.insertBefore(d, k); b[n] = h; } })( window, document, "script", "branch", function(b, r) { b[r] = function() { b._q.push([r, arguments]); }; }, {_q: [], _v: 1}, "addListener applyCode banner closeBanner creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setBranchViewData setIdentity track validateCode".split( " "), 0);
  // @ts-ignore
  window.branch.init(process.env.REACT_APP_BRANCH_KEY);
}

type Branch = {sendSMS: any};

function* sendSMS() {
  let phone = yield select(getBranchPhoneNumber);
  let eventId = yield select(getEventId);
  let orderNumber = yield select(getOrderNumber);
  let linkData = {
    tags: [],
    channel: "web",
    feature: "order_confirmation",
    data: {
      event_id: eventId,
      order_id: orderNumber
    }
  };
  let options = {};

  // Yield a promise with the result of sending the sms
  yield new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      window.branch.sendSMS(phone, linkData, options, (err: any, data: any) => {
        err ? reject(err) : resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function* sendApp(action: Action) {
  try {
    yield call(sendSMS);
    yield put({type: ActionType.SendMeAppSuccess});
  } catch (err) {
    yield put({type: ActionType.SendMeAppError, data: err});
    return;
  }
}

function* saga() {
  // Before anything, setup a channel to capture any actions we will handle, so
  // we don't lose actions in the interim
  let sendMeAppChannel = yield actionChannel(HomeActionType.SendMeAppSubmit);
  yield call(initializeBranch);
  yield takeEvery(sendMeAppChannel, sendApp);
}

export default saga;
