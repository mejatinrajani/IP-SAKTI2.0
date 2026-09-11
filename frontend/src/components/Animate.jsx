import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const variants = {
  fadeUp:   { hidden: { opacity: 0, y: 40 },  visible: { opacity: 1, y: 0 } },
  fadeIn:   { hidden: { opacity: 0 },          visible: { opacity: 1 } },
  fadeLeft: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  fadeRight:{ hidden: { opacity: 0, x: 40 },  visible: { opacity: 1, x: 0 } },
  scaleIn:  { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
}

export default function Animate({
  children,
  type = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className = '',
  threshold = 0.12,
}) {
  const { ref, inView } = useInView({ threshold, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants[type]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
