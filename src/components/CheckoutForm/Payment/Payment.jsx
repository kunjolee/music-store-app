import { useDispatch, useSelector } from "react-redux";

import {
  Elements,
  CardElement,
  ElementsConsumer,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import "./Payment.css";
import Review from "./Review";

import { backStep, nextStep } from "../../../actions/checkoutActions";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Payment = ({ handleCaptureCheckout }) => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const { shippingData, token } = state.checkout;

  const handleSubmit = async (e, elements, stripe) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.log(error);
    } else {
      const orderData = {
        line_items: token.live.line_items,
        customer: {
          firstname: shippingData.firstname,
          lastname: shippingData.lastname,
          email: shippingData.email,
        },
        shipping: {
          name: "Primary",
          street: shippingData.address1,
          town_city: shippingData.city,
          county_state: shippingData.shippingSubdivision,
          postal_zip_code: shippingData.zip,
          country: shippingData.shippingCountry,
        },
        fulfillment: { shipping_method: shippingData.shippingOption },
        payment: {
          gateway: "stripe",
          stripe: {
            payment_method_id: paymentMethod.id,
          },
        },
      };

      handleCaptureCheckout(token.id, orderData);
      dispatch(nextStep(1));
    }
  };

  return (
    <>
      <Review />
      <hr />
      <h3 className="music__payment_title">Payment Method</h3>
      <Elements stripe={stripePromise}>
        <ElementsConsumer>
          {({ elements, stripe }) => (
            <form onSubmit={(e) => handleSubmit(e, elements, stripe)}>
              <CardElement />
              <br />
              <br />
              <div className="music__payment_buttons">
                <input
                  type="button"
                  className="btn-style"
                  value="Back"
                  onClick={() => dispatch(backStep(1))}
                />
                <input
                  type="submit"
                  value="Pay"
                  disabled={!stripe}
                  className="btn-style"
                />
              </div>
            </form>
          )}
        </ElementsConsumer>
      </Elements>
    </>
  );
};
export default Payment;
