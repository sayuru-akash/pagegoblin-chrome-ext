import type { PageRisk } from "./types";

export function normalizePageUrl(input: string): { url: string; domain: string; protocol: string } {
  let trimmed = input.trim();
  if (!trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
    trimmed = `https://${trimmed}`;
  }
  const url = new URL(trimmed);
  let href = url.href;
  if (href.endsWith("/") && url.pathname === "/") href = href.slice(0, -1);
  return { url: href, domain: url.hostname, protocol: url.protocol };
}

export function detectPageRisk(url: string): PageRisk[] {
  const warnings: PageRisk[] = [];
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return warnings;
  }

  const hostname = parsed.hostname;
  const pathname = parsed.pathname.toLowerCase();

  // Private/local addresses
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    warnings.push({
      type: "PRIVATE_PAGE",
      message: "This appears to be a local/private page. Sending it to pagegoblin.org will share its content publicly.",
      severity: "danger",
    });
  }

  // Private-looking paths
  const privatePaths = ["/admin", "/dashboard", "/login", "/signin", "/account", "/settings", "/internal", "/backoffice"];
  if (privatePaths.some((p) => pathname.startsWith(p))) {
    warnings.push({
      type: "PRIVATE_PAGE",
      message: `The URL path "${pathname}" looks like a private/internal page. Roasting it may expose sensitive content.`,
      severity: "warning",
    });
  }

  return warnings;
}

export function sanitizePageText(text: string, maxLength = 3000): string {
  return text.replace(/\s+/g, " ").trim().slice(0, maxLength);
}
