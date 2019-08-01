import React from "react";
import moment from "moment";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import Skeleton from "react-loading-skeleton";

import {AppState} from "./redux/store";
import {AuthenticationStatus, Event} from "./redux/reducers/root";
import {
  initiateLogin as initiateLoginAction,
  initiateLogout as initiateLogoutAction,
  togglePullUpMenu as togglePullUpMenuAction,
  selectView as selectViewAction,
  View
} from "./redux/reducers/home";
import {byLayout} from "./layout";
import foriaLogo from "./foria_logo.png";
import calendarIcon from "./calendar_icon.png";
import PinpointIcon from "./pinpointIcon";
import DecrementIcon from "./decrementIcon";
import IncrementIcon from "./incrementIcon";
import DownwardChevron from "./downwardChevron";
import UpwardChevron from "./upwardChevron";

const ticketOverlayWidth = 376;
const bodyWidth = 960;
const pink = "#FF0266";

interface AppStateT {
  vipShowMore: boolean;
}

interface AppPropsT {
  // TODO can return a more specific type (a | b)
  byLayout: (a: any, b: any) => any;
  pullUpMenuCollapsed: boolean;
  authenticationStatus: AuthenticationStatus;
  initiateLogin: () => void;
  initiateLogout: () => void;
  togglePullUpMenu: () => void;
  selectView: (view: View) => void;
  view: View;
  profile?: auth0.Auth0UserProfile;
  event?: Event;
}

const sharedStyles = {
  pullUpMenuTicketsButton: {
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
    fontWeight: 500,
    fontSize: "1.29em",
    lineHeight: "1.2em",
    cursor: "pointer"
  },
  eventDetailSubtitle: {
    fontFamily: "Rubik",
    fontSize: "1em",
    lineHeight: "1.2em"
  },
  semibold: {
    fontWeight: 500
  },
  eventDetailTitle: {
    marginBottom: "0.2em",
    fontFamily: "Rubik",
    fontSize: "1.3em",
    lineHeight: "1.2em"
  }
};

export class Home extends React.Component<AppPropsT, AppStateT> {
  constructor(props: AppPropsT) {
    super(props);
    this.state = {
      vipShowMore: false
    };
  }

