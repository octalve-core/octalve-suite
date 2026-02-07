"use client";

import {
  LoginLink as LoginLinkOriginal,
  RegisterLink as RegisterLinkOriginal,
} from "@kinde-oss/kinde-auth-nextjs/components";

// Cast components to any to resolve React 19 type incompatibility
const LoginLink = LoginLinkOriginal as any;
const RegisterLink = RegisterLinkOriginal as any;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <CardTitle className="text-2xl">Octalve Suite</CardTitle>
          </div>
          <CardDescription>
            Sign in to access your project dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" size="lg" asChild>
            <LoginLink postLoginRedirectURL="/dashboard">Sign in</LoginLink>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" size="lg" asChild>
            <RegisterLink postLoginRedirectURL="/dashboard">
              Create an account
            </RegisterLink>
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Secure authentication powered by Kinde
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
