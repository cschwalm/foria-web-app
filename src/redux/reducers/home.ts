import {Dispatch} from "redux";

export enum View {
  Tickets,
  Checkout,
  Complete
}

export enum ActionType {
  InitiateLogin = "InitiateLogin",
  InitiateLogout = "InitiateLogout",
  TogglePullUpMenu = "TogglePullUpMenu",
  SelectView = "SelectView"
}
export interface Action {
  type: ActionType;
  data?: any;
}
export interface State {
  pullUpMenuCollapsed: boolean;
  view: View
}
export const initialState = {
  // pullUpMenuCollapsed: false
  pullUpMenuCollapsed: true,
  view: View.Tickets
};
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
  dispatch({type: ActionType.SelectView, data: view });
