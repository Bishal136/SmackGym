import dns from 'node:dns/promises';
import net from 'node:net';
import { BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface SSRFCheckResult {
  isSafe: boolean;
  hostname: string;
  resolvedIps: string[];
}

export class SSRFGuardAdapter {
  /**
   * Evaluates whether an IPv4 address belongs to a private, loopback, or cloud metadata range
   */
  private isPrivateOrReservedIPv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true; // Malformed IP is treated as unsafe
    }

    const a = parts[0]!;
    const b = parts[1]!;

    // 0.0.0.0/8 (Broadcast/Current network)
    if (a === 0) return true;

    // 10.0.0.0/8 (RFC 1918 Private)
    if (a === 10) return true;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;

    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;

    // 169.254.0.0/16 (Link-Local / AWS/GCP Metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;

    // 172.16.0.0/12 (RFC 1918 Private: 172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (RFC 1918 Private)
    if (a === 192 && b === 168) return true;

    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (a >= 224) return true;

    return false;
  }

  /**
   * Evaluates whether an IPv6 address is loopback, unique local, or link-local
   */
  private isPrivateOrReservedIPv6(ip: string): boolean {
    const normalized = ip.toLowerCase();
    // IPv6 Loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // IPv6 Link-Local (fe80::/10)
    if (normalized.startsWith('fe80:') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
    // IPv6 Unique Local (fc00::/7)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // IPv4-mapped IPv6 (::ffff:127.0.0.1)
    if (normalized.includes('::ffff:')) {
      const ipv4Part = normalized.split('::ffff:')[1];
      if (ipv4Part && this.isPrivateOrReservedIPv4(ipv4Part)) return true;
    }

    return false;
  }

  /**
   * Validates target URL and resolves DNS against RFC 1918/loopback ranges (RULE-SEC-03, Gate T11)
   */
  public async validateTargetUrl(rawUrl: string): Promise<SSRFCheckResult> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new BadRequestError('Invalid target URL format', 'invalid_url_format');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestError(
        `Unsupported protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted`,
        'unsupported_protocol'
      );
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost, link-local, internal domain aliases directly
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      logger.warn(`SSRF attempt detected and blocked for internal host '${hostname}'`, { targetUrl: rawUrl });
      throw new BadRequestError(
        `Access to internal host '${hostname}' is strictly prohibited`,
        'ssrf_target_blocked'
      );
    }

    // Direct IP string checks
    const ipFamily = net.isIP(hostname);
    if (ipFamily === 4 && this.isPrivateOrReservedIPv4(hostname)) {
      logger.warn(`SSRF attempt detected and blocked for direct IPv4 '${hostname}'`, { targetUrl: rawUrl });
      throw new BadRequestError(
        `Access to private, loopback, or metadata address '${hostname}' is strictly prohibited`,
        'ssrf_target_blocked'
      );
    }
    if (ipFamily === 6 && this.isPrivateOrReservedIPv6(hostname)) {
      logger.warn(`SSRF attempt detected and blocked for direct IPv6 '${hostname}'`, { targetUrl: rawUrl });
      throw new BadRequestError(
        `Access to private, loopback, or metadata address '${hostname}' is strictly prohibited`,
        'ssrf_target_blocked'
      );
    }

    // Resolve DNS records before issuing outbound request
    try {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        throw new BadRequestError(`Unable to resolve DNS for host '${hostname}'`, 'dns_resolution_failed');
      }

      const resolvedIps = records.map((r) => r.address);
      for (const record of records) {
        const isForbidden =
          record.family === 4
            ? this.isPrivateOrReservedIPv4(record.address)
            : this.isPrivateOrReservedIPv6(record.address);

        if (isForbidden) {
          logger.warn(`SSRF attempt blocked: hostname '${hostname}' resolved to private IP '${record.address}'`, {
            hostname,
            resolvedIp: record.address,
          });
          throw new BadRequestError(
            `Target host '${hostname}' resolved to forbidden private IP address '${record.address}'`,
            'ssrf_target_blocked'
          );
        }
      }

      return {
        isSafe: true,
        hostname,
        resolvedIps,
      };
    } catch (err: any) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError(`DNS resolution failure for host '${hostname}': ${err.message}`, 'dns_lookup_error');
    }
  }

  /**
   * Executes outbound HTTP request only after pre-flight SSRF validation passes
   */
  public async safeFetch(url: string, init?: RequestInit): Promise<Response> {
    await this.validateTargetUrl(url);
    return await fetch(url, init);
  }
}

export const ssrfGuardAdapter = new SSRFGuardAdapter();
