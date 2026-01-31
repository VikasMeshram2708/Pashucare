"use client";

import { Image, ImageKitProvider } from "@imagekit/next";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const navLinks = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "#",
      label: "Chat",
    },
    {
      href: "#",
      label: "Contact Us",
    },
  ] as const;
  return (
    <header className="p-4 sticky top-0 bg-background/75 backdrop-blur-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <LogoFn />
        </Link>
        <nav className="hidden lg:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.label}>
              <span className="text-sm hover:text-primary hover:underline hover:underline-offset-8 transition-colors duration-300">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
        {/* mobile nav */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"ghost"}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center">
                    <LogoFn />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="p-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link href={link.href} key={link.label}>
                    <span className="text-sm">{link.label}</span>
                  </Link>
                ))}
              </nav>
              <SheetFooter>
                <Unauthenticated>
                  <Button asChild variant={"link"}>
                    <SignInButton />
                    Sign In
                  </Button>
                  <Button asChild>
                    <SignUpButton />
                    Sign Up
                  </Button>
                </Unauthenticated>
                <Authenticated>
                  <UserButton />
                </Authenticated>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Unauthenticated>
            <Button asChild variant={"link"}>
              <SignInButton />
              Sign In
            </Button>
            <Button asChild>
              <SignUpButton />
              Sign Up
            </Button>
          </Unauthenticated>
          <Authenticated>
            <UserButton />
          </Authenticated>
        </div>
      </div>
    </header>
  );
}

function LogoFn({ className }: { className?: string }) {
  const urlEndpoint = "https://ik.imagekit.io/kxstc2rku";
  return (
    <div>
      <ImageKitProvider urlEndpoint={urlEndpoint}>
        <Image
          src="/pashucare/veterinary%20ai/main_logo.png?updatedAt=1769840319703"
          width={200}
          height={10}
          alt="Picture of the author"
          className={cn("object-cover w-28 md:w-52 h-auto", className)}
        />
      </ImageKitProvider>
    </div>
  );
}
