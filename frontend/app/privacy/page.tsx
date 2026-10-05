import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Privacy Policy | IntervAi",
  description: "Privacy policy for IntervAi, covering data collection, use, AI processing, retention, and user rights.",
};

export default function PrivacyPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Privacy Policy</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Interview AI Privacy Policy</h1>
              <div className="mt-4 space-y-1 text-sm text-ink-secondary">
                <p><strong>Effective Date:</strong> 01/10/2026</p>
                <p><strong>Last Updated:</strong> 05/10/2026</p>
              </div>
            </div>

            <p className="text-base leading-8 text-ink-secondary">
              Welcome to <strong>Interview AI</strong>. Interview AI is an AI-powered career and interview preparation
              platform designed to help users practice interviews, improve communication, receive AI-generated feedback,
              analyze resumes, and prepare for employment opportunities.
            </p>

            <div className="mt-10 space-y-8 text-ink-primary">
              <section>
                <h2 className="text-2xl font-bold text-ink-primary">1. Who We Are</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI is operated by <strong>Vaibhav Patil</strong> under the <strong>Interview AI</strong>
                  brand. For privacy and data-protection purposes, we may act as the data fiduciary/controller or
                  equivalent entity responsible for personal information processed through the Services, subject to
                  applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">2. Information We Collect</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We collect only information reasonably necessary to operate, secure, improve, and provide the
                  Services. This may include account information, profile details, education and career history,
                  skills, experience, and optional profile photos. We also process resume and career data, interview
                  answers, transcripts, audio and video recordings, communication metrics, AI-generated feedback,
                  and technical usage information, including device, browser, IP address, and security event data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">3. Resume and Career Information</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  If you upload or create a resume, CV, cover letter, portfolio, or similar career document, we may
                  process the information contained within it, including contact details, education, work experience,
                  skills, certifications, projects, career preferences, and resume formatting. We use this
                  information to provide resume analysis, interview personalization, job preparation, and related
                  features. You should not upload information that you do not have permission to provide.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">4. Interview Data</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  When you use Interview AI&apos;s interview features, we may process interview questions, written answers,
                  spoken answers, audio recordings, transcripts, interview duration, scores, communication metrics,
                  answer quality indicators, AI-generated feedback, coding responses, and interview history. Some
                  interview data may be temporarily processed by third-party AI, speech, cloud, or infrastructure
                  providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">5. Voice and Audio Data</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  If you use voice-interview or communication-training features, Interview AI may process microphone
                  input, including audio recordings, speech, transcriptions, pronunciation-related signals, speaking
                  pace, pauses, filler-word frequency, response structure, and other communication indicators. We use
                  this information to provide the requested interview or communication-analysis service. We do not
                  claim that AI-generated communication scores are medical, psychological, employment, or personality
                  assessments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">6. Camera and Video Data</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Certain features may optionally require access to your camera. If enabled, we may process video
                  streams, recordings, interview-session frames, and other visual interview-session information. Camera
                  access will not be required unless reasonably necessary for the feature you choose. Unless expressly
                  stated otherwise, Interview AI does not intend to identify individuals through facial-recognition
                  technology.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">7. AI-Processed Information</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI uses artificial intelligence and machine-learning technologies to provide certain
                  Services. AI may process information you submit to generate interview questions, follow-up questions,
                  evaluate answers, generate feedback, analyze resumes, improve interview preparation, generate
                  recommendations, personalize learning experiences, and assist with communication practice. AI outputs
                  may contain mistakes, omissions, or inaccurate conclusions. You should independently evaluate
                  important information and should not rely solely on AI output when making significant career,
                  employment, financial, educational, or professional decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">8. Cookies and Similar Technologies</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI uses cookies, local storage, pixels, SDKs, and similar technologies for authentication,
                  session management, security, preferences, analytics, product performance, fraud prevention, and
                  marketing where applicable. For additional information, see our Cookie Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">9. How We Use Your Information</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We process personal information to create and maintain accounts, conduct AI interviews, generate
                  interview questions, provide feedback, analyze resumes, maintain interview history, personalize your
                  experience, prevent fraud and abuse, preserve security, and improve the product. We may also use
                  information to develop new features and test AI systems where permitted by law and your choices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">10. Data Sharing</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We may share information with carefully selected service providers who help us operate the Services,
                  including cloud hosting providers, database providers, authentication providers, AI model providers,
                  speech-to-text providers, email providers, analytics providers, payment processors, customer-support
                  providers, security providers, and error-monitoring providers. Service providers may process
                  information only according to applicable agreements, instructions, and law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">11. Data Retention</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We retain personal information only for as long as reasonably necessary for providing the Services,
                  maintaining your account, fulfilling contractual obligations, security, fraud prevention, legal
                  compliance, resolving disputes, enforcing agreements, and legitimate business purposes where legally
                  permitted. When information is no longer required, we may delete, anonymize, aggregate, or securely
                  dispose of it, subject to applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">12. Deletion of Your Data</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You may request deletion of your personal information, subject to applicable law and legitimate
                  retention requirements. You can contact <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
                  . When your account is deleted, certain information may remain temporarily in backups, logs,
                  fraud-prevention systems, or records that we are legally required or permitted to retain.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">13. Your Privacy Rights</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Depending on your location and applicable law, you may have rights to access personal information,
                  obtain information about processing, correct or update inaccurate information, withdraw consent,
                  request deletion, and raise grievances. Requests may be submitted to the privacy contact above. We
                  may need to verify your identity before fulfilling certain requests.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">14. Security</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We use reasonable technical and organizational measures designed to protect information, including
                  encryption in transit, access controls, authentication, role-based permissions, secure infrastructure,
                  logging, backup controls, and incident-response procedures. However, no internet service can guarantee
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">15. Contact Us</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  For privacy questions, requests, or complaints, contact <strong>Interview AI</strong> at
                  <a href="mailto:vp4647115@gmail.com" className="ml-1 text-primary underline">vp4647115@gmail.com</a>.
                </p>
              </section>
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
              For legal clarity, this page reflects the privacy commitments provided by the business. If you want,
              we can also add a matching <Link href="/terms" className="font-semibold text-primary underline">Terms of Service</Link>{" "}
              page and a cookie policy page in the same style.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
