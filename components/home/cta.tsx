"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl py-24">
        {/* Parent MUST be relative */}
        <div className="relative rounded-2xl border border-border/60 bg-background/80 p-10 text-center shadow-lg backdrop-blur-md sm:p-16">
          {/* Background gradients */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            {/* Central radial glow */}
            <div
              className="
                absolute left-1/2 top-1/2
                h-130 w-130
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.28),transparent_65%)]
                blur-3xl
                dark:bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.22),transparent_65%)]
              "
            />

            {/* Indigo / purple conic accent */}
            <div
              className="
                absolute -top-32 -right-32
                h-105 w-105
                rounded-full
                bg-[conic-gradient(from_180deg_at_50%_50%,rgba(139,92,246,0.18),rgba(99,102,241,0.14),rgba(139,92,246,0.18))]
                blur-2xl
                opacity-70
              "
            />

            {/* Soft secondary glow (bottom-left) */}
            <div
              className="
                absolute -bottom-40 -left-40
                h-90 w-90
                rounded-full
                bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_70%)]
                blur-3xl
                opacity-60
              "
            />

            {/* Optional grain */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] dark:opacity-[0.05]" />
          </div>

          {/* Content */}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Start making better decisions for your animals
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PashuCare provides calm, responsible AI-assisted veterinary guidance
            to help you understand symptoms, risks, and next steps — for pets
            and livestock alike.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <SignedIn>
              <Button asChild size="lg" className="gap-2">
                <Link href="/ai">
                  Start now
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>

            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="gap-2">
                  Try PashuCare
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </SignUpButton>

              <SignInButton mode="modal">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Free to try · No credit card required · Not a replacement for a
            licensed veterinarian
          </p>
        </div>
      </div>
    </section>
  );
}
