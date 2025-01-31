import React from "react";
import {Helmet} from "react-helmet";
import moment from "moment";
import {connect} from "react-redux";
import Skeleton from "react-loading-skeleton";
import {
  CardElement,
  Elements,
  injectStripe,
  PaymentRequestButtonElement,
  ReactStripeElements,
  StripeProvider
} from "react-stripe-elements";
import memoizeOne from "memoize-one";
import ReactMarkdown from "react-markdown";

import {Layout} from "../layout";
import {isFreePurchase} from "../redux/selectors";
import {
    antiFlashWhite,
    black,
    budGreen,
    lavenderGray,
    neonCarrot,
    red,
    trolleyGray,
    vividRaspberry,
    white,
} from "../utils/colors";
import Ellipsis from "../icons/Ellipsis";
import {AppState} from "../redux/store";
import {
  Event,
  FREE_TICKET_PRICE,
  TicketTypeConfig
} from "../redux/reducers/root";
import {
  onTokenCreate as onTokenCreateAction,
  onTokenCreateError as onTokenCreateErrorAction
} from "../redux/stripeSaga";
import {
  addTicket as addTicketAction,
  onCreditCardSubmit as onCreditCardSubmitAction,
  onFreePurchaseSubmit as onFreePurchaseSubmitAction,
  onApplyPromoCode as onApplyPromoCodeAction,
  resetPromoError as resetPromoErrorAction,
  removeTicket as removeTicketAction,
  resetError as resetErrorAction,
  resetPullUpMenu as resetPullUpMenuAction,
  selectView as selectViewAction,
  showPullUpMenu as showPullUpMenuAction,
  someTicketsSelected,
  TicketCounts,
  toNextView as toNextViewAction,
  toPreviousView as toPreviousViewAction,
  totalTicketsSelected,
  View
} from "../redux/reducers/event";
import {byLayout as byLayoutWrapper} from "../layout";
import NavBar from "../UI/NavBar/NavBar";
import Footer from "../UI/Footer";
import calendarIcon from "../assets/calendar_icon.png";
import PinpointIcon from "../icons/pinpointIcon";
import DecrementIcon from "../icons/decrementIcon";
import IncrementIcon from "../icons/incrementIcon";
import CloseIconMobile from "../icons/closeIconMobile";
import BackIconMobile from "../icons/backIconMobile";
import LeftChevron from "../icons/leftChevron";
import UpwardChevron from "../icons/upwardChevron";
import {
    initiateLogin as initiateLoginAction,
    initiateLogout as initiateLogoutAction,
    initiateSpotifyLogin as initiateSpotifyAction,
} from "../redux/auth0Saga";
import {
  feeFormatter,
  pricePreviewFormatter,
  twoDecimalFormatter,
  twoDecimalNoCurrencyFormatter
} from "../utils/formatCurrency";
import minMax from "../utils/minMax";
import {
    MAX_TICKETS,
    TICKET_OVERLAY_WIDTH,
    BODY_WIDTH,
    FONT_6,
    FONT_5,
    FONT_4,
    FONT_3,
    FONT_2,
    FONT_1,
    BUTTON_HEIGHT
} from "../utils/constants";
import {Auth0UserProfile} from "auth0-js";
import SpotifyButton from "../UI/SpotifyButton";
import SkipSpotifyButton from "../UI/SkipSpotifyButton";
import ErrorOverlay from "../UI/ErrorOverlay";

interface AppPropsT {
  layout: Layout;
  byLayout: <A, B>(a: A, b: B) => A | B;
  pullUpMenuCollapsed: boolean;
  initiateSpotifyLogin: () => void;
  addTicket: (ticket: TicketTypeConfig) => void;
  removeTicket: (ticket: TicketTypeConfig) => void;
  resetError: () => void;
  resetPullUpMenu: () => void;
  showPullUpMenu: () => void;
  onTokenCreate: (result: stripe.TokenResponse) => void;
  onTokenCreateError: (err: string) => void;
  onCreditCardSubmit: () => void;
  onFreePurchaseSubmit: () => void;
  onApplyPromoCode: (promoCode: string) => void;
  resetPromoError: () => void;
  selectView: (view: View) => void;
  toPreviousView: () => void;
  toNextView: () => void;
  view: View;
  stripe: stripe.Stripe | null;
  paymentRequest: stripe.paymentRequest.StripePaymentRequest | null;
  canMakePayment: boolean;
  checkoutPending: boolean;
  purchasePending: boolean;
  isFree: boolean;
  ticketsForPurchase: TicketCounts;
  profile?: Auth0UserProfile;
  event?: Event;
  isSpotifyLinked: boolean;
  orderNumber?: string;
  orderSubTotal?: number;
  orderFees?: number;
  orderGrandTotal?: number;
  orderCurrency?: string;
  error?: any;
  promoTicketTypeConfigs: TicketTypeConfig[];
  applyPromoPending: boolean;
  applyPromoError?: string;
}

