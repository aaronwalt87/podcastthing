import Link from 'next/link'
import SystemSculpture from './SystemSculpture'
import ScrollScene from '@/components/ui/ScrollScene'
import Reveal from '@/components/ui/Reveal'
import styles from './Hero.module.css'
import PlayButton from '@/components/podcasts/PlayButton'
import { profile } from '@/lib/profile'
import { num } from '@/lib/format'
import { MARKET_STATE_LABEL } from '@/types/stocks'
import type { Episode } from '@/types/episode'
import type { MarketSnapshot } from '@/types/stocks'

interface HeroProps {
  latestEpisode: Episode | null
  headlineCount: number
  sourceCount: number
  snapshot: MarketSnapshot
}

export default function Hero({ latestEpisode, headlineCount, sourceCount, snapshot }: HeroProps) {
  const total = snapshot.advancers + snapshot.decliners
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <ScrollScene kind="hero">
      <div className={`shell ${styles.composition}`}>
        <div className={styles.copy}>
          <p className={`eyebrow ${styles.kicker}`}><span className={styles.marker} aria-hidden="true" />Aaron Walters · {profile.location}</p>
          <h1 id="hero-title" className={styles.title}>{profile.heroLead}<span>{profile.heroLeadMuted}</span></h1>
          <p className={styles.summary}>Technology news, market context,<br />and episodes worth your time.</p>
          <div className={styles.actions}>
            <Link href="/news" className="btn btn-primary">Explore the dashboard <span aria-hidden="true">↗</span></Link>
            <Link href="/about" className={styles.aboutLink}>About this site <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className={styles.stage} data-scroll-anchor>
          <div className={styles.stageTop}><span>Always a work in progress.</span><span aria-hidden="true">↗</span></div>
          <SystemSculpture />
          <div className={styles.stageBottom}><span>A few things<br />worth following.</span><span className={styles.stageGlyph} aria-hidden="true">✳</span></div>
        </div>
      </div>
      </ScrollScene>
      <div className={`shell ${styles.intro}`}>
        <Reveal className={styles.introHeading}><p className="eyebrow">The collection</p><h2>A little less<br />tab hopping.</h2></Reveal>
        <Reveal delay={120} className={styles.introBody}>
          <p>{profile.standfirst}</p>
          {latestEpisode && latestEpisode.audioUrl.trim().length > 0 && (
            <div className={styles.episode}>
              <PlayButton episode={latestEpisode} size="md" />
              <div className={styles.episodeCopy}><span className="eyebrow">On the listening list</span><Link href="/podcasts" className={styles.episodeTitle}>{latestEpisode.title}</Link></div>
            </div>
          )}
        </Reveal>
      </div>
      <div className={`shell ${styles.statBar}`}>
        <p className={`eyebrow ${styles.status}`}><span className={snapshot.marketState === 'REGULAR' ? 'pulse' : 'pulse pulse-idle'} aria-hidden="true" />{MARKET_STATE_LABEL[snapshot.marketState]}</p>
        <dl className={styles.stats}>
          <div><dt>Headlines tracked</dt><dd className="num">{num(headlineCount, 0)}</dd></div>
          <div><dt>Sources</dt><dd className="num">{num(sourceCount, 0)}</dd></div>
          <div><dt>Market breadth</dt><dd className="num">{total > 0 ? `${num(snapshot.advancers, 0)}/${num(total, 0)} up` : '—'}</dd></div>
        </dl>
      </div>
    </section>
  )
}
