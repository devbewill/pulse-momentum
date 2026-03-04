'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

export default function LandingPage() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setScrollProgress(scrolled)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from(titleRef.current, {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
    }).from(
      subtitleRef.current,
      {
        y: 50,
        opacity: 0,
        duration: 0.8,
      },
      '-=0.4'
    )

    gsap.utils.toArray('.reveal-up').forEach((elem: any) => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
      })
    })
  }, [mounted])

  return (
    <div className="min-h-screen bg-white text-zinc-950 overflow-hidden">
      <CustomCursor x={cursorPos.x} y={cursorPos.y} />
      <ScrollIndicator progress={scrollProgress} />

      <Nav />

      <main className="relative">
        <Hero heroRef={heroRef} titleRef={titleRef} subtitleRef={subtitleRef} />

        <MarqueeSection />

        <ManifestoSection />

        <FeatureSection />

        <DemoSection />

        <HowItWorks />

        <CTASection />
      </main>

      <Footer />
    </div>
  )
}

function CustomCursor({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <div className="w-8 h-8 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
    </div>
  )
}

function ScrollIndicator({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-zinc-100">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: 'var(--neon)',
        }}
      />
    </div>
  )
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-[5px] border-zinc-950 bg-white">
      <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="star-glow text-[24px] leading-none font-black"
            style={{ color: 'var(--neon)' }}
          >
            ✦
          </span>
          <span className="text-[18px] font-black uppercase tracking-widest text-zinc-950">
            PULSE
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hidden md:block text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            Launch App
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-950 border-2 border-zinc-950 hover:bg-zinc-950 hover:text-white transition-all duration-150"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero({
  heroRef,
  titleRef,
  subtitleRef,
}: {
  heroRef: React.RefObject<HTMLDivElement | null>
  titleRef: React.RefObject<HTMLDivElement | null>
  subtitleRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <section
      ref={heroRef}
      className="min-h-screen flex flex-col justify-center items-center px-5 pt-24 pb-16 md:px-10 md:pt-32 md:pb-24 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 border-[5px] border-zinc-950" />
        <div className="absolute top-40 right-20 w-64 h-64 border-[5px] border-zinc-950" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 border-[5px] border-zinc-950" />
      </div>

      <div ref={titleRef} className="text-center z-10 max-w-6xl mx-auto">
        <h1 className="text-[12vw] md:text-[10vw] font-black leading-[0.85] uppercase tracking-tighter">
          <span className="block">Your</span>
          <span className="block" style={{ color: 'var(--neon)' }}>
            Thoughts
          </span>
          <span className="block">Connected</span>
        </h1>
      </div>

      <div ref={subtitleRef} className="mt-8 md:mt-12 text-center z-10 max-w-3xl mx-auto">
        <p className="text-lg md:text-2xl font-bold text-zinc-700 leading-tight">
          An intelligent stream of ideas that surfaces relevant context as you write.
          <span className="block mt-2 text-zinc-500">
            No folders. No tags to manage. Just magic.
          </span>
        </p>
      </div>

      <div className="mt-12 md:mt-16 flex flex-col sm:flex-row gap-4 z-10">
        <Link
          href="/"
          className="px-8 py-4 text-[14px] font-black uppercase tracking-wider text-white bg-zinc-950 border-[3px] border-zinc-950 hover:bg-white hover:text-zinc-950 transition-all duration-150"
        >
          Start Writing
        </Link>
        <Link
          href="#how-it-works"
          className="px-8 py-4 text-[14px] font-black uppercase tracking-wider text-zinc-950 border-[3px] border-zinc-950 hover:bg-zinc-950 hover:text-white transition-all duration-150"
        >
          How It Works
        </Link>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Scroll
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-400"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  )
}

