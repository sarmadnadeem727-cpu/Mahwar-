import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
    apiVersion: '2025-01-27.preview',
  });
  const { searchParams, origin } = new URL(req.url);
  const priceId = searchParams.get('priceId');

  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Check if user already has a Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
      },
    };

    if (subscription?.stripe_customer_id) {
      checkoutSessionParams.customer = subscription.stripe_customer_id;
    } else {
      checkoutSessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(checkoutSessionParams);

    if (session.url) {
      return NextResponse.redirect(session.url);
    }

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Stripe error' }, { status: 500 });
  }
}
