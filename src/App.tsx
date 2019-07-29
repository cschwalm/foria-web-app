import React from "react";
// import Auth0Lock from "auth0-lock";
import foriaLogo from "./foria_logo.png";
import heroImage from "./example_hero.jpg";
import calendarIcon from "./calendar_icon.png";
import PinpointIcon from "./pinpointIcon";
import DecrementIcon from "./decrementIcon";
import IncrementIcon from "./incrementIcon";
import "./App.css";

const ticketOverlayWidth = 376;
const bodyWidth = 960;
const pink = "#FF0266";

//const lock = new Auth0Lock(
//  "6btWupF5RfQPPMyRL08DWOF7wZ8ZDjzr",
//  "auth.foriatickets.com",
//  {configurationBaseUrl: "https://cdn.auth0.com"}
//);

//// Listening for the authenticated event
//lock.on("authenticated", function(authResult) {
//  // Use the token in authResult to getUserInfo() and save it if necessary
//  this.getUserInfo(authResult.accessToken, function(error, profile) {
//    if (error) {
//      // Handle error
//      return;
//    }

//    //we recommend not storing Access Tokens unless absolutely necessary
//    wm.set(privateStore, {
//      accessToken: authResult.accessToken
//    });

//    wm.set(privateStore, {
//      profile: profile
//    });
//  });
//});

//window.setTimeout(function() {
//  lock.show();
//}, 1000);

enum View {
  Tickets,
  Checkout,
  Complete
}
enum Layout {
  Mobile,
  Desktop
}

interface AppStateT {
  vipShowMore: boolean;
  view: View;
  layout: Layout;
}

function getLayout() {
  const width = window.innerWidth;
  if (width < 700) {
    return Layout.Mobile;
  } else {
    return Layout.Desktop;
  }
}

const byLayout = (layout: Layout, a: any, b: any) =>
  layout === Layout.Mobile ? a : b;

