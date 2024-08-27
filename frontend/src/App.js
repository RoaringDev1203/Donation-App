import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51PW1l2CGpyMH2Fs7YTwIM30w4rxKpliclHIpIZtOIa5fw7wLKHEHrJoqpkopPcFLC9bdKNYkDMqslqSR4V5YvVyJ00l2M9B2WJ'); // Replace with your actual publishable key

const CheckoutForm = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe.js has not yet loaded.');
      return;
    }

    if (paymentMethod === 'stripe') {
      try {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          console.error('Card Element not found.');
          return;
        }

        console.log('Stripe payment initiated');
        const { error, token } = await stripe.createToken(cardElement);
        if (error) {
          console.error('Stripe Token Error:', error);
          return;
        }

        console.log('Received token:', token);
        const response = await axios.post('/api/stripe-payment', { amount, token: token.id });
        console.log('Stripe Payment Response:', response.data);
      } catch (error) {
        console.error('Stripe Payment Error:', error);
      }
    } else if (paymentMethod === 'paypal') {
      try {
        console.log('PayPal payment initiated');
        const response = await axios.post('/api/paypal-payment', { amount });
        console.log('PayPal Payment Response:', response.data);
        window.location.href = response.data.approvalUrl;
      } catch (error) {
        console.error('PayPal Payment Error:', error);
      }
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        required
      />
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
        <option value="">Select Payment Method</option>
        <option value="stripe">Stripe</option>
        <option value="paypal">PayPal</option>
      </select>
      {paymentMethod === 'stripe' && (
        <div>
          <CardElement />
        </div>
      )}
      <button type="submit">Donate</button>
    </form>
  );
};

const App = () => (
  <Elements stripe={stripePromise}>
    <h1>Donation App</h1>
    <CheckoutForm />
  </Elements>
);

export default App;
