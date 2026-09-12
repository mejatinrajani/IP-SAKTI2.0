import { useState } from 'react'
import { motion } from 'framer-motion'
import Animate from './Animate'
import { useNavigate } from 'react-router-dom'
import { askIPSakti } from '../lib/api'

export default function Demo({ t }) {
  const navigate = useNavigate()
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState([
    { role: 'user', text: t.demoUser },
    { role: 'ai',   text: t.demoAI  },
  ])
  const [loading, setLoading]   = useState(false)
  const [lang, setLang]         = useState('en')

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const data = await askIPSakti(userMsg, lang)
      let reply = 'No response received.'
      if (data.status === 'success' && data.data?.india_response?.content) {
        reply = data.data.india_response.content
      } else if (data.status === 'clarify' && data.message) {
        reply = data.message
      } else if (data.data) {
        reply = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2)
      }
      setMessages(m => [...m, { role: 'ai', text: reply }])
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', text: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative bg-white border-b border-gray-100 py-28 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label">Live Demo</span>
          <h2 className="text-4xl font-bold text-navy-900 mt-4 mb-4 tracking-tight">{t.demoHeading}</h2>
          <div className="divider-line mb-14" />
        </Animate>

        <Animate type="scaleIn" delay={0.15}>
          <div className="max-w-3xl mx-auto shadow-2xl shadow-navy-900/15 border border-gray-200 bg-white">
            {/* Title bar */}
            <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-navy-300 ml-2">IP-SAKTI Research Interface</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={lang} onChange={e => setLang(e.target.value)}
                  className="bg-navy-800 text-navy-300 text-xs border border-navy-700 px-2 py-1 outline-none">
                  <option value="en">EN</option>
                  <option value="hi">हि</option>
                  <option value="mr">मरा</option>
                  <option value="ta">த</option>
                </select>
                <span className="text-xs text-navy-600 border border-navy-800 px-2 py-0.5">v2.0</span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 bg-gray-50/50 max-h-80 overflow-y-auto">
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-lg">
                    <div className={`text-xs mb-1 font-semibold tracking-wide flex items-center gap-1.5 ${msg.role === 'user' ? 'text-right text-gray-400 justify-end' : 'text-gray-400'}`}>
                      {msg.role === 'ai' && <span className="w-3 h-3 border-2 border-saffron-400 inline-block" />}
                      {msg.role === 'user' ? 'USER' : 'IP-SAKTI 2.0'}
                    </div>
                    <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-navy-900 text-white'
                        : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-navy-400" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white px-4 py-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about a formulation or regulatory question…"
                className="flex-1 text-sm text-navy-900 outline-none px-3 py-2 border border-gray-200 focus:border-navy-400 transition-colors"
              />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleSend} disabled={loading || !input.trim()}
                className="bg-navy-900 text-white text-xs font-bold px-5 py-2 hover:bg-navy-700 transition-colors disabled:opacity-40"
              >
                Ask →
              </motion.button>
            </div>

            {/* Tags + CTA */}
            <div className="border-t border-gray-100 bg-white px-5 py-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex flex-wrap gap-1">
                {t.demoTags.map((tag, i) => (
                  <span key={i}
                    onClick={() => setInput(tag)}
                    className="text-xs font-semibold text-navy-700 bg-navy-50 border border-navy-100 px-3 py-1 hover:bg-navy-900 hover:text-white hover:border-navy-900 cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button onClick={() => navigate('/evaluate')}
                className="text-xs font-bold text-navy-900 border border-navy-900 px-4 py-1.5 hover:bg-navy-900 hover:text-white transition-colors flex-shrink-0">
                Full Evaluation →
              </button>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
