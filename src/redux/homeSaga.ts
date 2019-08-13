import {
  call,
  fork,
  put,
  race,
  select,
  take,
  takeEvery
} from "redux-saga/effects";

import {getView, getCanMakePayment, getTicketsForPurchase} from "./selectors";
import {
  View,
  ActionType as HomeActionType,
  someTicketsSelected
} from "./reducers/home";
import {ActionType as StripeActionType} from "./stripeSaga";
import {ActionType as Auth0ActionType} from "./auth0Saga";
import {ActionType as ApiActionType} from "./apiSaga";

// Navigate a user to the appropriate checkout view, by first logging them in,
// then checking if they have multiple payment options.
function* toCheckoutView() {
  // Pull out the actual body of the method into a separate function, so that we can put an action before and after it
  function* _toCheckoutView() {
    let ticketsForPurchase = yield select(getTicketsForPurchase);
    let someSelected = yield call(someTicketsSelected, ticketsForPurchase);
    if (!someSelected) {
      // Only navigate to checkout if some tickets have been selected
      return;
    }

    // Initiate a login if they are not logged in
    yield put({type: Auth0ActionType.CheckLogin});
    let [success, noSession /*error*/] = yield race([
      take(Auth0ActionType.AuthenticationSuccess),
      take(Auth0ActionType.NoExistingSession),
      take(Auth0ActionType.AuthenticationError)
    ]);

    if (noSession) {
      // We attempt to login the user, if we run into any errors we do not let
      // user proceed to checkout view
      yield put({type: Auth0ActionType.InitiateLogin});
      let [success /*noSession, error*/] = yield race([
        take(Auth0ActionType.AuthenticationSuccess),
        take(Auth0ActionType.NoExistingSession),
        take(Auth0ActionType.AuthenticationError)
      ]);
      if (!success) {
        return;
      }
    } else if (!success) {
      return;
    }

    // Fire the events to request an order calculation and to see if we
    // have web payments support
    yield put({type: ApiActionType.InitiateCalculateOrder});
    let [calculateSuccess /*,error*/] = yield race([
      take(ApiActionType.CalculateOrderTotalSuccess),
      take(ApiActionType.CalculateOrderTotalError)
    ]);

    if (!calculateSuccess) {
      // Unable to calculate a purchase total
      return;
    }

    // Create a payment request with the result of the calculate order total result
    yield put({
      type: StripeActionType.CreatePaymentRequest,
      data: calculateSuccess.data
    });

    // Use `all` to wait for the failure or success of each in parallel
    let [paymentsSuccess /*,error*/] = yield race([
      take(StripeActionType.CanMakePaymentSuccess),
      take(StripeActionType.CanMakePaymentError)
    ]);

    // The data on the action is whether web payments are accepted
    let webPaymentSupported = paymentsSuccess && paymentsSuccess.data;
    if (!webPaymentSupported) {
      // No support, so navigate to credit card checkout
      yield put({
        type: HomeActionType.SelectView,
        data: View.CreditCardCheckout
      });
      return;
    }

    yield put({type: HomeActionType.SelectView, data: View.ChooseCheckout});
  }

  yield put({type: HomeActionType.ToCheckoutPending});
  yield call(_toCheckoutView);
  yield put({type: HomeActionType.ToCheckoutCompleted});
}

// Navigate a user from a checkout view, sends user back to ChooseCheckout if
// they had multiple payment options, or to Tickets if they never had multiple
// options
function* fromCheckoutView() {
  let canMakePayment = yield select(getCanMakePayment);

  if (canMakePayment) {
    yield put({type: HomeActionType.SelectView, data: View.ChooseCheckout});
    return;
  }

  yield put({type: HomeActionType.SelectView, data: View.Tickets});
}

function* handleToPreviousView() {
  let currentView = yield select(getView);

  switch (currentView) {
    // No previous view
    case View.Tickets:
      return;
    // Don't allow a previous view on complete step
    case View.Complete:
      return;
    case View.ChooseCheckout:
      yield put({type: HomeActionType.SelectView, data: View.Tickets});
      return;
    case View.CreditCardCheckout:
      // Defer to a method, we may either send the user to Tickets or
      // to ChooseCheckout if they have options
      yield call(fromCheckoutView);
      break;
    default:
      throw new Error(`Unhandled view: ${currentView}`);
  }
}

function* handleToNextView() {
  let currentView = yield select(getView);

  switch (currentView) {
    // No next view
    case View.Complete:
      return;
    case View.ChooseCheckout:
    case View.CreditCardCheckout:
      yield put({type: HomeActionType.SelectView, data: View.Complete});
      return;
    case View.Tickets:
      // Defer to a method, we may either send user to CreditCardCheckout or
      // to ChooseCheckout if they have options
      yield call(toCheckoutView);
      break;
    default:
      throw new Error(`Unhandled view: ${currentView}`);
  }
}

// Track when a purchase is initiated and completed
function* trackPurchase() {
  // Map these events to a purchase pending event
  yield takeEvery(
    [
      HomeActionType.CreditCardSubmit,
      StripeActionType.StripeCreateTokenSuccess
    ],
    function*() {
      yield put({type: HomeActionType.PurchasePending});
    }
  );

  // Map these events to a purchase no longer pending event
  yield takeEvery(
    [
      StripeActionType.StripeCreateTokenError,
      ApiActionType.CheckoutError,
      ApiActionType.CheckoutSuccess
    ],
    function*() {
      yield put({type: HomeActionType.PurchaseNotPending});
    }
  );

  // On checkout success transition to the next view
  yield takeEvery(ApiActionType.CheckoutSuccess, function*() {
    yield call(handleToNextView);
  });
}

function* saga() {
  yield takeEvery(HomeActionType.ToPreviousView, handleToPreviousView);
  yield takeEvery(HomeActionType.ToNextView, handleToNextView);
  yield fork(trackPurchase);
}

export default saga;
