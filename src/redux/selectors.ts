import {AppState} from "./store";

export const getEventId = (state: AppState) => state.root.eventId;
