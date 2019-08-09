import React, {RefObject} from "react";
import moment from "moment";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import {
  StripeProvider,
  CardElement,
  PaymentRequestButtonElement,
  Elements,
  injectStripe,
  ReactStripeElements
} from "react-stripe-elements";

import {AppState} from "./redux/store";
import {
  AuthenticationStatus,
  Event,
  TicketTypeConfig
} from "./redux/reducers/root";
import {
  onTokenCreate as onTokenCreateAction,
  onTokenCreateError as onTokenCreateErrorAction
} from "./redux/stripeSaga";
import {
  addTicket as addTicketAction,
  removeTicket as removeTicketAction,
  resetPullUpMenu as resetPullUpMenuAction,
  showPullUpMenu as showPullUpMenuAction,
  selectView as selectViewAction,
  toPreviousView as toPreviousViewAction,
  toNextView as toNextViewAction,
  someTicketsSelected,
  totalTicketsSelected,
  View,
  TicketCounts
} from "./redux/reducers/home";
import {
  initiateLogin as initiateLoginAction,
  initiateLogout as initiateLogoutAction
} from "./redux/auth0Saga";
import {byLayout as byLayoutWrapper} from "./layout";
import foriaLogo from "./foria_logo.png";
import calendarIcon from "./calendar_icon.png";
import PinpointIcon from "./pinpointIcon";
import DecrementIcon from "./decrementIcon";
import IncrementIcon from "./incrementIcon";
// import DownwardChevron from "./downwardChevron";
import CloseIcon from "./closeIcon";
import LeftChevron from "./leftChevron";
import UpwardChevron from "./upwardChevron";
import {
  pricePreviewFormatter,
  feeFormatter,
  twoDecimalFormatter,
  twoDecimalNoCurrencyFormatter
} from "./formatCurrency";
import minMax from "./minMax";

const ticketOverlayWidth = 385;
const bodyWidth = 960;
const pink = "#FF0266";

interface AppPropsT {
  // TODO can return a more specific type (a | b)
  byLayout: (a: any, b: any) => any;
  pullUpMenuCollapsed: boolean;
  authenticationStatus: AuthenticationStatus;
  initiateLogin: () => void;
  initiateLogout: () => void;
  addTicket: (ticket: TicketTypeConfig) => void;
  removeTicket: (ticket: TicketTypeConfig) => void;
  resetPullUpMenu: () => void;
  showPullUpMenu: () => void;
  onTokenCreate: (result: stripe.TokenResponse) => void;
  onTokenCreateError: (err: string) => void;
  selectView: (view: View) => void;
  toPreviousView: () => void;
  toNextView: () => void;
  view: View;
  stripe: stripe.Stripe | null;
  paymentRequest: stripe.Stripe["paymentRequest"] | null;
  canMakePayment: boolean;
  ticketsForPurchase: TicketCounts;
  profile?: auth0.Auth0UserProfile;
  event?: Event;
  orderSubTotal?: number;
  orderFees?: number;
  orderGrandTotal?: number;
  orderCurrency?: string;
}

const checkoutButtonHeight = "2.5em";

const mobileBaseFont = 16;
const desktopBaseFont = 18;

