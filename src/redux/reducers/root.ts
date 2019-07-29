import { getLayout, Layout } from "../../layout"

export interface State {
  layout: Layout
}
export const initialState = {
  layout: getLayout()
};
export enum ActionType {
  RESIZE
}
export interface Action {
  type: ActionType,
  data: object
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.RESIZE:
      return {
        ...state,
        layout: getLayout()
      };
    default:
      return state;
  }
};
