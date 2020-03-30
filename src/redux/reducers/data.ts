/*
  To test, you can use events from this file as the event in initial state of the root
  reducer
*/

// Use this is as the initial event, to simulate the flow where a user must
// enter a promo code to see additional tickets, promoCode TEST1234 is one
// such valid code
export const promoCodeEvent = {
  type: "DEFAULT",
  id: "7025c3e1-cfa5-4504-86f2-091341231661",
  name: "Silent Disco and Yoga",
  tag_line: "test",
  description: "Test",
  image_url:
    "https://images.unsplash.com/photo-1561579890-3ace74d8e378?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
  start_time: "2019-09-28T13:00:00-07:00",
  end_time: "2019-10-28T20:00:00-07:00",
  address: {
    venue_name: "Ocean Beach",
    street_address: "609 Dekalb Ave.",
    city: "Brooklyn",
    state: "New York",
    zip: "11216",
    country: "USA"
  },
  ticket_type_config: []
};

// Use this is as the initial event, to simulate the flow where no event
// tickets (for a RESELL event) prompts for the flow for a user to provide
// their email for the waitlist
export const waitListEvent = {
  type: "RESELL",
  id: "7025c3e1-cfa5-4504-86f2-091341231661",
  name: "Silent Disco and Yoga",
  tag_line: "test",
  description: "Test",
  image_url:
    "https://images.unsplash.com/photo-1561579890-3ace74d8e378?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
  start_time: "2019-09-28T13:00:00-07:00",
  end_time: "2019-10-28T20:00:00-07:00",
  address: {
    venue_name: "Ocean Beach",
    street_address: "609 Dekalb Ave.",
    city: "Brooklyn",
    state: "New York",
    zip: "11216",
    country: "USA"
  },
  ticket_type_config: [
    {
      id: "417e2a2b-a9ae-43c8-9c95-b5f03b13f9a1",
      name: "Support the Artists",
      description:
        "Includes pressed vinyl with specially selected tracks by our creative community.",
      amount_remaining: 0,
      price: "50.00",
      calculated_fee: "4.38",
      currency: "USD"
    }
  ]
};
