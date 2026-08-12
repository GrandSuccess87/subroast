import { useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const canonicalUrl = "https://subroast.com/blog/how-to-find-leads-on-reddit-without-getting-banned";
const publishedDate = "2026-08-12";
const title = "How to Find Leads on Reddit Without Getting Banned";
const description = "Learn how to find leads on Reddit without getting banned, with a community-first framework for spotting buyer signals and starting useful conversations.";

const faqs = [
  {
    question: "Can I use Reddit for lead generation?",
    answer: "Yes, when you participate in relevant communities, answer real questions, follow each community's rules, and give people a clear choice about any next step. Treat conversations as a chance to help first, not a reason to send a generic pitch.",
  },
  {
    question: "Will Reddit ban me for promoting my SaaS?",
    answer: "A product mention is not automatically a problem, but repeated, unsolicited, disruptive, or rule-breaking activity can be treated as spam. Read each community's rules, disclose your connection when it is relevant, and contribute useful information before mentioning your product.",
  },
  {
    question: "Should I DM people who post about a problem I solve?",
    answer: "Do not use bulk or unsolicited direct-message outreach. A better approach is to reply publicly when you have a useful answer, then continue privately only if the person asks for more detail or clearly opts in to a follow-up.",
  },
  {
    question: "What makes a Reddit post a qualified lead?",
    answer: "A qualified Reddit lead has a specific problem, enough context to show your offer may fit, and a reason to solve it now. Posts that only mention a broad topic are usually research inputs, not immediate outreach opportunities.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  datePublished: publishedDate,
  dateModified: publishedDate,
  mainEntityOfPage: canonicalUrl,
  author: { "@type": "Organization", name: "SubRoast" },
  publisher: { "@type": "Organization", name: "SubRoast", url: "https://subroast.com" },
  keywords: ["how to find leads on Reddit without getting banned", "Reddit lead generation", "Reddit leads", "Reddit outreach"],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

function setMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

function Citation({ id, href, label }: { id: number; href: string; label: string }) {
  return <a className="lead-guide-link" href={href} target="_blank" rel="noreferrer" aria-label={`Source ${id}: ${label}`}>[{id}]</a>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ color: "#14181F", fontSize: "clamp(1.55rem, 3vw, 2.05rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.18, margin: "3.25rem 0 1rem" }}>{children}</h2>;
}

export default function FindLeadsOnReddit() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | SubRoast`;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", "article");
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div style={{ minHeight: "100svh", background: "#FCF7F1", color: "#374151", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .lead-guide-prose p { margin: 0 0 1.25rem; font-size: 1.05rem; line-height: 1.78; }
        .lead-guide-prose h3 { color: #14181F; font-size: 1.24rem; font-weight: 750; letter-spacing: -0.02em; line-height: 1.35; margin: 2.1rem 0 0.75rem; }
        .lead-guide-prose li { margin-bottom: 0.5rem; font-size: 1.01rem; line-height: 1.68; }
        .lead-guide-link { color: #C2410C; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
        .lead-guide-link:hover { color: #9A3412; }
        .lead-guide-toc a { color: #4B5563; text-decoration: none; }
        .lead-guide-toc a:hover { color: #C2410C; }
        @media (max-width: 640px) { .lead-guide-prose p { font-size: 1rem; } }
      `}</style>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

      <nav aria-label="Primary" style={{ position: "sticky", top: "1rem", zIndex: 20, maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.55rem 0.6rem 0.55rem 1.35rem", borderRadius: "999px", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)", border: "1px solid #F3F4F6", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <a href="/" aria-label="SubRoast home" style={{ color: "#14181F", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none" }}>Sub<span style={{ color: "#F67A31" }}>Roast</span></a>
          <a href="/billing/reserve" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.65rem 1.1rem", borderRadius: "999px", background: "#111827", color: "#fff", fontSize: "0.86rem", fontWeight: 650, textDecoration: "none" }}>Reserve access <ArrowRight size={15} aria-hidden="true" /></a>
        </div>
      </nav>

      <main>
        <header style={{ padding: "clamp(5.5rem, 10vw, 8.5rem) 1.5rem 3.5rem", background: "radial-gradient(circle at 50% 0%, rgba(246,122,49,0.15), rgba(252,247,241,0) 52%)" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: "#F67A31", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 1.2rem" }}>Reddit lead generation guide</p>
            <h1 style={{ color: "#14181F", fontSize: "clamp(2.45rem, 6vw, 4.55rem)", fontWeight: 800, letterSpacing: "-0.052em", lineHeight: 1.04, margin: 0 }}>{title}</h1>
            <p style={{ maxWidth: "650px", margin: "1.45rem auto 0", color: "#6B7280", fontSize: "clamp(1.04rem, 2vw, 1.2rem)", lineHeight: 1.68 }}>A practical, community-first workflow for finding buyer signals, helping people in public, and protecting the trust that makes Reddit useful.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.7rem", marginTop: "1.65rem", color: "#9CA3AF", fontSize: "0.85rem" }}><span>SubRoast</span><span aria-hidden="true">·</span><time dateTime={publishedDate}>August 12, 2026</time><span aria-hidden="true">·</span><span>8 min read</span></div>
          </div>
        </header>

        <article className="lead-guide-prose" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
          <p>Learning <strong>how to find leads on Reddit without getting banned</strong> starts with a mindset shift. You are not looking for a database to mine. You are joining communities where people explain their problems, compare options, and ask for help. Your job is to recognize relevant conversations and make the discussion better.</p>
          <p>That is a much safer and more useful goal than dropping links or sending copied messages. Reddit's platform rules require authentic participation, compliance with community rules, and no spam or disruptive behavior. <Citation id={1} label="Reddit Rules" href="https://redditinc.com/policies/reddit-rules" /> The workflow below helps founders use Reddit as a source of customer insight and qualified conversations without sacrificing trust.</p>

          <nav className="lead-guide-toc" aria-label="Table of contents" style={{ margin: "2rem 0 2.5rem", padding: "1.4rem 1.5rem", borderRadius: "12px", border: "1px solid #FCD9BD", background: "#FFF9F5" }}>
            <p style={{ margin: "0 0 0.65rem", color: "#9A3412", fontSize: "0.76rem", fontWeight: 750, letterSpacing: "0.12em", textTransform: "uppercase" }}>In this guide</p>
            <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "grid", gap: "0.35rem", fontSize: "0.95rem", lineHeight: 1.55 }}>
              <li><a href="#safe">Know what safe Reddit lead generation means</a></li>
              <li><a href="#signals">Find conversations with real buyer signals</a></li>
              <li><a href="#reply">Reply in a way that earns trust</a></li>
              <li><a href="#routine">Build a simple weekly routine</a></li>
              <li><a href="#faq">Frequently asked questions</a></li>
            </ol>
          </nav>

          <section id="safe">
            <SectionTitle>Know what safe Reddit lead generation means</SectionTitle>
            <p>Safe lead generation is not a collection of tricks for dodging moderation. It is a repeatable way to identify conversations where your experience can help, then respond within the rules and culture of that community. A lead becomes interesting because a person has a specific problem, not because they used a keyword once.</p>
            <p>Reddit defines spam as repeated or unsolicited actions that negatively affect Redditors, communities, or Reddit. Its examples include mass-posting repetitive content, mass messaging, and automated product promotion. <Citation id={2} label="Reddit Help: Spam" href="https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" /> That makes the operating principle clear: do not scale a behavior that would feel intrusive if you wrote it by hand.</p>
            <blockquote style={{ margin: "1.75rem 0", padding: "1.25rem 1.5rem", borderLeft: "4px solid #F67A31", borderRadius: "0 10px 10px 0", background: "#FFF4EC", color: "#7C2D12", fontSize: "1.1rem", fontWeight: 650, lineHeight: 1.55 }}>If your reply would not be useful without a product mention, it is probably not ready to post.</blockquote>
          </section>

          <section id="signals">
            <SectionTitle>Find conversations with real buyer signals</SectionTitle>
            <p>Start narrow. Choose two or three communities where your ideal customer already asks questions about the problem you solve. Large subreddits can create a lot of noise. Focused communities often make it easier to understand the culture, recognize recurring problems, and see what a useful answer looks like.</p>
            <h3>1. Read the rules before you save a post</h3>
            <p>Every community can set its own standards for links, promotions, product mentions, feedback threads, and direct messages. Record the rules next to the community name. If a rule is vague, treat that as a cue to ask a moderator, not as permission to test the boundary. Reddit explicitly tells participants to abide by community rules. <Citation id={1} label="Reddit Rules" href="https://redditinc.com/policies/reddit-rules" /></p>
            <h3>2. Search for problems, not categories</h3>
            <p>Generic searches such as “marketing” or “SaaS” return too much. Build a small list of phrases people use when they are stuck: “how do I find,” “what tool do you use,” “looking for an alternative,” “anyone solved,” or “need help with.” Add the language from your customers and refine it as you learn.</p>
            <h3>3. Score the context before you reply</h3>
            <p>A post deserves attention when it shows a specific problem, reasonable product fit, and a reason to act. You do not need a complex model. A short note is enough to stop your team from chasing every mention.</p>
            <div style={{ margin: "1.5rem 0 2rem", overflowX: "auto" }}>
              <table aria-label="Reddit lead signal scorecard" style={{ width: "100%", minWidth: "620px", borderCollapse: "separate", borderSpacing: 0, border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", fontSize: "0.91rem", lineHeight: 1.55 }}>
                <thead><tr style={{ background: "#14181F", color: "#fff", textAlign: "left" }}><th style={{ padding: "0.85rem 1rem" }}>Signal</th><th style={{ padding: "0.85rem 1rem" }}>What it looks like</th><th style={{ padding: "0.85rem 1rem" }}>Best next move</th></tr></thead>
                <tbody>
                  <tr><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>High intent</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>A specific problem, failed attempts, urgency, or a request for a recommendation</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Write a direct, self-contained answer and disclose your connection if relevant.</td></tr>
                  <tr style={{ background: "#FFFCF9" }}><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Research signal</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>A broad question about a workflow or category</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Share practical insight or ask a clarifying question. Do not force a pitch.</td></tr>
                  <tr><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Low signal</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>A passing mention with no request, problem, or fit</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Save the language as research. Usually do not reach out.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="reply">
            <SectionTitle>Reply in a way that earns trust</SectionTitle>
            <p>The best first reply answers the question in front of you. Mention the detail that shows you read the post. Offer a step, a tradeoff, or an example. Then stop. A reader should get value even if they never click a link or learn what you sell.</p>
            <p>If you built the product you mention, say so plainly. Transparent affiliation helps readers judge the recommendation. It also prevents the familiar problem of a disguised pitch that invites skepticism. You can link to your product only when community rules allow it and the link adds more than the comment already does.</p>
            <p>For founders who want a more organized process, <a className="lead-guide-link" href="/">SubRoast</a> helps surface relevant conversations and turn the surrounding context into a draft response. The point is not to automate promotion. It is to spend more time on useful conversations and less time hunting through irrelevant threads.</p>
            <h3>Use public help before private follow-up</h3>
            <p>Do not treat a public complaint as permission to send an unsolicited DM. Start with a helpful public contribution when it belongs in the thread. Continue privately only when the person asks for details or clearly opts in. This protects the reader's control and avoids the mass messaging behavior Reddit identifies as spam. <Citation id={2} label="Reddit Help: Spam" href="https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" /></p>
            <p>If you need predictable contact capture, a consent-based option is better than cold messaging. Reddit's Lead Generation Ads use an on-platform form for people who choose to share their information in exchange for a stated follow-up. <Citation id={3} label="Reddit Ads: Lead Gen Ads" href="https://www.business.reddit.com/advertise/ad-types/lead-gen" /></p>
          </section>

          <section id="routine">
            <SectionTitle>Build a simple weekly routine</SectionTitle>
            <p>Consistency is more useful than volume. Block one short session to review the communities and problem phrases you have chosen. Save only high-context posts. Before responding, check the rules, read the comments, and write one sentence explaining why your answer belongs there.</p>
            <ul style={{ paddingLeft: "1.25rem", margin: "1rem 0 1.5rem" }}>
              <li>Review a narrow set of communities and search phrases.</li>
              <li>Keep a note on the problem, relevant context, and the local rules you checked.</li>
              <li>Publish only answers that help without a click.</li>
              <li>Track replies, opt-in follow-ups, and moderator feedback instead of raw message volume.</li>
            </ul>
            <p>This routine also improves your broader marketing. The words people use in high-quality threads can sharpen your landing page, onboarding, and positioning. Review your <a className="lead-guide-link" href="/pricing">pricing and access options</a> through that customer language, not through guesses about what sounds persuasive.</p>
          </section>

          <section style={{ margin: "3.5rem 0 0", padding: "2rem", borderRadius: "16px", background: "#14181F", color: "#F9FAFB" }}>
            <p style={{ margin: "0 0 0.75rem", color: "#FDBA74", fontSize: "0.73rem", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase" }}>Build a safer workflow</p>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.03em", lineHeight: 1.18 }}>Find the right conversations, then respond like a person.</h2>
            <p style={{ margin: "1rem 0 1.5rem", color: "#D1D5DB", fontSize: "1rem", lineHeight: 1.7 }}>Reserve founder access to SubRoast and build a more focused Reddit lead workflow around real context, not mass outreach.</p>
            <a href="/billing/reserve" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.8rem 1.1rem", borderRadius: "999px", background: "#F67A31", color: "#fff", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none" }}>Reserve founder access <ArrowRight size={16} aria-hidden="true" /></a>
          </section>

          <section id="faq">
            <SectionTitle>Frequently asked questions</SectionTitle>
            {faqs.map(({ question, answer }) => <div key={question} style={{ padding: "1.25rem 0", borderBottom: "1px solid #E5E7EB" }}><h3 style={{ marginTop: 0 }}>{question}</h3><p style={{ marginBottom: 0 }}>{answer}</p></div>)}
          </section>

          <SectionTitle>Conclusion</SectionTitle>
          <p>Finding leads on Reddit without getting banned is not about outsmarting a filter. It is about choosing the right communities, recognizing real problems, and answering in a way that respects the people already talking there. Start small, keep your contributions specific, and let trust determine whether a conversation moves forward.</p>
          <p><a className="lead-guide-link" href="/billing/reserve">Reserve founder access to SubRoast</a> when you are ready to make that workflow more consistent.</p>

          <section aria-labelledby="sources" style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid #E5E7EB" }}>
            <h2 id="sources" style={{ color: "#14181F", fontSize: "1.3rem", fontWeight: 800, margin: "0 0 1rem" }}>Sources</h2>
            <ol style={{ paddingLeft: "1.25rem", margin: 0, lineHeight: 1.8 }}>
              <li><a className="lead-guide-link" href="https://redditinc.com/policies/reddit-rules" target="_blank" rel="noreferrer">Reddit Rules</a></li>
              <li><a className="lead-guide-link" href="https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" target="_blank" rel="noreferrer">Reddit Help: Spam</a></li>
              <li><a className="lead-guide-link" href="https://www.business.reddit.com/advertise/ad-types/lead-gen" target="_blank" rel="noreferrer">Reddit Ads: Lead Gen Ads</a></li>
            </ol>
          </section>
        </article>
      </main>

      <footer style={{ borderTop: "1px solid #E5E7EB", padding: "2rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", color: "#6B7280", fontSize: "0.86rem" }}><a href="/" style={{ color: "#14181F", fontWeight: 800, textDecoration: "none" }}>Sub<span style={{ color: "#F67A31" }}>Roast</span></a><span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}><CheckCircle2 size={15} color="#F67A31" aria-hidden="true" /> Community-first Reddit growth for founders</span></div>
      </footer>
    </div>
  );
}
