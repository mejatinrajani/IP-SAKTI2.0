import Animate from '../Animate'

export default function FeatureBlock({ title, description, bullets, visual, reverse = false, index = 0 }) {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 ${reverse ? 'lg:direction-rtl' : ''}`}>
      {/* Text */}
      <Animate type={reverse ? 'fadeRight' : 'fadeLeft'} delay={0.1} className={reverse ? 'lg:order-2 lg:direction-ltr' : ''}>
        <div className="space-y-5">
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-saffron-500">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold text-navy-900 tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-gray-500 leading-relaxed text-[15px]">
            {description}
          </p>
          <ul className="space-y-3 pt-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-saffron-400 mt-2 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Animate>

      {/* Visual */}
      <Animate type={reverse ? 'fadeLeft' : 'fadeRight'} delay={0.2} className={reverse ? 'lg:order-1 lg:direction-ltr' : ''}>
        <div className="relative">
          <div className="border border-gray-200 bg-white shadow-xl shadow-gray-100/50 overflow-hidden">
            {visual}
          </div>
          {/* Corner accent */}
          <div className={`absolute -bottom-2 ${reverse ? '-left-2' : '-right-2'} w-12 h-12 border-b-2 border-r-2 border-saffron-400 pointer-events-none hidden lg:block`} />
        </div>
      </Animate>
    </div>
  )
}
