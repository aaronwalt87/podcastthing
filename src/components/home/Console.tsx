'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import Sparkline from '@/components/markets/Sparkline'
import { MARKET_STATE_LABEL, type MarketSnapshot } from '@/types/stocks'
import type { Episode } from '@/types/episode'
import styles from './Console.module.css'

const CHANNELS = [
  { name: 'News', label: 'Reading room', href: '/news', code: '01' },
  { name: 'Markets', label: 'Market board', href: '/markets', code: '02' },
  { name: 'Podcasts', label: 'Listening list', href: '/podcasts', code: '03' },
]

const SEGMENTS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg']
const PATHS = {
  a: 'M8 2h24l4 4-4 4H8L4 6Z', b: 'M34 10l4-4 3 5-3 22-4 3-3-4Z',
  c: 'M31 40l4-4 3 4-3 23-4 4-3-5Z', d: 'M4 64h24l4 5-4 4H4l-4-4Z',
  e: 'M3 38l4 4-3 21-4 4-3-5 3-21Z', f: 'M7 10l3 4-3 19-4 4-3-4 3-22Z',
  g: 'M8 33h22l4 4-4 4H8l-4-4Z',
}

function SegmentNumber({ value }: { value: string }) {
  return <svg viewBox="0 0 96 78" className={styles.digits} aria-hidden="true">
    {value.split('').map((digit, i) => <g key={i} transform={`translate(${i * 49 + 4},0)`}>
      {Object.entries(PATHS).map(([segment, d]) => <path key={segment} d={d} fill="currentColor" opacity={SEGMENTS[Number(digit)].includes(segment) ? 1 : .065} />)}
    </g>)}
  </svg>
}

export default function Console({ headlineCount, sourceCount, snapshot, latestEpisode }: {
  headlineCount: number; sourceCount: number; snapshot: MarketSnapshot; latestEpisode: Episode | null
}) {
  const [channel, setChannel] = useState(0)
  const player = usePlayer()
  const selected = CHANNELS[channel]
  const quote = snapshot.quotes.find(q => q.symbol === 'SPY') ?? snapshot.quotes[0]
  const episode = player.currentEpisode ?? latestEpisode
  const playable = Boolean(episode?.audioUrl.trim())
  const openSearch = () => window.dispatchEvent(new Event('signal:open-palette'))
  const play = () => {
    if (!episode) return
    if (player.currentEpisode?.id === episode.id) player.toggle()
    else player.play(episode)
  }

  return <div className={styles.instrument} data-console>
    <div className={styles.ports} aria-hidden="true"><span>INPUT / FEEDS</span><span>AW–01</span><span>OUTPUT / IDEAS <i /></span></div>
    <div className={styles.chassis}>
      <div className={styles.faceplate}>
        <div className={styles.nameplate}><span className={styles.model}>AW–01<span>●</span></span><p>PERSONAL INFORMATION SYSTEM</p><span className={styles.serial}>AARON WALTERS / EST. IN CURIOSITY</span></div>
        <div className={styles.speaker} aria-hidden="true" />
      </div>
      <div className={styles.display}>
        <div className={styles.displayTop}><span><i /> {selected.label}</span><span>CH / {selected.code}</span></div>
        <div className={styles.readout}>
          <SegmentNumber value={selected.code} />
          <div className={styles.screenContent} aria-live="polite" aria-atomic="true">
            {channel === 0 && <><strong>{headlineCount} headlines</strong><span>{sourceCount} sources · one feed</span><div className={styles.signalBars} aria-hidden="true">{[4,8,6,10,7,12,9,5,11,8,13,10,6,9,12,7,11,6,10,8].map((h,i)=><i key={i} style={{'--bar':h, '--i':i} as CSSProperties} />)}</div></>}
            {channel === 1 && <><strong>{quote ? `${quote.symbol} / ${quote.price.toFixed(2)}` : 'Market feed idle'}</strong><span>{MARKET_STATE_LABEL[snapshot.marketState]} · {quote?.source === 'finnhub' ? 'Live quote' : 'End-of-day data'}</span>{quote && <Sparkline id="console-market" points={quote.history} color="var(--screen-blue)" width={240} height={34} fill={false} />}</>}
            {channel === 2 && <><strong className={styles.episodeTitle}>{episode?.title ?? 'The listening list'}</strong><span>{player.isLoading ? 'Loading audio' : player.isPlaying ? 'Now playing' : 'Ready when you are'}</span><div className={styles.transportGlyphs} aria-hidden="true"><span>●</span> ▷ Ⅱ <span>∿</span></div></>}
          </div>
        </div>
        <div className={styles.displayBottom}><span>READ / WATCH / LISTEN</span><span className={styles.screenDots} aria-hidden="true">{CHANNELS.map((c,i)=><i key={c.code} data-lit={i===channel} />)}</span></div>
      </div>
      <div className={styles.controls}>
        <div className={styles.volume}>
          <label htmlFor="console-volume">VOLUME</label>
          <div className={styles.knob} aria-hidden="true" style={{'--knob-turn':`${-135 + (player.muted ? 0 : player.volume) * 270}deg`} as CSSProperties}><i /></div>
          <input id="console-volume" type="range" min="0" max="1" step="0.05" value={player.muted ? 0 : player.volume} aria-valuetext={`${Math.round((player.muted ? 0 : player.volume) * 100)} percent`} onChange={e => { if(player.muted) player.toggleMute(); player.setVolume(Number(e.target.value)) }} />
          <span className={styles.volumeEnds} aria-hidden="true"><span>−</span><span>+</span></span>
          <button className={styles.smallKey} onClick={player.toggleMute} aria-pressed={player.muted}>{player.muted ? 'UNMUTE' : 'MUTE'}</button>
        </div>
        <div className={styles.keyBank}>
          <p className={styles.bankLabel}>SELECT CHANNEL <span>01—03</span></p>
          <div className={styles.pads} role="group" aria-label="Console channel">
            {CHANNELS.map((c,i)=><button type="button" key={c.code} aria-pressed={channel===i} onClick={()=>setChannel(i)} className={styles.pad} style={{'--pad-order':i} as CSSProperties}><span className={styles.padTop}>{c.code}<i /></span><span>{c.name}</span></button>)}
          </div>
          <div className={styles.utilityKeys}>
            <button onClick={openSearch} className={styles.utilityKey}><span aria-hidden="true">⌕</span>Search</button>
            <Link href="/about" className={styles.utilityKey}><span aria-hidden="true">↗</span>About</Link>
            <button onClick={play} disabled={!playable} className={`${styles.utilityKey} ${styles.playKey}`} aria-label={playable ? `${player.isPlaying ? 'Pause' : 'Play'} ${episode?.title}` : 'No playable episode'}><span aria-hidden="true">{player.isPlaying ? 'Ⅱ' : '▷'}</span>{player.isLoading ? 'Loading' : player.isPlaying ? 'Pause' : 'Play'}</button>
          </div>
        </div>
      </div>
      <div className={styles.bottomPlate}><span>THREE CHANNELS. ZERO DOOMSCROLL QUOTA.</span><Link href={selected.href}>Open {selected.name.toLowerCase()} <span aria-hidden="true">↗</span></Link></div>
      <i className={`${styles.screw} ${styles.screwLeft}`} aria-hidden="true" /><i className={`${styles.screw} ${styles.screwRight}`} aria-hidden="true" />
    </div>
    <div className={styles.instrumentCaption}><span>PERSONAL COLLECTION / {selected.code}</span><span>PRESS A KEY ↗</span></div>
  </div>
}
