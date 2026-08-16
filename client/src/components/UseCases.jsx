import { motion } from 'motion/react'
import {
  Building2,
  Bus,
  Dumbbell,
  GraduationCap,
  Headset,
  HeartPulse,
  Laptop,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { stagger, fadeUp } from '@/lib/motion'

const CASES = [
  { icon: GraduationCap, label: 'Student & faculty feedback' },
  { icon: Building2, label: 'Departments & teams' },
  { icon: ShoppingBag, label: 'Products & services' },
  { icon: Headset, label: 'Customer support' },
  { icon: Users, label: 'Employee engagement' },
  { icon: Laptop, label: 'Software & apps' },
  { icon: Dumbbell, label: 'Training programs' },
  { icon: HeartPulse, label: 'Healthcare services' },
  { icon: Bus, label: 'Transport & commute' },
  { icon: ShoppingBag, label: 'Retail & stores' },
]

function Chip({ item }) {
  const Icon = item.icon
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full border bg-card px-5 py-2.5 text-sm font-medium">
      <Icon className="size-4 text-primary" />
      {item.label}
    </span>
  )
}

export default function UseCases() {
  return (
    <section className="mt-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.h2 variants={fadeUp} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          One flow, every use case
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-muted-foreground sm:text-base">
          Collect feedback wherever it happens — from classrooms to customer support.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mt-10 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        <div className="flex w-max animate-marquee items-center gap-4 will-change-transform motion-reduce:animate-none hover:[animation-play-state:paused]">
          {CASES.map((item) => (
            <Chip key={item.label} item={item} />
          ))}
          <div aria-hidden="true" className="flex w-max items-center gap-4">
            {CASES.map((item) => (
              <Chip key={item.label} item={item} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
