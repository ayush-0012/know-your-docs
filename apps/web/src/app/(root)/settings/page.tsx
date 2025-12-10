"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {/* Profile Settings */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
            <CardDescription className="text-neutral-400">
              View your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-200">
                Name
              </Label>
              <Input
                id="name"
                value={session.user.name || ""}
                disabled
                className="bg-neutral-800 border-neutral-700 text-neutral-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={session.user.email || ""}
                disabled
                className="bg-neutral-800 border-neutral-700 text-neutral-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Preferences</CardTitle>
            <CardDescription className="text-neutral-400">
              Manage your application preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-400">
              More settings coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