  renderTicketsGrid = () => {
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
        fontSize: "0.8em",
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
      <div
        style={{
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
        {vipShowMore ? null : (
          <>
            <div className="column" />
            <div className="column" />
            <div className="column" />
            <div className="column" />
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
            </div>
            <div className="column" />
          </>
        )}
      </div>
    );
  };

  renderDesktopTicketsStep = () => {
    let {selectView} = this.props;
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
            margin: "0em 1em 1.5em 1em"
          }}>
          {this.renderTicketsGrid()}
        </div>
        <div
          className="row"
          onClick={() => selectView(View.Checkout)}
          style={styles.checkoutButton}>
          Checkout
        </div>
      </>
    );
  };

  renderDesktopCheckoutStep = () => {
    return <div />;
  };

  renderMobileCheckoutStep = () => {
    return <div />;
  };

  renderDesktopCompleteStep = () => {
    return <div />;
  };

  renderMobileCompleteStep = () => {
    return <div />;
  };

  renderTicketsPullUpCollapsed = () => {
    let {togglePullUpMenu} = this.props;

    return (
      <div
        style={{
          // Create a 100px white rectangle, so that content does not run
          // under the fixed position pullup menu
          height: "100px",
          backgroundColor: "white"
        }}>
        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%"
          }}>
          <div
            style={{
              height: "4em"
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
                fontWeight: 500,
                fontSize: "1.29em",
                lineHeight: "1.2em"
              }}>
              $30 - $90
            </div>
            <div
              onClick={() => togglePullUpMenu()}
              style={sharedStyles.pullUpMenuTicketsButton}>
              Tickets
              <div
                style={{
                  fontSize: "14px",
                  marginLeft: "0.6em",
                  display: "flex"
                }}>
                <UpwardChevron />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderMobileTicketsStep = () => {
    let {selectView} = this.props;
    let styles = {
      // TODO: dedup
      ticketsRestriction: {
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: "0.75em",
        lineHeight: "1.2em",
        color: "#7E7E7E"
      },
      // TODO: dedup
      checkoutButton: {
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
        <div style={{margin: "0em 0em 1.5em 0em"}}>
          <div style={styles.ticketsRestriction}>
            A maximum of 10 tickets can be purchased
          </div>
        </div>
        <div style={{margin: "0em 0em 3em 0em"}}>
          {this.renderTicketsGrid()}
        </div>
        <div
          className="row"
          style={styles.checkoutButton}
          onClick={() => selectView(View.Checkout)}>
          Checkout
        </div>
      </>
    );
  };

  renderTicketsPullUp = () => {
    let {pullUpMenuCollapsed, togglePullUpMenu, view} = this.props;
    if (pullUpMenuCollapsed) {
      return this.renderTicketsPullUpCollapsed();
    }

    let modalView;
    switch (view) {
      case View.Tickets:
        modalView = this.renderMobileTicketsStep();
        break;
      case View.Checkout:
        modalView = this.renderMobileCheckoutStep();
        break;
      case View.Complete:
        modalView = this.renderMobileCompleteStep();
        break;
      default:
        throw new Error(`Unhandled view: ${view}`);
    }

    return (
      <div
        style={{
          // Create a 100px white rectangle, so that content does not run
          // under the fixed position pullup menu
          height: "100px",
          backgroundColor: "white"
        }}>
        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%"
          }}>
          <div
            style={{
              height: "4em"
            }}
          />
          <div
            style={{
              boxSizing: "border-box",
              boxShadow: "rgba(0, 0, 0, 0.21) 0 -2px 8px 4px",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "white",
              padding: "1.5em",
              position: "relative"
            }}
            className="column">
            <div style={{position: "absolute", top: "1em", right: "1.5em"}}>
              <DownwardChevron onClick={() => togglePullUpMenu()} />
            </div>
            {modalView}
          </div>
        </div>
      </div>
    );
  };

  renderTicketModal = () => {
    let {view} = this.props;

    let modalView;
    switch (view) {
      case View.Tickets:
        modalView = this.renderDesktopTicketsStep();
        break;
      case View.Checkout:
        modalView = this.renderDesktopCheckoutStep();
        break;
      case View.Complete:
        modalView = this.renderDesktopCompleteStep();
        break;
      default:
        throw new Error(`Unhandled view: ${view}`);
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
    let {byLayout, event} = this.props;
    let imgHeight = byLayout("200px", "300px");
    if (event && event.image_url) {
      return (
        <div
          style={{
            height: imgHeight,
            background: `url(${event.image_url})`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        />
      );
    }
    return <Skeleton height={imgHeight} />;
  };

  renderLoginToggle = () => {
    let {
      byLayout,
      initiateLogin,
      initiateLogout,
      authenticationStatus
    } = this.props;
    let styles = {
      loginAnchor: {
        background: "none",
        border: "none",
        padding: 0,
        marginLeft: byLayout("1.5em", "3em"),
        fontFamily: "Roboto",
        fontSize: "1em",
        lineHeight: "1.2em",
        cursor: "pointer",
        color: "#FF0266"
      }
    };

    switch (authenticationStatus) {
      case AuthenticationStatus.Pending:
        return (
          <div
            className="ellipsis-anim"
            style={{...styles.loginAnchor, fontWeight: "bold" as "bold"}}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        );
      case AuthenticationStatus.NoAuth:
        return (
          <button onClick={() => initiateLogin()} style={styles.loginAnchor}>
            {byLayout("Sign In", "Sign Up/Sign In")}
          </button>
        );
      case AuthenticationStatus.Auth:
        return (
          <button onClick={() => initiateLogout()} style={styles.loginAnchor}>
            Log Out
          </button>
        );
      default:
        throw new Error(
          "Unhandled AuthenticationStatus when generating login link"
        );
    }
  };

  renderHeader = () => {
    let {byLayout} = this.props;
    let styles = {
      header: {
        backgroundColor: "#fff",
        boxShadow: "0px 0px 2px 3px #ccc"
      },
      logo: {
        height: byLayout("2em", "2.6em"),
        cursor: "pointer"
      },
      helpAnchor: {
        color: "#7E7E7E",
        fontFamily: "Roboto",
        fontSize: "1em",
        lineHeight: "1.2em",
        cursor: "pointer",
        textDecoration: "none"
      },
      loginAnchor: {
        background: "none",
        border: "none",
        padding: 0,
        marginLeft: byLayout("1.5em", "3em"),
        fontFamily: "Roboto",
        fontSize: "1em",
        lineHeight: "1.2em",
        cursor: "pointer",
        color: "#FF0266"
      }
    };

    return (
      <div style={styles.header}>
        <div
          style={{
            maxWidth: `${bodyWidth}px`,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            padding: byLayout("1em", "1em 2em"),
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
            <Link to="/help/" style={styles.helpAnchor}>
              Help
            </Link>
            {this.renderLoginToggle()}
          </div>
        </div>
      </div>
    );
  };

  formatEventDate(start: string, end: string) {
    let startMoment = moment(start);
    let endMoment = moment(end);
    if (
      startMoment.month() === endMoment.month() &&
      startMoment.day() === endMoment.day()
    ) {
      return (
        startMoment.format("MMMM Do, h:mmA") +
        " to " +
        endMoment.format("h:mmA")
      );
    }
    return (
      startMoment.format("MMM Do, h:mmA") +
      " to " +
      endMoment.format("MMM Do, h:mmA")
    );
  }

  renderBody = () => {
    let {event, byLayout} = this.props;

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
        ...sharedStyles.eventDetailTitle,
        ...byLayout(sharedStyles.semibold, {})
      },
      eventDetailSubtitle: {
        ...sharedStyles.eventDetailSubtitle,
        ...byLayout({...sharedStyles.semibold, color: pink}, {})
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

    return (
      <div
        style={{
          flex: 1,
          flexDirection: "column",
          display: "flex",
          maxWidth: `${bodyWidth}px`,
          backgroundColor: byLayout("white", "initial"),
          margin: byLayout("0 auto", "0 auto 3em auto")
        }}>
        <div
          className="row"
          style={{
            borderRadius: "5px",
            backgroundColor: "white",
            margin: byLayout("0", "0 0.6em"),
            padding: byLayout("2em 1.5em", "2em 0em 2em 1.5em"),
            alignItems: "flex-start"
          }}>
          <div className="column" style={{flex: 1}}>
            <div style={{margin: "0em 0em 2em 0em"}}>
              <div style={styles.eventTitle}>
                {(event && event.name) || <Skeleton />}
              </div>
              <div style={styles.eventSubTitle}>
                {(event && event.tag_line) || <Skeleton />}
              </div>
            </div>
            <div className="row" style={{marginBottom: "1em"}}>
              {!event ? (
                <div style={{flex: 1}}>
                  <Skeleton height={"2em"} />
                </div>
              ) : (
                <>
                  <img
                    src={calendarIcon}
                    style={styles.calendarIcon}
                    alt="calendar-icon"
                  />
                  <div
                    className="column"
                    style={{marginLeft: "0.8em", flex: 1}}>
                    <div style={styles.eventDetailTitle}>
                      {this.formatEventDate(event.start_time, event.end_time)}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="row" style={{marginBottom: "2em"}}>
              {!event ? (
                <div style={{flex: 1}}>
                  <Skeleton height={"2em"} />
                </div>
              ) : (
                <>
                  <PinpointIcon
                    width={styles.pinpointIcon.width}
                    height={styles.pinpointIcon.height}
                  />
                  <div className="column" style={{marginLeft: "0.8em"}}>
                    <div style={styles.eventDetailTitle}>
                      Radio City Music Hall
                    </div>
                    <div style={styles.eventDetailSubtitle}>
                      {`${event.address.street_address}, ${
                        event.address.city
                      }, ${event.address.state} ${event.address.zip}`}
                    </div>
                  </div>
                </>
              )}
            </div>
            {this.renderEventBodyText()}
          </div>
          {byLayout(null, this.renderTicketModal())}
        </div>
      </div>
    );
  };

  renderEventBodyText = () => {
    let {event, byLayout} = this.props;
    let styles = {
      eventBody: {
        fontFamily: "Rubik",
        fontSize: byLayout("1em", "0.8em"),
        lineHeight: "1.2em",
        color: "#7E7E7E"
      }
    };
    return (
      <div style={styles.eventBody}>
        {!event ? (
          <Skeleton height={100} />
        ) : (
          event.description
            .split("\n")
            .map((paragraph, index) => <p key={index}>{paragraph}</p>)
        )}
      </div>
    );
  };

  render() {
    let {byLayout} = this.props;

    return (
      <div
        className="App"
        style={{
          fontSize: byLayout("14px", "18px"),
          overflowY: "scroll",
          backgroundColor: "#f2f2f2"
        }}>
        {this.renderHeader()}
        {this.renderHero()}
        {this.renderBody()}
        {byLayout(this.renderTicketsPullUp(), null)}
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

export default connect(
  ({root, home}: AppState) => ({
    byLayout: byLayout(root.layout),
    profile: root.profile,
    event: root.event,
    authenticationStatus: root.authenticationStatus,
    pullUpMenuCollapsed: home.pullUpMenuCollapsed,
    view: home.view
  }),
  dispatch => ({
    initiateLogin: initiateLoginAction(dispatch),
    initiateLogout: initiateLogoutAction(dispatch),
    togglePullUpMenu: togglePullUpMenuAction(dispatch),
    selectView: selectViewAction(dispatch)
  })
)(Home);
