export function assertIsolatedConfig(config) {
  const sections = config.split(/\n(?=\[)/);
  const apiSection = sections.find((section) => section.startsWith("[api]\n")) ?? "";
  const dbSection = sections.find((section) => section.startsWith("[db]\n")) ?? "";
  const authSection = sections.find((section) => section.startsWith("[auth]\n")) ?? "";
  if (!/^project_id = "SmartPointsE2E"$/m.test(config) || !/^port = 55321$/m.test(apiSection) || !/^port = 55322$/m.test(dbSection) || !/^site_url = "http:\/\/127\.0\.0\.1:3100"$/m.test(authSection)) {
    throw new Error("Refusing E2E database operation: expected the dedicated SmartPointsE2E project and local-only ports.");
  }
  if (!/^enable_confirmations = false$/m.test(config)) throw new Error("E2E Auth must disable email confirmations.");
}

export function assertLocalApiUrl(value, expectedPort = 55321) {
  const url = new URL(value);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || Number(url.port) !== expectedPort || url.username || url.password || url.pathname !== "/") {
    throw new Error(`Refusing E2E target: expected loopback HTTP port ${expectedPort}.`);
  }
}
