# Project rules

- Keep post-authentication market destinations in `src/lib/authRedirect.ts`, validating same-origin UUID market paths and capturing them when a signed-out visitor opens a market, before intermediate navigation; this prevents open redirects and lost shared-market context through login, signup, or email callbacks.