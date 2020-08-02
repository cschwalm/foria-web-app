import React, {Component} from "react";
import EventPage from "./EventPage";
import {connect} from "react-redux";
import {AppState} from "../redux/store";
import SignUpScreen from "./SignUpScreen";

interface WrapperProps {
    eventId: string | null;
}
class WrapperComponent extends Component<WrapperProps> {
    render () {
        if (this.props.eventId === null) {
            return (
                <SignUpScreen/>
            );
        } else {
            return (
                <EventPage/>
            );
        }
    }
}
export default connect(
    (state: AppState) => {
        let {root} = state;
        return {
            eventId: root.eventId
        };
    },
)(WrapperComponent);