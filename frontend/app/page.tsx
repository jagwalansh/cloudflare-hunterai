"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import CountUp from '@/components/shared/CountUp';
import VariableProximity from '@/components/shared/VariableProximity';
import CurvedLoop from '@/components/shared/CurvedLoop';
import RoleTyper from '@/components/shared/RoleTyper';
import { User } from 'lucide-react';

// Register GSAP Plugin on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  ['Upload', 'Add a resume, LinkedIn PDF, or portfolio notes in one pass.'],
  ['Extract', 'The system separates skills, projects, impact, tools, and context.'],
  ['Match', 'Roles are ranked by fit, gaps, evidence strength, and timing.'],
];

const features = [
  ['Universal profile', 'One canonical career profile that can shape resumes, applications, and job board data.'],
  ['Match scoring', 'See fit, gaps, and leverage before deciding whether a role deserves time.'],
  ['Skill graph', 'A map of adjacent skills, seniority signals, missing terms, and evidence density.'],
  ['Auto-apply', 'Queue tailored applications with the strongest proof already attached.'],
  ['Alerts', 'Get quiet notifications when a role matches your actual momentum.'],
];

const jobPlatforms = [
  { name: 'LinkedIn', mark: 'in', className: 'platform-linkedin' },
  { name: 'Internshala', mark: 'i', className: 'platform-internshala' },
] as const;

function Icon({ name }: { name: 'search' | 'bell' | 'upload' | 'filter' | 'arrow' | 'check' | 'refresh' | 'bookmark' }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 15H6l1.2-1.8V9a4.8 4.8 0 0 1 9.6 0v4.2L18 15Z" /><path d="M10 18h4" /></>,
    upload: <><path d="M12 16V5" /><path d="m8 9 4-4 4 4" /><path d="M5 19h14" /></>,
    filter: <><path d="M5 7h14" /><path d="M8 12h8" /><path d="M10 17h4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4 10-10" />,
    refresh: <><path d="M20 12a8 8 0 0 1-13.5 5.8" /><path d="M4 12A8 8 0 0 1 17.5 6.2" /><path d="M17 2v5h-5" /><path d="M7 22v-5h5" /></>,
    bookmark: <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16l-5-3-5 3Z" />,
  };

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

const workflowPath =
  'M522 205 C604 220 625 292 575 370 C535 433 565 470 640 492 C704 511 752 529 780 565 C830 635 740 690 602 676 C500 666 430 642 410 714 C398 754 406 784 430 800';



