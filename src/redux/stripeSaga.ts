/// <reference types="stripe-v3" />
import {Dispatch} from "redux";
import {
  actionChannel,
  call,
  fork,
  put,
  race,
  take,
  takeLatest
} from "redux-saga/effects";

import Action from "./Action";
import {ActionType as ApiActionType} from "./apiSaga";

export enum ActionType {
  CreatePaymentRequest = "CreatePaymentRequest",
  PaymentRequestCreated = "PaymentRequestCreated",
  CanMakePaymentSuccess = "CanMakePaymentSuccess",
  CanMakePaymentError = "CanMakePaymentError",
  StripeInstantiated = "StripeInstantiated",
  StripeScriptLoadingError = "StripeScriptLoadingError",
  StripeCreateTokenNetworkError = "StripeCreateTokenNetworkError",
  StripeCreateTokenError = "StripeCreateTokenError",
  StripeCreateTokenSuccess = "StripeCreateTokenSuccess"
}

export const onTokenCreate = (dispatch: Dispatch<Action>) => (
  result: stripe.TokenResponse
) =>
  dispatch(
    result.token
      ? {type: ActionType.StripeCreateTokenSuccess, data: result.token}
      : {type: ActionType.StripeCreateTokenError, data: result.error}
  );

// stripe.createToken() when it can handles its error resolves rather than
// rejects the promise, in any case we still handle the rejection with
// onTokenCreateError
export const onTokenCreateError = (dispatch: Dispatch<Action>) => (
  err: string
) => dispatch({type: ActionType.StripeCreateTokenError, data: err});

const onPaymentRequestTokenCreate = (
  paymentRequest: stripe.paymentRequest.StripePaymentRequest
) => new Promise(resolve => paymentRequest.on("token", resolve));

const onPaymentRequestTokenCancel = (
  paymentRequest: stripe.paymentRequest.StripePaymentRequest
) => new Promise(resolve => paymentRequest.on("cancel", () => resolve(true)));

function* createPaymentRequest(stripe: stripe.Stripe) {
  let paymentRequest = stripe.paymentRequest({
    country: "US",
    currency: "usd",
    total: {
      label: "Demo total",
      amount: 1000
    },
    requestPayerName: true,
    requestPayerEmail: true
  });

  yield put({
    type: ActionType.PaymentRequestCreated,
    data: paymentRequest
  });

  // Spawn a saga to handle token creation (and cancellation)
  yield fork(function*() {
    let {token, complete} = yield onPaymentRequestTokenCreate(paymentRequest);
    yield put({type: ActionType.StripeCreateTokenSuccess, data: token});

    let [success, error, userCancel] = yield race([
      take(ApiActionType.CheckoutSuccess),
      take(ApiActionType.CheckoutError),
      call(onPaymentRequestTokenCancel, paymentRequest)
    ]);

    if (success) {
      complete("success");
    } else if (error) {
      complete("fail");
    } else if (userCancel) {
      complete("fail");
      // TODO:
      // This is where you would handle a user cancelling the payment after
      // the payment token has been sent off to the backend, by issuing a refund if necesary
      // https://stripe.com/docs/stripe-js/elements/payment-request-button#complete-payment
    }
  });

  let result;
  try {
    result = yield paymentRequest.canMakePayment();
  } catch (err) {
    // TODO present this error in a user friendly way
    yield put({
      type: ActionType.CanMakePaymentError
    });
    return;
  }
  yield put({
    type: ActionType.CanMakePaymentSuccess,
    data: !!result
  });
}

function loadStripeInstance() {
  const stripeJs = document.createElement("script");
  stripeJs.id = "stripe-script";
  stripeJs.src = "https://js.stripe.com/v3/";
  stripeJs.async = true;

  return new Promise((resolve, reject) => {
    // Resolve the promise when stripe has loaded
    stripeJs.onload = resolve;
    stripeJs.onerror = reject;

    // Attach the script to begin loading
    document.body.appendChild(stripeJs);
  }).then(
    // Return a stripe instance
    () => {
      let Stripe = (window as any)["Stripe"];
      return Stripe(process.env.REACT_APP_STRIPE_API_PUBLIC_KEY as "string");
    }
  );
}

function* saga() {
  // Before anything, setup a channel to capture any actions we will handle, so
  // we don't lose actions in the interim
  let paymentRequestChannel = yield actionChannel(
    ActionType.CreatePaymentRequest
  );

  let stripe;
  try {
    stripe = yield call(loadStripeInstance);
  } catch (err) {
    // TODO present this error in a user friendly way
    yield put({
      type: ActionType.StripeScriptLoadingError
    });
    return;
  }
  yield put({
    type: ActionType.StripeInstantiated,
    data: stripe
  });

  yield takeLatest(paymentRequestChannel, createPaymentRequest, stripe);
}

export default saga;
