#!/usr/bin/env node
// Lightweight HTTP performance tester for Midori (Next.js) pages
// Focuses on GET page loads and optional API proxied routes

const DEFAULTS = {
  base: process.env.MIDORI_BASE_URL || 'http://localhost:3000',
  // Public pages to test (add more like '/dashboard' if auth/session available)
  paths: ['/', '/sign-in', '/api/v1/public/active-semester', '/api/v1/public/next-semester'],
  durationSec: 20,
  concurrency: 10,
  timeoutMs: 15000,
  headers: {
    // Emulate a browser-ish UA for realistic behavior
    'User-Agent': 'midori-perf/1.0 (+node)'
  },
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const n = argv[i + 1];
    switch (a) {
      case '--base': args.base = n; i++; break;
      case '--paths': args.paths = n.split(',').map(s => s.trim()).filter(Boolean); i++; break;
      case '--duration': args.durationSec = parseInt(n, 10); i++; break;
      case '--concurrency': args.concurrency = parseInt(n, 10); i++; break;
      case '--timeout': args.timeoutMs = parseInt(n, 10); i++; break;
      case '--header': {
        const [k, ...rest] = n.split('=');
        const v = rest.join('=');
        args.headers[k] = v; i++; break;
      }
      case '--out': args.out = n; i++; break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`\nMidori Performance Test\n\nUsage:\n  node perf/performance-test.mjs [options]\n\nOptions:\n  --base <url>          Base URL (default: ${DEFAULTS.base})\n  --paths <list>        Comma-separated paths (default: ${DEFAULTS.paths.join(',')})\n  --duration <sec>      Test duration in seconds (default: ${DEFAULTS.durationSec})\n  --concurrency <n>     Concurrent workers per path (default: ${DEFAULTS.concurrency})\n  --timeout <ms>        Request timeout in ms (default: ${DEFAULTS.timeoutMs})\n  --header k=v          Extra header, can be repeated\n  --out <file>          Write JSON report to file\n`);
}

function nowMs() { return performance.now(); }

function percentile(arr, p) {
  if (!arr.length) return 0;
  const pos = (arr.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (arr[base + 1] !== undefined) {
    return arr[base] + rest * (arr[base + 1] - arr[base]);
  }
  return arr[base];
}

function fixGitBashPath(p) {
  const pf = '/Program Files/Git/';
  if (p.includes(pf)) {
    const idx = p.indexOf(pf);
    const rest = p.slice(idx + pf.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  if (/^[A-Za-z]:\//.test(p)) {
    const last = p.split('/').pop();
    return last ? (last.startsWith('/') ? last : `/${last}`) : '/';
  }
  return p;
}

async function httpFetch(url, timeoutMs, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = nowMs();
  try {
    const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
    const dur = nowMs() - start;
    // Consume body to emulate browser load; cap at 2MB
    let size = 0;
    try {
      const reader = res.body?.getReader?.();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value?.length || 0;
          if (size > 2 * 1024 * 1024) { // 2MB cap
            controller.abort();
            break;
          }
        }
      } else {
        const t = await res.text();
        size = t.length;
      }
    } catch (_) { }
    return { ok: res.ok, status: res.status, dur, size };
  } catch (err) {
    const dur = nowMs() - start;
    return { ok: false, status: 0, dur, error: err?.name || 'Error' };
  } finally { clearTimeout(timeout); }
}

async function runPath({ base, path, concurrency, timeoutMs, headers, deadline }) {
  const safePath = fixGitBashPath(path);
  const url = base.replace(/\/$/, '') + (safePath.startsWith('/') ? safePath : `/${safePath}`);
  const latencies = [];
  let ok = 0, fail = 0, total = 0, bytes = 0;

  async function worker() {
    while (performance.now() < deadline) {
      const r = await httpFetch(url, timeoutMs, headers);
      total++;
      if (r.ok) ok++; else fail++;
      latencies.push(r.dur);
      bytes += r.size || 0;
    }
  }

  const start = performance.now();
  await Promise.all(Array.from({ length: concurrency }, worker));
  const elapsed = (performance.now() - start) / 1000;

  latencies.sort((a, b) => a - b);
  const result = {
    path,
    url,
    total,
    ok,
    fail,
    bytes,
    elapsedSec: +elapsed.toFixed(3),
    rps: +(total / elapsed).toFixed(2),
    min: latencies[0] || 0,
    p50: percentile(latencies, 0.5),
    p90: percentile(latencies, 0.9),
    p95: percentile(latencies, 0.95),
    p99: percentile(latencies, 0.99),
    max: latencies[latencies.length - 1] || 0,
  };
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`\n🚀 Midori perf: ${args.base}`);
  const displayPaths = args.paths.map(p => fixGitBashPath(p));
  console.log(`Paths: ${displayPaths.join(', ')}`);
  console.log(`Duration: ${args.durationSec}s  Concurrency: ${args.concurrency}`);

  const deadline = performance.now() + args.durationSec * 1000;
  const perPath = await Promise.all(
    args.paths.map((p) => runPath({
      base: args.base,
      path: p,
      concurrency: args.concurrency,
      timeoutMs: args.timeoutMs,
      headers: args.headers,
      deadline,
    }))
  );

  const totals = perPath.reduce((acc, r) => {
    acc.total += r.total; acc.ok += r.ok; acc.fail += r.fail; acc.bytes += r.bytes; acc.elapsedSec = Math.max(acc.elapsedSec, r.elapsedSec);
    return acc;
  }, { total: 0, ok: 0, fail: 0, bytes: 0, elapsedSec: 0 });
  const overall = {
    target: args.base,
    startedAt: new Date().toISOString(),
    durationSec: args.durationSec,
    concurrencyPerPath: args.concurrency,
    summary: {
      requests: totals.total,
      ok: totals.ok,
      fail: totals.fail,
      throughputRps: +(totals.total / (totals.elapsedSec || 1)).toFixed(2),
      transferredMB: +(totals.bytes / (1024 * 1024)).toFixed(3),
    },
    results: perPath,
  };

  console.log(`\n=== Summary ===`);
  console.table(perPath.map(r => ({
    path: r.path,
    rps: r.rps,
    ok: r.ok,
    fail: r.fail,
    p50: +r.p50.toFixed(1),
    p90: +r.p90.toFixed(1),
    p95: +r.p95.toFixed(1),
    p99: +r.p99.toFixed(1),
  })));
  console.log(`Total: ${overall.summary.requests} | OK: ${overall.summary.ok} | Fail: ${overall.summary.fail} | RPS: ${overall.summary.throughputRps}`);

  if (args.out) {
    await import('node:fs/promises').then(fs => fs.writeFile(args.out, JSON.stringify(overall, null, 2), 'utf8'));
    console.log(`Report written to ${args.out}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