function DashboardMock({ countersActive }: { countersActive: boolean }) {
  const signalStats = [
    ['Python', 28500, 0.45],
    ['Product analytics', 35200, 0.55],
    ['Workflow design', 24300, 0.65],
  ] as const;

  return (
    <div className="dashboard glass-panel relative z-10 mx-auto mt-12 grid h-[30rem] w-[min(70rem,92vw)] grid-cols-[13.5rem_1fr] overflow-hidden rounded-[1.05rem] text-left md:mt-16">
      <aside className="side-rail hidden p-6 text-white md:block">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-black text-[var(--black)]">H</span>
          <div>
            <p className="text-sm font-semibold">Hunter AI</p>
            <p className="text-xs text-white/58">skill assets</p>
          </div>
        </div>
        <div className="mt-7 rounded-md bg-white/12 px-3 py-2 text-xs text-white/72">Search profile</div>
        <div className="mt-8 space-y-4 text-sm text-white/72">
          {['Dashboard', 'Skill graph', 'Applications', 'Saved roles'].map((item, index) => (
            <div key={item} className={`flex items-center hover:bg-black/20 hover:transition-all p-2 rounded-2xl justify-between ${index === 0 ? 'text-white' : ''}`}>
              <span>{item}</span>
              {index === 0 && <span className="rounded-full bg-white/18 px-2 py-0.5 text-xs">12</span>}
            </div>
          ))}
        </div>
      </aside>

      <div className="relative col-span-2 p-5 md:col-span-1 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--stone)]">career signal</p>
            <RoleTyper 
              className="text-2xl font-semibold tracking-[-.03em] md:text-3xl"
              roles={[
                "Software Engineer",
                "UI/UX Designer",
                "Product Manager",
                "Data Scientist",
                "DevOps Engineer",
                "AI Engineer",
                "Full Stack Developer",
                "Backend Engineer"
              ]} 
            />
          </div>
        </div>

        <div className="mt-9">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--stone)]">role match control</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <span className="numeric text-5xl font-semibold tracking-[-.025em] md:text-6xl">
              <CountUp from={0} to={87.4} duration={1.3} startWhen={countersActive} shuffle shuffleDuration={0.78} />%
            </span>
            <span className="mb-2 rounded-full bg-[var(--white)] px-3 py-1 text-xs font-semibold text-[var(--charcoal)] border border-[var(--line)]">
              +<CountUp from={0} to={14.8} delay={0.12} duration={1.05} startWhen={countersActive} shuffle shuffleDuration={0.65} /> fit gain
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {signalStats.map(([label, value, delay]) => (
            <div key={label} className="rounded-lg border border-[var(--line)] bg-white/56 p-4">
              <p className="numeric text-2xl font-semibold tracking-[-.04em]">
                <CountUp from={0} to={value} delay={delay * 0.35} duration={1.2} separator="," startWhen={countersActive} shuffle shuffleDuration={0.7} />
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 h-28 overflow-hidden rounded-lg border border-[var(--line)] bg-white/46 p-4">
          <div className="flex h-full items-end gap-[3px]">
            {Array.from({ length: 82 }).map((_, index) => (
              <span
                key={index}
                className="block flex-1 rounded-t bg-[var(--black)]/18"
                style={{ height: `${24 + ((index * 13) % 68)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const heroMatchRef = useRef<HTMLSpanElement>(null);
  const [dashboardCountersActive, setDashboardCountersActive] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDashboardCountersActive(true);
      return;
    }
    if (!root.current) return;

    setDashboardCountersActive(false);

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-kicker', { y: 14, opacity: 0, duration: 0.7 }, 0.05)
        .from('.hero-copy', { y: 18, opacity: 0, duration: 0.75 }, 0.55)
        .from('.dashboard', { y: 90, opacity: 0, scale: 0.94, duration: 1.05 }, 0.42)
        .call(() => setDashboardCountersActive(true), [], 0.42);

      gsap.to('.mist', {
        x: 34,
        y: -12,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.dashboard-scroll-wrap', {
        y: -72,
        scrollTrigger: {
          trigger: '.hero-stage',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });

      gsap.utils.toArray<HTMLElement>('.reveal:not(.workflow-step)').forEach((item) => {
        gsap.from(item, {
          y: 34,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
          },
        });
      });

      const workflowMap = root.current?.querySelector<HTMLElement>('.workflow-map');
      const workflowPathProgress = root.current?.querySelector<SVGPathElement>('.workflow-path-progress');
      const matchStep = root.current?.querySelector<HTMLElement>('.workflow-match');
      const workflowSteps = root.current ? Array.from(root.current.querySelectorAll<HTMLElement>('.workflow-step')) : [];

      if (workflowMap && workflowPathProgress && matchStep) {
        const pathLength = workflowPathProgress.getTotalLength();
        const clampProgress = gsap.utils.clamp(0, 1);
        const stepThresholds = [0.03, 0.47, 0.86];

        workflowPathProgress.style.strokeDasharray = `${pathLength}`;
        workflowPathProgress.style.strokeDashoffset = `${pathLength}`;

        const drawWorkflowPath = () => {
          const mapTop = workflowMap.getBoundingClientRect().top + window.scrollY;
          const matchRect = matchStep.getBoundingClientRect();
          const matchCenter = matchRect.top + window.scrollY + matchRect.height / 2;
          const start = mapTop - window.innerHeight * 0.72;
          const end = matchCenter - window.innerHeight * 0.5;
          const progress = clampProgress((window.scrollY - start) / Math.max(end - start, 1));
          const grey = Math.round(143 + (5 - 143) * progress);
          const greyBlue = Math.round(141 + (5 - 141) * progress);

          workflowPathProgress.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
          workflowPathProgress.style.stroke = `rgb(${grey}, ${grey}, ${greyBlue})`;

          workflowSteps.forEach((step, index) => {
            step.classList.toggle('is-visible', progress >= stepThresholds[index]);
          });
        };

        const mapObserver = new IntersectionObserver(
          ([entry]) => {
            workflowMap.dataset.pathActive = String(entry.isIntersecting);
            drawWorkflowPath();
          },
          { rootMargin: '20% 0px 20% 0px' },
        );

        mapObserver.observe(workflowMap);

        window.addEventListener('scroll', drawWorkflowPath, { passive: true });
        window.addEventListener('resize', drawWorkflowPath);
        drawWorkflowPath();

        cleanups.push(() => {
          mapObserver.disconnect();
          window.removeEventListener('scroll', drawWorkflowPath);
          window.removeEventListener('resize', drawWorkflowPath);
        });
      }


    }, root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return (
    <div className="landing-body">
      <div ref={root} className="min-h-screen overflow-hidden text-[var(--black)]">
        <a className="focusable sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2" href="#main">
          Skip to content
        </a>

        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 border-b border-[var(--line)]">
          <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
            <Link href="/" className="text-2xl font-black tracking-tight md:text-3xl">
              HunterAI
            </Link>
            <div className="hidden items-center gap-10 text-sm font-bold uppercase md:flex absolute left-1/2 -translate-x-1/2">
              <a href="#how" className="hover:opacity-70">How it Works</a>
              <a href="#features" className="hover:opacity-70">Features</a>

            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {(!user || user.isGuest) ? (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="border font-bold border-gray-400 rounded-full hover:bg-gray-600 hover:text-white hover:shadow-2xl px-3 py-1.5 sm:px-6 sm:py-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:opacity-70 cursor-pointer whitespace-nowrap"
                  >
                    Sign in
                  </button>

                  <Link
                    href="/dashboard"
                    className="rounded-full bg-black px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md md:text-base whitespace-nowrap"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="border font-bold border-gray-400 rounded-full hover:bg-gray-600 hover:text-white hover:shadow-2xl px-3 py-1.5 sm:px-6 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm hover:opacity-70 cursor-pointer whitespace-nowrap text-black"
                    style={{ textDecoration: 'none' }}
                  >
                    <User size={13} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> Profile
                  </Link>

                  <Link
                    href="/dashboard"
                    className="rounded-full bg-black px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md md:text-base whitespace-nowrap"
                  >
                    Go to Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <header className="hero-stage relative min-h-[920px] overflow-hidden pt-[6.2rem] md:min-h-[1040px]">
          <div className="mist absolute left-[14%] top-[26rem] h-28 w-72 rounded-full bg-white/80" />
          <div className="mist absolute right-[17%] top-[31rem] h-24 w-64 rounded-full bg-white/70" />
          <div className="relative z-10 mx-auto max-w-[112rem] px-5 pt-20 text-center md:px-10 md:pt-24">
            <p className="hero-kicker text-sm font-semibold uppercase tracking-[.08em] text-[var(--stone)]">Career intelligence reimagined</p>
            <div className="mt-5 overflow-hidden pb-6">
              <div className="hero-title text-6xl sm:text-7xl md:text-8xl tracking-loose font-semibold leading-[1.1] sm:leading-[1.0]" role="heading" aria-level={1}>
                <span className="block text-[var(--silver)]">A new standard in</span>
                <span ref={heroMatchRef} className="block text-[var(--black)]">
                  <VariableProximity
                    label="career matching"
                    className="hero-proximity"
                    fromFontVariationSettings="'wght' 620"
                    toFontVariationSettings="'wght' 940"
                    containerRef={heroMatchRef}
                    radius={260}
                    falloff="exponential"
                  />
                </span>
              </div>
            </div>
            <p className="hero-copy text-balance mx-auto mt-8 max-w-2xl text-lg text-[var(--muted)] md:text-xl">
              Upload once and turn scattered experience into a living skill profile, ranked opportunities, and clearer applications in real time.
            </p>
            <div className="dashboard-scroll-wrap w-full">
              <DashboardMock countersActive={dashboardCountersActive} />
            </div>
          </div>
        </header>

        <main id="main">
          <section id="how" className="section-rule soft-grid bg-[var(--paper)] px-5 py-24 md:px-10 md:py-32">
            <div className="mx-auto max-w-[82rem]">
              <div className="reveal grid gap-6 md:grid-cols-[.85fr_1fr] md:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[.08em] text-[var(--stone)]">How it works</p>
                  <h2 className="text-balance mt-4 text-5xl font-semibold leading-[.95] tracking-[-.06em] md:text-7xl">
                    From raw resume to ranked roles.
                  </h2>
                </div>
                <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
                  The workflow stays deliberately short. Upload the source material, let the system understand the context, then inspect the matches worth acting on.
                </p>
              </div>

              <div className="workflow-map relative mt-20 min-h-[58rem] md:min-h-[72rem]">
                <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1200 980" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    className="workflow-path-base"
                    d={workflowPath}
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    className="workflow-path-progress"
                    d={workflowPath}
                    fill="none"
                    stroke="#050505"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                <article className="workflow-step workflow-upload relative z-10 md:absolute md:left-0 md:top-0 md:w-[37rem]">
                  <div className="workflow-node numeric">01</div>
                  <div style={{ backgroundColor: '#ffffff', opacity: 1 }} className="flex flex-col md:flex-row gap-6 rounded-2xl p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.78)] border border-[var(--line)] md:p-8">
                    <h3 className="text-5xl font-semibold tracking-tight md:text-6xl md:w-[13rem] flex-shrink-0">{steps[0][0]}</h3>
                    <div className="flex-grow self-end">
                      <p className="text-lg leading-8 text-[var(--muted)]">{steps[0][1]}</p>
                      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[var(--charcoal)]">
                        <span className="rounded-lg bg-[var(--paper)] px-3 py-2 text-center border border-[var(--line)]">PDF</span>
                        <span className="rounded-lg bg-[var(--paper)] px-3 py-2 text-center border border-[var(--line)]">LinkedIn</span>
                        <span className="rounded-lg bg-[var(--paper)] px-3 py-2 text-center border border-[var(--line)]">Portfolio</span>
                        <span className="rounded-lg bg-[var(--paper)] px-3 py-2 text-center border border-[var(--line)]">Notes</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="workflow-step workflow-extract relative z-10 mt-10 md:absolute md:right-0 md:top-[24rem] md:mt-0 md:w-[40rem]">
                  <div className="workflow-node numeric md:ml-auto">02</div>
                  <div style={{ backgroundColor: '#ebebe9', opacity: 1 }} className="flex flex-col md:flex-row gap-6 rounded-2xl p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.56)] border border-[var(--line)] md:p-8">
                    <div className="flex-grow md:text-right">
                      <p className="text-lg leading-8 text-[rgba(5,5,5,.6)]">{steps[1][1]}</p>
                      <div className="mt-6 flex flex-wrap gap-2 md:justify-end">
                        {['Skills', 'Projects', 'Impact', 'Tools'].map((item) => (
                          <span key={item} className="rounded-full bg-white/62 px-3 py-1.5 text-sm font-semibold text-[var(--charcoal)] border border-[var(--line)]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-5xl font-semibold tracking-[-.065em] md:text-right md:text-6xl md:w-[10rem] flex-shrink-0 order-first md:order-last">{steps[1][0]}</h3>
                  </div>
                </article>

                <article className="workflow-step workflow-match relative z-10 mx-auto mt-10 md:absolute md:bottom-0 md:left-1/2 md:mt-0 md:w-[36rem] md:-translate-x-1/2">
                  <div className="workflow-node numeric mx-auto">03</div>
                  <div className="rounded-2xl bg-[var(--black)] p-7 text-center text-white shadow-[0_30px_80px_rgba(5,5,5,.22)] md:p-8">
                    <h3 className="text-6xl font-semibold tracking-[-.07em] md:text-7xl">{steps[2][0]}</h3>
                    <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-white/62">{steps[2][1]}</p>
                    <div className="numeric mx-auto mt-8 flex max-w-sm items-center justify-between rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--black)]">
                      <span>87.4% fit</span>
                      <span>14 roles</span>
                      <span>6 gaps</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>



          <section className="section-rule platform-source-section relative overflow-hidden px-5 py-24 md:px-10 md:py-32">
            <div className="source-halo" aria-hidden="true" />
            <div className="relative z-10 mx-auto flex min-h-[44rem] max-w-[92rem] flex-col items-center justify-center text-center">
              <p className="reveal source-label">Job suggestions from these platforms</p>
              <h2 className="reveal text-balance mt-5 max-w-5xl text-5xl font-semibold leading-[.95] tracking-[-.04em] text-[var(--black)] md:text-8xl">
                One resume, three live job markets.
              </h2>

              <div className="source-orbit reveal mt-12 w-full max-w-6xl" aria-label="LinkedIn and Internshala job source animation">
                <CurvedLoop
                  marqueeText="LinkedIn ✦ Internshala ✦"
                  speed={1.35}
                  curveAmount={260}
                  direction="right"
                  interactive
                  className="source-loop-text"
                />
              </div>

              <div className="platform-grid mt-10" aria-label="Supported job platforms">
                {jobPlatforms.map((platform) => (
                  <article key={platform.name} className={`platform-card ${platform.className}`}>
                    <span className="platform-mark" aria-hidden="true">{platform.mark}</span>
                    <span className="platform-name">{platform.name}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="section-rule bg-[var(--paper)] px-5 py-24 md:px-10 md:py-32">
            <div className="mx-auto max-w-[82rem]">
              <div className="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[.08em] text-[var(--stone)]">Features</p>
                  <h2 className="mt-4 text-5xl font-semibold tracking-[-.06em] md:text-7xl">Platform cards.</h2>
                </div>
                <p className="max-w-md text-lg leading-8 text-[var(--muted)]">
                  Built as a calm operating layer for repeated job-search decisions.
                </p>
              </div>

              <div className="mt-14 grid gap-5 md:grid-cols-6">
                {features.map(([title, copy], index) => (
                  <article key={title} className={`reveal lift-card rounded-xl bg-white/52 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.78)] border border-[var(--line)] ${index < 2 ? 'md:col-span-3' : 'md:col-span-2'}`}>
                    <div className="mb-14 h-1.5 w-20 rounded-full bg-[var(--black)]" />
                    <h3 className="text-2xl font-semibold tracking-[-.04em]">{title}</h3>
                    <p className="mt-4 leading-7 text-[var(--muted)]">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>



          <section id="closing" className="relative overflow-hidden bg-[var(--black)] px-5 py-24 text-white md:px-10 md:py-36">
            <div className="absolute inset-x-0 top-0 h-px bg-white/18" />
            <div className="reveal mx-auto flex max-w-5xl flex-col items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-[.08em] text-white/54">Your next chapter</p>
              <h2 className="text-balance mt-5 text-5xl font-semibold leading-[.95] tracking-[-.06em] md:text-8xl">
                Start with the resume you already have.
              </h2>
              <Link className="focusable magnet mt-10 rounded-full bg-white px-8 py-4 font-semibold text-[var(--black)] shadow-[0_24px_54px_rgba(255,255,255,.12)]" href="/dashboard">
                Go to Dashboard
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-[var(--black)] text-white/54 border-t border-white/10 px-6 py-12">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-lg font-black tracking-tight text-white">
              HunterAI
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} HunterAI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
