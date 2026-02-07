import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware(req: any) {
    console.log("look at me", req.kindeAuth);
  },
  {
    isReturnToCurrentPage: true,
    loginPage: "/login",
    publicPaths: ["/public", "/more"],
    isAuthorized: ({ token }: { token: any }) => {
      // The user will be considered authorized if they have the permission 'eat:chips'
      // return token?.permissions?.includes("eat:chips");
      return true;
    },
  },
);

export const config = {
  matcher: [
    // "/dashboard",
    // "/dashboard/:path*",
    // "/project",
    // "/phases",
    // "/approvals",
    // "/support",
    // Run on everything but Next internals and static files
    // "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
