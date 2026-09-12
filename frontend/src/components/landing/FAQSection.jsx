import { useState } from 'react'
import Animate from '../Animate'
import FAQItem from './FAQItem'

const faqs = [
  {
    q: 'What is IP-SAKTI 2.0?',
    a: 'IP-SAKTI 2.0 is an AI-powered regulatory intelligence platform designed for India\'s Ayurvedic innovation ecosystem. It evaluates formulations across six dimensions — statutory classification, intellectual property, traditional knowledge, biodiversity/ABS compliance, evidence, and multilingual reporting — and generates a structured regulatory dossier.',
  },
  {
    q: 'Is it free to use?',
    a: 'Yes. IP-SAKTI 2.0 is completely free. It was developed as a regulatory intelligence initiative to support researchers, formulators, and IP professionals working with Ayurvedic and traditional medicine formulations in India.',
  },
  {
    q: 'What types of formulations can I evaluate?',
    a: 'Any Ayurvedic, Siddha, or Unani (ASU) formulation — including hair oils, skin preparations, internal medicines, and polyherbal compositions. Simply describe your formulation ingredients in natural language, and the system will identify the botanical entities and run the evaluation pipeline.',
  },
  {
    q: 'Which regulatory statutes does it cover?',
    a: 'The platform covers the Drugs and Cosmetics Act 1940, Schedule E(1) (restricted/toxic substances), the Drugs and Magic Remedies (Objectionable Advertisements) Act 1954, the Biological Diversity Act 2002, Ayurvedic Pharmacopoeia of India, and relevant gazette notifications. International coverage includes WHO traditional medicine guidelines and Nagoya Protocol considerations.',
  },
  {
    q: 'How accurate are the evaluations?',
    a: 'Every finding in the report is evidence-linked — it traces back to a specific Act, Section, Schedule entry, or pharmacopoeia reference. The system uses a Dual-RAG architecture that retrieves from vectorized statute databases rather than relying on LLM knowledge alone. However, IP-SAKTI is an intelligence tool, not a substitute for legal counsel.',
  },
  {
    q: 'Does it support languages other than English?',
    a: 'Yes. IP-SAKTI generates full regulatory evaluations in Hindi, Marathi, Bengali, Tamil, Telugu, and more. Translations are powered by Bhashini and Sarvam NMT APIs, with scientific binomial names and legal references preserved accurately across languages.',
  },
  {
    q: 'Is my formulation data kept private?',
    a: 'Absolutely. IP-SAKTI employs DPDP-compliant data masking — proprietary formulation details are masked before reaching any language model. Your trade secrets never leave the secure pipeline. All chat history is stored in your personal account and is not shared.',
  },
  {
    q: 'Can I download the regulatory report?',
    a: 'Yes. Every evaluation generates a downloadable PDF report with 9 structured sections: Executive Summary, Formulation Profile, Regulatory Assessment, IPR Assessment, Traditional Knowledge, ABS/Biodiversity, Risk Assessment, Evidence, and Recommended Actions.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative bg-white py-20 lg:py-28 border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-6">
        <Animate type="fadeUp">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-saffron-500 mb-4 block">
              FAQ
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight mb-5">
              Frequently asked questions
            </h2>
          </div>
        </Animate>

        <Animate type="fadeUp" delay={0.1}>
          <div className="border-t border-gray-100">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </Animate>
      </div>
    </section>
  )
}
