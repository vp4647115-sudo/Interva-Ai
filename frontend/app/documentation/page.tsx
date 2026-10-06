import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Interview AI Documentation | IntervAi",
  description: "The Interview AI user guide: getting started, interviews, voice and video, resume analysis, privacy, troubleshooting, and more.",
};

type DocBlock =
  | { type: "paragraph"; text: string }
  | { type: "list" | "steps"; items: string[] }
  | { type: "heading"; text: string }
  | { type: "callout"; text: string }
  | { type: "links"; items: { label: string; href: string }[] }
  | { type: "groups"; items: { title: string; content: string[] }[] }
  | { type: "process"; items: { title: string; description: string }[] }
  | { type: "faq"; items: { question: string; answer: string }[] };

type DocSection = { title: string; blocks: DocBlock[] };

const sections: DocSection[] = [
  {
    title: "1. What is Interview AI?",
    blocks: [
      { type: "paragraph", text: "Interview AI simulates an interview environment where users can practice answering questions and receive AI-generated feedback. Instead of preparing only by reading interview questions, users can interact with an AI interviewer and practice answering questions in a realistic format." },
      { type: "list", items: ["Build interview confidence", "Improve answer structure", "Practice technical concepts", "Improve communication", "Identify weak areas", "Understand common interview questions", "Improve your resume", "Practice repeatedly before an actual interview"] },
    ],
  },
  {
    title: "2. Who Is Interview AI For?",
    blocks: [
      { type: "groups", items: [
        { title: "Students", content: ["Campus placements", "Internships", "Technical interviews", "Viva preparation", "First job interviews"] },
        { title: "Freshers", content: ["HR questions", "Technical questions", "Project questions", "Behavioral questions", "Resume-based questions"] },
        { title: "Developers", content: ["Programming and DSA interviews", "Software engineering interviews", "Technical and project discussions", "System-design interviews"] },
        { title: "Professionals", content: ["Job switches and promotions", "Technical interviews", "Leadership interviews", "Behavioral interviews"] },
      ] },
    ],
  },
  {
    title: "3. Getting Started",
    blocks: [
      { type: "heading", text: "Step 1 — Create an Account" },
      { type: "paragraph", text: "Open Interview AI and select Sign Up. Enter the requested information and use an email address that you can access." },
      { type: "paragraph", text: "Depending on the current authentication system, account creation may be available using:" },
      { type: "list", items: ["Email and password", "Supported social authentication", "Other available authentication methods"] },
    ],
  },
  {
    title: "4. User Onboarding",
    blocks: [
      { type: "paragraph", text: "After creating an account, Interview AI may ask for information that helps personalize the experience. This can include:" },
      { type: "list", items: ["Name and email", "Mobile number", "Education, college or school, and degree or course", "Skills and experience level", "Target role and career interests"] },
      { type: "paragraph", text: "Providing more relevant information can help Interview AI generate more personalized preparation experiences." },
    ],
  },
  {
    title: "5. Dashboard",
    blocks: [
      { type: "paragraph", text: "After signing in, users can access their main dashboard. It may provide access to:" },
      { type: "list", items: ["Start Interview", "Resume Analyzer", "Communication Practice", "Interview History", "Question Bank", "Resources", "Profile", "Settings"] },
      { type: "paragraph", text: "The exact dashboard options may change as Interview AI evolves." },
    ],
  },
  {
    title: "6. AI Mock Interview",
    blocks: [
      { type: "paragraph", text: "The AI Mock Interview feature simulates an interview using artificial intelligence. The system can:" },
      { type: "steps", items: ["Select or generate interview questions.", "Present questions to the user.", "Receive the user's response.", "Analyze the response.", "Generate feedback.", "Provide an overall interview summary."] },
    ],
  },
  {
    title: "7. Starting a Mock Interview",
    blocks: [
      { type: "steps", items: ["Sign in to Interview AI.", "Open AI Interview.", "Select the interview type.", "Select your target role where available.", "Select experience level if available.", "Configure available interview options.", "Start the interview and follow the instructions shown on screen."] },
      { type: "links", items: [{ label: "Open AI Mock Interview", href: "/mock-interviews" }] },
    ],
  },
  {
    title: "8. Interview Types",
    blocks: [
      { type: "groups", items: [
        { title: "HR Interview", content: ["Introduction", "Motivation", "Strengths and weaknesses", "Career goals", "Company fit"] },
        { title: "Technical Interview", content: ["Programming and computer science fundamentals", "Technical concepts", "Problem solving", "Role-specific knowledge"] },
        { title: "Behavioral Interview", content: ["Teamwork and leadership", "Conflict and failure", "Decision-making", "Problem solving"] },
        { title: "Project Interview", content: ["Project architecture and technology choices", "Your contribution", "Challenges and results", "Possible improvements"] },
        { title: "Coding Interview", content: ["Algorithms and data structures", "Problem solving and complexity", "Programming concepts"] },
      ] },
      { type: "paragraph", text: "Available interview types depend on the current product configuration." },
    ],
  },
  {
    title: "9. Voice Interview",
    blocks: [
      { type: "paragraph", text: "Interview AI may provide voice-based interview functionality. When voice mode is enabled:" },
      { type: "steps", items: ["The platform requests microphone permission.", "You speak your response.", "Your audio may be processed and speech may be converted into text.", "AI may analyze the response and generate feedback."] },
    ],
  },
  {
    title: "10. Microphone Permissions",
    blocks: [
      { type: "groups", items: [
        { title: "Browser", content: ["Check whether microphone permission has been granted to Interview AI."] },
        { title: "Operating system", content: ["Check whether your browser has microphone access."] },
        { title: "Hardware", content: ["Make sure the microphone is connected and not muted.", "Confirm that the correct microphone is selected."] },
      ] },
      { type: "paragraph", text: "Then refresh the page and try again." },
    ],
  },
  {
    title: "11. Camera-Based Interviews",
    blocks: [
      { type: "paragraph", text: "Some Interview AI features may optionally use a camera for specific video-interview functionality." },
      { type: "list", items: ["Make sure your camera is working.", "Choose an appropriate environment with adequate lighting.", "Position your camera correctly.", "Do not record another person without appropriate permission."] },
    ],
  },
  {
    title: "12. Interview Feedback",
    blocks: [
      { type: "groups", items: [
        { title: "Answer Quality", content: ["How clearly and directly you addressed the question."] },
        { title: "Communication", content: ["Clarity", "Structure", "Speaking pace", "Filler words", "Conciseness"] },
        { title: "Technical Knowledge", content: ["Technical concepts may be evaluated depending on the interview type."] },
        { title: "Confidence Indicators", content: ["Certain product features may provide communication-related feedback."] },
      ] },
      { type: "callout", text: "These indicators are preparation guidance, not objective measurements of a person's personality or professional ability." },
    ],
  },
  {
    title: "13. Interview Score",
    blocks: [
      { type: "paragraph", text: "Interview AI may generate an overall score or category-based scores, for example:" },
      { type: "list", items: ["Overall performance", "Communication", "Technical knowledge", "Answer relevance", "Problem solving", "Structure"] },
      { type: "paragraph", text: "Scores are intended to help users identify areas for improvement. They are not guarantees of interview performance or employment outcomes." },
    ],
  },
  {
    title: "14. Resume Analyzer",
    blocks: [
      { type: "paragraph", text: "Resume Analyzer helps users review their resume using AI-assisted analysis. Depending on the available implementation, it may analyze:" },
      { type: "list", items: ["Resume structure and formatting", "Skills and experience", "Projects and keywords", "Clarity and role relevance"] },
      { type: "links", items: [{ label: "Open Resume", href: "/resume" }] },
    ],
  },
  {
    title: "15. Uploading a Resume",
    blocks: [
      { type: "steps", items: ["Open Resume Analyzer.", "Select Upload Resume.", "Select your resume file.", "Wait for processing.", "Review the generated analysis.", "Apply improvements where appropriate."] },
      { type: "callout", text: "Only upload documents you have the right to provide." },
    ],
  },
  {
    title: "16. Resume Score",
    blocks: [
      { type: "paragraph", text: "Interview AI may provide an AI-generated resume score as a guidance mechanism. A high score does not guarantee:" },
      { type: "list", items: ["An interview", "Applicant tracking system selection", "Employment or a job offer"] },
      { type: "paragraph", text: "Review the underlying recommendations rather than relying only on the numerical score." },
    ],
  },
  {
    title: "17. Communication Practice",
    blocks: [
      { type: "paragraph", text: "Communication Practice helps users practice speaking and interview communication. Depending on the implementation, the system may provide feedback related to:" },
      { type: "list", items: ["Clarity and answer structure", "Speaking pace and filler words", "Response length and vocabulary", "Overall communication"] },
      { type: "paragraph", text: "Repeated practice can help users become more comfortable communicating under interview conditions." },
      { type: "links", items: [{ label: "Open Communication Practice", href: "/communication" }] },
    ],
  },
  {
    title: "18. Interview Question Bank",
    blocks: [
      { type: "paragraph", text: "The Question Bank provides interview questions organized by category. Possible categories include:" },
      { type: "list", items: ["HR and behavioral", "Technical and coding", "DSA and DBMS", "Operating systems and computer networks", "Projects and software development"] },
      { type: "paragraph", text: "Questions may also be organized by role, difficulty, experience level, technology, or topic." },
      { type: "links", items: [{ label: "Browse the Question Bank", href: "/question-bank" }] },
    ],
  },
  {
    title: "19. How to Practice With the Question Bank",
    blocks: [
      { type: "callout", text: "Read → Think → Answer → Review → Improve" },
      { type: "paragraph", text: "Do not simply memorize answers. Interviewers may change the wording of questions, so understanding the underlying concept is more valuable than memorizing a fixed response." },
    ],
  },
  {
    title: "20. Interview Guides",
    blocks: [
      { type: "paragraph", text: "Interview Guides provide structured preparation resources. Guides may cover interview preparation, HR interviews, technical interviews, coding interviews, fresher interviews, resume-based interviews, and project interviews." },
      { type: "paragraph", text: "Use the guides before starting a mock interview." },
      { type: "links", items: [{ label: "Browse Interview Guides", href: "/interview-guides" }] },
    ],
  },
  {
    title: "21. Interview History",
    blocks: [
      { type: "paragraph", text: "Interview History may allow users to review previous interview sessions. Depending on the implementation, historical information may include:" },
      { type: "list", items: ["Interview type and date", "Score and feedback", "Questions", "Performance areas"] },
      { type: "paragraph", text: "Historical results can help users identify patterns and track improvement over time." },
    ],
  },
  {
    title: "22. Profile",
    blocks: [
      { type: "paragraph", text: "Users can manage available profile information from their profile or settings area. Possible information includes name, email, education, skills, experience, target role, and career preferences." },
      { type: "paragraph", text: "Keep your information accurate to improve personalization." },
    ],
  },
  {
    title: "23. Account Security",
    blocks: [
      { type: "paragraph", text: "Users are responsible for maintaining the security of their account. Recommended practices:" },
      { type: "list", items: ["Use a strong password and do not share it.", "Do not share authentication codes.", "Avoid logging in on untrusted devices.", "Sign out from shared computers.", "Report suspicious activity."] },
      { type: "paragraph", text: "If you believe your account has been compromised, contact Interview AI support." },
    ],
  },
  {
    title: "24. AI Limitations",
    blocks: [
      { type: "paragraph", text: "Interview AI uses artificial intelligence, and AI-generated outputs may contain errors. AI may misunderstand a response, generate an incorrect answer, miss context, produce inconsistent scores, misinterpret technical explanations, or generate outdated information." },
      { type: "callout", text: "Always use your own judgment. Important career, employment, educational, and professional decisions should not be based solely on AI-generated information." },
    ],
  },
  {
    title: "25. Preparing for an Actual Interview",
    blocks: [
      { type: "groups", items: [
        { title: "Research", content: ["Understand the company, role, job description, required skills, and product or business."] },
        { title: "Review your resume", content: ["Be ready to explain every important item."] },
        { title: "Practice", content: ["Complete multiple mock interviews."] },
        { title: "Prepare questions", content: ["Prepare thoughtful questions for the interviewer."] },
        { title: "Technical setup for remote interviews", content: ["Test your microphone and camera.", "Check your internet and charge your device.", "Choose a quiet environment."] },
      ] },
    ],
  },
  {
    title: "26. Using AI During Real Interviews",
    blocks: [
      { type: "paragraph", text: "Interview AI is primarily designed for preparation and practice." },
      { type: "callout", text: "Do not secretly use AI to answer questions during an actual interview when doing so is prohibited by an employer, educational institution, assessment provider, or applicable rules. Prepare beforehand so you can answer confidently yourself." },
    ],
  },
  {
    title: "27. Privacy and Data",
    blocks: [
      { type: "paragraph", text: "Interview AI may process information required to provide its features. Depending on the features you use, this may include account information, resume information, interview responses, audio, video, transcripts, usage information, and technical information." },
      { type: "links", items: [{ label: "Read the Privacy Policy", href: "/privacy" }] },
    ],
  },
  {
    title: "28. Cookies",
    blocks: [
      { type: "paragraph", text: "Interview AI may use cookies and similar technologies for authentication, security, preferences, analytics, performance, and other permitted functionality." },
      { type: "links", items: [{ label: "Read the Cookie Policy", href: "/cookies" }] },
    ],
  },
  {
    title: "29. Billing and Subscriptions",
    blocks: [
      { type: "paragraph", text: "If Interview AI provides paid plans, the available pricing and billing terms will be displayed before purchase. Depending on the plan, billing may be monthly, annual, one-time, or usage-based." },
      { type: "paragraph", text: "Payment processing may be handled by third-party payment providers." },
    ],
  },
  {
    title: "30. Subscription Cancellation",
    blocks: [
      { type: "paragraph", text: "If your plan supports subscription cancellation:" },
      { type: "steps", items: ["Open your account.", "Go to billing or subscription settings.", "Select the cancellation option.", "Follow the instructions."] },
      { type: "paragraph", text: "Cancellation terms depend on your plan and applicable law." },
    ],
  },
  {
    title: "31. Troubleshooting",
    blocks: [
      { type: "groups", items: [
        { title: "Website isn't loading", content: ["Refresh the page and check your internet connection.", "Update your browser or clear its cache.", "Disable problematic extensions or try another browser."] },
        { title: "AI interview isn't starting", content: ["Check your internet connection, account status, and browser compatibility.", "Check microphone permissions for voice mode or camera permissions for video mode."] },
        { title: "Microphone isn't working", content: ["Check browser and operating-system permissions.", "Confirm the selected microphone, mute state, and hardware connection."] },
        { title: "Camera isn't working", content: ["Check camera and browser permissions.", "Check whether another application is using the camera.", "Check camera hardware and browser compatibility."] },
        { title: "Resume upload failed", content: ["Check the supported file format and file size.", "Check your internet connection and whether the file is corrupted.", "Try uploading a new copy of the resume."] },
      ] },
    ],
  },
  {
    title: "32. Browser Recommendations",
    blocks: [
      { type: "paragraph", text: "For the best experience, use a modern version of a major browser such as:" },
      { type: "list", items: ["Google Chrome", "Microsoft Edge", "Mozilla Firefox", "Safari"] },
      { type: "paragraph", text: "Some advanced voice or video features may have additional browser requirements." },
    ],
  },
  {
    title: "33. Accessibility",
    blocks: [
      { type: "paragraph", text: "Interview AI aims to make its Services usable by as many people as reasonably possible. We encourage users who experience accessibility problems to contact support." },
      { type: "links", items: [{ label: "Accessibility contact: vp4647115@gmail.com", href: "mailto:vp4647115@gmail.com" }] },
    ],
  },
  {
    title: "34. Contact Support",
    blocks: [
      { type: "paragraph", text: "For technical problems, account questions, or product support, email vp4647115@gmail.com. When contacting support, include:" },
      { type: "list", items: ["Your account email", "Description of the problem and relevant feature", "Device and browser", "Screenshot, if useful", "Steps that caused the problem"] },
      { type: "callout", text: "Do not send passwords, authentication codes, complete payment-card information, or other unnecessary sensitive information." },
    ],
  },
  {
    title: "35. Privacy Requests",
    blocks: [
      { type: "paragraph", text: "For privacy-related questions or requests, contact vp4647115@gmail.com. Requests may include data access, data correction, data deletion, privacy questions, and consent-related requests." },
      { type: "paragraph", text: "Requests will be handled according to applicable law and the Interview AI Privacy Policy." },
    ],
  },
  {
    title: "36. Frequently Asked Questions",
    blocks: [
      { type: "faq", items: [
        { question: "Is Interview AI free?", answer: "Availability of free and paid features depends on the current Interview AI plans." },
        { question: "Does Interview AI guarantee a job?", answer: "No. Interview AI is a preparation platform and cannot guarantee employment." },
        { question: "Can I practice technical interviews?", answer: "Yes, where the relevant technical interview functionality is available." },
        { question: "Can I upload my resume?", answer: "Yes, where Resume Analyzer functionality is available." },
        { question: "Does Interview AI use AI?", answer: "Yes. AI is a core part of the platform's interview and preparation functionality." },
        { question: "Can AI make mistakes?", answer: "Yes. AI-generated results should be reviewed and treated as guidance." },
        { question: "Can I practice multiple times?", answer: "Yes, subject to the applicable plan and usage limits." },
        { question: "How do I delete my account?", answer: "Use the account deletion functionality where available or contact vp4647115@gmail.com." },
      ] },
    ],
  },
  {
    title: "37. Responsible Use",
    blocks: [
      { type: "paragraph", text: "Interview AI is intended to support learning and preparation. Users should:" },
      { type: "list", items: ["Provide truthful information.", "Respect other people's privacy.", "Follow interview and assessment rules.", "Respect intellectual property.", "Use AI responsibly.", "Avoid fraudulent or deceptive use."] },
    ],
  },
  {
    title: "38. Legal Documents",
    blocks: [
      { type: "paragraph", text: "The following documents form part of the Interview AI legal framework. Review the applicable documents before using relevant Services." },
      { type: "links", items: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Terms & Conditions", href: "/terms" },
      ] },
      { type: "list", items: ["Refund & Cancellation Policy", "Acceptable Use Policy"] },
    ],
  },
  {
    title: "39. Product Updates",
    blocks: [
      { type: "paragraph", text: "Interview AI may evolve over time. Features, interface elements, AI models, supported technologies, plans, and workflows may change. This documentation may therefore be updated periodically. Always refer to the latest version published on the Interview AI documentation site." },
    ],
  },
  {
    title: "40. Documentation Feedback",
    blocks: [
      { type: "paragraph", text: "If you find an error or outdated information in this documentation, please contact vp4647115@gmail.com with the subject Documentation Feedback. Include the page or section that requires correction." },
      { type: "links", items: [{ label: "Email Documentation Feedback", href: "mailto:vp4647115@gmail.com?subject=Documentation%20Feedback" }] },
    ],
  },
  {
    title: "41. Quick Start",
    blocks: [
      { type: "steps", items: ["Create Account", "Complete Profile", "Upload Resume", "Analyze Resume", "Review Interview Guides", "Practice Question Bank", "Start AI Mock Interview", "Review Feedback", "Practice Again", "Prepare for the Real Interview"] },
    ],
  },
  {
    title: "42. The Interview AI Method",
    blocks: [
      { type: "process", items: [
        { title: "Practice", description: "Simulate the interview." },
        { title: "Analyze", description: "Understand where you struggled." },
        { title: "Improve", description: "Work on your weak areas." },
        { title: "Repeat", description: "Practice again." },
        { title: "Perform", description: "Take what you learned into the real interview." },
      ] },
    ],
  },
  {
    title: "43. Final Note",
    blocks: [
      { type: "paragraph", text: "Interview AI is a preparation tool. Your success ultimately comes from your knowledge, preparation, communication, problem-solving ability, experience, and judgment." },
      { type: "callout", text: "Use Interview AI as your practice environment—not as a replacement for your own thinking." },
      { type: "process", items: [
        { title: "Prepare Better.", description: "" },
        { title: "Communicate Better.", description: "" },
        { title: "Interview Better.", description: "" },
      ] },
    ],
  },
];

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function DocumentationBlock({ block }: { block: DocBlock }) {
  if (block.type === "paragraph") return <p className="mt-4 leading-7 text-ink-secondary">{block.text}</p>;
  if (block.type === "heading") return <h3 className="mt-6 text-lg font-bold text-ink-primary">{block.text}</h3>;
  if (block.type === "callout") return <p className="mt-5 rounded-xl bg-primary-soft p-4 leading-7 text-ink-primary">{block.text}</p>;
  if (block.type === "list" || block.type === "steps") {
    const List = block.type === "steps" ? "ol" : "ul";
    return <List className={`${block.type === "steps" ? "list-decimal" : "list-disc"} mt-4 space-y-2 pl-6 leading-7 text-ink-secondary`}>{block.items.map((item) => <li key={item}>{item}</li>)}</List>;
  }
  if (block.type === "links") return <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">{block.items.map((item) => <a key={item.label} href={item.href} className="text-sm font-semibold text-primary underline underline-offset-2">{item.label} →</a>)}</div>;
  if (block.type === "groups") return <div className="mt-5 grid gap-5 sm:grid-cols-2">{block.items.map((group) => <div key={group.title} className="border-l-2 border-primary pl-4"><h3 className="font-semibold text-ink-primary">{group.title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-secondary">{group.content.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div>;
  if (block.type === "process") return <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{block.items.map((item, index) => <div key={item.title} className="border-t-2 border-primary pt-3"><p className="text-xs font-bold uppercase tracking-wider text-primary">{String(index + 1).padStart(2, "0")}</p><h3 className="mt-1 font-bold text-ink-primary">{item.title}</h3>{item.description && <p className="mt-1 text-sm leading-6 text-ink-secondary">{item.description}</p>}</div>)}</div>;
  if (block.type === "faq") return <div className="mt-4 divide-y divide-border">{block.items.map((item) => <details key={item.question} className="py-3"><summary className="cursor-pointer font-semibold text-ink-primary">{item.question}</summary><p className="mt-2 leading-7 text-ink-secondary">{item.answer}</p></details>)}</div>;
  return null;
}

export default function DocumentationPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Product Documentation</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Interview AI Documentation</h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-secondary">
              <p><strong>Version:</strong> 1.0</p>
              <p><strong>Last updated:</strong> 6 October 2026</p>
              <p><strong>Product:</strong> Interview AI</p>
              <p><strong>Website:</strong> <a className="text-primary underline" href="https://www.intervai.vpnpro.in/">intervai.vpnpro.in</a></p>
            </div>
          </header>

          <section className="mt-8 rounded-2xl border border-border bg-surface-alt p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Welcome to Interview AI</p>
            <h2 className="mt-2 text-2xl font-bold text-ink-primary">Prepare Better. Communicate Better. Interview Better.</h2>
            <p className="mt-3 max-w-4xl leading-7 text-ink-secondary">Interview AI is an AI-powered interview preparation platform designed to help students, freshers, developers, professionals, and job seekers prepare through realistic practice and personalized feedback.</p>
            <ul className="mt-5 grid gap-2 text-sm text-ink-secondary sm:grid-cols-2 lg:grid-cols-3">
              {["AI-powered mock interviews", "HR interview preparation", "Technical interview preparation", "Resume analysis", "Communication practice", "Voice-based interview experiences", "Interview feedback", "Question banks", "Career resources"].map((feature) => <li key={feature} className="flex gap-2"><span className="text-primary" aria-hidden="true">✓</span>{feature}</li>)}
            </ul>
            <p className="mt-5 font-semibold text-ink-primary">The goal is simple: Practice before the opportunity arrives.</p>
          </section>

          <details className="mt-8 rounded-2xl border border-border bg-surface-alt p-5 sm:p-6">
            <summary className="cursor-pointer font-bold text-ink-primary">Browse all 43 sections</summary>
            <nav aria-label="Documentation contents" className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => <a key={section.title} href={`#${sectionId(section.title)}`} className="text-sm leading-6 text-ink-secondary transition-colors hover:text-primary">{section.title}</a>)}
              <a href="#contact-and-copyright" className="text-sm leading-6 text-ink-secondary transition-colors hover:text-primary">Contact and copyright</a>
            </nav>
          </details>

          <div className="mt-10 space-y-5">
            {sections.map((section) => (
              <section key={section.title} id={sectionId(section.title)} className="scroll-mt-6 rounded-2xl border border-border bg-surface-alt p-5 sm:p-7">
                <h2 className="text-xl font-bold text-ink-primary sm:text-2xl">{section.title}</h2>
                {section.blocks.map((block, index) => <DocumentationBlock key={`${section.title}-${index}`} block={block} />)}
              </section>
            ))}
          </div>

          <footer id="contact-and-copyright" className="mt-8 rounded-2xl bg-primary-soft p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-primary">Interview AI</h2>
            <p className="mt-3 text-ink-secondary">Website: <a className="text-primary underline" href="https://www.intervai.vpnpro.in/">https://www.intervai.vpnpro.in/</a></p>
            <p className="mt-2 text-ink-secondary">Support: <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a></p>
            <p className="mt-5 border-t border-border pt-4 text-sm text-ink-secondary">© 2026 Interview AI. All rights reserved.</p>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}