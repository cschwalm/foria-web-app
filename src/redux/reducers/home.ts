import {Dispatch} from "redux";

import {TicketTypeConfig} from "./root";

export enum View {
  Tickets,
  Checkout,
  Complete
}

export enum ActionType {
  InitiateLogin = "InitiateLogin",
  InitiateLogout = "InitiateLogout",
  TogglePullUpMenu = "TogglePullUpMenu",
  SelectView = "SelectView",
  AddTicket = "AddTicket",
  RemoveTicket = "RemoveTicket"
}
export interface Action {
  type: ActionType;
  data?: any;
}

export interface TicketLookupAndCount {
  ticketType: TicketTypeConfig;
  quantity: number;
}

export type TicketCounts = {[ticketId: string]: TicketLookupAndCount};

export interface State {
  pullUpMenuCollapsed: boolean;
  view: View;
  promoCode?: string;
  ticketsForPurchase: TicketCounts;
}
export const initialState = {
  // pullUpMenuCollapsed: false,
  pullUpMenuCollapsed: true,
  ticketsForPurchase: {},
  view: View.Tickets
};

function updateTicketsQuantityHelper(
  tickets: TicketCounts,
  ticket: TicketTypeConfig,
  delta: number
) {
  let ticketCount = tickets[ticket.id];
  let currentCount = ticketCount ? ticketCount.quantity : 0;
  return {
    ...tickets,
    // TODO remove ticketType if unused
    [ticket.id]: { quantity: currentCount + delta, ticketType: ticket }
  };
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.TogglePullUpMenu:
      return {
        ...state,
        pullUpMenuCollapsed: !state.pullUpMenuCollapsed
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
          state.ticketsForPurchase, action.data, 1
        )
      };
    case ActionType.RemoveTicket:
      return {
        ...state,
        ticketsForPurchase: updateTicketsQuantityHelper(
          state.ticketsForPurchase, action.data, -1
        )
      };
    default:
      return state;
  }
};

export const initiateLogin = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogin});

export const initiateLogout = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogout});

export const togglePullUpMenu = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.TogglePullUpMenu});

export const selectView = (dispatch: Dispatch<Action>) => (view: View) =>
  dispatch({type: ActionType.SelectView, data: view});

export const addTicket = (dispatch: Dispatch<Action>) => (
  ticket: TicketTypeConfig
) => dispatch({type: ActionType.AddTicket, data: ticket});

export const removeTicket = (dispatch: Dispatch<Action>) => (
  ticket: TicketTypeConfig
) => dispatch({type: ActionType.RemoveTicket, data: ticket});
