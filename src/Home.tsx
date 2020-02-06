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
import InputMask from "react-input-mask";

import {Layout} from "./layout";
import {isFreePurchase} from "./redux/selectors";
import {
  antiFlashWhite,
  black,
  budGreen,
  lavenderGray,
  neonCarrot,
  red,
  trolleyGray,
  vividRaspberry,
  white
} from "./colors";
import appleStoreBadge from "./appleStoreBadge.svg";
import googlePlayBadge from "./googlePlayBadge.png";
import {AppState} from "./redux/store";
import {
  AuthenticationStatus,
  Event,
  FREE_TICKET_PRICE,
  TicketTypeConfig
} from "./redux/reducers/root";
import {
  onTokenCreate as onTokenCreateAction,
  onTokenCreateError as onTokenCreateErrorAction
} from "./redux/stripeSaga";
import {
  addTicket as addTicketAction,
  onCreditCardSubmit as onCreditCardSubmitAction,
  onFreePurchaseSubmit as onFreePurchaseSubmitAction,
  onApplyPromoCode as onApplyPromoCodeAction,
  onSendMeApp as onSendMeAppAction,
  onBranchPhoneNumberChange as onBranchPhoneNumberChangeAction,
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
import CloseIconMobile from "./closeIconMobile";
import BackIconMobile from "./backIconMobile";
import SendIcon from "./sendIcon";
import LeftChevron from "./leftChevron";
import UpwardChevron from "./upwardChevron";
import {
  feeFormatter,
  pricePreviewFormatter,
  twoDecimalFormatter,
  twoDecimalNoCurrencyFormatter
} from "./formatCurrency";
import minMax from "./minMax";

const ticketOverlayWidth = 385;
const bodyWidth = 960;

interface AppPropsT {
  layout: Layout;
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
  onFreePurchaseSubmit: () => void;
  onApplyPromoCode: (promoCode: string) => void;
  onSendMeApp: () => void;
  onBranchPhoneNumberChange: (phoneNumber: string) => void;
  selectView: (view: View) => void;
  toPreviousView: () => void;
  toNextView: () => void;
  view: View;
  stripe: stripe.Stripe | null;
  paymentRequest: stripe.paymentRequest.StripePaymentRequest | null;
  canMakePayment: boolean;
  checkoutPending: boolean;
  purchasePending: boolean;
  branchSMSPending: boolean;
  isFree: boolean;
  ticketsForPurchase: TicketCounts;
  profile?: auth0.Auth0UserProfile;
  event?: Event;
  orderNumber?: string;
  orderSubTotal?: number;
  orderFees?: number;
  orderGrandTotal?: number;
  orderCurrency?: string;
  error?: any;
  branchPhoneNumber?: string;
  branchLinkSent: boolean;
  promoTicketTypeConfigs: TicketTypeConfig[];
  applyPromoPending: boolean;
  applyPromoError?: string;
}

const font6 = 36;
const font5 = 20;
const font4 = 18;
const font3 = 16;
const font2 = 14;
const font1 = 12;
const checkoutButtonHeight = `${2.5 * font3}px`;

const baseInputStyle = {
  /* Remove the default input shadow */
  WebkitAppearance: "none" as "none",
  MozAppearance: "none" as "none",
  appearance: "none" as "none",
  border: `solid 1.75px ${lavenderGray}`,
  width: "100%",
  marginBottom: `${font3}px`,
  borderRadius: "5px",
  fontSize: `${font3}px`,
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
  promoButtonText: {
    fontSize: `${font3}px`,
    fontWeight: 500,
    lineHeight: "1.2em"
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
    height: `${2.2 * font3}px`,
    fontSize: `${font5}px`
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
    fontSize: `${font6}px`,
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
    fontWeight: 500,
    margin: "0em 0em 1em",
    fontSize: `${font4}px`
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
    height: checkoutButtonHeight,
    flex: `0 0 ${checkoutButtonHeight}`,
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
  ticketSalesNotStarted: {
    fontSize: `${font3}px`,
    fontWeight: 500,
    lineHeight: "1.2em",
    color: trolleyGray
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
              fontSize: `${font3}px`,
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
  state = {
    // Storing this value in local state, to lower input latency
    promoCode: ""
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
      amountSelected + 1 <= 10 &&
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

  renderDesktopTicketsStep = () => {
    let {
      toNextView,
      ticketsForPurchase,
      checkoutPending,
      byLayout
    } = this.props;
    let someSelected = someTicketsSelected(ticketsForPurchase);
    return (
      <>
        {this.renderDesktopHeader()}
        <div
          style={{
            margin: byLayout("1em", "1.5em 1em")
          }}>
          {this.renderTicketStepBody()}
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

  renderDesktopCheckoutStep = () => {
    let {byLayout} = this.props;
    return (
      <>
        {this.renderDesktopHeader()}
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

  renderMobileCheckoutStep = () => {
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
                top: `${font3}px`,
                bottom: `${font3}px`,
                left: `${font3}px`
              }}>
              <LeftChevron />
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: `${3 * font3}px`,
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

  onBranchPhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let {onBranchPhoneNumberChange} = this.props;
    let cleaned = e.target.value;
    if (cleaned) {
      // Remove any non-digits from the number
      cleaned = cleaned.replace(/[^\d]+/g, "");
    }
    onBranchPhoneNumberChange(cleaned);
  };

  renderCompleteStepBody = () => {
    let {
      byLayout,
      orderNumber,
      onSendMeApp,
      branchPhoneNumber,
      branchSMSPending,
      branchLinkSent
    } = this.props;

    let badgeHeight = "42.77px";
    let styles = {
      badgeAnchor: {
        position: "absolute" as "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        textDecoration: "none"
      },
      badgeImg: {display: "block", overflow: "hidden", height: badgeHeight}
    };
    return (
      <>
        <p style={sharedStyles.eventBody}>Thank you for your purchase!</p>
        {byLayout(
          <>
            <p style={sharedStyles.eventBody}>
              Your order number is #{orderNumber as string}
            </p>
            <p style={sharedStyles.getTicketsFromForiaApp}>
              <a
                style={sharedStyles.getTicketsFromForiaApp}
                href={process.env.REACT_APP_BRANCH_LINK}
                target="_blank"
                rel="noopener noreferrer">
                Access your tickets in the Foria app
              </a>
            </p>
          </>,
          <p style={{fontSize: font5}}>Your tickets are in the Foria app</p>
        )}
        <p
          style={{...sharedStyles.eventBody, marginBottom: `${1.5 * font3}px`}}>
          To ensure authenticity, your tickets are only available in the Foria
          app. You will not receive tickets via email. We recommend that you
          locate your tickets in-app before the event. Once located, the tickets
          will be saved to your device, and you will not need internet at the
          event. If you haven't located your tickets in-app, for any reason,
          then you must have a government ID that shows the name on your Foria
          account.
        </p>
        {byLayout(
          null,
          <>
            <p
              style={{
                ...sharedStyles.eventBody,
                marginBottom: `${0.5 * font3}px`
              }}>
              Recieve a one-time SMS to download the app:
            </p>
            <InputMask
              placeholder="Enter phone number"
              mask="+1 (999) 999-9999"
              value={branchPhoneNumber || ""}
              onChange={this.onBranchPhoneNumberChange}>
              {(inputProps: any) => (
                <input
                  {...inputProps}
                  type="text"
                  autoComplete="tel"
                  className={byLayout("mobile", "desktop")}
                  style={byLayout(
                    sharedStyles.mobileInput,
                    sharedStyles.desktopInput
                  )}
                />
              )}
            </InputMask>
            <div
              className="row"
              style={{
                ...sharedStyles.checkoutButton,
                position: "relative",
                marginBottom: `${0.5 * font3}px`,
                fontSize: `${font4}px`
              }}
              onClick={onSendMeApp}>
              {branchLinkSent ? "A link was sent" : "Send me the app"}
              {branchSMSPending ? <Ellipsis style={{fontWeight: 700}} /> : null}
              <div
                style={{
                  position: "absolute",
                  boxSizing: "border-box",
                  /* This padding ultimately determines the height of the svg
                   * in its container, this value was chosen so that the
                   * button text "Send me the app" would have a similar weight
                   * as the stroke of the svg SendIcon*/
                  padding: "11px",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center"
                }}>
                <SendIcon />
              </div>
            </div>
            <p
              style={{
                ...sharedStyles.eventBody,
                marginBottom: `${1.5 * font3}px`,
                textAlign: "center"
              }}>
              Standard messaging rates may apply
            </p>
          </>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}>
          <div style={{position: "relative"}}>
            <img
              alt="Apple App Store download badge"
              src={appleStoreBadge}
              style={styles.badgeImg}
            />
            <a
              style={styles.badgeAnchor}
              href="https://apps.apple.com/us/app/foria/id1475421513"
              target="_blank"
              rel="noopener noreferrer">
              <span
                style={sharedStyles.visuallyHiddenButScreenReaderAccessible}>
                Download the Foria iOS app
              </span>
            </a>
          </div>
          <div style={{marginLeft: `${1.5 * font3}px`, position: "relative"}}>
            <img
              alt="Google Play Store download badge"
              src={googlePlayBadge}
              style={styles.badgeImg}
            />
            <a
              style={styles.badgeAnchor}
              href="https://play.google.com/store/apps/details?id=com.foriatickets.foria"
              target="_blank"
              rel="noopener noreferrer">
              <span
                style={sharedStyles.visuallyHiddenButScreenReaderAccessible}>
                Download the Foria Android app
              </span>
            </a>
          </div>
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

  renderPromoCode = () => {
    let {
      byLayout,
      onApplyPromoCode,
      applyPromoPending,
      promoTicketTypeConfigs,
      applyPromoError
    } = this.props;
    let {promoCode} = this.state;

    let canSubmitPromoCode = !applyPromoPending;
    let applyButtonStyles = {
      ...sharedStyles.promoButtonText,
      color:
        applyPromoError || promoTicketTypeConfigs.length || !promoCode
          ? trolleyGray
          : vividRaspberry,
      padding: "0em 1em",
      display: "flex",
      /* Provide a stable width, so that the narrow loading symbol doesn't
       * cause too much visual disruption */
      minWidth: "40px",
      alignItems: "center",
      justifyContent: "center",
      cursor: canSubmitPromoCode ? "pointer" : "not-allowed"
    };
    let promoInputStyles = {
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
                  if (!canSubmitPromoCode || event.key !== "Enter") {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  onApplyPromoCode(promoCode);
                }}
                value={promoCode}
                onChange={e =>
                  this.setState({
                    promoCode: e.target.value.trim().toUpperCase()
                  })
                }
                placeholder="Enter promo code"
                type="text"
                className={byLayout("mobile", "desktop")}
                style={promoInputStyles}
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
                  style={applyButtonStyles}
                  onClick={() =>
                    canSubmitPromoCode && onApplyPromoCode(promoCode)
                  }>
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

  renderTicketStepBody = () => {
    let {event, promoTicketTypeConfigs} = this.props;

    let ticketConfigs: TicketTypeConfig[] = [];
    // Promo code tickets have precedence to the tickets on the event
    if (promoTicketTypeConfigs.length) {
      ticketConfigs = promoTicketTypeConfigs;
    } else if (event?.ticket_type_config?.length) {
      ticketConfigs = event.ticket_type_config;
    }

    return (
      <>
        <div style={{margin: "0em 0em 1.5em 0em"}}>
          <div style={sharedStyles.ticketsRestriction}>
            {event ? "A maximum of 10 tickets can be purchased" : <Skeleton />}
          </div>
        </div>
        <div style={{margin: "0em 0em 1.5em 0em"}}>
          {event ? (
            ticketConfigs.length ? (
              this.renderTicketsGrid(ticketConfigs)
            ) : (
              <span style={sharedStyles.ticketSalesNotStarted}>
                Public ticket sales have not started yet. If you have a promo
                code, enter it below to access tickets.
              </span>
            )
          ) : (
            <Skeleton />
          )}
        </div>
        <div style={{margin: "0em 0em 1.5em 0em"}}>
          {this.renderPromoCode()}
        </div>
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
              minHeight: `${4.75 * font3}px`,
              padding: "1.5em 1em 0em 1em",
              position: "relative"
            }}
            className="column">
            {modalView}
          </div>
        </div>
        {view === View.Tickets ? this.renderFixedCheckoutButton() : null}
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
          flex: `0 0 ${ticketOverlayWidth}px`
        }}>
        <div
          style={{
            borderRadius: "5px",
            backgroundColor: white,
            position: "absolute",
            zIndex: 1,
            width: `${ticketOverlayWidth}px`,
            /* Line up the menu bottom border with the hero bottom border */
            top: `${-5.2 * font3}px`,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
            marginBottom: `${5 * font3}px`
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

  renderMetadata = () => {
    let {event} = this.props;
    if (event == null) {
      return;
    }

    let eventName: String = event.name ? event.name : "Fora Event Page";
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
              href="https://foriatickets.com/contact-us.html">
              Help
            </a>
            {this.renderLoginToggle()}
          </div>
        </div>
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
    let spacer = <div className="column" style={{flex: `0 0 ${font3}px`}} />;
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
                width: `${3 * font3}px`,
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
                width: `${3 * font3}px`,
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
            maxWidth: `${bodyWidth}px`,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            padding: `${font3}px`,
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
              fontSize: `${font4}px`,
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
          minHeight: `${4.75 * font3}px`,
          height: "100%",
          padding: "1em",
          position: "relative"
        }}
        className="column">
        <div
          className="row"
          style={{
            ...sharedStyles.checkoutButton,
            ...(!someSelected ? sharedStyles.disabledMobileCheckoutButton : {})
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
                  marginBottom: `${0.5 * font3}px`,
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

  renderFooter = () => {
    let {byLayout} = this.props;

    return (
      <div
        style={{
          flex: 1,
          flexDirection: "column",
          display: "flex",
          maxWidth: `${bodyWidth}px`,
          backgroundColor: antiFlashWhite,
          position: "relative",
          margin: "0 auto"
        }}>
        <div
          className="column"
          style={{padding: "0 4px", margin: byLayout("1em", "2em 1.5em")}}>
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
        <div
          style={{
            // Create an empty rectangle the size of the collapsed pull up menu,
            // so that the footer is not hidden beneath the menu
            height: `${5 * font3}px`
          }}
        />
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
            minHeight: `${4.75 * font3}px`,
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
    const styles = {
      container: {
        position: "fixed" as "fixed",
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
          {this.renderHeader()}
          {this.renderHero()}
          {this.renderBody()}
          {this.renderFooter()}
        </>
      );
    } else if (layout === Layout.Mobile && pullUpMenuCollapsed) {
      body = (
        <>
          {this.renderHeader()}
          {this.renderHero()}
          {this.renderBody()}
          {this.renderFooter()}
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
          fontSize: `${font3}px`,
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
        {body}
      </div>
    );
  }
}

let memoizedIsFreePurchase = memoizeOne(isFreePurchase);

export default connect(
  (state: AppState) => {
    let {root, home} = state;
    return {
      layout: root.layout,
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
      purchasePending: home.purchasePending,
      branchSMSPending: home.branchSMSPending,
      isFree: memoizedIsFreePurchase(state),
      branchPhoneNumber: home.branchPhoneNumber,
      branchLinkSent: home.branchLinkSent,
      promoTicketTypeConfigs: home.promoTicketTypeConfigs,
      applyPromoPending: home.applyPromoPending,
      applyPromoError: home.applyPromoError
    };
  },
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
    onFreePurchaseSubmit: onFreePurchaseSubmitAction(dispatch),
    onApplyPromoCode: onApplyPromoCodeAction(dispatch),
    onSendMeApp: onSendMeAppAction(dispatch),
    onBranchPhoneNumberChange: onBranchPhoneNumberChangeAction(dispatch),
    resetError: resetErrorAction(dispatch)
  })
)(Home);
