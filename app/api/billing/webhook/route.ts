import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.preview',
});

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getPlanNameFromPriceId = (priceId: string): string => {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) return 'pro';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_INSTITUTIONAL) return 'institutional';
  return 'free';
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId) {
          console.error('No user ID found in checkout session');
          break;
        }

        // Retrieve subscription details to get the price ID
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlanNameFromPriceId(priceId);

        const { error } = await supabaseService
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error inserting subscription details:', error);
        } else {
          console.log(`Successfully completed checkout for user ${userId} with plan ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;
        const stripeSubscriptionId = subscription.id;
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlanNameFromPriceId(priceId);

        const { data: subData, error: selectError } = await supabaseService
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', stripeCustomerId)
          .maybeSingle();

        if (selectError || !subData) {
          console.error('No matching subscription found in database for customer ID:', stripeCustomerId);
          break;
        }

        const { error: updateError } = await supabaseService
          .from('subscriptions')
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', subData.user_id);

        if (updateError) {
          console.error('Error updating subscription details:', updateError);
        } else {
          console.log(`Successfully updated subscription for user ${subData.user_id} to plan ${plan}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const { data: subData, error: selectError } = await supabaseService
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', stripeCustomerId)
          .maybeSingle();

        if (selectError || !subData) {
          console.error('No matching subscription found in database for customer ID:', stripeCustomerId);
          break;
        }

        const { error: updateError } = await supabaseService
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            current_period_end: new Date().toISOString(),
          })
          .eq('user_id', subData.user_id);

        if (updateError) {
          console.error('Error deleting subscription details:', updateError);
        } else {
          console.log(`Successfully canceled subscription for user ${subData.user_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe Webhook Handler Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
