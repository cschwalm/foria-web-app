import {Dispatch} from "redux";

export interface State {}
export enum ActionType {
  InitiateLogin = "InitiateLogin",
  InitiateLogout = "InitiateLogout"
}
export interface Action {
  type: ActionType;
  data?: object;
}
export const initialState = {};
export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const initiateLogin = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogin});

export const initiateLogout = (dispatch: Dispatch<Action>) => () =>
  dispatch({type: ActionType.InitiateLogout});
