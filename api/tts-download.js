const ALLOWED_HOSTS = new Set(['api.milorapart.top', 'apis.uctb.cn']);
const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_REDIRECTS = 3;

function sanitizeFilename(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  const sanitized = raw
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .slice(0, 120);
  return sanitized || 'voice.wav';
}

function encodeContentDisposition(filename) {
  const asciiName = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function validateTarget(value) {
  const target = new URL(value);
  if (target.protocol !== 'https:') throw new Error('Unsupported URL protocol');
  if (!ALLOWED_HOSTS.has(target.hostname.toLowerCase())) throw new Error('Unsupported download host');
  if (target.username || target.password) throw new Error('Credentials are not allowed');
  return target;
}

async function fetchAllowedUrl(initialUrl, signal) {
  let target = validateTarget(initialUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetch(target.href, {
      redirect: 'manual',
      signal,
      headers: { 'User-Agent': 'Astro-Enav-TTS-Downloader/1.0' },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    if (redirects === MAX_REDIRECTS) throw new Error('Too many redirects');
    const location = response.headers.get('location');
    if (!location) throw new Error('Invalid redirect');
    target = validateTarget(new URL(location, target).href);
  }
  throw new Error('Too many redirects');
}

async function readLimitedBody(response) {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_DOWNLOAD_BYTES) throw new Error('File too large');
  if (!response.body) throw new Error('Empty response');

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DOWNLOAD_BYTES) {
      await reader.cancel('File too large');
      throw new Error('File too large');
    }
    chunks.push(Buffer.from(value));
  }
  if (!total) throw new Error('Empty response');
  return Buffer.concat(chunks, total);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawUrl = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  const rawFilename = Array.isArray(req.query?.filename) ? req.query.filename[0] : req.query?.filename;
  if (typeof rawUrl !== 'string' || !rawUrl) {
    res.status(400).json({ error: 'Missing download URL' });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const upstream = await fetchAllowedUrl(rawUrl, controller.signal);
    if (!upstream.ok) {
      res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502)
        .json({ error: `Upstream request failed: ${upstream.status}` });
      return;
    }
    const buffer = await readLimitedBody(upstream);
    const filename = sanitizeFilename(rawFilename);
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Content-Disposition', encodeContentDisposition(filename));
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(buffer);
  } catch (error) {
    const timedOut = controller.signal.aborted;
    const message = error instanceof Error ? error.message : 'Invalid download request';
    const clientError = /Unsupported|Credentials|Missing/.test(message);
    res.status(timedOut ? 504 : clientError ? 400 : message === 'File too large' ? 413 : 502)
      .json({ error: timedOut ? 'Upstream request timed out' : message });
  } finally {
    clearTimeout(timer);
  }
}
