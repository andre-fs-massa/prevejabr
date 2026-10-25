# Project rules

- Keep post-authentication market destinations in `src/lib/authRedirect.ts`, validating same-origin UUID market paths and preserving them through email confirmation; this prevents open redirects and lost shared-market context.