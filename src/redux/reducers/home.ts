import {Dispatch} from "redux";
import {values, omit} from "lodash";

import Action from "../Action";
import {TicketTypeConfig} from "./root";
import {ActionType as StripeActionType} from "../stripeSaga";
import {ActionType as ApiActionType} from "../apiSaga";
import {ActionType as Auth0ActionType} from "../auth0Saga";

export enum View {
  Tickets,
  ChooseCheckout,
  CreditCardCheckout,
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
  ToCheckoutCompleted = "ToCheckoutCompleted"
}

export type TicketCounts = {[ticketId: string]: number};

export interface State {
  pullUpMenuCollapsed: boolean;
  view: View;
  ticketsForPurchase: TicketCounts;
  canMakePayment: boolean;
  checkoutPending: boolean;
  paymentRequest: stripe.paymentRequest.StripePaymentRequest | null;
  orderNumber?: string;
  orderSubTotal?: number;
  orderFees?: number;
  orderGrandTotal?: number;
  orderCurrency?: string;
  error?: any;
}
export const initialState: State = {
  pullUpMenuCollapsed: true,
  view: View.Tickets,
  paymentRequest: null,
  canMakePayment: false,
  checkoutPending: false,
  ticketsForPurchase: {}
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

export const reducer = (state = initialState, action: Action) => {
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
    case StripeActionType.PaymentRequestCreationError:
    case StripeActionType.CanMakePaymentError:
    case StripeActionType.StripeScriptLoadingError:
    case StripeActionType.StripeCreateTokenNetworkError:
    case StripeActionType.StripeCreateTokenError:
    case ApiActionType.EventFetchError:
    case ApiActionType.CheckoutError:
    case ApiActionType.CalculateOrderTotalError:
    case Auth0ActionType.AuthenticationError:
    case Auth0ActionType.LoginError:
      return {
        ...state,
        error: action.data
      };
    default:
      return state;
  }
};

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
