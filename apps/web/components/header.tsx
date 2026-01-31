"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { MenuIcon } from "lucide-react";

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
    <header className="p-4 sticky top-0 bg-background/75 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Image
            src="https://ik.imagekit.io/kxstc2rku/pashucare/veterinary%20ai/main_logo.png?updatedAt=1769840319703"
            width={200}
            height={10}
            alt="pashucare_official_logo"
            className="object-cover"
            priority
          />
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
                    <Image
                      src="https://ik.imagekit.io/kxstc2rku/pashucare/veterinary%20ai/logo.png"
                      width={50}
                      height={50}
                      alt="pashucare_official_logo"
                      className="object-cover"
                    />
                    <h1 className="font-bold">PashuCare AI</h1>
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
