export function normalizeIp(ip?: string) {
  if (!ip) return ip;

  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", "");
  }
  return ip;
}