class App extends React.Component<{}, AppStateT> {
  constructor(props: object) {
    super(props);
    this.state = {
      vipShowMore: false,
      view: View.Tickets,
      layout: getLayout()
    };
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onResize);
  }

  onResize = () => {
    this.setState({layout: getLayout()});
  };

  renderTicketsStep = () => {
    let {vipShowMore} = this.state;
    let styles = {
      ticketsTitle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "5px 5px 0px 0px",
        padding: "1rem",
        backgroundColor: "#f2f2f2",
        fontFamily: "Roboto",
        fontSize: "1em",
        lineHeight: "1.2em",
        marginBottom: "1em"
      },
      ticketsRestriction: {
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "0.75em",
        lineHeight: "1.2em",
        color: "#7E7E7E"
      },
      ticketNumeral: {
        fontFamily: "Rubik",
        fontWeight: "bold" as "bold",
        fontSize: "1.3em",
        lineHeight: "1.2em"
      },
      ticketPriceFee: {
        fontFamily: "Rubik",
        fontSize: "0.6em",
        lineHeight: "1.2em"
      },
      ticketType: {
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "0.8em",
        lineHeight: "1.2em",
        color: "#7E7E7E"
      },
      ticketSoldOut: {
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "1em",
        lineHeight: "1.2em",
        flex: 1,
        opacity: 0.3
      },
      ticketShowMore: {
        gridArea: "7 / 2 / 8 / 4",
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "1.2em",
        color: "#7E7E7E"
      },
      checkoutButton: {
        margin: "0em 1em 1em 1em",
        padding: "1em",
        background: "#FF0266",
        borderRadius: "5px",
        color: "white",
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "18px",
        lineHeight: "21px",
        justifyContent: "center",
        alignItems: "center"
      }
    };
    return (
      <>
        <div style={styles.ticketsTitle}>Tickets</div>
        <div style={{margin: "0em 1em 1.5em 1em"}}>
          <div style={styles.ticketsRestriction}>
            A maximum of 10 tickets can be purchased
          </div>
        </div>
        <div
          style={{
            margin: "0em 1em 1.5em 1em",
            display: "grid",
            gridTemplateColumns: "auto auto auto",
            gridTemplateRows: `auto 1em auto 1em auto ${
              vipShowMore ? "" : "0.6em auto"
            }`,
            gridColumnGap: "1em",
            // gridRowGap: "1.5em",
            justifyItems: "space-between",
            alignItems: "center"
          }}>
          <div className="column" style={{flex: 1, opacity: 0.3}}>
            <div style={styles.ticketNumeral}>$25</div>
            <div style={styles.ticketPriceFee}>+$3.00 fee</div>
          </div>
          <div className="column" style={{...styles.ticketType, opacity: 0.3}}>
            Tier 1 - General Admission
          </div>
          <div className="column" style={styles.ticketSoldOut}>
            Sold Out
          </div>
          <div className="column" />
          <div className="column" />
          <div className="column" />
          <div className="column" style={{flex: 1}}>
            <div style={styles.ticketNumeral}>$45</div>
            <div style={styles.ticketPriceFee}>+$4.50 fee</div>
          </div>
          <div className="column" style={styles.ticketType}>
            Tier 2 - General Admission
          </div>
          <div className="column" style={{flex: 1}}>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <DecrementIcon />
              <div style={styles.ticketNumeral}>2</div>
              <IncrementIcon />
            </div>
          </div>
          <div className="column" />
          <div className="column" />
          <div className="column" />
          <div className="column" style={{flex: 1}}>
            <div style={styles.ticketNumeral}>$90</div>
            <div style={styles.ticketPriceFee}>+$4.50 fee</div>
          </div>
          <div className="column" style={styles.ticketType}>
            <div style={{marginBottom: "0.2em"}}>VIP</div>
            <VIPInfoToggle
              showMore={vipShowMore}
              onShow={() => this.setState({vipShowMore: true})}
              onHide={() => this.setState({vipShowMore: false})}
            />
          </div>
          <div className="column" style={{flex: 1}}>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <DecrementIcon />
              <div style={styles.ticketNumeral}>0</div>
              <IncrementIcon disabled />
            </div>
          </div>
          {vipShowMore
            ? null
            : [
                <div className="column" />,
                <div className="column" />,
                <div className="column" />,
                <div className="column" />,
                <div className="column" style={styles.ticketShowMore}>
                  <div style={{marginBottom: "0.4em"}}>VIP perks:</div>
                  <ul
                    style={{
                      margin: "0em 0em 0em 1em",
                      padding: 0,
                      listStyle: "none"
                    }}>
                    <li>> Separate VIP entrance</li>
                    <li>> Private bars</li>
                    <li>> Exclusive VIP viewing area</li>
                  </ul>
                </div>,
                <div className="column" />
              ]}
        </div>
        <div className="row" style={styles.checkoutButton}>
          Checkout
        </div>
      </>
    );
  };

  renderCheckoutStep = () => {
    return <div />;
  };
  renderCompleteStep = () => {
    return <div />;
  };

  renderTicketsPullUp = () => {
    return (
      <div
        style={{
          flex: "0 0 100px"
        }}>
        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%"
          }}>
          <div
            style={{
              height: "4em",
              backgroundImage: "linear-gradient(to top, white, rgba(255,0,0,0))"
            }}
          />
          <div
            style={{
              boxSizing: "border-box",
              boxShadow: "rgba(0, 0, 0, 0.21) 0 -2px 8px 4px",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "white",
              padding: "1.5em"
            }}
            className="row">
            <div
              style={{
                padding: "0.8em",
                fontFamily: "Rubik",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "21px"
              }}>
              $30 - $90
            </div>
            <div
              style={{
                marginLeft: "1em",
                width: "40%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.8em",
                background: "#FF0266",
                borderRadius: "24px",
                color: "white",
                fontFamily: "Rubik",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "21px"
              }}>
              Tickets
            </div>
          </div>
        </div>
      </div>
    );
  };
  renderTicketModal = () => {
    let {view} = this.state;

    let modalView;
    switch (view) {
      case View.Tickets:
        modalView = this.renderTicketsStep();
        break;
      case View.Checkout:
        modalView = this.renderCheckoutStep();
        break;
      case View.Complete:
        modalView = this.renderCompleteStep();
        break;
      default:
        throw new Error(`Unknown view: ${view}`);
    }
    return (
      <div
        style={{
          borderRadius: "5px",
          marginLeft: "2em",
          position: "relative",
          flex: `0 0 ${ticketOverlayWidth}px`
        }}>
        <div
          style={{
            borderRadius: "5px",
            backgroundColor: "white",
            position: "absolute",
            width: `${ticketOverlayWidth}px`,
            top: "-64px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)"
          }}>
          {modalView}
        </div>
      </div>
    );
  };

  renderHero = () => {
    let {layout} = this.state;
    return (
      <div
        style={{
          minHeight: byLayout(layout, "200px", "300px"),
          background: `url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />
    );
  };

  renderHeader = () => {
    let {layout} = this.state;
    let styles = {
      header: {
        backgroundColor: "#fff",
        boxShadow: "0px 0px 2px 3px #ccc"
      },
      logo: {
        height: byLayout(layout, "2em", "2.6em"),
        cursor: "pointer"
      },
      helpAnchor: {
        color: "#7E7E7E",
        fontFamily: "Roboto",
        fontSize: "1em",
        lineHeight: "1.2em",
        cursor: "pointer"
      },
      loginAnchor: {
        marginLeft: byLayout(layout, "1.5em", "3em"),
        fontFamily: "Roboto",
        fontSize: "1em",
        lineHeight: "1.2em",
        cursor: "pointer",
        color: "#FF0266"
      }
    };

    let signInMessage = byLayout(layout, "Sign In", "Sign Up/Sign In");
    return (
      <div style={styles.header}>
        <div
          style={{
            maxWidth: `${bodyWidth}px`,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            padding: byLayout(layout, "1em", "1em 2em"),
            boxSizing: "border-box"
          }}>
          {
            // TODO: redirect to foria homepage on click
          }
          <div style={{display: "flex", flex: 1}}>
            <img src={foriaLogo} alt="logo" style={styles.logo} />
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-end"
            }}>
            <a style={styles.helpAnchor}>Help</a>
            <a style={styles.loginAnchor}>{signInMessage}</a>
          </div>
        </div>
      </div>
    );
  };

  renderBody = () => {
    let {layout} = this.state;

    let styles = {
      eventTitle: {
        fontFamily: "Rubik",
        fontWeight: "bold" as "bold",
        fontSize: "2.2em",
        lineHeight: "1.2em"
      },
      eventSubTitle: {
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "1em",
        lineHeight: "1.2em",
        color: "#7E7E7E"
      },
      eventDetailTitle: {
        marginBottom: "0.2em",
        fontFamily: "Rubik",
        fontSize: "1.3em",
        lineHeight: "1.2em",
        ...byLayout(layout, {fontWeight: 500}, {})
      },
      eventDetailSubtitle: {
        fontFamily: "Rubik",
        fontSize: "1em",
        lineHeight: "1.2em",
        ...byLayout(layout, {fontWeight: 500}, {})
      },
      eventBody: {
        fontFamily: "Rubik",
        fontSize: byLayout(layout, "1em", "0.8em"),
        lineHeight: "1.2em",
        color: "#7E7E7E"
      },
      calendarIcon: {
        width: "1.38em",
        height: "1.52em"
      },
      pinpointIcon: {
        width: "1.33em",
        height: "2em"
      }
    };

    let eventDate = byLayout(
      layout,
      <div style={styles.eventDetailTitle}>June 18th, 7:00pm to 11:00pm</div>,
      <>
        <div style={styles.eventDetailTitle}>June 18th</div>
        <div style={styles.eventDetailSubtitle}>7:00pm to 11:00pm</div>
      </>
    );
    return (
      <div
        style={{
          flex: 1,
          flexDirection: "column",
          display: "flex",
          maxWidth: `${bodyWidth}px`,
          backgroundColor: byLayout(layout, "white", "initial"),
          margin: byLayout(layout, "0 auto", "0 auto 3em auto")
        }}>
        <div
          className="row"
          style={{
            borderRadius: "5px",
            backgroundColor: "white",
            margin: byLayout(layout, "0", "0 0.6em"),
            padding: byLayout(layout, "2em 1.5em", "2em 0em 2em 1.5em"),
            position: "relative",
            alignItems: "flex-start"
          }}>
          <div className="column">
            <div style={{margin: "0em 0em 2em 0em"}}>
              <div style={styles.eventTitle}>Billie Eilish</div>
              <div style={styles.eventSubTitle}>When We Fall Asleep Tour</div>
            </div>
            <div className="row" style={{marginBottom: "1em"}}>
              <img
                src={calendarIcon}
                style={styles.calendarIcon}
                alt="calendar-icon"
              />
              <div className="column" style={{marginLeft: "0.8em"}}>
                {eventDate}
              </div>
            </div>
            <div className="row" style={{marginBottom: "2em"}}>
              <PinpointIcon
                width={styles.pinpointIcon.width}
                height={styles.pinpointIcon.height}
              />
              <div className="column" style={{marginLeft: "0.8em"}}>
                <div style={styles.eventDetailTitle}>Radio City Music Hall</div>
                <div style={{...styles.eventDetailSubtitle, color: pink}}>
                  1260 6th Ave, New York, NY 10020
                </div>
              </div>
            </div>
            <div style={styles.eventBody}>
              <p>
                Billie Eilish Pirate Baird O'Connell is an American singer and
                songwriter. In 2016, she released her debut single, "Ocean
                Eyes", which subsequently went viral. Her debut EP Don't Smile
                at Me was released in August of the next year.
              </p>
              <p>This event is 18 and over</p>
              <p>
                ARRIVE EARLY: Please arrive one-hour prior to showtime. All
                packages, including briefcases and pocketbooks, will be
                inspected prior to entry.Inquiries or requests for accessible
                seating for this event should be made through Radio City Music
                Hall's Disabled Services at 212-465-6115.
              </p>
            </div>
          </div>
          {byLayout(layout, null, this.renderTicketModal())}
        </div>
      </div>
    );
  };

  render() {
    let {layout} = this.state;

    return (
      <div
        className="App"
        style={{
          fontSize: byLayout(layout, "14px", "18px")
        }}>
        {this.renderHeader()}
        {this.renderHero()}
        {this.renderBody()}
        {byLayout(layout, this.renderTicketsPullUp(), null)}
      </div>
    );
  }
}

interface VIPInfoToggleProps {
  showMore: boolean;
  onShow: () => any;
  onHide: () => any;
}

const VIPInfoToggle: React.FC<VIPInfoToggleProps> = ({
  showMore = true,
  onShow,
  onHide
}) => {
  return (
    <div
      onClick={showMore ? onHide : onShow}
      style={{color: pink, cursor: "pointer"}}>
      {showMore ? "More" : "Less"} Info
    </div>
  );
};

export default App;
