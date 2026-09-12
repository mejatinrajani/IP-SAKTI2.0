export default function UtilityBar({ t, lang, setLang }) {
  return (
    <div className="bg-navy-950 text-white text-xs py-1.5 px-6 flex items-center justify-between border-b border-navy-900">
      <span className="tracking-wide text-navy-400 hidden sm:block">{t.utilityBar}</span>
      <div className="flex items-center gap-5 text-navy-400 ml-auto">
        <button className="hover:text-white transition-colors">{t.accessibility}</button>
        <span className="text-navy-800">|</span>
        <button className="hover:text-white transition-colors">{t.help}</button>
        <span className="text-navy-800">|</span>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="bg-transparent text-navy-400 hover:text-white cursor-pointer outline-none"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </div>
    </div>
  )
}
