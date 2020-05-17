import {Dispatch} from "redux";
import {values, omit} from "lodash";
import * as Sentry from "@sentry/browser";

import Action from "../Action";
import {TicketTypeConfig} from "./root";
import {ActionType as StripeActionType} from "../stripeSaga";
import {ActionType as ApiActionType} from "../apiSaga";
import {ActionType as Auth0ActionType} from "../auth0Saga";
import {ActionType as BranchActionType} from "../branchSaga";

export enum View {
  Tickets,
  Checkout,
  Complete
}

export enum ActionType {
  SelectView = "SelectView",
  ToPreviousView = "ToPreviousView",
  ToNextView = "ToNextView",

  ResetPullUpMenu = "ResetPullUpMenu",
  ShowPullUpMenu = "ShowPullUpMenu",

  RequestView = "RequestView",
  AddTicket = "AddTicket",
  RemoveTicket = "RemoveTicket",

  ResetError = "ResetError",

  ToCheckoutPending = "ToCheckoutPending",
  ToCheckoutCompleted = "ToCheckoutCompleted",
  PurchasePending = "PurchasePending",
  PurchaseNotPending = "PurchaseNotPending",

  CreditCardSubmit = "CreditCardSubmit",
  FreePurchaseSubmit = "FreePurchaseSubmit",

  SendMeAppSubmit = "SendMeAppSubmit",
  BranchPhoneNumberChange = "BranchPhoneNumberChange",

  ApplyPromoCode = "ApplyPromoCode",
  ResetPromoError = "ResetPromoError"
}

export type TicketCounts = {[ticketId: string]: number};

export interface State {
  pullUpMenuCollapsed: boolean;
  view: View;
  ticketsForPurchase: TicketCounts;
  canMakePayment: boolean;
  checkoutPending: boolean;
  purchasePending: boolean;
  paymentRequest: stripe.paymentRequest.StripePaymentRequest | null;
  orderNumber?: string;
  orderSubTotal?: number;
  orderFees?: number;
  orderGrandTotal?: number;
  orderCurrency?: string;
  error?: any;
  branchPhoneNumber?: string;
  branchSMSPending: boolean;
  branchLinkSent: boolean;
  promoTicketTypeConfigs: TicketTypeConfig[];
  applyPromoPending: boolean;
  applyPromoError?: string;
  appliedPromoCode?: string;
}

const getViewFromUrl = (): View | void => {
    let params = new URLSearchParams(window.location.search);
    let view = params.get("view");
    if (view != null && view === 'spotify-callback') {
        return View.Complete
    }
    return View.Tickets;
};

export const initialState: State = {
  pullUpMenuCollapsed: true,
  view: getViewFromUrl() as View,
  paymentRequest: null,
  canMakePayment: false,
  checkoutPending: false,
  purchasePending: false,
  branchSMSPending: false,
  branchLinkSent: false,
  ticketsForPurchase: {},
  applyPromoPending: false,
  promoTicketTypeConfigs: []
};

function updateTicketsQuantityHelper(
  tickets: TicketCounts,
  ticket: TicketTypeConfig,
  delta: number
) {
  let ticketCount = tickets[ticket.id];
  let currentCount = ticketCount || 0;
  if (currentCount + delta === 0) {
    return omit(tickets, ticket.id);
  }
  return {
    ...tickets,
    [ticket.id]: currentCount + delta
  };
}

export const someTicketsSelected = (ticketsForPurchase: TicketCounts) =>
  values(ticketsForPurchase).some(quantity => quantity > 0);

export const totalTicketsSelected = (ticketsForPurchase: TicketCounts) =>
  values(ticketsForPurchase).reduce((a, b) => a + b, 0);

export const sentryCaptureErrorReducer = (
  state = initialState,
  action: Action
) => {
  switch (action.type) {
    case StripeActionType.PaymentRequestCreationError:
    case StripeActionType.CanMakePaymentError:
    case StripeActionType.StripeScriptLoadingError:
    case StripeActionType.StripeCreateTokenError:
    case Auth0ActionType.UnrecoverableError:
    case Auth0ActionType.LoginError:
    case ApiActionType.ApplyPromoCriticalError:
    case ApiActionType.EventFetchCriticalError:
    case ApiActionType.CheckoutCriticalError:
    case ApiActionType.CalculateOrderTotalCriticalError:
      Sentry.withScope(scope => {
        let error;
        if (action.data instanceof Error) {
          error = action.data;
        } else {
          error = new Error(
            typeof action.data === "string"
              ? action.data
              : JSON.stringify(action.data)
          );
        }
        scope.setExtra("reduxAction", action.type);
        Sentry.captureException(error);
      });
      break;
  }
  return state;
};

export const errorModalReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    /* This error is shown inline
    case ApiActionType.ApplyPromoError:
   */
    case StripeActionType.PaymentRequestCreationError:
    case StripeActionType.CanMakePaymentError:
    case StripeActionType.StripeScriptLoadingError:
    case StripeActionType.StripeCreateTokenError:
    case Auth0ActionType.UnrecoverableError:
    case Auth0ActionType.LoginError:
    case ApiActionType.EventFetchError:
    case ApiActionType.CheckoutError:
    case ApiActionType.CalculateOrderTotalError:
    case ApiActionType.EventFetchCriticalError:
    case ApiActionType.CheckoutCriticalError:
    case BranchActionType.SendMeAppError:
    case ApiActionType.CalculateOrderTotalCriticalError:
      return {
        ...state,
        error: action.data
      };
  }
  return state;
};

