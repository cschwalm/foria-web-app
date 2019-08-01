import React from "react";
import ReactDOM from "react-dom";
import Enzyme, {shallow} from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import {Home} from "./Home";
import {AuthenticationStatus, Event} from "./redux/reducers/root";
import {View} from "./redux/reducers/home";

Enzyme.configure({adapter: new Adapter()});
it("renders an event", () => {
  const div = document.createElement("div");
  const props = {
    byLayout: (a, b) => a,
    authenticationStatus: AuthenticationStatus.NoAuth,
    view: View.Tickets,
    togglePullUpMenu: () => {},
    pullUpMenuCollapsed: true,
    initiateLogin: () => {},
    initiateLogout: () => {},
    event: {
      id: "a42205c9-f7fc-4371-80e4-99b73385f462",
      name: "Test Event",
      tag_line: "For The Fans",
      description: "first paragraph\nsecond paragraph",
      image_url:
        "https://musicoomph.com/wp-content/uploads/2018/03/benefits-of-going-to-live-music-concerts.jpg",
      start_time: "2019-06-19T20:07:09-07:00",
      end_time: "2019-09-30T17:00:00-07:00",
      address: {
        street_address: "12345 Fake Ln",
        city: "Fake City",
        state: "MO",
        zip: "55555",
        country: "USA"
      }
    }
  };
  const wrapper = shallow(<Home {...props} />);
  expect(wrapper.contains("Jun 20th, 3:07AM to Oct 1st, 12:00AM")).toEqual(
    true
  );
  expect(wrapper.contains("12345 Fake Ln, Fake City, MO 55555")).toEqual(true);
  expect(wrapper.contains(<p>first paragraph</p>)).toEqual(true);
  expect(wrapper.contains(<p>second paragraph</p>)).toEqual(true);
});
