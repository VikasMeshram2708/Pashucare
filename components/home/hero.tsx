"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Container from "../Container";
import { Video } from "@imagekit/next";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
        <div className="mt-40 h-56 w-56 rounded-full bg-foreground/10 blur-3xl animate-pulse" />
      </div>

      <Container className="py-14 md:py-24">
        {/* Text */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-muted-foreground">
            <SparklesIcon className="size-6 animate-pulse text-amber-500" />
            AI-powered veterinary guidance
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Trusted animal care.
            <br />
            Built for real decisions.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            PashuCare helps pet owners and livestock caretakers make informed,
            responsible decisions with professional AI-assisted veterinary
            guidance — anytime, anywhere.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <SignedIn>
              <Button
                type="button"
                size={"lg"}
                asChild
                variant={"outline"}
                className="rounded-full"
              >
                <Link href="/ai">
                  Start now
                  <ArrowRightIcon />
                </Link>
              </Button>
            </SignedIn>
            <SignedOut>
              <Button size="lg" className="relative gap-2">
                <Link href="/ai" className="relative flex items-center gap-2">
                  <span className="absolute -inset-1 rounded-md bg-foreground/10 blur-md" />
                  <span className="relative">Try PashuCare</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <SignUpButton>Get early access</SignUpButton>
              </Button>
            </SignedOut>
          </div>
        </div>

        {/* Video with hover-only 3D motion */}
        <div className="relative mx-auto mt-20 max-w-6xl perspective-distant">
          <motion.div
            className="
              overflow-hidden rounded-2xl
              border border-border/60
              shadow-xl
              will-change-transform
              bg-black
            "
            initial={{
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              translateZ: 0,
            }}
            whileHover={{
              rotateX: 6,
              rotateY: -5,
              rotateZ: 1,
              translateZ: 16,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              mass: 0.7,
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <Video
              urlEndpoint="https://ik.imagekit.io/kxstc2rku"
              src="/pashucare/veterinary%20ai/hero-video.mp4?updatedAt=1768817811991"
              controls
              className="w-full aspect-video object-cover"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
