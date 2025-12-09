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
import { Timer, Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResendEmail = async () => {
    // TODO: Implement resend verification email
    console.log("Resending verification email to:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
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
              <div className="p-4 bg-primary/10 rounded-full animate-pulse">
                <Mail className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Check your email
            </CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent you a verification link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email Display */}
            {email && (
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Verification email sent to:
                </p>
                <p className="font-medium">{email}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Click the link in the email to verify your account and complete
                your registration.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> If you don&apos;t see the email, check
                  your spam or junk folder.
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Next steps:</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Find the email from Pomofocus</li>
                <li>Click the verification link</li>
                <li>Start tracking your productivity!</li>
              </ol>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            {/* Resend Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend verification email
            </Button>

            {/* Back to Sign In */}
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </Button>

            {/* Help Text */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Wrong email?{" "}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline"
              >
                Sign up again
              </Link>{" "}
              with a different address.
            </p>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Having trouble?{" "}
          <Link
            href="mailto:support@pomofocus.io"
            className="text-primary hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
