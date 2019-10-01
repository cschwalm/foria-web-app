import React, {RefObject} from "react";
import moment from "moment";
import {connect} from "react-redux";
import Skeleton from "react-loading-skeleton";
import {
  StripeProvider,
  CardElement,
  PaymentRequestButtonElement,
  Elements,
  injectStripe,
  ReactStripeElements
} from "react-stripe-elements";

import {
  vividRaspberry,
  red,
  white,
  black,
  lavenderGray,
  trolleyGray,
  antiFlashWhite
} from "./colors";
import appleStoreBadge from "./appleStoreBadge.svg";
import googlePlayBadge from "./googlePlayBadge.png";
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
  onCreditCardSubmit as onCreditCardSubmitAction,
  resetError as resetErrorAction,
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

interface AppPropsT {
  byLayout: <A, B>(a: A, b: B) => A | B;
  pullUpMenuCollapsed: boolean;
  authenticationStatus: AuthenticationStatus;
  initiateLogin: () => void;
  initiateLogout: () => void;
  addTicket: (ticket: TicketTypeConfig) => void;
  removeTicket: (ticket: TicketTypeConfig) => void;
  resetError: () => void;
  resetPullUpMenu: () => void;
  showPullUpMenu: () => void;
  onTokenCreate: (result: stripe.TokenResponse) => void;
  onTokenCreateError: (err: string) => void;
  onCreditCardSubmit: () => void;
  selectView: (view: View) => void;
  toPreviousView: () => void;
  toNextView: () => void;
  view: View;
  stripe: stripe.Stripe | null;
  paymentRequest: stripe.paymentRequest.StripePaymentRequest | null;
  canMakePayment: boolean;
  checkoutPending: boolean;
  purchasePending: boolean;
  ticketsForPurchase: TicketCounts;
  profile?: auth0.Auth0UserProfile;
  event?: Event;
  orderNumber?: string;
  orderSubTotal?: number;
  orderFees?: number;
  orderGrandTotal?: number;
  orderCurrency?: string;
  error?: any;
}

const checkoutButtonHeight = "2.5em";
const font5 = 36;
const font4 = 18;
const font3 = 16;
const font2 = 14;
const font1 = 12;

