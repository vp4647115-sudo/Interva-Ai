import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Help Center | IntervAi",
  description: "Answers, troubleshooting, and tips for getting the most out of Interview AI.",
};

const helpSections = [
  { title: "Getting Started", items: [
    { question: "How do I create an account?", answer: <>Select <strong>Sign Up</strong> and provide the requested information. Follow the verification instructions if verification is required.</> },
    { question: "How do I start an interview?", answer: <>Sign in to Interview AI, select <strong>Start Interview</strong>, choose the relevant interview type, and follow the instructions.</> },
    { question: "Do I need a resume?", answer: "Not always. Some features work without a resume, while resume-based personalization requires you to upload or provide one." },
  ] },
  { title: "AI Interviews", items: [
    { question: "How does an AI interview work?", answer: "Interview AI generates questions based on the interview type and information you provide. Your responses may then be analyzed to generate feedback and recommendations." },
    { question: "Can I choose the interview type?", answer: "Where supported, you may select HR, technical, behavioral, coding, or role-specific interviews." },
    { question: "Can I practice multiple times?", answer: "Yes. Repeated practice is one of the main purposes of Interview AI." },
  ] },
  { title: "Voice & Camera", items: [
    { question: "Why does Interview AI need microphone access?", answer: "Voice features require microphone access to capture your responses." },
    { question: "Why does Interview AI need camera access?", answer: "Camera access may be required for specific video-interview features. Grant camera permission only when you want to use those features." },
    { question: "My microphone isn't working.", answer: <>Check browser microphone permissions and operating-system settings, confirm the correct microphone is selected, refresh the page, and restart your browser if necessary.</> },
  ] },
  { title: "Resume", items: [
    { question: "What type of resume can I upload?", answer: "Supported file formats and size limits are displayed during upload." },
    { question: "Can AI analyze my resume?", answer: "Yes, where Resume Analyzer is available. It may analyze structure, skills, experience, projects, keywords, clarity, and role relevance. Review AI recommendations before using them." },
  ] },
  { title: "Account", items: [
    { question: "How do I change my profile?", answer: "Open your account or profile settings and update the available information." },
    { question: "How do I delete my account?", answer: <>Use the account deletion option if available, or contact <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a>.</> },
  ] },
  { title: "Billing", items: [
    { question: "How do I manage my subscription?", answer: "Open your account's billing or subscription section." },
    { question: "I was charged incorrectly.", answer: <>Contact <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a>. Include your account email and transaction information where appropriate. Do not send passwords or complete payment-card information.</> },
  ] },
  { title: "Privacy & Data", items: [
    { question: "How is my information used?", answer: <>Review our <a className="text-primary underline" href="/privacy">Privacy Policy</a> for details about collection, processing, retention, and sharing.</> },
    { question: "Can I request deletion of my data?", answer: <>Yes, subject to applicable legal requirements and retention obligations. Contact <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a>.</> },
  ] },
  { title: "Technical Problems", items: [
    { question: "Something isn't working. What should I try?", answer: "Refresh the page, check your internet connection, update your browser, disable problematic extensions, try another supported browser, and try again later if the service may be experiencing an outage. If it continues, contact support." },
  ] },
];

export default function HelpCenterPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Help Center</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">How Can We Help?</h1>
            <p className="mt-5 text-lg leading-8 text-ink-secondary">Find answers, troubleshoot problems, and learn how to get the most out of Interview AI.</p>
          </header>
          <div className="mt-10 space-y-8">
            {helpSections.map((section) => <section key={section.title}>
              <h2 className="mb-3 text-xl font-bold text-ink-primary">{section.title}</h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-surface-alt px-5 sm:px-7">
                {section.items.map((item) => <details key={item.question} className="group py-4">
                  <summary className="cursor-pointer list-none pr-8 font-semibold text-ink-primary marker:hidden">{item.question}<span aria-hidden="true" className="float-right text-primary group-open:rotate-45">+</span></summary>
                  <div className="mt-3 max-w-3xl leading-7 text-ink-secondary">{item.answer}</div>
                </details>)}
              </div>
            </section>)}
          </div>
          <section className="mt-10 rounded-2xl bg-primary-soft p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-primary">Still Need Help?</h2>
            <p className="mt-2 leading-7 text-ink-secondary">Contact the Interview AI team and we'll help you get back to practicing.</p>
            <a href="/contact" className="mt-5 inline-flex items-center justify-center rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Contact Support</a>
            <p className="mt-4 text-sm text-ink-secondary">Support: <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}