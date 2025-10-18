"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";
import Link from "next/link";

const Auth = () => {
  const handleGithubAuth = () => {
    // TODO: Implement GitHub OAuth
    console.log("GitHub authentication clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="text-fuchsia-500">Know Your Docs</span>
          </h1>
          <p className="text-muted-foreground">
            Sign in to start exploring your documents
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGithubAuth}
            variant="outline"
            className="w-full h-12 text-base border-border hover:bg-secondary/50 hover:shadow-elegant transition-all duration-300 bg-transparent"
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                By signing in, you agree to our terms
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