const sharedStyles = {
  dashedLine: {borderBottom: "dashed 4px", color: antiFlashWhite},
  helpAnchor: {
    color: trolleyGray,
    fontFamily: "Roboto",
    cursor: "pointer",
    textDecoration: "none"
  },
  loginAnchor: {
    background: "none",
    border: "none",
    padding: 0,
    fontFamily: "Roboto",
    fontSize: "1em",
    lineHeight: "1.2em",
    cursor: "pointer",
    color: vividRaspberry
  },
  footerLink: {
    color: trolleyGray,
    fontFamily: "Roboto",
    letterSpacing: "0.4px",
    fontSize: `${font2}px`,
    lineHeight: "1.2em",
    textDecoration: "none",
    backgroundColor: "initial",
    cursor: "pointer"
  },
  copyright: {
    color: trolleyGray,
    fontFamily: "Roboto",
    letterSpacing: "0.4px",
    fontSize: `${font2}px`,
    lineHeight: "1.2em"
  },
  visuallyHiddenButScreenReaderAccessible: {
    height: "1px",
    width: "1px",
    position: "absolute" as "absolute",
    overflow: "hidden",
    top: "-10px"
  },
  eventBody: {
    lineHeight: "1.4em",
    color: trolleyGray
  },
  ticketsTitle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px 5px 0px 0px",
    padding: "1em",
    backgroundColor: antiFlashWhite,
    fontFamily: "Roboto",
    boxSizing: "border-box" as "border-box",
    /* Provide exact height to line up the menu bottom border with the hero bottom border */
    height: "3.2em"
  },
  eventSubTitle: {
    fontWeight: 500,
    fontSize: `${font4}px`,
    color: trolleyGray,
    lineHeight: "1.2em"
  },
  eventTitle: {
    fontFamily: "Rubik",
    fontWeight: 700,
    fontSize: `${font5}px`,
    position: "relative" as "relative",
    lineHeight: "1em",
    left: "-2px"
  },
  ticketsRestriction: {
    fontWeight: 500,
    fontSize: `${font2}px`,
    color: trolleyGray
  },
  ticketQuantityColumn: {
    justifySelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 0
  },
  mobileTicketHeader: {
    color: lavenderGray,
    textTransform: "uppercase" as "uppercase",
    fontWeight: 700,
    margin: "0em 0em 1.5em",
    fontFamily: "Rubik"
  },
  paymentOrSeparator: {
    display: "flex",
    fontFamily: "Rubik",
    justifyContent: "center",
    color: lavenderGray,
    textTransform: "uppercase" as "uppercase",
    fontWeight: 700
  },
  checkoutTicketDetails: {
    color: trolleyGray
  },
  payWithCardButton: {
    cursor: "pointer",
    fontFamily: "Roboto",
    border: "none",
    height: checkoutButtonHeight,
    backgroundColor: vividRaspberry,
    borderRadius: "5px",
    color: white,
    fontSize: "1em",
    fontWeight: 500,
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
    backgroundColor: vividRaspberry,
    borderRadius: "5px",
    color: white,
    fontWeight: 500,
    justifyContent: "center",
    alignItems: "center"
  },
  ticketSoldOut: {
    lineHeight: "1.2em",
    fontWeight: 500,
    flex: 1,
    color: lavenderGray
  },
  ticketTitle: {
    fontSize: `${font3}px`,
    overflow: "hidden",
    whiteSpace: "nowrap" as "nowrap",
    textOverflow: "ellipsis" as "ellipsis",
    fontWeight: 500,
    lineHeight: "1.2em",
    color: trolleyGray
  },
  ticketPriceFee: {
    fontSize: `${font1}px`,
    color: trolleyGray,
    lineHeight: "1.2em"
  },
  ticketDescription: {
    fontSize: `${font1}px`,
    lineHeight: "1.2em",
    color: trolleyGray
  },
  ticketPrice: {
    fontWeight: 700,
    fontFamily: "Rubik",
    fontSize: `${font4}px`,
    lineHeight: "1.2em",
    display: "flex"
  },
  ticketNumeral: {
    fontWeight: 700,
    fontFamily: "Rubik",
    fontSize: `${font4}px`,
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
    background: vividRaspberry,
    borderRadius: "24px",
    color: white,
    fontWeight: 500,
    cursor: "pointer"
  },
  eventDetailSubtitle: {
    lineHeight: "1.2em"
  },
  semibold: {
    fontWeight: 500
  },
  eventDetailTitle: {
    marginBottom: "0.2em",
    fontSize: `${font4}px`,
    lineHeight: "1.2em"
  },
  getTicketsFromForiaApp: {
    color: vividRaspberry,
    fontSize: `${font4}px`,
    lineHeight: "1.2em"
  }
};