export const mainReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    // Due to mobile space constraints, there is no back button to undo
    // selected tickets, as a substitute, the user can close the menu, and
    // start again if they open it
    case ActionType.ResetPullUpMenu:
      return {
        ...state,
        ...initialState,
        pullUpMenuCollapsed: true
      };
    case ActionType.ShowPullUpMenu:
      return {
        ...state,
        pullUpMenuCollapsed: false
      };
    case ActionType.SelectView:
      return {
        ...state,
        view: action.data
      };
    case ActionType.ApplyPromoCode:
      return {
        ...state,
        applyPromoPending: true
      };
    case ApiActionType.ApplyPromoError:
    case ApiActionType.ApplyPromoCriticalError:
      return {
        ...state,
        applyPromoError:
          action.type === ApiActionType.ApplyPromoCriticalError
            ? "An internal error occurred"
            : action.data.status === 401
            ? "Please login first"
            : "Invalid promo code",
        applyPromoPending: false
      };
    case ApiActionType.ApplyPromoCancelledNoLogin:
      return {
        ...state,
        applyPromoPending: false,
        applyPromoError: "Login required"
      };
    case ActionType.ResetPromoError:
      return {
        ...state,
        applyPromoError: ""
      };
    case ApiActionType.ApplyPromoSuccess:
      return {
        ...state,
        promoTicketTypeConfigs: action.data.promoTicketTypeConfigs,
        appliedPromoCode: action.data.promoCode,
        applyPromoPending: false,
        applyPromoError: ""
      };
    case ApiActionType.CalculateOrderTotalSuccess:
      return {
        ...state,
        orderSubTotal: Number(action.data.subtotal),
        orderFees: Number(action.data.fees),
        orderGrandTotal: Number(action.data.grand_total),
        orderCurrency: action.data.currency
      };
    case ApiActionType.CheckoutSuccess:
      return {
        ...state,
        orderNumber: action.data
      };
    case ActionType.AddTicket:
      return {
        ...state,
        ticketsForPurchase: updateTicketsQuantityHelper(
          state.ticketsForPurchase,
          action.data,
          1
        )
      };
    case ActionType.RemoveTicket:
      return {
        ...state,
        ticketsForPurchase: updateTicketsQuantityHelper(
          state.ticketsForPurchase,
          action.data,
          -1
        )
      };
    case ActionType.ResetError:
      return omit(state, "error");
    case ActionType.ToCheckoutPending:
      return {
        ...state,
        checkoutPending: true
      };
    case ActionType.ToCheckoutCompleted:
      return {
        ...state,
        checkoutPending: false
      };
    case ActionType.PurchasePending:
      return {
        ...state,
        purchasePending: true
      };
    case ActionType.PurchaseNotPending:
      return {
        ...state,
        purchasePending: false
      };
    case StripeActionType.CanMakePaymentSuccess:
      return {
        ...state,
        canMakePayment: action.data
      };
    case StripeActionType.PaymentRequestCreated:
      return {
        ...state,
        paymentRequest: action.data,
        // canMakePayment is state dervied from paymentRequest (pr), when a pr
        // is created, we reset canMakePayment
        canMakePayment: false
      };
    case ActionType.SendMeAppSubmit:
      return {
        ...state,
        branchSMSPending: true
      };
    case BranchActionType.SendMeAppSuccess:
      return {
        ...state,
        branchSMSPending: false,
        branchLinkSent: true
      };
    case ActionType.BranchPhoneNumberChange:
      return {
        ...state,
        branchPhoneNumber: action.data
      };
    case BranchActionType.SendMeAppError:
      return {
        ...state,
        branchSMSPending: false
      };
  }
  return state;
};

// chainReducers connects the state from one reducer to the next.
const chainReducers = (...reducers: any[]) => (state: any, action: any) =>
  reducers.reduce((acc, next) => next(acc, action), state);

export const reducer = chainReducers(
  errorModalReducer,
  sentryCaptureErrorReducer,
  mainReducer
);

export const resetPullUpMenu = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ResetPullUpMenu});

export const resetError = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ResetError});

export const showPullUpMenu = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ShowPullUpMenu});

export const selectView = (dispatch: Dispatch<Action>) => (view: View) =>
  dispatch({type: ActionType.SelectView, data: view});

export const toNextView = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ToNextView});

export const toPreviousView = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ToPreviousView});

export const requestView = (dispatch: Dispatch<Action>) => (view: View) =>
  dispatch({type: ActionType.RequestView, data: view});

export const addTicket = (dispatch: Dispatch<Action>) => (
  ticket: TicketTypeConfig
) => dispatch({type: ActionType.AddTicket, data: ticket});

export const removeTicket = (dispatch: Dispatch<Action>) => (
  ticket: TicketTypeConfig
) => dispatch({type: ActionType.RemoveTicket, data: ticket});

export const onCreditCardSubmit = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.CreditCardSubmit});

export const onFreePurchaseSubmit = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.FreePurchaseSubmit});

export const onApplyPromoCode = (dispatch: Dispatch<Action>) => (
  promoCode: string
) => dispatch({type: ActionType.ApplyPromoCode, data: promoCode});

export const resetPromoError = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ResetPromoError});

export const onSendMeApp = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.SendMeAppSubmit});

export const onBranchPhoneNumberChange = (dispatch: Dispatch<Action>) => (
  phoneNumber: string
) => dispatch({type: ActionType.BranchPhoneNumberChange, data: phoneNumber});
