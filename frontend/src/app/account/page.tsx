import { Container } from "@/components/layout/container";
import { AccountForm } from "@/features/account/account-form";

export default function AccountPage() {
  return <main className="py-section-sm"><Container><header className="mx-auto mb-10 max-w-xl"><p className="text-caption font-semibold tracking-[0.2em] text-highlight uppercase">MORPHO account</p><h1 className="mt-3 font-display text-page-title text-primary">Continue your story.</h1></header><AccountForm /></Container></main>;
}
