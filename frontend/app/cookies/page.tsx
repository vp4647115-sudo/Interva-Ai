import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Cookie Policy | IntervAi",
  description: "Cookie policy for IntervAi, explaining cookies, consent, analytics, performance, authentication, and your control options.",
};

export default function CookiesPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Cookie Policy</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Interview AI Cookie Policy</h1>
              <div className="mt-4 space-y-1 text-sm text-ink-secondary">
                <p><strong>Effective Date:</strong> 01/10/2026</p>
                <p><strong>Last Updated:</strong> 05/10/2026</p>
              </div>
            </div>

            <p className="text-base leading-8 text-ink-secondary">
              This Cookie Policy explains how Interview AI uses cookies and similar technologies on
              <strong> www.intervai.vpnpro.in</strong>.
            </p>

            <div className="mt-10 space-y-8 text-ink-primary">
              <section>
                <h2 className="text-2xl font-bold text-ink-primary">1. What Are Cookies?</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Cookies are small text files stored on your device when you visit a website. We may also use
                  technologies such as local storage, session storage, pixels, web beacons, software development kits
                  (SDKs), device identifiers, and similar technologies. These tools help us remember settings,
                  authenticate users, understand usage, protect the platform, and improve our Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">2. Types of Cookies We Use</h2>

                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-ink-primary">2.1 Strictly Necessary Cookies</h3>
                    <p className="mt-2 leading-7 text-ink-secondary">
                      These cookies are required for essential website functionality, including login, authentication,
                      session management, security, fraud prevention, account management, load balancing, and basic
                      functionality. They generally cannot be disabled without affecting core functionality.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-ink-primary">2.2 Functional Cookies</h3>
                    <p className="mt-2 leading-7 text-ink-secondary">
                      Functional cookies remember preferences such as language, theme, interface preferences, previously
                      selected settings, and session preferences.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-ink-primary">2.3 Analytics Cookies</h3>
                    <p className="mt-2 leading-7 text-ink-secondary">
                      Analytics technologies help us understand visitor numbers, popular pages, feature usage, session
                      behavior, performance, errors, and product engagement. Analytics data may be aggregated or
                      otherwise processed to understand how users interact with the Services.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-ink-primary">2.4 Performance Cookies</h3>
                    <p className="mt-2 leading-7 text-ink-secondary">
                      Performance technologies help us identify slow pages, technical errors, browser compatibility
                      issues, application failures, API issues, and performance bottlenecks.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-ink-primary">2.5 Marketing Cookies</h3>
                    <p className="mt-2 leading-7 text-ink-secondary">
                      Where used, marketing cookies may help us measure advertising campaigns, understand campaign
                      performance, deliver relevant promotional content, and measure conversions. We will seek consent
                      where required by applicable law before using non-essential marketing technologies.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">3. Authentication Technologies</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI may use cookies, local storage, tokens, or similar mechanisms to keep you securely
                  signed in. These technologies may contain identifiers that allow the platform to recognize your
                  authenticated session. You should never share authentication tokens or account credentials with
                  another person.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">4. Third-Party Cookies</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Some technologies may be provided by third parties, including analytics services, payment providers,
                  authentication providers, security providers, customer-support tools, marketing providers, and embedded
                  content providers. Third parties may process information according to their own privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">5. Cookie Consent</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Where legally required, Interview AI will provide a cookie-consent mechanism allowing users to accept
                  or reject optional cookies, manage preferences, and change previously provided choices. We do not
                  intend to make non-essential cookies a condition of using services where consent is legally required.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">6. Managing Cookies</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  You may control cookies through our cookie-consent interface, browser settings, device settings, or
                  third-party opt-out tools where available. Disabling certain cookies may cause some features to stop
                  functioning correctly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">7. Cookie Retention</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Cookies may be session cookies, which are deleted when the browser session ends, or persistent cookies,
                  which remain on your device for a defined time or until manually deleted. The retention period depends
                  on the purpose of the cookie.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">8. Local Storage and Similar Technologies</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  Interview AI may use browser local storage or similar technologies for interface preferences,
                  temporary application state, authentication-related functionality, performance, and feature
                  functionality. These technologies may operate differently from traditional cookies but serve similar
                  purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">9. Changes to This Cookie Policy</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  We may update this Cookie Policy when our technologies, Services, vendors, or legal requirements
                  change. The latest version will always be published on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink-primary">10. Contact</h2>
                <p className="mt-3 leading-7 text-ink-secondary">
                  For questions regarding cookies or privacy, please email <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>.
                </p>
                <p className="mt-2 leading-7 text-ink-secondary">
                  Website: <a href="https://www.intervai.vpnpro.in" className="text-primary underline">www.intervai.vpnpro.in</a>
                </p>
              </section>
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
              You can also review our <Link href="/privacy" className="font-semibold text-primary underline">Privacy Policy</Link> for the broader data handling details.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
