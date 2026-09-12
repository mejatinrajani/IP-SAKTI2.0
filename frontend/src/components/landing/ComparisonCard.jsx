import { motion } from 'framer-motion'

export default function ComparisonCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: '#ff9a2d' }}
      className="border border-gray-200 bg-white p-6 transition-all cursor-default group"
    >
      <div className="w-10 h-10 bg-navy-50 flex items-center justify-center mb-4 text-navy-700 group-hover:bg-saffron-50 group-hover:text-saffron-600 transition-colors">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-navy-900 mb-2 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-gray-500 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
