/**
 * Guard outbound HTTP calls made on behalf of CMS users (webhooks, review
 * imports) against SSRF: only https, no credentials in the URL, and the host
 * must not resolve to a private, loopback or link-local address.
 */
import dns from 'node:dns/promises';
import net from 'node:net';
import { validationError } from '../errors/index.js';

function privateV4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function privateV6(ip) {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? privateV4(mapped[1]) : false;
}

export function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) return privateV4(ip);
  if (net.isIPv6(ip)) return privateV6(ip);
  return true;
}

function allowPrivate() {
  return process.env.OUTBOUND_ALLOW_PRIVATE === 'true';
}

/** Validate the shape of a URL typed into the CMS. */
export function parseOutboundUrl(raw) {
  let url;
  try {
    url = new URL(String(raw || '').trim());
  } catch {
    throw validationError('Enter a full URL starting with https://', { field: 'url' });
  }
  const devHttp = allowPrivate() && url.protocol === 'http:';
  if (url.protocol !== 'https:' && !devHttp) {
    throw validationError('The URL must start with https://', { field: 'url' });
  }
  if (url.username || url.password) {
    throw validationError('Do not put a username or password in the URL — use a custom header instead', { field: 'url' });
  }
  return url;
}

/** Resolve the host right before sending and refuse internal addresses. */
export async function assertPublicHost(url) {
  if (allowPrivate()) return;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw validationError('Internal addresses are not allowed', { field: 'url' });
  }
  const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addresses.length || addresses.some((row) => isPrivateAddress(row.address))) {
    throw validationError('That address points to a private network and cannot be used', { field: 'url' });
  }
}
