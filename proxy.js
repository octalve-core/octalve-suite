import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export function proxy(req) {
    return withAuth(req, {
        loginPage: "/login",
        publicPaths: ["/", "/login", "/api/auth"],
    });
}

export const config = {
    matcher: [
        // Run on everything but Next internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    ],
};