const sharedStyles = {
  ticketsTitle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px 5px 0px 0px",
    padding: "1em",
    backgroundColor: "#f2f2f2",
    fontFamily: "Roboto",
    fontSize: "1em",
    lineHeight: "1.2em",
    marginBottom: "1em"
  },
  eventSubTitle: {
    fontFamily: "Rubik",
    fontWeight: 500,
    fontSize: "1em",
    lineHeight: "1.2em",
    color: "#7E7E7E"
  },
  eventTitle: {
    fontFamily: "Rubik",
    fontWeight: "bold" as "bold",
    fontSize: "2.0em",
    lineHeight: "1.2em"
  },
  ticketsRestriction: {
    fontFamily: "Rubik",
    fontWeight: 500,
    fontSize: "0.75em",
    lineHeight: "1.2em",
    color: "#7E7E7E"
  },
  ticketQuantityColumn: {
    justifySelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 0
    // overflow: "hidden",
    // whiteSpace: "nowrap" as "nowrap",
    // textOverflow: "ellipsis" as "ellipsis",
  },
  ticketPriceColumn: {},
  ticketDescriptionColumn: {},
  mobileTicketHeader: {
    color: "#c2c2c2",
    textTransform: "uppercase" as "uppercase",
    fontFamily: "Rubik",
    fontWeight: 600,
    margin: "0em 0em 1.5em"
  },
  paymentOrSeparator: {
    display: "flex",
    justifyContent: "center",
    color: "#c2c2c2",
    textTransform: "uppercase" as "uppercase",
    fontFamily: "Rubik",
    fontSize: "1em",
    lineHeight: "1.2em",
    fontWeight: 600
  },
  checkoutTicketDetails: {
    fontFamily: "Rubik",
    fontSize: "0.75em",
    lineHeight: "1.2em",
    color: "#7E7E7E"
  },
  payWithCardButton: {
    // flex: 1,
    cursor: "pointer",
    display: "inline-block",
    border: "none",
    height: checkoutButtonHeight,
    backgroundColor: "#FF0266",
    borderRadius: "5px",
    color: "white",
    fontFamily: "Rubik",
    fontWeight: 500,
    fontSize: "1em",
    lineHeight: "1.2em",
    justifyContent: "center",
    alignItems: "center"
  },
  disabledCheckoutButton: {
    cursor: "not-allowed"
  },
  disabledMobileCheckoutButton: {
    backgroundColor: "#c3c3c3"
  },
  checkoutButton: {
    cursor: "pointer",
    height: checkoutButtonHeight,
    backgroundColor: "#FF0266",
    borderRadius: "5px",
    color: "white",
    fontFamily: "Rubik",
    fontWeight: 500,
    fontSize: "1em",
    lineHeight: "1.2em",
    justifyContent: "center",
    alignItems: "center"
  },
  ticketSoldOut: {
    fontFamily: "Rubik",
    fontWeight: 500,
    fontSize: "1em",
    lineHeight: "1.2em",
    flex: 1,
    opacity: 0.3
  },
  ticketTitle: {
    fontFamily: "Rubik",
    overflow: "hidden",
    whiteSpace: "nowrap" as "nowrap",
    textOverflow: "ellipsis" as "ellipsis",
    fontWeight: 500,
    lineHeight: "1.2em",
    color: "#7E7E7E"
  },
  ticketPriceFee: {
    fontFamily: "Rubik",
    fontSize: "0.6em",
    lineHeight: "1.2em"
  },
  ticketPrice: {
    fontFamily: "Rubik",
    fontWeight: "bold" as "bold",
    fontSize: "1.3em",
    lineHeight: "1.2em",
    display: "flex"
  },
  ticketNumeral: {
    fontFamily: "Rubik",
    fontWeight: "bold" as "bold",
    fontSize: "1.3em",
    lineHeight: "1.2em",
    display: "flex",
    justifyContent: "center",
    width: "2em"
  },
  pullUpMenuTicketsButton: {
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

function PaymentRequest(props: any) {
  let {canMakePayment, paymentRequest, byLayout}: any = props;

  return !(canMakePayment && paymentRequest) ? null : (
    <PaymentRequestButtonElement
      className="PaymentRequestButton"
      paymentRequest={paymentRequest}
      style={{
        paymentRequestButton: {
          // theme: "light-outline",
          theme: "dark",
          // TODO make these computed
          height: byLayout(
            `${mobileBaseFont * 2.5}px`,
            `${desktopBaseFont * 2.5}px`
          )
        }
      }}
    />
  );
}

const WrappedPaymentRequest = injectStripe(PaymentRequest);

interface OptionalStripe {
  stripe?: ReactStripeElements.StripeProps;
}
type CardFormProps = Pick<
  AppPropsT,
  "byLayout" | "onTokenCreate" | "onTokenCreateError"
> &
  OptionalStripe;
interface CardFormState {
  cardholderName: string;
  hasSubmittedOnce: boolean;
  cardElemEmpty: boolean;
}

class CardForm extends React.Component<CardFormProps, CardFormState> {
  constructor(props: CardFormProps) {
    super(props);
    this.state = {
      cardholderName: "",
      hasSubmittedOnce: false,
      cardElemEmpty: true
    };
  }
  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    let {cardholderName} = this.state;
    let {stripe, onTokenCreate, onTokenCreateError} = this.props;
    if (!cardholderName) {
      this.setState({
        hasSubmittedOnce: true
      });
      return;
    }
    (stripe as ReactStripeElements.StripeProps)
      .createToken({name: cardholderName})
      .then(onTokenCreate)
      .catch(onTokenCreateError);
  };
  onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let cardholderName = evt.target.value;
    this.setState({
      cardholderName
    });
  };
  onCardElementChange = (event: stripe.elements.ElementChangeResponse) => {
    this.setState({cardElemEmpty: event.empty});
  };
  render() {
    let {cardholderName, hasSubmittedOnce, cardElemEmpty} = this.state;
    let {byLayout} = this.props;

    return (
      <form className="column" onSubmit={this.onSubmit}>
        <div style={{marginBottom: "0.6em"}}>
          <span
            style={{
              fontWeight: 500,
              fontFamily: "Rubik",
              fontSize: "1em",
              lineHeight: "1.2em",
              marginBottom: "0.6em"
            }}>
            Cardholder name
          </span>
          <span
            style={{
              marginLeft: "0.2em",
              fontWeight: 500,
              fontFamily: "Rubik",
              fontSize: "1em",
              lineHeight: "1.2em",
              color: "red"
            }}>
            *{" "}
            {hasSubmittedOnce && !cardholderName
              ? "This field is required"
              : ""}
          </span>
        </div>
        <input
          type="text"
          autoComplete="cc-name"
          value={cardholderName}
          onChange={this.onChange}
          placeholder="Name as it appears on card"
          className={byLayout("mobile", "desktop")}
          style={{
            /* Remove the default input shadow */
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            border: "solid 1.75px #ddd",
            marginBottom: "1em",
            borderRadius: "5px",
            // Use mobile font size also for desktop, note that the placeholder style fontSize, should agree with this fontSize
            fontSize: `${mobileBaseFont}px`,
            padding: byLayout("7px", "9px"),
            boxSizing: "border-box"
          }}
        />
        <div
          style={{
            marginBottom: "0.6em"
          }}>
          <span
            style={{
              fontWeight: 500,
              fontFamily: "Rubik",
              fontSize: "1em",
              lineHeight: "1.2em",
              marginBottom: "0.6em"
            }}>
            Card details
          </span>
          <span
            style={{
              marginLeft: "0.2em",
              fontWeight: 500,
              fontFamily: "Rubik",
              fontSize: `${mobileBaseFont}px`,
              lineHeight: "1.2em",
              color: "red"
            }}>
            *{" "}
            {hasSubmittedOnce && cardElemEmpty ? "This field is required" : ""}
          </span>
        </div>
        <div
          style={{
            border: "solid 1.75px #ddd",
            borderRadius: "5px",
            padding: byLayout("7px", "9px"),
            boxSizing: "border-box",
            marginBottom: "1.5em"
          }}>
          <CardElement
            onChange={this.onCardElementChange}
            style={{
              base: {
                // Use mobile font size also for desktop
                fontSize: `${mobileBaseFont}px`,
                color: "#424770",
                fontFamily: "Rubik, monospace",
                "::placeholder": {
                  color: "#aab7c4"
                }
              },
              invalid: {
                color: "#9e2146"
              }
            }}
          />
        </div>
        <button
          type="submit"
          className="row"
          style={sharedStyles.payWithCardButton}>
          Purchase
        </button>
      </form>
    );
  }
}