function PaymentRequest(props: any) {
  let {canMakePayment, paymentRequest}: any = props;

  return !(canMakePayment && paymentRequest) ? null : (
    <PaymentRequestButtonElement
      className="PaymentRequestButton"
      paymentRequest={paymentRequest}
      style={{
        paymentRequestButton: {
          theme: "dark",
          height: `${font3 * 2.5}px`
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
  | "byLayout"
  | "onTokenCreate"
  | "onTokenCreateError"
  | "purchasePending"
  | "onCreditCardSubmit"
> &
  OptionalStripe;
interface CardFormState {
  cardholderName: string;
  showErrors: boolean;
  cardElemEmpty: boolean;
}

class CardForm extends React.Component<CardFormProps, CardFormState> {
  constructor(props: CardFormProps) {
    super(props);
    this.state = {
      cardholderName: "",
      showErrors: false,
      cardElemEmpty: true
    };
  }

  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    let {cardholderName} = this.state;
    let {
      stripe,
      onTokenCreate,
      onTokenCreateError,
      onCreditCardSubmit,
      purchasePending
    } = this.props;
    if (purchasePending) {
      return;
    }
    if (!cardholderName) {
      this.setState({
        showErrors: true
      });
      return;
    }
    onCreditCardSubmit();
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
    let {cardholderName, showErrors, cardElemEmpty} = this.state;
    let {byLayout, purchasePending} = this.props;

    return (
      <form className="column" onSubmit={this.onSubmit}>
        <div style={{marginBottom: "0.6em"}}>
          <span
            style={{
              fontWeight: 500,
              lineHeight: "1.2em",
              marginBottom: "0.6em"
            }}>
            Cardholder name
          </span>
          <span
            style={{
              marginLeft: "0.2em",
              fontWeight: 500,
              lineHeight: "1.2em",
              color: red
            }}>
            * {showErrors && !cardholderName ? "This field is required" : ""}
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
            border: `solid 1.75px ${lavenderGray}`,
            marginBottom: "1em",
            borderRadius: "5px",
            fontSize: `${font3}px`,
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
              lineHeight: "1.2em",
              marginBottom: "0.6em"
            }}>
            Card details
          </span>
          <span
            style={{
              marginLeft: "0.2em",
              fontWeight: 500,
              fontSize: `${font3}px`,
              lineHeight: "1.2em",
              color: red
            }}>
            * {showErrors && cardElemEmpty ? "This field is required" : ""}
          </span>
        </div>
        <div
          style={{
            border: `solid 1.75px ${lavenderGray}`,
            borderRadius: "5px",
            padding: byLayout("7px", "9px"),
            boxSizing: "border-box",
            marginBottom: "1.5em"
          }}>
          <CardElement
            onChange={this.onCardElementChange}
            style={{
              base: {
                fontSize: `${font3}px`,
                color: black,
                fontFamily: "Roboto, monospace",
                "::placeholder": {
                  color: lavenderGray
                }
              },
              invalid: {
                color: red
              }
            }}
          />
        </div>
        <button
          type="submit"
          className="row"
          style={sharedStyles.payWithCardButton}>
          Purchase
          {purchasePending ? <Ellipsis style={{fontWeight: 700}} /> : null}
        </button>
      </form>
    );
  }
}

const WrappedCardForm = injectStripe(CardForm);

const Ellipsis = ({style = {}}: {style?: React.CSSProperties}) => (
  <div className="ellipsis-anim" style={style}>
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </div>
);

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
    let soldOut = ticketType.amount_remaining === 0;
    return (
      <div className="column">
        <div
          style={{
            ...sharedStyles.ticketTitle,
            ...(soldOut ? {color: lavenderGray} : {}),
            marginBottom: "0.1em"
          }}>
          {ticketType.name}
        </div>
        <div
          style={{
            ...sharedStyles.ticketDescription,
            ...(soldOut ? {color: lavenderGray} : {})
          }}>
          {ticketType.description}
        </div>
      </div>
    );
  };

  renderTicketPriceColumn = (ticketType: TicketTypeConfig) => {
    let soldOut = ticketType.amount_remaining === 0;
    return (
      <div className="column">
        <div
          style={{
            ...sharedStyles.ticketPrice,
            ...(soldOut ? {color: lavenderGray} : {}),
            marginBottom: "0.1em"
          }}>
          {feeFormatter(Number(ticketType.price), ticketType.currency)}
        </div>
        <div
          style={{
            ...sharedStyles.ticketPriceFee,
            ...(soldOut ? {color: lavenderGray} : {}),
            marginBottom: "0.1em"
          }}>
          +
          {feeFormatter(Number(ticketType.calculated_fee), ticketType.currency)}{" "}
          fee
        </div>
      </div>
    );
  };

  renderTicketQuantityColumn = (ticketType: TicketTypeConfig) => {
    let {ticketsForPurchase, addTicket, removeTicket} = this.props;

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
        <div
          style={{
            ...sharedStyles.ticketNumeral,
            ...(amountSelected === 0 ? {color: lavenderGray} : {})
          }}>
          {amountSelected}
        </div>
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
    let {
      event,
      toNextView,
      ticketsForPurchase,
      checkoutPending,
      byLayout
    } = this.props;
    let someSelected = someTicketsSelected(ticketsForPurchase);
    return (
      <>
        <div style={sharedStyles.ticketsTitle}>
          <span style={event ? {} : {opacity: 0}}>Foria Passes</span>
        </div>
        <div
          style={{
            margin: byLayout("1em", "1.5em 1em")
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
            {checkoutPending ? <Ellipsis style={{fontWeight: 700}} /> : null}
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
                      cssSrc: "https://fonts.googleapis.com/css?family=Roboto"
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
    let {event, toPreviousView, byLayout} = this.props;
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
        <div style={{margin: byLayout("1em", "1.5em 1em")}}>
          {this.renderCheckoutSummary()}
          <div style={{margin: "0 0em 1.5em 0em"}}>
            <div style={sharedStyles.dashedLine} />
          </div>
          <div style={{margin: "0 0em 1.5em 0em"}}>
            {this.renderCheckoutDisclaimer()}
          </div>
          <div style={{margin: "0 0em 1.5em 0em"}}>
            <div style={sharedStyles.dashedLine} />
          </div>
          {this.renderPaymentDelegateView()}
        </div>
      </>
    );
  };

  renderCheckoutDisclaimer = () => {
    return (
      <div
        style={{
          ...sharedStyles.checkoutTicketDetails,
          lineHeight: "1.4em",
          fontSize: `${font2}px`
        }}>
        By continuing, I acknowledge that tickets are{" "}
        <span style={{color: black, fontWeight: 500}}>NON-REFUNDABLE</span> and
        that my tickets are delivered via the Foria mobile app. The app is
        available on iOS and Android devices.
      </div>
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
          style={{marginBottom: "0.4em", justifyContent: "space-between"}}>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            Ticket price {totalSelected > 0 ? `(x${totalSelected})` : ""}
          </div>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            {twoDecimalNoCurrencyFormatter(orderSubTotal as number)}
          </div>
        </div>
        <div
          className="row"
          style={{marginBottom: "0.4em", justifyContent: "space-between"}}>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            Service fee
          </div>
          <div style={sharedStyles.checkoutTicketDetails} className="column">
            {twoDecimalNoCurrencyFormatter(orderFees as number)}
          </div>
        </div>
        <div className="row" style={{justifyContent: "space-between"}}>
          <div
            style={{
              ...sharedStyles.checkoutTicketDetails,
              color: black,
              fontWeight: 500
            }}
            className="column">
            Total price
          </div>
          <div
            style={{
              ...sharedStyles.checkoutTicketDetails,
              color: black,
              fontWeight: 500
            }}
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

  renderCreditCardForm = () => {
    let {
      stripe,
      purchasePending,
      byLayout,
      onTokenCreate,
      onTokenCreateError,
      onCreditCardSubmit
    } = this.props;
    return stripe ? (
      <StripeProvider stripe={stripe}>
        <Elements
          fonts={[
            {
              cssSrc: "https://fonts.googleapis.com/css?family=Roboto"
            }
          ]}>
          <WrappedCardForm
            byLayout={byLayout}
            purchasePending={purchasePending}
            onTokenCreate={onTokenCreate}
            onTokenCreateError={onTokenCreateError}
            onCreditCardSubmit={onCreditCardSubmit}
          />
        </Elements>
      </StripeProvider>
    ) : (
      <Skeleton />
    );
  };

  renderDesktopCreditCardCheckoutStep = () => {
    let {byLayout, event, toPreviousView} = this.props;
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
        <div style={{margin: byLayout("1em", "1.5em 1em")}}>
          {this.renderCheckoutSummary()}
          <div style={{margin: "0 0em 1.5em 0em"}}>
            <div style={sharedStyles.dashedLine} />
          </div>
          <div style={{margin: "0 0em 1.5em 0em"}}>
            {this.renderCheckoutDisclaimer()}
          </div>
          <div style={{margin: "0 0em 1.5em 0em"}}>
            <div style={sharedStyles.dashedLine} />
          </div>
          {this.renderCreditCardForm()}
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
          <div style={sharedStyles.dashedLine} />
        </div>
        <div style={{marginBottom: "1.5em"}}>
          {this.renderCheckoutDisclaimer()}
        </div>
        <div style={{marginBottom: "1.5em"}}>
          <div style={sharedStyles.dashedLine} />
        </div>
        {this.renderPaymentDelegateView()}
      </>
    );
  };

  renderMobileCreditCardCheckoutStep = () => {
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Checkout</div>
        {this.renderCheckoutSummary()}
        <div style={{marginBottom: "1.5em"}}>
          <div style={sharedStyles.dashedLine} />
        </div>
        <div style={{margin: "0 0em 1.5em 0em"}}>
          {this.renderCheckoutDisclaimer()}
        </div>
        <div style={{margin: "0 0em 1.5em 0em"}}>
          <div style={sharedStyles.dashedLine} />
        </div>
        {this.renderCreditCardForm()}
      </>
    );
  };

  renderDesktopCompleteStep = () => {
    let {event, byLayout} = this.props;
    return (
      <>
        <div style={sharedStyles.ticketsTitle}>
          <span style={event ? {} : {opacity: 0}}>Checkout</span>
        </div>
        <div
          style={{
            margin: byLayout("1em", "1.5em 1em")
          }}>
          {this.renderCompleteStepBody()}
        </div>
      </>
    );
  };

  renderCompleteStepBody = () => {
    let {orderNumber} = this.props;
    return (
      <>
        <p style={sharedStyles.eventBody}>Thank you for your purchase!</p>
        <p style={sharedStyles.eventBody}>
          Your order number is #{orderNumber as string}
        </p>
        <p style={sharedStyles.getTicketsFromForiaApp}>
            <a
                style={sharedStyles.getTicketsFromForiaApp}
                href="https://foria.app.link/9UDqrSsTi0"
                target="_blank"
                rel="noopener noreferrer">
                Access your tickets in the Foria app
            </a>
        </p>
        <p style={{...sharedStyles.eventBody, marginBottom: "1.5em"}}>
            To ensure authenticity, your tickets are only available in the Foria app. You will not receive tickets
            via email. We recommend that you locate your tickets in-app before the event.
            Once located, the tickets will be saved to your device, and you will not need internet at the event.
            If you haven't located your tickets in-app, for any reason,
            then you must have a government ID that shows the name on your Foria account.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, ${3.375 * 2.5 * font3}px)`,
            gridAutoRows: `minmax(0, ${2.5 * font3}px)`,
            gridColumnGap: "0.6em",
            gridRowGap: "0.6em",
            alignItems: "center"
          }}>
          <a
            style={{
              background: `url('${appleStoreBadge}') no-repeat`,
              backgroundSize: "contain",
              display: "inline-block",
              overflow: "hidden",
              textDecoration: "none",
              width: "100%",
              height: "100%"
            }}
            href="https://apps.apple.com/us/app/foria/id1475421513"
            target="_blank"
            rel="noopener noreferrer">
            <span style={sharedStyles.visuallyHiddenButScreenReaderAccessible}>
              Download the Foria iOS app
            </span>
          </a>
          <a
            style={{
              background: `url('${googlePlayBadge}') no-repeat`,
              backgroundSize: "contain",
              display: "inline-block",
              overflow: "hidden",
              textDecoration: "none",
              width: "100%",
              height: "100%"
            }}
            href="https://play.google.com/store/apps/details?id=com.foriatickets.foria"
            target="_blank"
            rel="noopener noreferrer">
            <span style={sharedStyles.visuallyHiddenButScreenReaderAccessible}>
              Download the Foria Android app
            </span>
          </a>
        </div>
      </>
    );
  };

  renderMobileCompleteStep = () => {
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Checkout</div>
        {this.renderCompleteStepBody()}
      </>
    );
  };

  renderTicketsPriceRange = () => {
    let event = this.props.event!;
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
            lineHeight: "1.2em"
          }}>
          Passes
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
                fontWeight: 500,
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
    let {toNextView, ticketsForPurchase, checkoutPending} = this.props;
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
          {checkoutPending ? <Ellipsis style={{fontWeight: 700}} /> : null}
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
          // Create an empty rectangle the size of the collapsed pull up menu,
          // so that the footer is not hidden beneath the menu
          height: `${5 * font3}px`
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
              boxShadow: "rgba(0, 0, 0, 0.21) 0 -2px 16px 4px",
              display: "flex",
              justifyContent: "center",
              backgroundColor: white,
              minHeight: `${4.75 * font3}px`,
              padding: "1em",
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
                    top: "1em",
                    right: "1em"
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
          right: "-1.5em",
          position: "relative",
          flex: `0 0 ${ticketOverlayWidth}px`
        }}>
        <div
          style={{
            borderRadius: "5px",
            backgroundColor: white,
            position: "absolute",
            width: `${ticketOverlayWidth}px`,
            /* Line up the menu bottom border with the hero bottom border */
            top: `${-5.2 * font3}px`,
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
        ...sharedStyles.loginAnchor,
        marginLeft: byLayout("1.5em", "3em")
      },
      boldLoginAnchor: {
        ...sharedStyles.loginAnchor,
        marginLeft: byLayout("1.5em", "3em"),
        fontWeight: "bold" as "bold"
      }
    };

    switch (authenticationStatus) {
      case AuthenticationStatus.Pending:
        return <Ellipsis style={styles.boldLoginAnchor} />;
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
        backgroundColor: white,
        boxShadow: "0px 0px 2px 3px #ccc"
      },
      logo: {
        height: byLayout("2em", "2.6em"),
        cursor: "pointer"
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
            padding: byLayout("1em", "1em 1.5em"),
            boxSizing: "border-box"
          }}>
          <div
            style={{display: "flex", flex: 1}}
            onClick={() => (window.location.href = "https://foriatickets.com")}>
            <img src={foriaLogo} alt="Foria Logo" style={styles.logo} />
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-end"
            }}>
            <a
              style={sharedStyles.helpAnchor}
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
        color: vividRaspberry,
        ...byLayout({...sharedStyles.semibold}, {})
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
          backgroundColor: byLayout(white, "initial"),
          margin: "0em auto"
        }}>
        <div
          className="row"
          style={{
            borderRadius: "5px",
            backgroundColor: white,
            padding: byLayout("1em", "2em 1.5em"),
            alignItems: "flex-start"
          }}>
          <div className="column" style={{flex: 1}}>
            <div style={{marginBottom: byLayout("1.5em", "2em")}}>
              <div
                style={{
                  ...sharedStyles.eventTitle,
                  marginBottom: `${0.5 * font3}px`
                }}>
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
                  <div style={{flex: "0 0 auto"}}>
                    <img
                      src={calendarIcon}
                      style={styles.calendarIcon}
                      alt="calendar-icon"
                    />
                  </div>
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
            <div
              className="row"
              style={{marginBottom: byLayout("1.5em", "2em")}}>
              {!event ? (
                <div style={{flex: 1}}>
                  <Skeleton height={"2em"} />
                </div>
              ) : (
                <>
                  <div style={{flex: "0 0 auto"}}>
                    <PinpointIcon
                      width={styles.pinpointIcon.width}
                      height={styles.pinpointIcon.height}
                    />
                  </div>
                  <div className="column" style={{marginLeft: "0.8em"}}>
                    <div style={styles.eventDetailTitle}>
                      {event.address.venue_name}
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

  renderFooter = () => {
    let {byLayout} = this.props;

    return (
      <div
        style={{
          flex: 1,
          flexDirection: "column",
          display: "flex",
          maxWidth: `${bodyWidth}px`,
          margin: "0 auto"
        }}>
        <div className="column" style={{margin: byLayout("1em", "2em 1.5em")}}>
          <div className="row" style={{marginBottom: "0.6em"}}>
            <a
              href="https://foriatickets.com/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              style={sharedStyles.footerLink}>
              Privacy Policy
            </a>
            <span
              style={{
                color: trolleyGray,
                fontFamily: "Roboto",
                margin: "0 0.4em"
              }}>
              |
            </span>
            <a
              href="https://foriatickets.com/terms-of-use.html"
              target="_blank"
              rel="noopener noreferrer"
              style={sharedStyles.footerLink}>
              Terms of Use
            </a>
          </div>
          <div style={sharedStyles.copyright}>
            &copy; 2019 Foria Technologies, Inc. All Rights Reserved.
          </div>
        </div>
      </div>
    );
  };

  renderEventBodyText = () => {
    let {event} = this.props;
    return (
      <div style={sharedStyles.eventBody}>
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

  renderErrorOverlay() {
    let {error, resetError} = this.props;
    if (!error) {
      return;
    }
    const styles = {
      container: {
        position: "absolute" as "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      },
      innerContainer: {
        margin: "1em",
        width: ticketOverlayWidth + "px",
        backgroundColor: white,
        padding: "1em",
        borderRadius: "5px",
        borderBottom: `1px solid #B5B5B5`,
        boxShadow: "rgb(199, 199, 199) 0 2px 3px 0px",
        overflow: "hidden"
      },
      headerStyle: {
        fontSize: `${font4}px`,
        marginBottom: "16px",
        lineHeight: "1.2em",
        fontWeight: 600
      },
      body: {
        ...sharedStyles.eventBody,
        color: black,
        marginBottom: "16px",
        overflowWrap: "break-word" as "break-word"
      },
      buttonContainer: {
        ...sharedStyles.checkoutButton,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: black,
        backgroundColor: "#EDEDED"
      }
    };

    let errorMessage: string;
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error.message && typeof error.message === "string") {
      errorMessage = error.message;
    } else {
      errorMessage = JSON.stringify(error);
    }

    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={styles.headerStyle}>Oops!</div>
          <p style={{...styles.body, maxHeight: "150px", overflowY: "auto"}}>
            {errorMessage}
          </p>
          <p style={styles.body}>Please try again.</p>
          <div onClick={resetError} style={styles.buttonContainer}>
            Okay
          </div>
        </div>
      </div>
    );
  }

  render() {
    let {byLayout} = this.props;

    return (
      <div
        className="App"
        style={{
          fontSize: `${font3}px`,
          fontFamily: "Roboto",
          lineHeight: "1.2em",
          overflowY: "scroll",
          backgroundColor: antiFlashWhite
        }}>
        {this.renderHeader()}
        {this.renderHero()}
        {this.renderBody()}
        {this.renderFooter()}
        {byLayout(this.renderTicketsPullUp(), null)}
        {this.renderErrorOverlay()}
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
    orderNumber: home.orderNumber,
    orderSubTotal: home.orderSubTotal,
    orderFees: home.orderFees,
    orderGrandTotal: home.orderGrandTotal,
    orderCurrency: home.orderCurrency,
    error: home.error,
    checkoutPending: home.checkoutPending,
    purchasePending: home.purchasePending
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
    onTokenCreateError: onTokenCreateErrorAction(dispatch),
    onCreditCardSubmit: onCreditCardSubmitAction(dispatch),
    resetError: resetErrorAction(dispatch)
  })
)(Home);
