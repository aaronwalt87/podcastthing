import Link from 'next/link'
import Console from './Console'
import ScrollScene from '@/components/ui/ScrollScene'
import styles from './Hero.module.css'
import type { Episode } from '@/types/episode'
import type { MarketSnapshot } from '@/types/stocks'

interface HeroProps {
  latestEpisode: Episode | null
  headlineCount: number
  sourceCount: number
  snapshot: MarketSnapshot
}

export default function Hero(props: HeroProps) {
  return <section className={styles.hero} aria-labelledby="hero-title">
    <ScrollScene kind="hero">
      <div className={`shell ${styles.composition}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}><span aria-hidden="true" /> AARON WALTERS <span className={styles.location}>WISCONSIN, US</span></p>
          <p className={styles.edition}>AW–01 / PERSONAL DASHBOARD</p>
          <h1 id="hero-title" className={styles.title}>A good place<br />to <span>tune in.</span></h1>
          <p className={styles.summary}>Technology news, market context,<br />and things worth listening to.</p>
          <div className={styles.actions}><Link href="#signal" className="btn btn-primary">Explore the collection <span aria-hidden="true">↓</span></Link><span className={styles.note}>Curiosity, on repeat.</span></div>
          <div className={styles.legend}><span>01 / NEWS</span><span>02 / MARKETS</span><span>03 / PODCASTS</span></div>
          <div className={styles.scrollCue} aria-hidden="true"><span>SCROLL TO ASSEMBLE</span><i /><span>↓</span></div>
        </div>
        <div className={styles.stage} data-scroll-anchor><Console {...props} /></div>
      </div>
    </ScrollScene>
  </section>
}
