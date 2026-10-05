import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Terms and Conditions | IntervAi",
  description: "Terms and conditions for IntervAi, covering eligibility, account responsibilities, acceptable use, AI content, subscriptions, and legal terms.",
};

export default function TermsPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Terms and Conditions</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Interview AI Terms and Conditions</h1>
              <div className="mt-4 space-y-1 text-sm text-ink-secondary">
                <p><strong>Effective Date:</strong> 01/10/2026</p>
                <p><strong>Last Updated:</strong> 05/10/2026</p>
              </div>
            </div>

            <p className="text-base leading-8 text-ink-secondary">
              Welcome to <strong>Interview AI</strong>. These Terms and Conditions (“Terms”) govern your access to and
              use of Interview AI&apos;s website, applications, AI interview tools, resume tools, communication-training
              features, APIs, subscriptions, and related services (collectively, the “Services”). By creating an
              account, accessing, or using the Services, you agree to these Terms.
            </p>

            <div className="mt-10 space-y-8 text-ink-primary">
              <section>
                <h2 className="text-2xl font-bold text-ink-primary">1. About Interview AI</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI is an AI-powered career preparation platform. Our Services may include AI mock interviews,
                  technical interviews, HR interviews, resume analysis, resume improvement, communication training,
                  voice-based interview practice, interview feedback, scoring, AI-generated questions, AI-generated answers,
                  coding interview practice, and personalized learning features. Features may change, be added, suspended,
                  or removed over time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">2. Eligibility</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You must satisfy the minimum age and legal requirements applicable to your location to use Interview AI.
                  If you are below the applicable age of digital consent, you may only use the Services where legally permitted
                  and with any required authorization. You must provide accurate information when creating an account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">3. Your Account</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You are responsible for maintaining account confidentiality, protecting your password and authentication
                  credentials, providing accurate information, and all activity occurring through your account, subject to
                  applicable law. You must immediately notify us if you believe your account has been compromised.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">4. Acceptable Use</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You agree not to use Interview AI to violate any law, infringe intellectual property rights, impersonate
                  another person, attempt unauthorized access, circumvent security systems, reverse engineer the Services where
                  prohibited by law, scrape the platform without permission, abuse APIs, attack infrastructure, upload malware,
                  conduct fraud, harass other users, upload unlawful or unauthorized content, or manipulate, exploit, or misuse
                  AI systems.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">5. AI-Generated Content</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI uses artificial intelligence. AI-generated content may be incorrect, incomplete, outdated,
                  misleading, biased, or inappropriate for a particular situation. You are responsible for reviewing AI-generated
                  content before relying on it. Interview AI does not guarantee that AI-generated answers are factually correct
                  or suitable for a particular interview, employer, role, examination, or professional situation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">6. No Guarantee of Employment</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI is an educational and preparation platform. Using our Services does not guarantee employment,
                  an interview, a job offer, salary, promotion, admission, certification, or professional success. We do not
                  represent that any particular interview score or resume score will result in employment.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">7. Interview Scores and Feedback</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview scores are generated using automated systems and may include statistical or AI-based evaluations.
                  Scores should be treated as educational indicators rather than objective measurements of your ability,
                  intelligence, employability, or professional worth. Technical limitations, accents, audio quality,
                  language differences, network conditions, and AI limitations may affect results.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">8. Voice Features</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  If you use voice-based features, you must provide appropriate microphone permission, are responsible for the
                  content of your responses, must not record another person without appropriate permission, and acknowledge that
                  AI analysis may contain errors and may involve third-party technology providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">9. Camera Features</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  If you enable camera-based features, you are responsible for obtaining permission from any other person appearing
                  in the recording, must not use the feature to secretly record another individual, and understand that visual
                  analysis may be inaccurate and does not guarantee the representation of emotions, competence, confidence, or behavior.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">10. Resume Services</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Resume-analysis and resume-generation tools are provided for assistance. You remain responsible for ensuring that your
                  resume is truthful, accurate, not fabricated, does not infringe third-party rights, and complies with applicable
                  employment requirements. Interview AI does not encourage users to fabricate experience, education, certifications,
                  or employment history.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">11. User Content</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You retain ownership of content that you submit to Interview AI, subject to rights you grant to us under these Terms.
                  You grant Interview AI a limited, non-exclusive, worldwide license to process, store, reproduce, transmit, and display
                  your content only as reasonably necessary to provide the Services, process your requests, generate requested AI outputs,
                  maintain the platform, secure the platform, provide support, and comply with law. Where required, additional consent will
                  be requested for other uses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">12. Feedback and Product Improvement</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You may provide suggestions, ideas, bug reports, or feedback. You agree that we may use non-confidential feedback to
                  improve Interview AI without owing you compensation, subject to applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">13. Intellectual Property</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI and its associated technology may include software, code, UI designs, graphics, branding, content,
                  algorithms, AI workflows, databases, documentation, trademarks, and product architecture. Except for rights expressly
                  granted to you, Interview AI and its licensors retain ownership of these materials. You may not copy, reproduce,
                  sell, redistribute, reverse engineer, or commercially exploit Interview AI&apos;s proprietary materials without permission,
                  except where such restriction is prohibited by applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">14. Subscriptions and Payments</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI may offer free plans, paid subscriptions, one-time purchases, usage-based plans, and promotional plans.
                  Prices, limits, features, billing cycles, and availability may vary. Before purchasing a paid plan, the applicable
                  price and billing terms will be presented to you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">15. Service Availability</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We aim to provide reliable Services, but we do not guarantee continuous availability, zero downtime, error-free
                  operation, uninterrupted AI responses, or compatibility with every device. Services may be temporarily unavailable
                  because of maintenance, security incidents, infrastructure failures, network problems, third-party outages, or force
                  majeure events.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">16. Privacy</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Your use of Interview AI is also governed by our privacy and cookie policies. Please review our
                  <Link href="/privacy" className="ml-1 text-primary underline">Privacy Policy</Link> and
                  <Link href="/cookies" className="ml-1 text-primary underline">Cookie Policy</Link>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">17. Disclaimer of Warranties</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  To the maximum extent permitted by applicable law, the Services are provided on an “as is” and “as available” basis.
                  We do not guarantee accuracy, suitability, uninterrupted availability, or that all errors will be corrected immediately.
                  Nothing in these Terms excludes warranties or rights that cannot legally be excluded.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">18. Limitation of Liability</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  To the maximum extent permitted by applicable law, Interview AI and its operators, employees, affiliates, contractors,
                  and service providers will not be responsible for indirect, incidental, special, consequential, or punitive damages arising
                  from your use of the Services. Where liability cannot be excluded, it will be limited to the maximum extent permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">19. Contact</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  For legal, privacy, grievance, or support questions, contact <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>.
                </p>
                <p className="mt-2 leading-7 text-ink-secondary">
                  Website: <a href="https://www.intervai.vpnpro.in" className="text-primary underline">www.intervai.vpnpro.in</a>
                </p>
              </section>
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
              This page reflects the business terms provided for your website. If you want, we can also add a separate
              <Link href="/privacy" className="ml-1 font-semibold text-primary underline">Privacy Policy</Link> and
              <Link href="/cookies" className="ml-1 font-semibold text-primary underline">Cookie Policy</Link> cross-links in a more formal legal layout.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
