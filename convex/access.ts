function getExpectedServerAccessKey() {
  const key = process.env.BETTER_AUTH_SECRET;

  if (!key) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }

  return key;
}

export function assertServerAccess(serverAccessKey?: string) {
  if (serverAccessKey !== getExpectedServerAccessKey()) {
    throw new Error("Unauthorized");
  }
}
