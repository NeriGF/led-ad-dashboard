// src/pages/api/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/lib/firebase'; // ✅ make sure this path is correct
import { collection, addDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Ad Slot (Preview Plan)',
            },
            unit_amount: 299, // $2.99
          },
          quantity: 1,
        },
      ],
      // ✅ This is where session_id gets passed in URL
      success_url: `${req.headers.origin}/upload?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    // ✅ OPTIONAL: Save Stripe session ID to Firestore
    await addDoc(collection(db, 'stripe_sessions'), {
      sessionId: session.id,
      createdAt: new Date(),
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
}
