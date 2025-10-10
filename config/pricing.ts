interface Plan {
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
}

const pricingPlans: Plan[] = [
  {
    name: 'Monthly Plan',
    description: 'Perfect for trying out our service with monthly billing.',
    features: [
      'All core features included',
      'Generate unlimited flowcharts',
      'AI-powered article analysis',
      'Export to SVG/PNG',
      'Banner image generation'
    ],
    monthlyPrice: 30000,
    yearlyPrice: 30000
  },
  {
    name: 'Quarterly Plan',
    description: 'Best value for 3 months with flexible commitment.',
    features: [
      'All core features included',
      'Generate unlimited flowcharts',
      'AI-powered article analysis',
      'Export to SVG/PNG',
      'Banner image generation'
    ],
    monthlyPrice: 20000,
    yearlyPrice: 20000
  },
  {
    name: 'Yearly Plan',
    description: 'Maximum savings with annual subscription.',
    features: [
      'All core features included',
      'Generate unlimited flowcharts',
      'AI-powered article analysis',
      'Export to SVG/PNG',
      'Banner image generation'
    ],
    monthlyPrice: 10000,
    yearlyPrice: 10000
  }
];

export default pricingPlans;

import { Tables } from '@/types/db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

export const dummyPricing: ProductWithPrices[] = [
  {
    id: 'dummy-monthly',
    name: 'Monthly Plan',
    description: 'Perfect for trying out our service with monthly billing.',
    prices: [
      {
        id: 'dummy-monthly-price-month',
        currency: 'INR',
        unit_amount: 30000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-monthly',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-monthly-price-year',
        currency: 'INR',
        unit_amount: 30000,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-monthly',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-quarterly',
    name: 'Quarterly Plan',
    description: 'Best value for 3 months with flexible commitment.',
    prices: [
      {
        id: 'dummy-quarterly-price-month',
        currency: 'INR',
        unit_amount: 20000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-quarterly',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-quarterly-price-year',
        currency: 'INR',
        unit_amount: 20000,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-quarterly',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-yearly',
    name: 'Yearly Plan',
    description: 'Maximum savings with annual subscription.',
    prices: [
      {
        id: 'dummy-yearly-price-month',
        currency: 'INR',
        unit_amount: 10000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-yearly',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-yearly-price-year',
        currency: 'INR',
        unit_amount: 10000,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-yearly',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  }
];
