import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const exports = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/market-history.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports })
const { parseHistoryCsv, compareHistory, retainMarketData } = exports
const parsed = parseHistoryCsv('\uFEFFDate,Open,Close\r\n2026-02-30,1,99\r\n2026-09-02,1,120\r\n2026-09-01,1,100\r\n2026-09-02,1,125\r\n2026-09-03,1,NaN\r\n2026-09-04,1,-2')
assert.equal(JSON.stringify(parsed), JSON.stringify([{date:'2026-09-01',close:100},{date:'2026-09-02',close:125}]))
assert.equal(parseHistoryCsv('<html>Access denied</html>').length, 0)
const a = { symbol:'A', dailyHistory: [{ date:'2026-07-01', close:50 }, { date:'2026-09-01', close:100 }, { date:'2026-09-02', close:110 }, { date:'2026-09-03', close:125 }] }
const b = { symbol:'B', dailyHistory: [{ date:'2026-09-01', close:200 }, { date:'2026-09-03', close:180 }] }
const chart = compareHistory([a, b, {symbol:'MISSING', history:[1,2]}], '1M')
assert.equal(chart.dates.join(','), '2026-09-01,2026-09-03', 'Only actual shared dates may be compared')
assert.equal(chart.series[0].values[1].value, 25)
assert(Math.abs(chart.series[1].values[1].value + 10) < 1e-10)
assert.equal(chart.missing.join(','), 'MISSING', 'Undated legacy history must not be plotted')
assert.equal(compareHistory([a, {symbol:'C', dailyHistory:[{date:'2026-05-01',close:5},{date:'2026-05-02',close:6}]}], 'ALL').series.length, 0)
assert.equal(compareHistory([a], '1M').dates.length, 3)
assert.equal(compareHistory([a], 'ALL').dates.length, 4)
const previous = {...a, updatedAt:100, historyFetchedAt:100, price:125}
const fresh = {...a, dailyHistory:[], history:[], updatedAt:200, price:130}
assert.equal(retainMarketData(fresh, previous).price, 130)
assert.equal(retainMarketData(fresh, previous).historyFetchedAt, 100)
assert.equal(retainMarketData(null, previous).updatedAt, 100, 'A failed refresh must not refresh the quote age')
assert.equal(retainMarketData(null), null)
console.log('Market history: CSV validation, aligned returns, windowing and outage retention passed.')

// Exercise the server refresh against partial provider outages, with no network.
const server = {}, cache = new Map(), warnings = []
const redis = { get: async key => cache.get(key), set: async (key, value) => cache.set(key, value) }
let upstreamDown = false
const providerTime = Math.floor(Date.now() / 1000) - 300
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/stocks.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports: server, URL, AbortController, setTimeout, clearTimeout,
  process: { env: { FINNHUB_TOKEN: 'test-token', STOOQ_API_KEY: 'test-key' } },
  console: { warn: message => warnings.push(message), error: message => warnings.push(message) },
  require: name => name === 'server-only' ? {} : name === './market-history' ? exports : name === './redis' ? {getRedis: () => redis, acquireLock: async () => false} : name === './sample-data' ? {sampleDataEnabled: () => false} : {waitUntil: () => {}},
  fetch: async url => {
    const parsed = new URL(url)
    if (upstreamDown) return {ok:false,status:503}
    if (parsed.hostname === 'finnhub.io') return {ok:true,json:async () => ({c:150,pc:100,t:providerTime})}
    assert.equal(parsed.searchParams.get('apikey'), 'test-key')
    return {ok:true,text:async () => parsed.searchParams.get('s') === 'amd.us' ? 'No data' : 'Date,Close\n2026-09-01,90\n2026-09-02,100'}
  },
})
const first = await server.refreshStocks()
assert.equal(first.quotes.length, 16)
assert.equal(first.quotes[0].history.join(','), '90,100', 'Intraday quote must not be appended to daily closes')
assert.equal(first.quotes[0].price, 150)
assert.equal(first.quotes[0].updatedAt, providerTime * 1000)
assert.equal(first.quotes.find(q => q.symbol === 'AMD').dailyHistory.length, 0, 'One failed history must not drop a working quote')
upstreamDown = true
const fallback = await server.refreshStocks()
assert.equal(fallback.quotes.length, 16)
assert.equal(fallback.quotes[0].updatedAt, providerTime * 1000)
assert.equal(fallback.quotes[0].historyFetchedAt, first.quotes[0].historyFetchedAt)
cache.delete('stocks:cache:v3')
assert.equal((await server.getMarketSnapshot()).quotes.length, 16, 'Last-good data survives primary cache expiry')
assert(!warnings.some(message => message.includes('test-key') || message.includes('test-token')))
console.log('Market refresh: independent feeds, provider timestamps, outage fallback and cache expiry passed.')
