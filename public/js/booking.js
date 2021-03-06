/*eslint-disable*/
import axios from 'axios';
import Stripe from 'stripe';
import { showAlert } from './alert';

const stripe = Stripe(process.env.STRIPE_PUB_API_KEY);

export const bookTour = async toudId => {
  try {
    // 1) Get Checkout Session from the API
    const session = await axios({
      url: `/api/v1/bookings/checkout-session/${toudId}`,
    });

    await location.assign(session.data.session.url);
  } catch (error) {
    showAlert('error', error);
  }
};
