import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/useAuth.js'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { NoiseBackground } from '@/components/ui/noise-background'
import DashboardPreview from '../components/DashboardPreview'
import UseCases from '../components/UseCases'
import Benefits from '../components/Benefits'
import HowItWorks from '../components/HowItWorks'
import { cn } from '@/lib/utils'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

export default function Landing() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <div>
      <section className="relative mx-[calc(50%-50vw)] flex w-screen flex-col items-center justify-end overflow-hidden bg-background">
        <img
          src="/hero-home.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full px-4 pt-16 pb-12 text-center sm:px-8 sm:pt-24 sm:pb-16"
        >
          <motion.h1
            variants={fadeUp}
            className="mx-auto max-w-2xl text-balance text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl"
          >
            One hub for
            <br />
            <span className="bg-gradient-to-r from-primary to-lime-700 bg-clip-text text-transparent">
              all your feedbacks
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            Collect structured ratings and comments in one place, track every submission, and help
            administrators uncover actionable insights through clear dashboards and reports.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <NoiseBackground
                  containerClassName="w-fit rounded-full p-2 bg-muted"
                  gradientColors={['rgb(154, 230, 0)', 'rgb(255, 214, 50)', 'rgb(190, 250, 70)']}
                  noiseIntensity={0.35}
                >
                  <Link
                    to={isAdmin ? '/admin' : '/feedback/new'}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {isAdmin ? 'Open Dashboard' : 'Give Feedback'}
                    <ArrowRight className="size-4" />
                  </Link>
                </NoiseBackground>
                <Link
                  to={isAdmin ? '/admin/feedback' : '/my-feedback'}
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-6')}
                >
                  {isAdmin ? 'Review Feedback' : 'My Feedback'}
                </Link>
              </>
            ) : (
              <>
                <NoiseBackground
                  containerClassName="w-fit rounded-full p-2 bg-muted"
                  gradientColors={['rgb(154, 230, 0)', 'rgb(255, 214, 50)', 'rgb(190, 250, 70)']}
                  noiseIntensity={0.35}
                >
                  <Link
                    to="/login"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Get Started
                    <ArrowRight className="size-4" />
                  </Link>
                </NoiseBackground>
                <Link
                  to="/login"
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-6')}
                >
                  Login to Dashboard
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      <UseCases />

      <DashboardPreview />

      <HowItWorks />

      <Benefits />
    </div>
  )
}
