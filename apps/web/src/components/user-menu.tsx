import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <Link href="/auth">Sign In</Link>
      </Button>
    );
  }

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-neutral-800 cursor-pointer select-none"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-10 w-10 rounded-full object-cover select-none"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium text-sm select-none">
              {getInitials(session.user.name || "U")}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-neutral-800 border-neutral-700"
        align="end"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-neutral-400">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-700" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-neutral-700 focus:bg-neutral-700 text-neutral-200"
          asChild
        >
          <Link href={"/settings" as any}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-700" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-neutral-700 focus:bg-neutral-700 text-red-400 focus:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
