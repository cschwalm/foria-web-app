import {
    call,
    fork,
    put,
    race,
    select,
    take,
    takeEvery
} from "redux-saga/effects";

import {setLocalStorage, getView, getTicketsForPurchase, isFreePurchase} from "./selectors";
import {
    View,
    ActionType as HomeActionType,
    someTicketsSelected
} from "./reducers/home";
import {ActionType as StripeActionType} from "./stripeSaga";
import {initiateLoginIfNotLoggedInSaga} from "./auth0Saga";
import {ActionType as ApiActionType} from "./apiSaga";

// Login a user then navigate to payment options
function* toCheckoutView() {
    // Pull out the actual body of the method into a separate function, so that we can put an action before and after it
    function* _toCheckoutView() {
        let ticketsForPurchase = yield select(getTicketsForPurchase);
        let someSelected = someTicketsSelected(ticketsForPurchase);
        if (!someSelected) {
            // Only navigate to checkout if some tickets have been selected
            return;
        }

        try {
            // @ts-ignore
            yield* initiateLoginIfNotLoggedInSaga();
        } catch {
            // Login did not succeed either by error or user cancel
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

        let isFree = yield select(isFreePurchase);
        if (!isFree) {
            // Create a payment request with the result of the calculate order total result
            yield put({
                type: StripeActionType.CreatePaymentRequest,
                data: calculateSuccess.data
            });
            yield race([
                take(StripeActionType.CanMakePaymentSuccess),
                take(StripeActionType.CanMakePaymentError)
            ]);
        }

        yield put({type: HomeActionType.SelectView, data: View.Checkout});
    }

    yield put({type: HomeActionType.ToCheckoutPending});
    yield call(_toCheckoutView);
    yield put({type: HomeActionType.ToCheckoutCompleted});
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
        case View.Checkout:
            yield put({type: HomeActionType.SelectView, data: View.Tickets});
            return;
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
        case View.Checkout:
            yield put({type: HomeActionType.SelectView, data: View.Complete});
            // allows new new ticket purchases
            localStorage.clear();
            return;
        case View.Tickets:
            // allows for state to be returned after social login redirect
            yield select(setLocalStorage);
            // Defer to a method, login user then proceed to Checkout
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
            HomeActionType.FreePurchaseSubmit,
            HomeActionType.CreditCardSubmit,
            StripeActionType.StripeCreateTokenSuccess
        ],
        function* () {
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
        function* () {
            yield put({type: HomeActionType.PurchaseNotPending});
        }
    );

    // On checkout success transition to the next view
    yield takeEvery(ApiActionType.CheckoutSuccess, function* () {
        yield call(handleToNextView);
    });
}

function* saga() {
    yield takeEvery(HomeActionType.ToPreviousView, handleToPreviousView);
    yield takeEvery(HomeActionType.ToNextView, handleToNextView);
    yield fork(trackPurchase);
}

export default saga;
