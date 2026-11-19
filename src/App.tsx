import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  CakeSlice,
  CalendarDays,
  Clock3,
  Heart,
  Mail,
  Music2,
  Pause,
  Play,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { birthdayConfig, type Memory } from './config/birthday'
import './App.css'

const BirthdayUniverse = lazy(() =>
  import('./components/BirthdayUniverse').then((module) => ({ default: module.BirthdayUniverse })),
)

const placeholderImages = [
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=82',
]

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
}

function SectionHeading({ eyebrow, title, copy, light = false }: { eyebrow: string; title: React.ReactNode; copy: string; light?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} className={`section-heading ${light ? 'section-heading--light' : ''}`} variants={reveal} initial="hidden" animate={visible ? 'visible' : 'hidden'}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </motion.div>
  )
}

function Petals({ count = 14 }: { count?: number }) {
  return <div className="petal-field" aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index} className="petal" style={{ '--i': index } as React.CSSProperties} />)}</div>
}

function Countdown() {
  const [remaining, setRemaining] = useState(() => getRemainingTime())

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemainingTime()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="countdown" aria-label="Countdown to Sinchana's birthday">
      {Object.entries(remaining).map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function getRemainingTime() {
  const target = new Date('2026-11-25T00:00:00')
  const difference = Math.max(0, target.getTime() - Date.now())
  const totalSeconds = Math.floor(difference / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function App() {
  const [opened, setOpened] = useState(false)
  const [letterOpen, setLetterOpen] = useState(false)
  const [wish, setWish] = useState<string | null>(null)
  const [wished, setWished] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('top')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sections = ['top', 'memories', 'letter', 'wishes', 'finale']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting)
      if (visible?.target.id) setActiveSection(visible.target.id)
    }, { rootMargin: '-35% 0px -55% 0px' })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [opened])

  useEffect(() => {
    if (!selectedMemory) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedMemory(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedMemory])

  const memories = useMemo(() => birthdayConfig.memories.map((memory, index) => ({ ...memory, image: memory.image || placeholderImages[index] })), [])

  const startAudio = () => {
    setAudioStarted(true)
    if (audioRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const toggleAudio = () => {
    if (!audioStarted) startAudio()
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      audioRef.current.pause()
      setPlaying(false)
    }
  }

  const revealWish = () => {
    const choices = birthdayConfig.wishes.filter((item) => item !== wish)
    setWish(choices[Math.floor(Math.random() * choices.length)])
  }

  const shareExperience = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'A little world for Sin', text: 'A birthday universe made especially for Sinchana.', url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="site-shell">
      <div className="scroll-line"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <audio ref={audioRef} src={birthdayConfig.assets.music} loop muted={muted} />
      {opened && (
        <div className="music-control">
          <button className="music-toggle" onClick={toggleAudio} aria-label={playing ? 'Pause music' : 'Play music'}>
          {playing ? <Pause size={15} /> : <Music2 size={15} />}
          <span>{playing ? 'Playing softly' : 'Sound on'}</span>
          </button>
          <button className="music-mute" onClick={(event) => { event.stopPropagation(); setMuted((value) => !value) }} aria-label={muted ? 'Unmute music' : 'Mute music'}>
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.main className="invitation" key="invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.8 }}>
            <Petals count={20} />
            <div className="invitation-orb orb-one" /><div className="invitation-orb orb-two" />
            <div className="invitation-content">
              <span className="overline">A private invitation · 01 / 07</span>
              <div className="mini-rose">✦</div>
              <h1>A little surprise<br /><em>has been waiting for you...</em></h1>
              <p>Someone made something special just for you.</p>
              <button className="primary-button envelope-button" onClick={() => { setOpened(true); startAudio() }}>
                <span>Open your surprise</span><Heart size={16} fill="currentColor" />
              </button>
              <span className="invitation-note">for Sinchana · 25.11.2026</span>
            </div>
            <div className="envelope-art" aria-hidden="true">
              <div className="envelope-shadow" /><div className="envelope-body"><div className="envelope-flap" /><span>♡</span></div>
            </div>
            <div className="scroll-hint"><ArrowDown size={16} /> a little world awaits</div>
          </motion.main>
        ) : (
          <motion.div key="world" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <header className="top-nav">
              <a href="#top" className="brand"><span>♡</span> A little world for Sin</a>
              <nav>{[['memories', 'Memories'], ['letter', 'A letter'], ['wishes', 'Wishes'], ['finale', 'Finale']].map(([id, label]) => <a className={activeSection === id ? 'is-active' : ''} href={`#${id}`} key={id}>{label}</a>)}</nav>
              <div className="nav-actions"><button className="share-button" onClick={shareExperience} aria-label="Share this birthday experience"><Share2 size={14} /></button><a className="nav-cta" href="#finale">Make a wish <ArrowUpRight size={14} /></a></div>
            </header>

            <section id="top" className="hero-section">
              <div className="hero-stars" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>✦</span>)}</div>
              <div className="hero-copy">
                <motion.span className="overline" variants={reveal} initial="hidden" animate="visible">The universe is celebrating · 02 / 07</motion.span>
                <motion.h1 variants={reveal} initial="hidden" animate="visible">Happy<br /><em>Birthday,</em><strong>Sinchana.</strong></motion.h1>
                <motion.p variants={reveal} initial="hidden" animate="visible">Today, this little universe belongs to you.</motion.p>
                <motion.a href="#memories" className="text-link" variants={reveal} initial="hidden" animate="visible">Step inside <ArrowDown size={15} /></motion.a>
                <motion.div className="countdown-wrap" variants={reveal} initial="hidden" animate="visible">
                  <span className="countdown-label"><Clock3 size={13} /> the celebration begins in</span>
                  <Countdown />
                </motion.div>
              </div>
              <div className="hero-portrait">
                <Suspense fallback={null}>
                  <BirthdayUniverse />
                </Suspense>
                <div className="portrait-ring ring-one" /><div className="portrait-ring ring-two" />
                <div className="hero-image" />
                <div className="hero-caption"><span>for the girl who makes<br />ordinary days feel golden</span><Heart size={17} fill="currentColor" /></div>
              </div>
              <div className="hero-bottom"><span>25 / 11 / 2026</span><span className="line" /><span>Made with love, especially for you</span></div>
            </section>

            <section className="celebration-section section-pad">
              <div className="celebration-intro">
                <span className="overline">03 / your birthday itinerary</span>
                <h2>A day designed<br /><em>around you.</em></h2>
                <p>Every little detail is here to make the journey feel personal, playful, and full of beautiful surprises.</p>
              </div>
              <div className="celebration-grid">
                <article className="celebration-card celebration-card--feature"><span>01</span><CalendarDays size={21} /><h3>25 November<br /><em>your day, your universe</em></h3><p>A whole day to celebrate the person who makes ordinary moments feel golden.</p><a href="#finale">Save the date <ArrowUpRight size={14} /></a></article>
                <article className="celebration-card"><span>02</span><Sparkles size={21} /><h3>Little<br /><em>surprises</em></h3><p>Open every chapter, reveal every wish, and find the details hidden just for you.</p></article>
                <article className="celebration-card"><span>03</span><Heart size={21} /><h3>Made with<br /><em>love</em></h3><p>One small corner of the internet, made exclusively for Sinchana.</p></article>
              </div>
            </section>

            <section id="memories" className="memories-section section-pad">
              <SectionHeading eyebrow="04 / a world of memories" title={<>Beautiful things<br /><em>belong here.</em></>} copy="A small museum for the moments that made us smile. Add your photographs whenever you're ready." />
              <div className="memory-grid">{memories.map((memory, index) => <motion.button className={`memory-card memory-card-${index + 1}`} key={memory.label} onClick={() => setSelectedMemory(memory)} whileHover={{ y: -8, rotate: index % 2 ? 1 : -1 }} whileTap={{ scale: 0.98 }}>
                <img src={memory.image} alt={memory.caption} loading="lazy" /><span className="memory-overlay"><small>{memory.label}</small><strong>{memory.caption}</strong><ArrowUpRight size={17} /></span>
              </motion.button>)}</div>
              <p className="section-footnote"><Sparkles size={14} /> Replace the placeholder cards with your own favourite photographs.</p>
            </section>

            <section id="letter" className="letter-section section-pad">
              <div className="letter-visual"><div className="letter-glow" /><div className={`letter-envelope ${letterOpen ? 'is-open' : ''}`} onClick={() => setLetterOpen((value) => !value)}><div className="letter-paper">{birthdayConfig.letter.map((line, index) => <p key={`${line}-${index}`}>{line || '\u00a0'}</p>)}</div><div className="letter-flap" /><div className="letter-front"><Mail size={28} /><span>For Sin, with love</span></div></div><button className="letter-trigger" onClick={() => setLetterOpen((value) => !value)}>{letterOpen ? 'Close letter' : 'Open your letter'} <ArrowUpRight size={15} /></button></div>
              <div className="letter-copy"><span className="overline">05 / a letter just for you</span><h2>Words I hope<br /><em>you always remember.</em></h2><p>Some feelings are too lovely to fit inside a text message. So this one got its own little envelope.</p><div className="signature">your bestie <Heart size={15} fill="currentColor" /></div></div>
            </section>

            <section id="wishes" className="wishes-section section-pad">
              <Petals count={10} />
              <SectionHeading light eyebrow="06 / a thousand little wishes" title={<>Pick a flower.<br /><em>Keep the wish.</em></>} copy="There are a thousand good things waiting for you. Tap anywhere in the garden to discover one." />
              <div className="wish-garden" onClick={revealWish}><div className="garden-moon" /><div className="wish-orbit orbit-a" /><div className="wish-orbit orbit-b" />{Array.from({ length: 9 }, (_, i) => <button key={i} className={`garden-flower flower-${i + 1}`} onClick={(event) => { event.stopPropagation(); revealWish() }} aria-label="Reveal a wish"><span>✿</span><i /></button>)}<motion.div className="wish-card" key={wish || 'default'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>{wish ? <><Sparkles size={18} /><strong>{wish}</strong><span>and every beautiful thing in between</span></> : <><Sparkles size={18} /><strong>Tap a flower</strong><span>to reveal a little wish</span></>}</motion.div></div>
            </section>

            <section className="film-section section-pad"><div className="film-frame"><div className="film-noise" /><div className="film-content"><span className="overline">07 / the cinematic birthday film</span><h2>Your story<br /><em>is still unfolding.</em></h2><p>Add a birthday film whenever you're ready. Until then, let these quiet frames hold the space.</p><button className="film-button" onClick={() => document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth' })}><Play size={16} fill="currentColor" /> Explore the memories</button></div><div className="film-stamp">BIRTHDAY<br /><span>2026</span></div></div></section>

            <section id="finale" className={`finale-section ${wished ? 'is-wished' : ''} section-pad`}><Petals count={22} /><div className="finale-content"><span className="overline">08 / the grand finale</span><CakeSlice className="cake-icon" size={30} /><h2>One last wish,<br /><em>Sin.</em></h2><p className="finale-message">{wished ? 'May your life always be as beautiful as the dreams you carry. Thank you for being YOU.' : 'Close your eyes, make it a good one, and let the universe listen.'}</p><button className="primary-button wish-button" onClick={() => setWished(true)}>{wished ? 'Wish sent ✦' : 'Make a wish ✨'}</button>{wished && <motion.div className="fireworks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</motion.div>}<span className="final-signoff">Happy Birthday, Sinchana! ♡<br /><small>Made with love, especially for you.</small></span></div></section>

            <footer><span>A little world for Sin</span><span>25 · 11 · 2026</span><span>With lots of love, your bestie ♡</span></footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{selectedMemory && <motion.div className="modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMemory(null)}><motion.div className="memory-modal" role="dialog" aria-modal="true" aria-labelledby="memory-title" initial={{ y: 24, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: .96 }} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedMemory(null)} aria-label="Close memory"><X size={18} /></button><img src={selectedMemory.image || placeholderImages[0]} alt={selectedMemory.caption} /><div><small>{selectedMemory.label}</small><h3 id="memory-title">{selectedMemory.caption}</h3><p>This space is ready for a memory that is uniquely yours.</p></div></motion.div></motion.div>}</AnimatePresence>
    </div>
  )
}

export default App