const WrappedCardForm = injectStripe(CardForm);

export class Home extends React.Component<AppPropsT> {
  pullUpMenuRef: RefObject<HTMLDivElement>;
  constructor(props: AppPropsT) {
    super(props);
    this.pullUpMenuRef = React.createRef<HTMLDivElement>();
  }
  componentDidMount() {
    if (this.pullUpMenuRef.current) {
      // Disable scroll behind the pull up menu
      this.pullUpMenuRef.current.addEventListener(
        "touchmove",
        this.disableEvent,
        {passive: false}
      );
    }
  }

  componentWillUnmount() {
    if (this.pullUpMenuRef.current) {
      this.pullUpMenuRef.current.removeEventListener(
        "touchmove",
        this.disableEvent
      );
    }
  }

  disableEvent = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  renderTicketDescriptionColumn = (ticketType: TicketTypeConfig) => {
    let {byLayout} = this.props;
    let soldOut = ticketType.amount_remaining === 0;
    return (
      <div className="column" style={sharedStyles.ticketDescriptionColumn}>
        <div
          style={{
            ...sharedStyles.ticketTitle,
            fontSize: byLayout("1em", "0.8em"),
            opacity: soldOut ? 0.3 : 1
          }}>
          {ticketType.name}
        </div>
        <div
          style={{...sharedStyles.ticketPriceFee, opacity: soldOut ? 0.3 : 1}}>
          {ticketType.description}
        </div>
      </div>
    );
  };

