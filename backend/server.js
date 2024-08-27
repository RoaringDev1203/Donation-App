require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

paypal.configure({
  mode: 'sandbox', // or 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Stripe Payment Endpoint
app.post('/api/stripe-payment', async (req, res) => {
  const { amount, token } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount: amount * 100, // Amount in cents
      currency: 'usd',
      source: token,
      description: 'Donation'
    });
    res.status(200).json(charge);
  } catch (error) {
    console.error('Stripe Payment Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PayPal Payment Endpoint
app.post('/api/paypal-payment', (req, res) => {
  const { amount } = req.body;

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel'
    },
    transactions: [{
      item_list: {
        items: [{
          name: 'Donation',
          sku: '001',
          price: amount,
          currency: 'USD',
          quantity: 1
        }]
      },
      amount: {
        currency: 'USD',
        total: amount
      },
      description: 'Donation to Charity'
    }]
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error('PayPal Payment Error:', error.response);
      res.status(500).json({ error: error.response });
    } else {
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
      res.status(200).json({ approvalUrl });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
