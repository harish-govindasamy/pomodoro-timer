"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Timer,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    description:
      "There is a problem with the server configuration. Please contact support if this issue persists.",
  },
  AccessDenied: {
    title: "Access Denied",
    description:
      "You do not have permission to sign in. This could be because your account is restricted or you need to verify your email.",
  },
  Verification: {
    title: "Verification Error",
    description:
      "The verification link may have expired or already been used. Please request a new verification email.",
  },
  OAuthSignin: {
    title: "OAuth Sign-in Error",
    description:
      "There was a problem signing in with the OAuth provider. Please try again or use a different sign-in method.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description:
      "There was a problem processing the response from the OAuth provider. Please try signing in again.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description:
      "Could not create an account using the OAuth provider. The email may already be in use with a different sign-in method.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description:
      "This email is already associated with another account. Please sign in using your original sign-in method, then link this provider in your settings.",
  },
  EmailCreateAccount: {
    title: "Email Account Creation Failed",
    description:
      "Could not create an account with this email address. It may already be in use.",
  },
  Callback: {
    title: "Callback Error",
    description:
      "There was an error during the authentication process. Please try signing in again.",
  },
  CredentialsSignin: {
    title: "Sign-in Failed",
    description:
      "The email or password you entered is incorrect. Please check your credentials and try again.",
  },
  SessionRequired: {
    title: "Session Required",
    description:
      "You need to be signed in to access this page. Please sign in to continue.",
  },
  Default: {
    title: "Authentication Error",
    description:
      "An unexpected error occurred during authentication. Please try again or contact support if the problem persists.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "Default";
  const errorInfo = errorMessages[errorType] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-destructive/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Timer className="h-8 w-8 text-primary" />
          </div>
          <span className="text-2xl font-bold">Pomofocus</span>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-base">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Code */}
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <span className="text-xs text-muted-foreground">
                Error Code:{" "}
              </span>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {errorType}
              </code>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">What you can try:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check your email and password are correct</li>
                <li>Try a different sign-in method</li>
                <li>Clear your browser cookies and try again</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/auth/signin">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Need help?{" "}
              <Link
                href="mailto:support@pomofocus.io"
                className="text-primary hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