  renderTicketPriceColumn = (ticketType: TicketTypeConfig) => {
    let soldOut = ticketType.amount_remaining === 0;
    return (
      <div
        className="column"
        style={{...sharedStyles.ticketPriceColumn, opacity: soldOut ? 0.3 : 1}}>
        <div style={sharedStyles.ticketPrice}>
          {feeFormatter(Number(ticketType.price), ticketType.currency)}
        </div>
        <div style={sharedStyles.ticketPriceFee}>
          +
          {feeFormatter(Number(ticketType.calculated_fee), ticketType.currency)}{" "}
          fee
        </div>
      </div>
    );
  };

  renderTicketQuantityColumn = (ticketType: TicketTypeConfig) => {
    let {ticketsForPurchase, addTicket, removeTicket} = this.props;
    // TODO, gray out the quantity if it's zero

    let soldOut = ticketType.amount_remaining === 0;
    if (soldOut) {
      return (
        <div className="column" style={sharedStyles.ticketQuantityColumn}>
          <div style={sharedStyles.ticketSoldOut}>Sold Out</div>
        </div>
      );
    }

    let ticketCount = ticketsForPurchase[ticketType.id];
    let amountSelected = ticketCount || 0;
    let canIncrement =
      amountSelected + 1 <= 10 &&
      amountSelected + 1 <= ticketType.amount_remaining;
    let canDecrement = amountSelected - 1 >= 0;

    return (
      <div className="row" style={sharedStyles.ticketQuantityColumn}>
        <div
          style={{
            cursor: canDecrement ? "pointer" : "not-allowed",
            display: "flex",
            flex: 0
          }}>
          <DecrementIcon
            disabled={!canDecrement}
            onClick={() => removeTicket(ticketType)}
          />
        </div>
        <div style={sharedStyles.ticketNumeral}>{amountSelected}</div>
        <div
          style={{
            cursor: canIncrement ? "pointer" : "not-allowed",
            display: "flex",
            flex: 0
          }}>
          <IncrementIcon
            disabled={!canIncrement}
            onClick={() => addTicket(ticketType)}
          />
        </div>
      </div>
    );
  };

  renderTicketGridRow = (ticketType: TicketTypeConfig) => {
    return (
      <React.Fragment key={ticketType.id}>
        {this.renderTicketPriceColumn(ticketType)}
        {this.renderTicketDescriptionColumn(ticketType)}
        {this.renderTicketQuantityColumn(ticketType)}
      </React.Fragment>
    );
  };

