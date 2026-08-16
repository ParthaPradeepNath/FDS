import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Logo from '../components/Logo'
import { buttonVariants } from '@/components/ui/button'
import { fadeUp, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <Logo className="size-7" />
          <span className="text-base font-semibold tracking-tight">One Hub</span>
        </Link>
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'rounded-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
          )}
        >
          Back to Home
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 pt-10 pb-16 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.span
            variants={fadeUp}
            aria-hidden="true"
            className="select-none bg-gradient-to-b from-primary to-lime-700 bg-clip-text text-[clamp(6rem,22vw,14rem)] leading-none font-bold tracking-tighter text-transparent"
          >
            404
          </motion.span>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-balance text-base text-muted-foreground sm:text-lg"
          >
            This page took a wrong turn.
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}
