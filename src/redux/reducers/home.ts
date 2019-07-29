export interface State {}
export interface ActionType {}
export interface Action {
  type: ActionType,
  data: object
}
export const initialState = {};
export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    default:
      return state;
  }
};

