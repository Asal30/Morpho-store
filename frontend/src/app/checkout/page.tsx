import { Container } from "@/components/layout/container";
import { CheckoutForm } from "@/features/checkout/checkout-form";

export default function CheckoutPage() {
  return <main className="py-section-sm"><Container className="max-w-4xl"><p className="text-caption font-semibold tracking-[0.2em] text-highlight uppercase">Secure order</p><h1 className="mt-3 mb-10 font-display text-page-title text-primary">Checkout.</h1><CheckoutForm /></Container></main>;
}
