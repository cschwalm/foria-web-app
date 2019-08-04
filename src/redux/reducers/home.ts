import {Dispatch} from "redux";
import {values} from "lodash";

import Action from "../Action";
import {TicketTypeConfig} from "./root";
import {ActionType as StripeActionType} from "../stripeSaga";

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
  RemoveTicket = "RemoveTicket"
}

export type TicketCounts = {[ticketId: string]: number};

export interface State {
  pullUpMenuCollapsed: boolean;
  view: View;
  promoCode?: string;
  ticketsForPurchase: TicketCounts;
  paymentRequest: stripe.Stripe["paymentRequest"] | null;
  canMakePayment: boolean;
}
export const initialState = {
  pullUpMenuCollapsed: true,
  // pullUpMenuCollapsed: true,
  view: View.Tickets,
  // view: View.ChooseCheckout,
  paymentRequest: null,
  canMakePayment: false,
  ticketsForPurchase: {}
};

function updateTicketsQuantityHelper(
  tickets: TicketCounts,
  ticket: TicketTypeConfig,
  delta: number
) {
  let ticketCount = tickets[ticket.id];
  let currentCount = ticketCount || 0;
  return {
    ...tickets,
    [ticket.id]: currentCount + delta
  };
}
export const someTicketsSelected = (ticketsForPurchase: TicketCounts) =>
  values(ticketsForPurchase).some(quantity => quantity > 0);

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
    default:
      return state;
  }
};

export const resetPullUpMenu = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.ResetPullUpMenu});

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
