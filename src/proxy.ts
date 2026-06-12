import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth) => {
  // Protect all routes by default. Unauthenticated users will be redirected
  // straight to the Clerk hosted sign-in page.
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