const baseInputStyle = {
  /* Remove the default input shadow */
  WebkitAppearance: "none" as "none",
  MozAppearance: "none" as "none",
  appearance: "none" as "none",
  border: `solid 1.75px ${lavenderGray}`,
  width: "100%",
  marginBottom: `${FONT_3}px`,
  borderRadius: "5px",
  fontSize: `${FONT_3}px`,
  boxSizing: "border-box" as "border-box"
};

const sharedStyles = {
  mobileInput: {
    ...baseInputStyle,
    padding: "7px"
  },
  desktopInput: {
    ...baseInputStyle,
    padding: "8px"
  },
  dashedLine: {borderBottom: "dashed 4px", color: antiFlashWhite},
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
  buttonInInput: {
    fontSize: `${FONT_3}px`,
    fontWeight: 500,
    lineHeight: "1.2em",
    padding: "0em 1em",
    display: "flex",
    /* Provide a stable width, so that the narrow loading symbol doesn't
     * cause too much visual disruption */
    minWidth: "40px",
    alignItems: "center",
    justifyContent: "center"
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
    height: `${2.2 * FONT_3}px`,
    fontSize: `${FONT_5}px`
  },
  eventSubTitle: {
    fontWeight: 500,
    fontSize: `${FONT_4}px`,
    color: trolleyGray,
    lineHeight: "1.2em"
  },
  eventTitle: {
    fontFamily: "Rubik",
    fontWeight: 700,
    fontSize: `${FONT_6}px`,
    position: "relative" as "relative",
    lineHeight: "1em",
    left: "-2px"
  },
  ticketsRestriction: {
    fontWeight: 500,
    fontSize: `${FONT_2}px`,
    color: trolleyGray
  },
  ticketQuantityColumn: {
    justifySelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 0
  },
  mobileTicketHeader: {
    fontWeight: 500,
    margin: "0em 0em 1em",
    fontSize: `${FONT_4}px`
  },
  paymentOrSeparator: {
    display: "flex",
    justifyContent: "center",
    color: trolleyGray
  },
  checkoutTicketDetails: {
    color: trolleyGray
  },
  payWithCardButton: {
    cursor: "pointer",
    fontFamily: "Roboto",
    border: "none",
    height: BUTTON_HEIGHT,
    backgroundColor: vividRaspberry,
    borderRadius: "5px",
    color: white,
    fontSize: "1em",
    fontWeight: 500,
    justifyContent: "center",
    alignItems: "center"
  },
  disabledCheckoutButton: {
    cursor: "not-allowed",
    backgroundColor: lavenderGray
  },
  iconButton: {
    background: "none",
    color: "inherit",
    border: "none",
    padding: 0,
    font: "inherit",
    outline: "inherit"
  },
  checkoutButton: {
    cursor: "pointer",
    height: BUTTON_HEIGHT,
    flex: `0 0 ${BUTTON_HEIGHT}`,
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
  ticketStepBodyText: {
    fontSize: `${FONT_3}px`,
    fontWeight: 500,
    lineHeight: "1.2em",
    color: trolleyGray
  },
  ticketTitle: {
    fontSize: `${FONT_3}px`,
    overflow: "hidden",
    whiteSpace: "nowrap" as "nowrap",
    textOverflow: "ellipsis" as "ellipsis",
    fontWeight: 500,
    lineHeight: "1.2em",
    color: trolleyGray
  },
  ticketPriceFee: {
    fontSize: `${FONT_1}px`,
    color: trolleyGray,
    lineHeight: "1.2em"
  },
  ticketDescription: {
    fontSize: `${FONT_1}px`,
    lineHeight: "1.2em",
    color: trolleyGray
  },
  ticketPrice: {
    fontWeight: 700,
    fontFamily: "Rubik",
    fontSize: `${FONT_4}px`,
    lineHeight: "1.2em",
    display: "flex"
  },
  ticketNumeral: {
    fontWeight: 700,
    fontFamily: "Rubik",
    fontSize: `${FONT_4}px`,
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
    fontSize: `${FONT_4}px`,
    lineHeight: "1.2em"
  },
  eventDetailTitlePink: {
      marginBottom: "0.2em",
      color: vividRaspberry,
      fontSize: `${FONT_4}px`,
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
          height: `${FONT_3 * 2.5}px`
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
            {showErrors && !cardholderName ? "* This field is required" : ""}
          </span>
        </div>
        <input
          type="text"
          autoComplete="cc-name"
          value={cardholderName}
          onChange={this.onChange}
          placeholder="Name as it appears on card"
          className={byLayout("mobile", "desktop")}
          style={byLayout(sharedStyles.mobileInput, sharedStyles.desktopInput)}
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
              fontSize: `${FONT_3}px`,
              lineHeight: "1.2em",
              color: red
            }}>
            {showErrors && cardElemEmpty ? "* This field is required" : ""}
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
                fontSize: `${FONT_3}px`,
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

export class EventPage extends React.Component<AppPropsT> {
  state = {
    // Storing these values in local state, to lower input latency
      promoCode: "",
      waitListEmail: "",

      emailAddedToWaitlist: false,
      didUserSkipSpotify: false
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
    let isFree = ticketType.price === FREE_TICKET_PRICE;
    let ticketFeeElem;
    if (!isFree) {
      let ticketFee = feeFormatter(
        Number(ticketType.calculated_fee),
        ticketType.currency
      );
      ticketFeeElem = (
        <div
          style={{
            ...sharedStyles.ticketPriceFee,
            ...(soldOut ? {color: lavenderGray} : {}),
            marginBottom: "0.1em"
          }}>
          {`+${ticketFee} fee`}
        </div>
      );
    }
    return (
      <div className="column">
        <div
          style={{
            ...sharedStyles.ticketPrice,
            ...(soldOut ? {color: lavenderGray} : {}),
            marginBottom: "0.1em"
          }}>
          {isFree
            ? "Free"
            : feeFormatter(Number(ticketType.price), ticketType.currency)}
        </div>
        {ticketFeeElem}
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
      amountSelected + 1 <= MAX_TICKETS &&
      amountSelected + 1 <= ticketType.amount_remaining;
    let canDecrement = amountSelected - 1 >= 0;

    return (
      <div
        className="row"
        style={{
          ...sharedStyles.ticketQuantityColumn,
          position: "relative",
          height: "100%"
        }}>
        <DecrementIcon disabled={!canDecrement} />
        <button
          type="button"
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            if (canDecrement) {
              e.nativeEvent.stopPropagation();
              removeTicket(ticketType);
            }
          }}
          style={{
            ...sharedStyles.iconButton,
            cursor: canDecrement ? "pointer" : "not-allowed",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "50%",
            height: "100%"
          }}
        />
        <div
          style={{
            ...sharedStyles.ticketNumeral,
            ...(amountSelected === 0 ? {color: lavenderGray} : {})
          }}>
          {amountSelected}
        </div>
        <IncrementIcon disabled={!canIncrement} />
        <button
          type="button"
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            if (canIncrement) {
              e.nativeEvent.stopPropagation();
              addTicket(ticketType);
            }
          }}
          style={{
            ...sharedStyles.iconButton,
            cursor: canIncrement ? "pointer" : "not-allowed",
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "50%",
            height: "100%"
          }}
        />
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

  renderTicketsGrid = (ticketConfigs: TicketTypeConfig[]) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0,1fr) auto",
          gridColumnGap: "1em",
          gridRowGap: "1em",
          alignItems: "center"
        }}>
        {ticketConfigs.map(item => this.renderTicketGridRow(item))}
      </div>
    );
  };

  renderConditionalCheckoutButton = () => {
    let {toNextView, ticketsForPurchase, checkoutPending} = this.props;
    let disabledCheckout =
      !someTicketsSelected(ticketsForPurchase) || this.ticketSalesNotStarted();
    return this.shouldRenderAddEmailToWaitList() ? null : (
      <div
        className="row"
        style={{
          ...sharedStyles.checkoutButton,
          ...(disabledCheckout ? sharedStyles.disabledCheckoutButton : {})
        }}
        onClick={toNextView}>
        Checkout
        {checkoutPending ? <Ellipsis style={{fontWeight: 700}} /> : null}
      </div>
    );
  };

  renderDesktopTicketsStep = () => {
    let {byLayout} = this.props;
    return (
      <>
        {this.renderDesktopHeader()}
        <div
          style={{
            margin: byLayout("1em", "1.5em 1em")
          }}>
          {this.renderTicketStepBody()}
          {this.renderConditionalCheckoutButton()}
        </div>
      </>
    );
  };

  renderPaymentDelegateView = () => {
    let {
      stripe,
      canMakePayment,
      paymentRequest,
      byLayout,
      isFree,
      purchasePending,
      onFreePurchaseSubmit
    } = this.props;
    if (isFree) {
      return (
        <div className="column">
          <button
            onClick={onFreePurchaseSubmit}
            type="button"
            className="row"
            style={sharedStyles.payWithCardButton}>
            Purchase
            {purchasePending ? <Ellipsis style={{fontWeight: 700}} /> : null}
          </button>
        </div>
      );
    }
    return (
      <>
        {stripe && canMakePayment ? (
          <div style={{margin: "0em 0em 1.5em 0em"}}>
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
              Or enter card details
            </div>
          </div>
        ) : null}
        {this.renderCreditCardForm()}
      </>
    );
  };

  renderCheckoutStepBody = () => {
    let event = this.props.event as Event;
    let showDisclaimer = event.type !== "RESELL";
    let styles = {
      section: {
        margin: "0 0 1.5em 0"
      }
    };

    return (
      <>
        {this.renderCheckoutSummary()}
        {showDisclaimer ? (
          <>
            <div style={styles.section}>
              <div style={sharedStyles.dashedLine} />
            </div>
            <div style={styles.section}>{this.renderCheckoutDisclaimer()}</div>
          </>
        ) : null}
        <div style={styles.section}>
          <div style={sharedStyles.dashedLine} />
        </div>
        {this.renderPaymentDelegateView()}
      </>
    );
  };

  renderDesktopCheckoutStep = () => {
    let {byLayout} = this.props;
    return (
      <>
        {this.renderDesktopHeader()}
        <div style={{margin: byLayout("1em", "1.5em 1em")}}>
          {this.renderCheckoutStepBody()}
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
          fontSize: `${FONT_2}px`
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

  renderMobileCheckoutStep = () => {
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Checkout</div>
        {this.renderCheckoutStepBody()}
      </>
    );
  };

  renderDesktopHeader = () => {
    let {view, event, toPreviousView} = this.props;
    switch (view) {
      case View.Tickets:
        return (
          <div style={sharedStyles.ticketsTitle}>
            <span style={event ? {} : {opacity: 0}}>Foria Passes</span>
          </div>
        );
      case View.Checkout:
        return (
          <div style={{...sharedStyles.ticketsTitle, position: "relative"}}>
            <div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                top: `${FONT_3}px`,
                bottom: `${FONT_3}px`,
                left: `${FONT_3}px`
              }}>
              <LeftChevron />
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: `${3 * FONT_3}px`,
                cursor: "pointer"
              }}
              onClick={toPreviousView}
            />
            <span style={event ? {} : {opacity: 0}}>Checkout</span>
          </div>
        );
      default:
        // case View.Complete:
        return (
          <div style={sharedStyles.ticketsTitle}>
            <span style={event ? {} : {opacity: 0}}>Checkout</span>
          </div>
        );
    }
  };

  renderDesktopCompleteStep = () => {
    let {byLayout} = this.props;
    return (
      <>
        {this.renderDesktopHeader()}
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

    if (!this.props.isSpotifyLinked && !this.state.didUserSkipSpotify) {

      return (
        <>
            <div style={sharedStyles.eventDetailTitlePink}>Would you like more discounts?</div>
            <p style={sharedStyles.eventBody}>We'll send you more discounts that are tailored to your interests</p>
            {SpotifyButton(() => this.props.initiateSpotifyLogin())}
            {SkipSpotifyButton(()=> this.setState({didUserSkipSpotify: true}))}
        </>
      );
    }

    return (
        <>
            <p style={sharedStyles.eventBody}>Thank you for your purchase!</p>
            <p style={sharedStyles.eventBody}>
                Your tickets and receipt will be delivered via email.
            </p>
            <p style={sharedStyles.eventBody}>Have fun!</p>
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

  renderAddEmailToWaitList = () => {
    let {byLayout, profile} = this.props;
    let {waitListEmail, emailAddedToWaitlist} = this.state;
    let event = this.props.event as Event;

    let canSubmit = waitListEmail;
    let buttonInInputStyles = {
      ...sharedStyles.buttonInInput,
      color: !waitListEmail ? trolleyGray : vividRaspberry,
      cursor: canSubmit ? "pointer" : "not-allowed"
    };
    let inputStyles = {
      ...byLayout(sharedStyles.mobileInput, sharedStyles.desktopInput),
      border: `solid 1.75px ${emailAddedToWaitlist ? budGreen : lavenderGray}`,
      margin: 0
    };

    return (
      <div>
        <form
          action="https://foriatickets.us20.list-manage.com/subscribe/post?u=a6b6143a04863843e2f9a34f3&amp;id=241779b337"
          method="post"
          target="_blank"
          noValidate>
          <div style={{position: "relative"}}>
            {emailAddedToWaitlist ? (
              <div style={{color: budGreen, margin: "8px"}}>Email added!</div>
            ) : (
              <>
                <input
                  name="EMAIL"
                  type="email"
                  value={waitListEmail}
                  onChange={e => {
                    this.setState({
                      waitListEmail: e.target.value.trim()
                    });
                  }}
                  placeholder="user@email.com"
                  className={byLayout("mobile", "desktop")}
                  style={inputStyles}
                />
                <div
                  style={{
                    top: 0,
                    right: 0,
                    height: "100%",
                    position: "absolute",
                    display: "flex"
                  }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1
                    }}>
                    <span
                      style={{
                        flex: 1,
                        margin: "8px 0px",
                        width: "2px",
                        backgroundColor: lavenderGray,
                        display: "inline-block"
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      ...buttonInInputStyles,
                      backgroundColor: "transparent",
                      border: "0px",
                      fontFamily: "Roboto"
                    }}
                    onClick={e => {
                      // debugger;
                      if (!canSubmit) {
                        e.preventDefault();
                        return;
                      }

                      // We must defer the setState call, we conditionally
                      // render the inputs, calling setState as usual causes
                      // form submit attempt to be made without inputs
                      setTimeout(
                        () => this.setState({emailAddedToWaitlist: true}),
                        0
                      );
                    }}>
                    <span style={{minWidth: "40px"}}>Send</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "-5000px"
            }}>
            <input
              readOnly
              type="text"
              value={profile?.given_name || ""}
              name="FNAME"
              tabIndex={-1}
            />
            <input
              readOnly
              type="text"
              value={profile?.family_name || ""}
              name="LNAME"
              tabIndex={-1}
            />
            <input
              readOnly
              type="text"
              value={event.id}
              name="EVENTID"
              tabIndex={-1}
            />
            <input
              type="text"
              name="b_a6b6143a04863843e2f9a34f3_241779b337"
              tabIndex={-1}
            />
          </div>
        </form>
      </div>
    );
  };

  // FUTURE TODO this code is nearly identical to the add email to wait list logic, a
  // generic component could be made for an input with a button inside
  renderPromoCode = () => {
    let {
      byLayout,
      onApplyPromoCode,
      applyPromoPending,
      promoTicketTypeConfigs,
      applyPromoError,
      resetPromoError
    } = this.props;
    let {promoCode} = this.state;

    let canSubmit = !applyPromoPending;
    let buttonInInputStyles = {
      ...sharedStyles.buttonInInput,
      color:
        applyPromoError || promoTicketTypeConfigs.length || !promoCode
          ? trolleyGray
          : vividRaspberry,
      cursor: canSubmit ? "pointer" : "not-allowed"
    };
    let inputStyles = {
      ...byLayout(sharedStyles.mobileInput, sharedStyles.desktopInput),
      border: `solid 1.75px ${
        applyPromoError
          ? neonCarrot
          : promoTicketTypeConfigs.length
          ? budGreen
          : lavenderGray
      }`,
      margin: 0
    };

    return (
      <div>
        <div style={{position: "relative"}}>
          {promoTicketTypeConfigs.length ? (
            <div style={{color: budGreen, margin: "8px"}}>
              Promo code applied{" "}
              <span style={{fontWeight: "bold"}}>{promoCode}</span>
            </div>
          ) : (
            <>
              <input
                onKeyDown={(
                  event: React.KeyboardEvent<HTMLDivElement>
                ): void => {
                  if (!canSubmit || event.key !== "Enter") {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  onApplyPromoCode(promoCode);
                }}
                value={promoCode}
                onChange={e => {
                  this.setState({
                    promoCode: e.target.value.trim().toUpperCase()
                  });
                  if (applyPromoError) {
                    resetPromoError();
                  }
                }}
                placeholder="Enter promo code"
                type="text"
                className={byLayout("mobile", "desktop")}
                style={inputStyles}
              />
              <div
                style={{
                  top: 0,
                  right: 0,
                  height: "100%",
                  position: "absolute",
                  display: "flex"
                }}>
                <div
                  style={{display: "flex", flexDirection: "column", flex: 1}}>
                  <span
                    style={{
                      flex: 1,
                      margin: "8px 0px",
                      width: "2px",
                      backgroundColor: lavenderGray,
                      display: "inline-block"
                    }}
                  />
                </div>
                <div
                  style={buttonInInputStyles}
                  onClick={() => canSubmit && onApplyPromoCode(promoCode)}>
                  {applyPromoPending ? (
                    <Ellipsis style={{fontWeight: 700}} />
                  ) : (
                    "Apply"
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {applyPromoError ? (
          <div style={{color: neonCarrot, margin: "8px 0px 0px 8px"}}>
            {applyPromoError}
          </div>
        ) : null}
      </div>
    );
  };

  ticketSalesNotStarted = () => {
    let ticketConfigs = this.getTicketConfigsFromPromo();
    return !ticketConfigs.length;
  };

  shouldRenderAddEmailToWaitList = () => {
    let {event} = this.props;
    let ticketConfigs = this.getTicketConfigsFromPromo();
    let allSoldOut =
      // We assert that there are actually tickets
      ticketConfigs.length &&
      // and that every ticket has NONE remaining
      ticketConfigs.every(t => t.amount_remaining === 0);

    return event?.type === "RESELL" && allSoldOut;
  };

  getTicketConfigsFromPromo = () => {
    // Yield tickets giving precedence to promo code tickets over the tickets
    // on the event
    let {event, promoTicketTypeConfigs} = this.props;
    let ticketConfigs: TicketTypeConfig[] = [];
    if (promoTicketTypeConfigs.length) {
      ticketConfigs = promoTicketTypeConfigs;
    } else if (event?.ticket_type_config?.length) {
      ticketConfigs = event.ticket_type_config;
    }
    return ticketConfigs;
  };

  renderTicketStepBody = () => {
    let {event} = this.props;

    let styles = {
      section: {margin: "0em 0em 1.5em 0em"}
    };

    let ticketConfigs = this.getTicketConfigsFromPromo();
    let availableTickets : number = 0;
    for (const ticketTypeConfig of ticketConfigs) {
        availableTickets += ticketTypeConfig.amount_remaining;
    }
    const maxTickets = Math.min(availableTickets, MAX_TICKETS);

    if (!event) {
      return (
        <>
          <div style={styles.section}>
            <div style={sharedStyles.ticketsRestriction}>
              <Skeleton />
            </div>
          </div>
          <div style={styles.section}>
            <Skeleton />
          </div>
        </>
      );
    } else if (this.shouldRenderAddEmailToWaitList()) {
      return (
        <>
          <div style={styles.section}>
            <p style={sharedStyles.ticketStepBodyText}>
              Unfortunately, no tickets are available.
            </p>
            <p style={sharedStyles.ticketStepBodyText}>
              Drop your email here and we'll let you know when they're
              available!
            </p>
          </div>
          <div style={styles.section}>{this.renderAddEmailToWaitList()}</div>
        </>
      );
    } else if (this.ticketSalesNotStarted()) {
      return (
        <>
          <div style={styles.section}>
            <p style={sharedStyles.ticketStepBodyText}>
                Promotion tickets are available for select Foria fans.
                If you have a promo code, enter it below.
            </p>
              {this.renderPromoCode()}
          </div>
          <p style={sharedStyles.ticketsRestriction}>
              Not a Foria fan? Sign up! We curate the best events for
              you and give you access to exclusive promotions.
          </p>
        </>
      );
    }

    return (
      <>
        <div style={styles.section}>
          <div style={sharedStyles.ticketsRestriction}>
            A maximum of {maxTickets} tickets can be purchased
          </div>
        </div>
        <div style={styles.section}>
          {this.renderTicketsGrid(ticketConfigs)}
        </div>
        <div style={styles.section}>{this.renderPromoCode()}</div>
      </>
    );
  };

  renderMobileTicketsStep = () => {
    return (
      <>
        <div style={sharedStyles.mobileTicketHeader}>Tickets</div>
        {this.renderTicketStepBody()}
      </>
    );
  };

  renderTicketsPullUp = () => {
    let {view} = this.props;

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
    let hideCheckoutButton = view !== View.Tickets;

    return (
      <div className="column" style={{height: "100%", position: "relative"}}>
        {this.renderPullUpMenuHeader()}
        <div
          style={{
            position: "relative",
            borderBottom: `2px solid ${lavenderGray}`
          }}
        />
        <div
          style={{
            width: "100%",
            flex: 1,
            position: "relative"
          }}>
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              backgroundColor: white,
              minHeight: `${4.75 * FONT_3}px`,
              padding: "1.5em 1em 0em 1em",
              position: "relative"
            }}
            className="column">
            {modalView}
          </div>
        </div>
        {hideCheckoutButton ? null : this.renderFixedCheckoutButton()}
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
          right: "-1.5em",
          position: "relative",
          flex: `0 0 ${TICKET_OVERLAY_WIDTH}px`
        }}>
        <div
          style={{
            borderRadius: "5px",
            backgroundColor: white,
            position: "absolute",
            zIndex: 1,
            width: `${TICKET_OVERLAY_WIDTH}px`,
            /* Line up the menu bottom border with the hero bottom border */
            top: `${-5.2 * FONT_3}px`,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
            marginBottom: `${5 * FONT_3}px`
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
            maxWidth: `${BODY_WIDTH}px`,
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

  renderMetadata = () => {
    let {event} = this.props;
    if (event == null) {
      return;
    }

    let eventName: String = event.name ? event.name : "Foria Event Page";
    let description: String = event.name
      ? "Buy your tickets today for " + eventName
      : "Buy your tickets today.";
    let imageUrl: String = event.image_url ? event.image_url : "";

    return (
      <div className="application">
        <Helmet
          title={eventName.toString()}
          meta={[
            {property: "og:type", content: "website"},
            {property: "og:image", content: imageUrl.toString()},
            {property: "og:title", content: eventName.toString()},
            {property: "og:url", content: window.location.href},
            {property: "og:description", content: description.toString()},
            {property: "og:site_name", content: "Foria"},
            {property: "fb:app_id", content: "695063607637402"}
          ]}
        />
      </div>
    );
  };

  renderPullUpMenuHeader = () => {
    let {event, view, resetPullUpMenu, toPreviousView} = this.props;
    let styles = {
      header: {
        position: "relative" as "relative",
        backgroundColor: white,
        display: "inline-block",
        width: "100%"
      }
    };
    let spacer = <div className="column" style={{flex: `0 0 ${FONT_3}px`}} />;
    let leftIcon, rightIcon;
    switch (view) {
      case View.Tickets:
      case View.Complete:
        leftIcon = (
          <span style={{opacity: 0}}>
            <CloseIconMobile />
          </span>
        );
        rightIcon = (
          <div className="column">
            <CloseIconMobile />
            <div
              onClick={resetPullUpMenu}
              style={{
                top: "0",
                right: "0",
                bottom: "0",
                width: `${3 * FONT_3}px`,
                cursor: "pointer",
                position: "absolute"
              }}
            />
          </div>
        );
        break;
      case View.Checkout:
        leftIcon = (
          <div className="column">
            <BackIconMobile />
            <div
              onClick={toPreviousView}
              style={{
                top: "0",
                left: "0",
                bottom: "0",
                width: `${3 * FONT_3}px`,
                cursor: "pointer",
                position: "absolute"
              }}
            />
          </div>
        );
        rightIcon = (
          <span style={{opacity: 0}}>
            <BackIconMobile />
          </span>
        );
        break;
      default:
        throw new Error(`Unhandled view: ${view}`);
    }
    return (
      <div style={styles.header}>
        <div
          style={{
            position: "relative",
            maxWidth: `${BODY_WIDTH}px`,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            padding: `${FONT_3}px`,
            boxSizing: "border-box"
          }}>
          {leftIcon}
          {spacer}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignSelf: "center",
              justifyContent: "center",
              textAlign: "center",
              fontWeight: 500,
              fontSize: `${FONT_4}px`,
              lineHeight: "1.2em"
            }}>
            {(event && event.name) || <Skeleton />}
          </div>
          {spacer}
          {rightIcon}
        </div>
      </div>
    );
  };

  // If isVisualPlaceholder is true, we render a dummy version of the element
  // which is transparent but occupies the same vertical space as the
  // non-dummy version
  renderCheckoutButton = ({
    isVisualPlaceholder
  }: {
    isVisualPlaceholder: boolean;
  }) => {
    let {toNextView, ticketsForPurchase, checkoutPending} = this.props;
    let someSelected = someTicketsSelected(ticketsForPurchase);
    return (
      <div
        style={{
          opacity: isVisualPlaceholder ? 0 : 1,
          boxSizing: "border-box",
          boxShadow: "rgba(0, 0, 0, 0.21) 0 -2px 8px 2px",
          display: "flex",
          backgroundColor: white,
          minHeight: `${4.75 * FONT_3}px`,
          height: "100%",
          padding: "1em",
          position: "relative"
        }}
        className="column">
        <div
          className="row"
          style={{
            ...sharedStyles.checkoutButton,
            ...(!someSelected ? sharedStyles.disabledCheckoutButton : {})
          }}
          onClick={isVisualPlaceholder ? () => {} : toNextView}>
          Checkout
          {checkoutPending ? <Ellipsis style={{fontWeight: 700}} /> : null}
        </div>
      </div>
    );
  };

  renderFixedCheckoutButton = () => {
    return (
      <div>
        {/* Create an empty rectangle so that content doesn't flow behind
         * this fixed button */
        this.renderCheckoutButton({isVisualPlaceholder: true})}
        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%"
          }}>
          {this.renderCheckoutButton({isVisualPlaceholder: false})}
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

  buildGoogleMapsSearchUrl = () => {
    let {event} = this.props;
    if (!event) {
      return "";
    }
    let query = `${event.address.street_address} ${event.address.city}, ${event.address.state} ${event.address.zip}`;
    query = encodeURIComponent(query);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

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
          maxWidth: `${BODY_WIDTH}px`,
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
          <div
            className="column"
            style={{
              overflowX: "hidden",
              flex: 1
            }}>
            <div
              style={{
                padding: "0 4px",
                marginBottom: byLayout("1.5em", "2em")
              }}>
              <div
                style={{
                  ...sharedStyles.eventTitle,
                  marginBottom: `${0.5 * FONT_3}px`,
                  overflowWrap: "break-word"
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
              style={{
                position: "relative",
                marginBottom: byLayout("1.5em", "2em")
              }}>
              <a
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0
                }}
                rel="noopener noreferrer"
                href={this.buildGoogleMapsSearchUrl()}
                target="_blank">
                <span
                  style={sharedStyles.visuallyHiddenButScreenReaderAccessible}>
                  Event location in Google Maps
                </span>
              </a>
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
                      {`${event.address.street_address}, ${event.address.city}, ${event.address.state} ${event.address.zip}`}
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
    let {event} = this.props;
    return (
      <div
        id="eventMarkdown"
        style={{
          ...sharedStyles.eventBody,
          // Force text like (long urls) to break only when a natural break doesn't exist
          overflowWrap: "break-word",
          padding: "0 4px"
        }}>
        {!event ? (
          <Skeleton height={100} />
        ) : (
          <ReactMarkdown skipHtml={true} source={event.description} />
        )}
      </div>
    );
  };

  renderPullUpFooter = () => {
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

    return (
      <div
        style={{
          position: "fixed",
          bottom: "0",
          width: "100%"
        }}>
        <div
          style={{
            boxSizing: "border-box",
            boxShadow: "rgba(0, 0, 0, 0.21) 0 -2px 8px 2px",
            display: "flex",
            backgroundColor: white,
            minHeight: `${4.75 * FONT_3}px`,
            height: "100%",
            padding: "1em",
            position: "relative"
          }}
          className="column">
          {!event ? (
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
          )}
        </div>
      </div>
    );
  };

  renderErrorOverlay() {
      let {error, resetError} = this.props;
      if (!error) {
          return;
      }

      return (<div> {ErrorOverlay(error,resetError)} </div>);
  }

  render() {
    let {layout, error, byLayout, pullUpMenuCollapsed} = this.props;

    let backgroundColor = byLayout(
      // On mobile, we render a white bg behind the pull up menu
      pullUpMenuCollapsed ? antiFlashWhite : white,
      antiFlashWhite
    );

    // On mobile we introduce these styles to prevent the scrolling of the bg
    // content when an error exists (the error modal is rendered in the fg)
    let iosErrorStyles = {
      position: "fixed",
      width: "100%"
    };

    let body = null;
    if (layout === Layout.Desktop) {
      body = (
        <>
          {NavBar(byLayout)}
          {this.renderHero()}
          {this.renderBody()}
          {Footer(byLayout)}
        </>
      );
    } else if (layout === Layout.Mobile && pullUpMenuCollapsed) {
      body = (
        <>
          {NavBar(byLayout)}
          {this.renderHero()}
          {this.renderBody()}
          {Footer(byLayout)}
          {this.renderPullUpFooter()}
        </>
      );
    } else if (layout === Layout.Mobile) {
      body = this.renderTicketsPullUp();
    }

    return (
      <div
        className="App"
        style={{
          fontSize: `${FONT_3}px`,
          fontFamily: "Roboto",
          lineHeight: "1.2em",
          // Mobile cannot have scroll here, because iOS will render a white
          // boundary over the tickets pull up button
          overflowY: byLayout("initial", "auto"),
          // Using vh, so that we can work around the fact that we're not
          // setting the height on all ancester elements
          height: "100vh",
          backgroundColor: backgroundColor,
          position: "relative",
          ...(error ? byLayout(iosErrorStyles, {}) : {})
        }}>
        {this.renderMetadata()}
        {this.renderErrorOverlay()}
        {body}
      </div>
    );
  }
}

let memoizedIsFreePurchase = memoizeOne(isFreePurchase);

export default connect(
  (state: AppState) => {
    let {root, event} = state;
    return {
      layout: root.layout,
      byLayout: byLayoutWrapper(root.layout),
      profile: root.profile,
      isSpotifyLinked: root.isSpotifyLinked,
      stripe: root.stripe,
      paymentRequest: event.paymentRequest,
      canMakePayment: event.canMakePayment,
      event: root.event,
      pullUpMenuCollapsed: event.pullUpMenuCollapsed,
      ticketsForPurchase: event.ticketsForPurchase,
      view: event.view,
      orderNumber: event.orderNumber,
      orderSubTotal: event.orderSubTotal,
      orderFees: event.orderFees,
      orderGrandTotal: event.orderGrandTotal,
      orderCurrency: event.orderCurrency,
      error: event.error,
      checkoutPending: event.checkoutPending,
      purchasePending: event.purchasePending,
      isFree: memoizedIsFreePurchase(state),
      promoTicketTypeConfigs: event.promoTicketTypeConfigs,
      applyPromoPending: event.applyPromoPending,
      applyPromoError: event.applyPromoError
    };
  },
  dispatch => ({
    initiateLogin: initiateLoginAction(dispatch),
    initiateLogout: initiateLogoutAction(dispatch),
    initiateSpotifyLogin: initiateSpotifyAction(dispatch),
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
    onFreePurchaseSubmit: onFreePurchaseSubmitAction(dispatch),
    onApplyPromoCode: onApplyPromoCodeAction(dispatch),
    resetPromoError: resetPromoErrorAction(dispatch),
    resetError: resetErrorAction(dispatch)
  })
)(EventPage);
