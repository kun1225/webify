import 'server-only';

import Stripe from 'stripe';

export function getStripe() {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

	if (!stripeSecretKey) {
		throw new Error('Missing STRIPE_SECRET_KEY at runtime');
	}

	return new Stripe(stripeSecretKey);
}