  renderTicketsGrid = () => {
    let {event} = this.props;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0,1fr) auto",
          gridColumnGap: "1em",
          gridRowGap: "1em",
          alignItems: "center"
        }}>
        {event ? (
          event.ticket_type_config.map(item => this.renderTicketGridRow(item))
        ) : (
          <Skeleton />
        )}
      </div>
    );
  };

  renderDesktopTicketsStep = () => {
    let {event, toNextView, ticketsForPurchase} = this.props;
    let someSelected = someTicketsSelected(ticketsForPurchase);
    return (
      <>
        <div style={sharedStyles.ticketsTitle}>
          <span style={event ? {} : {opacity: 0}}>Tickets</span>
        </div>
        <div
          style={{
            margin: "1em"
          }}>
          <div style={{margin: "0em 0em 1.5em 0em"}}>
            <div style={sharedStyles.ticketsRestriction}>
              {event ? (
                "A maximum of 10 tickets can be purchased"
              ) : (
                <Skeleton />
              )}
            </div>
          </div>
          <div style={{margin: "0em 0em 1.5em 0em"}}>
            {this.renderTicketsGrid()}
          </div>
          <div
            className="row"
            style={{
              ...sharedStyles.checkoutButton,
              ...(!someSelected ? sharedStyles.disabledCheckoutButton : {})
            }}
            onClick={toNextView}>
            Checkout
          </div>
        </div>
      </>
    );
  };

  renderPaymentDelegateView = () => {
    // If we support more than one payment method, render a view to choose a payment method first
    let {
      selectView,
      stripe,
      canMakePayment,
      paymentRequest,
      byLayout
    } = this.props;
    return (
      <>
        {stripe && canMakePayment ? (
          <>
            <div style={{margin: "0em 0em 1em 0em"}}>
              <StripeProvider stripe={stripe}>
                <Elements
                  fonts={[
                    {
                      cssSrc:
                        "https://fonts.googleapis.com/css?family=Roboto|Rubik:400,500,700&display=swap"
                    }
                  ]}>
                  <WrappedPaymentRequest
                    canMakePayment={canMakePayment}
                    paymentRequest={paymentRequest}
                    byLayout={byLayout}
                  />
                </Elements>
              </StripeProvider>
            </div>
            <div
              style={{...sharedStyles.paymentOrSeparator, marginBottom: "1em"}}>
              Or
            </div>
          </>
        ) : null}
        <div
          className="row"
          style={sharedStyles.checkoutButton}
          onClick={() => selectView(View.CreditCardCheckout)}>
          Pay with card
        </div>
      </>
    );
  };

  renderDesktopChooseCheckoutStep = () => {
    let {event, toPreviousView} = this.props;
    return (
      <>
        <div style={{...sharedStyles.ticketsTitle, position: "relative"}}>
          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              top: "1em",
              bottom: "1em",
              left: "1em"
            }}>
            <LeftChevron />
          </div>
          <div
            style={{
              position: "absolute",
              top: "0em",
              bottom: "0em",
              left: "0em",
              width: "3em",
              cursor: "pointer"
            }}
            onClick={toPreviousView}
          />
          <span style={event ? {} : {opacity: 0}}>Checkout</span>
        </div>
        <div style={{margin: "1em"}}>
          {this.renderCheckoutSummary()}
          <div style={{margin: "0 0em 1.5em 0em"}}>
            <div style={{borderBottom: "dashed 4px", color: "#F2F2F2"}} />
          </div>
          {this.renderPaymentDelegateView()}
        </div>
      </>
    );
  };

  renderCheckoutSummary = () => {
    let {
      ticketsForPurchase,
      orderSubTotal,
      orderFees,
      orderGrandTotal,
      orderCurrency
    } = this.props;
    let totalSelected = totalTicketsSelected(ticketsForPurchase);
    return (
      <div style={{marginBottom: "1.5em"}} className="column">
        <div
          className="row"
          style={{marginBottom: "0.6em", justifyContent: "space-between"}}>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            Ticket price {totalSelected > 0 ? `(x${totalSelected})` : ""}
          </div>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            {twoDecimalNoCurrencyFormatter(orderSubTotal as number)}
          </div>
        </div>
        <div
          className="row"
          style={{marginBottom: "0.6em", justifyContent: "space-between"}}>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            Service fee
          </div>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            {twoDecimalNoCurrencyFormatter(orderFees as number)}
          </div>
        </div>
        <div className="row" style={{justifyContent: "space-between"}}>
          <div
            style={{...sharedStyles.checkoutTicketDetails, color: "black"}}
            className="column">
            Total price
          </div>
          <div
            style={{...sharedStyles.checkoutTicketDetails, color: "black"}}
            className="column">
            {twoDecimalFormatter(
              orderGrandTotal as number,
              orderCurrency as string
            )}
          </div>
        </div>
      </div>
    );
  };

  renderDesktopCreditCardCheckoutStep = () => {
    let {
      stripe,
      byLayout,
      onTokenCreate,
      onTokenCreateError,
      event,
      toPreviousView
    } = this.props;
    return (
      <>
        <div style={{...sharedStyles.ticketsTitle, position: "relative"}}>
          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              top: "1em",
              bottom: "1em",
              left: "1em"
            }}>
            <LeftChevron />
          </div>
          <div
            style={{
              position: "absolute",
              top: "0em",
              bottom: "0em",
              left: "0em",
              width: "3em",
              cursor: "pointer"
            }}
            onClick={toPreviousView}
          />
          <span style={event ? {} : {opacity: 0}}>Checkout</span>
        </div>
        <div style={{margin: "1em"}}>
          {this.renderCheckoutSummary()}
          <div style={{margin: "0 0em 1.5em 0em"}}>
            <div style={{borderBottom: "dashed 4px", color: "#F2F2F2"}} />
          </div>
          {stripe ? (
            <StripeProvider stripe={stripe}>
              <Elements
                fonts={[
                  {
                    cssSrc:
                      "https://fonts.googleapis.com/css?family=Roboto|Rubik:400,500,700&display=swap"
                  }
                ]}>
                <WrappedCardForm
                  byLayout={byLayout}
                  onTokenCreate={onTokenCreate}
                  onTokenCreateError={onTokenCreateError}
                />
              </Elements>
            </StripeProvider>
          ) : (
            /* TODO test this Skeleton */
            <Skeleton />
          )}
        </div>
      </>
    );
  };

  renderMobileChooseCheckoutStep = () => {
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Checkout</div>
        {this.renderCheckoutSummary()}
        <div style={{marginBottom: "1.5em"}}>
          <div style={{borderBottom: "dashed 4px", color: "#F2F2F2"}} />
        </div>
        {this.renderPaymentDelegateView()}
      </>
    );
  };

  renderMobileCreditCardCheckoutStep = () => {
    let {stripe, byLayout, onTokenCreate, onTokenCreateError} = this.props;
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Checkout</div>
        {this.renderCheckoutSummary()}
        <div style={{marginBottom: "1.5em"}}>
          <div style={{borderBottom: "dashed 4px", color: "#F2F2F2"}} />
        </div>
        {stripe ? (
          <StripeProvider stripe={stripe}>
            <Elements
              fonts={[
                {
                  cssSrc:
                    "https://fonts.googleapis.com/css?family=Roboto|Rubik:400,500,700&display=swap"
                }
              ]}>
              <WrappedCardForm
                byLayout={byLayout}
                onTokenCreate={onTokenCreate}
                onTokenCreateError={onTokenCreateError}
              />
            </Elements>
          </StripeProvider>
        ) : (
          /* TODO test this Skeleton */
          <Skeleton />
        )}
      </>
    );
  };

  renderDesktopCompleteStep = () => {
    let event = this.props.event!;
    return (
      <div style={sharedStyles.ticketsTitle}>
        <span style={event ? {} : {opacity: 0}}>Purchase Success</span>
      </div>
    );
  };

  renderMobileCompleteStep = () => {
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Purchase Success</div>
      </>
    );
  };

  renderTicketsPriceRange = () => {
    let event = this.props.event!;
    if (!event.ticket_type_config.length) {
      // TODO add an error boundary to display this to the user in a friendly
      // way
      throw new Error("An error occurred, this event has no available tickets");
    }
    let [minTicketType, maxTicketType] = minMax(
      event.ticket_type_config,
      item => Number(item.price)
    );
    let minAmountStr = pricePreviewFormatter(
      Number(minTicketType.price),
      minTicketType.currency
    );
    let maxAmountStr = pricePreviewFormatter(
      Number(maxTicketType.price),
      maxTicketType.currency
    );
    if (minTicketType === maxTicketType) {
      return minAmountStr;
    }
    return `${minAmountStr} - ${maxAmountStr}`;
  };

  renderTicketsPullUpCollapsed = () => {
    let {showPullUpMenu, event} = this.props;

    let numTickets = event ? event.ticket_type_config.length : 0;
    let showPriceRange = !event || numTickets > 1;
    let ticketsButton = (
      <div
        onClick={showPullUpMenu}
        style={sharedStyles.pullUpMenuTicketsButton}>
        <span
          style={{
            fontSize: "1em",
            lineHeight: "1.2em"
          }}>
          Tickets
        </span>
        <div
          style={{
            fontSize: "0.8em",
            lineHeight: "1.2em",
            marginLeft: "0.6em",
            display: "flex"
          }}>
          <UpwardChevron />
        </div>
      </div>
    );

    return !event ? (
      <Skeleton />
    ) : (
      <div className="row" style={{justifyContent: "center"}}>
        {showPriceRange ? (
          <>
            <div
              style={{
                padding: "0.8em",
                fontFamily: "Rubik",
                fontWeight: 500,
                fontSize: "1em",
                lineHeight: "1.2em",
                marginRight: "1em"
              }}>
              {this.renderTicketsPriceRange()}
            </div>
            {ticketsButton}
          </>
        ) : (
          ticketsButton
        )}
      </div>
    );
  };

  renderMobileTicketsStep = () => {
    let {toNextView, ticketsForPurchase} = this.props;
    let someSelected = someTicketsSelected(ticketsForPurchase);
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Tickets</div>
        <div style={{margin: "0em 0em 1.5em 0em"}}>
          <div style={sharedStyles.ticketsRestriction}>
            A maximum of 10 tickets can be purchased
          </div>
        </div>
        <div style={{margin: "0em 0em 2em 0em"}}>
          {this.renderTicketsGrid()}
        </div>
        <div
          className="row"
          style={{
            ...sharedStyles.checkoutButton,
            ...(!someSelected ? sharedStyles.disabledMobileCheckoutButton : {})
          }}
          onClick={toNextView}>
          Checkout
        </div>
      </>
    );
  };

  renderTicketsPullUp = () => {
    let {pullUpMenuCollapsed, resetPullUpMenu, view} = this.props;

    let modalView;
    switch (view) {
      case View.Tickets:
        modalView = this.renderMobileTicketsStep();
        break;
      case View.ChooseCheckout:
        modalView = this.renderMobileChooseCheckoutStep();
        break;
      case View.CreditCardCheckout:
        modalView = this.renderMobileCreditCardCheckoutStep();
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
          ref={this.pullUpMenuRef}
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
            {pullUpMenuCollapsed ? (
              this.renderTicketsPullUpCollapsed()
            ) : (
              <>
                <div
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    top: "1.5em",
                    right: "1.5em"
                  }}>
                  <CloseIcon onClick={resetPullUpMenu} />
                </div>
                {modalView}
              </>
            )}
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
      case View.ChooseCheckout:
        modalView = this.renderDesktopChooseCheckoutStep();
        break;
      case View.CreditCardCheckout:
        modalView = this.renderDesktopCreditCardCheckoutStep();
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
            maxWidth: `${bodyWidth}px`,
            margin: "0 auto",
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
            <a
              style={styles.helpAnchor}
              href="https://foriatickets.zendesk.com/hc/en-us">
              Help
            </a>
            {this.renderLoginToggle()}
          </div>
        </div>
      </div>
    );
  };

  formatCheckoutEventDate(start: string, end: string) {
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
    return startMoment.format("MMM Do") + " - " + endMoment.format("MMM Do");
  }
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
            padding: byLayout("2em 1.5em", "2em 0em 2em 1.5em"),
            alignItems: "flex-start"
          }}>
          <div className="column" style={{flex: 1}}>
            <div style={{margin: "0em 0em 2em 0em"}}>
              <div style={sharedStyles.eventTitle}>
                {(event && event.name) || <Skeleton />}
              </div>
              <div style={sharedStyles.eventSubTitle}>
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
          fontSize: byLayout(`${mobileBaseFont}px`, `${desktopBaseFont}px`),
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