function MarqueeSection() {
  return (
    <section className="border-y-[5px] border-zinc-950 bg-zinc-950 py-4 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-8">
            <span className="text-[12px] md:text-[14px] font-black uppercase tracking-wider text-white">
              Capture Ideas
            </span>
            <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
              ✦
            </span>
            <span className="text-[12px] md:text-[14px] font-black uppercase tracking-wider text-white">
              Intelligent Matching
            </span>
            <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
              ✦
            </span>
            <span className="text-[12px] md:text-[14px] font-black uppercase tracking-wider text-white">
              Merge Notes
            </span>
            <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
              ✦
            </span>
            <span className="text-[12px] md:text-[14px] font-black uppercase tracking-wider text-white">
              Rediscover Thoughts
            </span>
            <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
              ✦
            </span>
            <span className="text-[12px] md:text-[14px] font-black uppercase tracking-wider text-white">
              Offline First
            </span>
            <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
              ✦
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ManifestoSection() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto text-center reveal-up">
        <div className="border-[5px] border-zinc-950 p-8 md:p-16">
          <h2 className="text-[10vw] md:text-[8vw] font-black leading-[0.9] uppercase tracking-tighter mb-8 md:mb-12">
            The Problem
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="border-t-[3px] border-zinc-950 pt-6">
              <h3
                className="text-[48px] font-black leading-none mb-4"
                style={{ color: 'var(--neon)' }}
              >
                01
              </h3>
              <p className="text-lg font-bold text-zinc-700">
                Your best ideas get lost in endless folders and forgotten tags.
              </p>
            </div>
            <div className="border-t-[3px] border-zinc-950 pt-6">
              <h3
                className="text-[48px] font-black leading-none mb-4"
                style={{ color: 'var(--neon)' }}
              >
                02
              </h3>
              <p className="text-lg font-bold text-zinc-700">
                You spend more time organizing than actually thinking.
              </p>
            </div>
            <div className="border-t-[3px] border-zinc-950 pt-6">
              <h3
                className="text-[48px] font-black leading-none mb-4"
                style={{ color: 'var(--neon)' }}
              >
                03
              </h3>
              <p className="text-lg font-bold text-zinc-700">
                When you need to connect ideas, the context is already gone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  const features = [
    {
      number: '01',
      title: 'Instant Capture',
      description:
        'Write thoughts, dictate voice notes, or attach files. Your ideas flow freely without friction.',
      accent: true,
    },
    {
      number: '02',
      title: 'Semantic Intelligence',
      description:
        'As you type, Pulse surfaces previously-related notes using advanced vector embeddings. Connections appear automatically.',
      accent: false,
    },
    {
      number: '03',
      title: 'Smart Merging',
      description:
        'Combine related ideas into cohesive thoughts. Originals are preserved, new connections are forged.',
      accent: true,
    },
    {
      number: '04',
      title: 'Offline First',
      description:
        'Works completely offline. Your drafts sync automatically when you reconnect. Always available.',
      accent: false,
    },
  ]

  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24 reveal-up">
          <h2 className="text-[8vw] md:text-[6vw] font-black leading-none uppercase tracking-tighter mb-6">
            Why Pulse
          </h2>
          <p className="text-xl md:text-2xl font-bold text-zinc-600 max-w-2xl">
            Because your second brain shouldn't require manual organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  return (
    <div
      className={`
        border-[5px] border-zinc-950 p-8 md:p-12 reveal-up
        ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}
        ${index % 2 === 1 ? 'md:border-l-0' : ''}
        transition-all duration-300 hover:bg-zinc-100
      `}
    >
      <span className="text-[80px] md:text-[120px] font-black leading-none text-zinc-200 absolute select-none -mt-4 -ml-2">
        {feature.number}
      </span>
      <div className="relative z-10">
        <h3
          className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 ${feature.accent ? '' : 'text-zinc-950'}`}
        >
          {feature.title}
        </h3>
        <p className="text-base md:text-lg font-bold text-zinc-600 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  )
}

function DemoSection() {
  const [activeDemo, setActiveDemo] = useState(0)

  const demos = [
    {
      title: 'Write',
      description: 'Start typing. Pulse watches.',
    },
    {
      title: 'Connect',
      description: 'Related notes appear.',
    },
    {
      title: 'Merge',
      description: 'Combine ideas instantly.',
    },
  ]

  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-zinc-950 text-white border-y-[5px] border-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal-up">
          <h2 className="text-[8vw] md:text-[6vw] font-black leading-none uppercase tracking-tighter mb-6">
            See It In Action
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-4 reveal-up">
            {demos.map((demo, index) => (
              <button
                key={demo.title}
                onClick={() => setActiveDemo(index)}
                className={`
                  w-full text-left p-6 border-[3px] transition-all duration-200
                  ${
                    activeDemo === index
                      ? 'border-white bg-white text-zinc-950'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-wider mb-2">
                      {demo.title}
                    </h3>
                    <p
                      className={`font-bold ${activeDemo === index ? 'text-zinc-700' : 'text-zinc-400'}`}
                    >
                      {demo.description}
                    </p>
                  </div>
                  <div
                    className={`
                    w-8 h-8 flex items-center justify-center font-black text-lg
                    ${activeDemo === index ? 'bg-zinc-950 text-white' : 'border-2 border-zinc-600'}
                  `}
                  >
                    {index + 1}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="relative reveal-up">
            <DemoVisual activeDemo={activeDemo} />
          </div>
        </div>
      </div>
    </section>
  )
}

function DemoVisual({ activeDemo }: { activeDemo: number }) {
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (activeDemo === 0) {
      setIsTyping(true)
      setShowSuggestions(false)
    } else if (activeDemo === 1) {
      setIsTyping(false)
      setShowSuggestions(true)
    } else if (activeDemo === 2) {
      setIsTyping(false)
      setShowSuggestions(true)
    }
  }, [activeDemo])

  return (
    <div className="border-[5px] border-zinc-700 bg-zinc-900 p-6">
      <div className="border-[3px] border-zinc-700 bg-zinc-950 p-4 min-h-[200px]">
        {activeDemo === 0 && (
          <div className="text-zinc-500 font-mono text-sm">
            <span className="text-white">Building the next version of my product...</span>
            {isTyping && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}
          </div>
        )}

        {activeDemo === 1 && (
          <div className="space-y-3">
            <div className="text-white font-mono text-sm">
              Building the next version of my product...
            </div>
            <div className="border-t-[3px] border-zinc-700 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Strong Match
                </span>
                <div className="px-2 py-1 text-[11px] font-black bg-zinc-800 text-zinc-300">
                  0.92
                </div>
              </div>
              <p className="text-zinc-400 text-sm font-bold">
                Product roadmap for Q4 - focusing on user retention and core features...
              </p>
            </div>
          </div>
        )}

        {activeDemo === 2 && (
          <div className="space-y-3">
            <div className="text-white font-mono text-sm">
              Building the next version of my product...
            </div>
            <div className="border-t-[3px] border-zinc-700 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
                  ■
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Yesterday
                </span>
              </div>
              <p className="text-zinc-400 text-sm font-bold">
                Product roadmap for Q4 - focusing on user retention and core features...
              </p>
            </div>
            <div className="text-zinc-600 text-xs font-bold uppercase tracking-wider text-center py-2">
              Notes merged
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-5 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24 reveal-up">
          <h2 className="text-[8vw] md:text-[6vw] font-black leading-none uppercase tracking-tighter mb-6">
            How It Works
          </h2>
          <p className="text-xl md:text-2xl font-bold text-zinc-600 max-w-2xl mx-auto">
            Magic powered by vector embeddings and brutalist design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              step: '1',
              title: 'Write Freely',
              content: 'Capture thoughts, voice notes, or files. No structure required.',
            },
            {
              step: '2',
              title: 'AI Detects',
              content: 'Semantic analysis finds related notes in your archive.',
            },
            {
              step: '3',
              title: 'Connect & Merge',
              content: 'Combine ideas with one click. Your knowledge grows.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="border-[5px] border-zinc-950 p-8 hover:border-[#FF00FF] transition-all duration-300 reveal-up"
            >
              <div
                className="text-[60px] font-black leading-none mb-6"
                style={{ color: 'var(--neon)' }}
              >
                {item.step}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-zinc-950">
                {item.title}
              </h3>
              <p className="text-base font-bold text-zinc-600">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-24 border-[5px] border-zinc-950 p-8 md:p-12 bg-zinc-50 reveal-up">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 text-zinc-950">
                Under The Hood
              </h3>
              <ul className="space-y-4">
                {[
                  '384-dimensional vector embeddings',
                  'Multilingual semantic search',
                  'Client-side ML with @xenova/transformers',
                  'Convex for real-time sync',
                  'Offline-first PWA architecture',
                ].map((tech) => (
                  <li key={tech} className="flex items-center gap-3">
                    <span className="text-[20px]" style={{ color: 'var(--neon)' }}>
                      ■
                    </span>
                    <span className="text-base font-bold text-zinc-700">{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-[3px] border-zinc-950 p-6 bg-white">
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-4">
                Embedding Visualization
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[...Array(48)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square"
                    style={{
                      backgroundColor: `hsl(${300 + Math.random() * 60}, 100%, ${30 + Math.random() * 40}%)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-zinc-950 text-white border-t-[5px] border-zinc-950">
      <div className="max-w-4xl mx-auto text-center reveal-up">
        <div className="mb-8">
          <span
            className="text-[60px] md:text-[80px] leading-none star-glow"
            style={{ color: 'var(--neon)' }}
          >
            ✦
          </span>
        </div>

        <h2 className="text-[10vw] md:text-[8vw] font-black leading-none uppercase tracking-tighter mb-8">
          Your Ideas
          <br />
          Deserve Better
        </h2>

        <p className="text-xl md:text-2xl font-bold text-zinc-400 mb-12 max-w-2xl mx-auto">
          Stop organizing. Start connecting. Let Pulse surface the context you need, when you need
          it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-10 py-5 text-[16px] font-black uppercase tracking-wider text-zinc-950 bg-white border-[3px] border-white hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all duration-150"
          >
            Start Writing Now
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-5 text-[16px] font-black uppercase tracking-wider text-white border-[3px] border-zinc-700 hover:border-white transition-all duration-150"
          >
            View Source
          </a>
        </div>

        <div className="mt-16 pt-16 border-t border-zinc-800">
          <p className="text-[12px] font-black uppercase tracking-widest text-zinc-600">
            Free forever · Open source · Offline first
          </p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-5 md:px-10 bg-white border-t-[5px] border-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="star-glow text-[24px] leading-none font-black"
                style={{ color: 'var(--neon)' }}
              >
                ✦
              </span>
              <span className="text-[18px] font-black uppercase tracking-widest text-zinc-950">
                PULSE
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-600">Your ideas, connected</p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    Launch
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pulses"
                    className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    Archive
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            v0.1 · PWA · Offline · Made with ✦
          </p>
          <p className="text-[10px] font-bold text-zinc-500">© 2025 Pulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
