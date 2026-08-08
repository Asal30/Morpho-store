import { Container } from "@/components/layout/container";
import { CartView } from "@/features/cart/cart-view";

export default function CartPage() {
  return <main className="py-section-sm"><Container><h1 className="mb-10 font-display text-page-title text-primary">Your cart.</h1><CartView /></Container></main>;
}