export default connect(
  ({root, home}: AppState) => ({
    byLayout: byLayoutWrapper(root.layout),
    profile: root.profile,
    stripe: root.stripe,
    paymentRequest: home.paymentRequest,
    canMakePayment: home.canMakePayment,
    event: root.event,
    authenticationStatus: root.authenticationStatus,
    pullUpMenuCollapsed: home.pullUpMenuCollapsed,
    ticketsForPurchase: home.ticketsForPurchase,
    view: home.view,
    orderSubTotal: home.orderSubTotal,
    orderFees: home.orderFees,
    orderGrandTotal: home.orderGrandTotal,
    orderCurrency: home.orderCurrency
  }),
  dispatch => ({
    initiateLogin: initiateLoginAction(dispatch),
    initiateLogout: initiateLogoutAction(dispatch),
    addTicket: addTicketAction(dispatch),
    removeTicket: removeTicketAction(dispatch),
    resetPullUpMenu: resetPullUpMenuAction(dispatch),
    showPullUpMenu: showPullUpMenuAction(dispatch),
    selectView: selectViewAction(dispatch),
    toPreviousView: toPreviousViewAction(dispatch),
    toNextView: toNextViewAction(dispatch),
    onTokenCreate: onTokenCreateAction(dispatch),
    onTokenCreateError: onTokenCreateErrorAction(dispatch)
  })
)(Home);
