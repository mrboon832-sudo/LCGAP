// Central feature flags configuration
// Toggle flags to enable/disable experimental or temporary behaviors.
// In production, these should come from environment variables or remote config.

const featureFlags = {
  // When true, the app will NOT require email verification for login or dashboard access.
  // Signup will also skip sending the verification email and mark the user verified immediately.
  bypassEmailVerification: true,
};

export default featureFlags;
