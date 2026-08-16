import { motion } from 'motion/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BellRing, FolderSearch, Gauge, Target } from 'lucide-react'
import { stagger, fadeUp } from '@/lib/motion'

const BENEFITS = [
  {
    icon: Gauge,
    title: 'Understand satisfaction quickly',
    description:
      'Track ratings and feedback trends without manually reviewing every response.',
  },
  {
    icon: BellRing,
    title: 'Spot recurring issues early',
    description:
      'Identify common concerns across categories before they become bigger problems.',
  },
  {
    icon: Target,
    title: 'Make confident improvements',
    description:
      'Use organized reports and real user input to prioritize the changes that matter.',
  },
  {
    icon: FolderSearch,
    title: 'Keep feedback organized',
    description:
      'Store ratings, comments, and suggestions in one secure, searchable place.',
  },
]

export default function Benefits() {
  return (
    <section className="mx-auto mt-24 max-w-6xl">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="lg:sticky lg:top-32 lg:self-start"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            Why OneHub
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Make every response count
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            OneHub turns everyday feedback into clear, useful direction — helping teams understand
            what people value, where they struggle, and what to improve next.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 hidden items-center gap-3 lg:flex">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Four ways it helps
            </span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col gap-3"
        >
          <Accordion className="flex w-full flex-col gap-2">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <AccordionItem
                  key={benefit.title}
                  value={`benefit-${i}`}
                  className="overflow-hidden rounded-xl border bg-card transition-all duration-300 data-open:border-primary/30 data-open:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]"
                >
                  <AccordionTrigger className="gap-3 px-3 py-2.5 hover:no-underline">
                    <span className="inline-grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{benefit.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <p className="pl-11 pb-2.5 text-sm text-muted-foreground">{benefit.description}</p>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
