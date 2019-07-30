import {Dispatch} from "redux";

export enum ActionType {
  InitiateLogin = "InitiateLogin",
  InitiateLogout = "InitiateLogout",
  TogglePullUpMenu = "TogglePullUpMenu"
}
export interface Action {
  type: ActionType;
  data?: object;
}
export interface State {
  pullUpMenuCollapsed: boolean;
}
export const initialState = {
  // pullUpMenuCollapsed: false
  pullUpMenuCollapsed: true
};
export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.TogglePullUpMenu:
      return {
        ...state,
        pullUpMenuCollapsed: !state.pullUpMenuCollapsed
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
