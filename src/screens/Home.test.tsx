import React from "react";
import Enzyme, {shallow} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import ReactMarkdown from "react-markdown";

import {Layout} from "../layout";
import {Home} from "./Home";
import {AuthenticationStatus} from "../redux/reducers/root";
import {View} from "../redux/reducers/home";

Enzyme.configure({adapter: new Adapter()});
it("renders an event", () => {
  const props = {
    layout: Layout.Desktop,
    byLayout: (a : any) => a,
    promoTicketTypeConfigs: [],
    authenticationStatus: AuthenticationStatus.NoAuth,
    view: View.Tickets,
    togglePullUpMenu: () => {},
    pullUpMenuCollapsed: true,
    initiateLogin: () => {},
    initiateLogout: () => {},
    initiateSpotifyLogin: () => {},
    event: {
      id: "a42205c9-f7fc-4371-80e4-99b73385f462",
      name: "Test Event",
      tag_line: "For The Fans",
      ticket_type_config: [],
      description: "",
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
  // @ts-ignore
    const wrapper = shallow(<Home {...props} />);
  expect(wrapper.contains("Jun 20th, 3:07AM to Oct 1st, 12:00AM")).toEqual(
    true
  );
  expect(wrapper.contains("12345 Fake Ln, Fake City, MO 55555")).toEqual(true);
});

it("renders markdown in the event description", () => {
  const props = {
    layout: Layout.Desktop,
    byLayout: (a : any) => a,
    promoTicketTypeConfigs: [],
    authenticationStatus: AuthenticationStatus.NoAuth,
    view: View.Tickets,
    togglePullUpMenu: () => {},
    pullUpMenuCollapsed: true,
    initiateLogin: () => {},
    initiateLogout: () => {},
    initiateSpotifyLogin: () => {},
    event: {
      ticket_type_config: [],
      description: "first paragraph\n\nsecond paragraph",
      address: {
        street_address: "12345 Fake Ln",
        city: "Fake City",
        state: "MO",
        zip: "55555",
        country: "USA"
      }
    }
  };
  // @ts-ignore
    const wrapper = shallow(<Home {...props} />);
  let eventDescription = wrapper.find(ReactMarkdown);
  expect(eventDescription.html()).toEqual(
    "<p>first paragraph</p><p>second paragraph</p>"
  );
});

it("strips html from the markdown", () => {
  const props = {
    layout: Layout.Desktop,
    promoTicketTypeConfigs: [],
    byLayout: (a : any) => a,
    authenticationStatus: AuthenticationStatus.NoAuth,
    view: View.Tickets,
    togglePullUpMenu: () => {},
    pullUpMenuCollapsed: true,
    initiateLogin: () => {},
    initiateLogout: () => {},
    initiateSpotifyLogin: () => {},
    event: {
      ticket_type_config: [],
      description: "<p>error</p>",
      address: {
        street_address: "12345 Fake Ln",
        city: "Fake City",
        state: "MO",
        zip: "55555",
        country: "USA"
      }
    }
  };
  // @ts-ignore
    const wrapper = shallow(<Home {...props} />);
  let eventDescription = wrapper.find(ReactMarkdown);
  expect(eventDescription.html()).toEqual("");
});
