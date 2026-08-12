import { useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getLoginUrl } from "@/const";

const references = [
  { id: 1, label: "Reddit Rules", href: "https://redditinc.com/policies/reddit-rules" },
  { id: 2, label: "Reddit Help: Spam", href: "https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" },
  { id: 3, label: "Reddit Ads: Lead Gen Ads", href: "https://www.business.reddit.com/advertise/ad-types/lead-gen" },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Reddit Lead Generation: A Community-First Playbook for 2026",
  description:
    "Learn a community-first Reddit lead generation framework for finding real buying signals, helping prospects, and creating qualified conversations without spamming.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  author: { "@type": "Organization", name: "SubRoast" },
  publisher: { "@type": "Organization", name: "SubRoast", url: "https://subroast.com" },
  mainEntityOfPage: "https://subroast.com/blog/reddit-lead-generation",
  keywords: ["Reddit lead generation", "Reddit leads", "B2B lead generation on Reddit", "Reddit outreach"],
};

function Citation({ id }: { id: number }) {
  const reference = references.find(item => item.id === id);
  if (!reference) return null;

  return (
    <a
      href={reference.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Source ${id}: ${reference.label}`}
      style={{ color: "#C2410C", fontWeight: 700, textDecoration: "none" }}
    >
      [{id}]
    </a>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      color: "#14181F",
      fontSize: "clamp(1.55rem, 3vw, 2.05rem)",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.2,
      margin: "3.25rem 0 1rem",
    }}>
      {children}
    </h2>
  );
}

function ArticleTable({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ margin: "1.5rem 0 2rem", overflowX: "auto" }}>
      <table aria-label={label} style={{ width: "100%", minWidth: "620px", borderCollapse: "separate", borderSpacing: 0, border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", fontSize: "0.91rem", lineHeight: 1.55 }}>
        {children}
      </table>
    </div>
  );
}

export default function RedditLeadGeneration() {
  useEffect(() => {
    document.title = "Reddit Lead Generation: A Community-First Playbook | SubRoast";

    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = "Learn a community-first Reddit lead generation framework for finding real buying signals, helping prospects, and creating qualified conversations without spamming.";

    return () => {
      document.title = "SubRoast — AI Reddit Growth Tool for Founders";
    };
  }, []);

  const hasOAuthConfig = Boolean(import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID);
  const earlyAccessHref = hasOAuthConfig ? getLoginUrl("/onboarding") : "/onboarding";

  return (
    <div style={{ minHeight: "100svh", background: "#FCF7F1", color: "#374151", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .article-link { color: #C2410C; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
        .article-link:hover { color: #9A3412; }
        .article-prose p { font-size: 1.0625rem; line-height: 1.78; margin: 0 0 1.25rem; }
        .article-prose h3 { color: #14181F; font-size: 1.25rem; font-weight: 750; letter-spacing: -0.02em; line-height: 1.35; margin: 2rem 0 0.75rem; }
        .article-prose li { font-size: 1.02rem; line-height: 1.7; margin-bottom: 0.5rem; }
        @media (max-width: 640px) { .article-prose p { font-size: 1rem; } }
      `}</style>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

      <nav aria-label="Primary" style={{ position: "sticky", top: "1rem", zIndex: 20, maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.55rem 0.6rem 0.55rem 1.35rem", borderRadius: "999px", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)", border: "1px solid #F3F4F6", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <a href="/" aria-label="SubRoast home" style={{ color: "#14181F", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none" }}>
            Sub<span style={{ color: "#F67A31" }}>Roast</span>
          </a>
          <a href={earlyAccessHref} style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.65rem 1.1rem", borderRadius: "999px", background: "#111827", color: "#fff", fontSize: "0.86rem", fontWeight: 650, textDecoration: "none" }}>
            Get early access <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </nav>

      <main>
        <header style={{ padding: "clamp(5.5rem, 10vw, 8.5rem) 1.5rem 4rem", background: "radial-gradient(circle at 50% 0%, rgba(246,122,49,0.14), rgba(252,247,241,0) 52%)" }}>
          <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: "#F67A31", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 1.25rem" }}>Reddit growth guide</p>
            <h1 style={{ color: "#14181F", fontSize: "clamp(2.5rem, 6vw, 4.6rem)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.04, margin: 0 }}>
              Reddit Lead Generation: A Community-First Playbook for 2026
            </h1>
            <p style={{ maxWidth: "650px", margin: "1.5rem auto 0", color: "#6B7280", fontSize: "clamp(1.04rem, 2vw, 1.22rem)", lineHeight: 1.7 }}>
              Find real buying signals, contribute useful answers, and create qualified conversations without turning Reddit participation into spam.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1.75rem", color: "#9CA3AF", fontSize: "0.85rem" }}>
              <span>SubRoast</span><span aria-hidden="true">·</span><time dateTime="2026-08-11">August 11, 2026</time><span aria-hidden="true">·</span><span>9 min read</span>
            </div>
          </div>
        </header>

        <article className="article-prose" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
          <p>Reddit lead generation works when you stop treating Reddit as a list-building database and start treating it as a network of communities where people describe problems, compare options, and ask for help in public. For founders and growth teams, that makes Reddit a source of <strong>context-rich buying signals</strong>—but only when you add value to the discussion.</p>
          <p>The goal is not to scrape usernames, send generic private messages, or paste the same link across communities. Reddit’s rules ask people to follow community rules, participate authentically, and avoid spam or disruptive behavior. <Citation id={1} /> A durable approach instead connects three activities: listening for relevant conversations, contributing a useful answer, and offering a clear next step only when it fits.</p>

          <SectionHeading>What Reddit lead generation actually means</SectionHeading>
          <p><strong>Reddit lead generation</strong> is the process of turning relevant Reddit conversations into permission-based sales or discovery conversations. A strong lead is not merely a person in your target market. It is someone whose post or comment shows a problem you can solve, a reason to solve it now, and enough context to decide whether an answer from you would be welcome.</p>
          <p>That distinction matters. “Anyone discussing marketing” is an audience. “A founder asking how to find early users after three failed launch posts” is a potential conversation. The second signal contains a concrete problem, a moment of need, and the language the prospect uses to describe it.</p>
          <blockquote style={{ margin: "1.75rem 0", padding: "1.25rem 1.5rem", borderLeft: "4px solid #F67A31", borderRadius: "0 10px 10px 0", background: "#FFF4EC", color: "#7C2D12", fontSize: "1.1rem", fontWeight: 650, lineHeight: 1.55 }}>
            The community-first principle: begin with the usefulness of your contribution, not the likelihood that the person will book a call.
          </blockquote>
          <p>This aligns with Reddit’s guidance to participate authentically and comply with each community’s rules. <Citation id={1} /> It also gives your team a better definition of quality: a qualified Reddit lead has a recognizable need, relevant fit, and a context-appropriate next step.</p>

          <SectionHeading>Why Reddit can produce useful B2B conversations</SectionHeading>
          <p>On many channels, intent must be inferred from titles, firmographics, or website visits. On Reddit, people often volunteer the details that make a response relevant: a failed workaround, the tools they have tried, a budget constraint, or a deadline behind the question. That does not guarantee a sale, but it lets you answer a real problem rather than invent one.</p>
          <p>The conversation also takes place within an established community. That gives you a reason to learn before speaking: read the post, scan the comments, inspect the rules, and ask whether your response would stand on its own if the reader never visited your site.</p>

          <SectionHeading>A five-step Reddit lead generation framework</SectionHeading>
          <h3>1. Define the buying signals that matter to your product</h3>
          <p>Start with a small set of situations that make your product relevant. For SubRoast, a useful signal might be a founder asking how to find conversations about a specific pain point, how to draft a Reddit post without sounding promotional, or how to organize potential outreach opportunities. For another B2B product, it may be a request for tool recommendations, a complaint about a workflow, or a question about a looming deadline.</p>
          <p>Write signals as natural-language phrases, not broad categories. “Need help tracking competitor mentions” is more actionable than “social listening.” Include the problem, a qualifier, and an optional time cue. This helps your team prioritize conversations that are specific enough to deserve a thoughtful response.</p>
          <ArticleTable label="Signal quality and actions">
            <thead><tr style={{ background: "#14181F", color: "#fff", textAlign: "left" }}><th style={{ padding: "0.85rem 1rem" }}>Signal quality</th><th style={{ padding: "0.85rem 1rem" }}>Example</th><th style={{ padding: "0.85rem 1rem" }}>Recommended action</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>High</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>“What tool can help me find people asking for [problem] this week?”</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Read the thread, prepare a direct answer, and disclose affiliation if relevant.</td></tr>
              <tr style={{ background: "#FFFCF9" }}><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Medium</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>“How do you all handle [related workflow]?”</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Add practical insight and ask a clarifying question before offering a resource.</td></tr>
              <tr><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Low</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>A broad industry news link with no problem statement</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Observe or contribute only if you have genuinely useful context.</td></tr>
            </tbody>
          </ArticleTable>

          <h3>2. Map communities before you engage</h3>
          <p>Create a shortlist of communities where your ideal customer already discusses the problem. Do not choose a subreddit only because it is large. A smaller, focused community with clear questions and a compatible culture is often more valuable.</p>
          <p>For every community, record its audience, recurring problems, rules on promotion or links, and preferred discussion style. Community moderators define and enforce local rules, while Reddit’s platform-wide rules require you to abide by them. <Citation id={1} /> If a rule is unclear, ask the moderators before posting rather than treating uncertainty as permission.</p>

          <h3>3. Listen for context, then answer the question in front of you</h3>
          <p>Your first response should solve part of the problem without requiring a click. Reference the detail that shows you read the thread. Offer a concrete step, an example, or a trade-off. If you mention your product, be direct about your affiliation and keep the recommendation proportionate to the question.</p>
          <p>Avoid templated repetition. Reddit defines spam as repeated or unsolicited actions that negatively affect Redditors, communities, or Reddit itself; examples include mass-posting repetitive content, mass messaging, and automated product promotion. <Citation id={2} /> Every contribution should be written for that conversation, not copied from a campaign sequence.</p>

          <h3>4. Offer a next step only when the reader has control</h3>
          <p>A good next step is optional, relevant, and easy to decline. It may be a public explanation, a resource allowed by the community, or an invitation for the person to ask for more detail. Do not assume a public question is consent to receive an unsolicited sales message.</p>
          <p>If your objective is contact capture at scale, use a consent-based format. Reddit’s Lead Generation Ads collect information through an on-platform form in exchange for a stated follow-up, such as a consultation, newsletter, or discount. <Citation id={3} /> That is fundamentally different from mass private-message outreach: the person elects to submit their details and understands what comes next.</p>

          <h3>5. Turn qualitative learning into a repeatable workflow</h3>
          <p>Review a narrow set of communities and problem phrases weekly. Capture only posts that meet your high- or medium-signal criteria. Add a note explaining why the post is relevant, the rule you checked, and the value you can add. Then review outcomes together.</p>
          <p>This is where a tool such as SubRoast can help: it gives founders a workflow for surfacing relevant Reddit conversations, thinking through response quality, and keeping potential outreach organized. The tool should support better judgment, not automate generic promotion. If a proposed response would not be useful without the product mention, rewrite it or skip it.</p>

          <SectionHeading>How to measure a Reddit lead generation strategy</SectionHeading>
          <p>Do not judge the program by raw mentions or usernames collected. Track a small funnel that rewards relevance and respectful participation.</p>
          <ArticleTable label="Reddit lead generation metrics">
            <thead><tr style={{ background: "#14181F", color: "#fff", textAlign: "left" }}><th style={{ padding: "0.85rem 1rem" }}>Metric</th><th style={{ padding: "0.85rem 1rem" }}>What it reveals</th><th style={{ padding: "0.85rem 1rem" }}>Healthy interpretation</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Qualified conversations found</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Whether listening criteria are specific enough</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Prioritize fit and clear context over volume.</td></tr>
              <tr style={{ background: "#FFFCF9" }}><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Helpful responses published</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Whether the team consistently contributes value</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Review a sample for specificity, clarity, and rule compliance.</td></tr>
              <tr><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Permissioned conversions</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Whether the next step fits the problem</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Count trials, demos, or forms only when a person chose them.</td></tr>
              <tr style={{ background: "#FFFCF9" }}><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>Removals or moderator feedback</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Whether the process harms trust</td><td style={{ padding: "0.9rem 1rem", borderTop: "1px solid #E5E7EB" }}>Investigate immediately and adjust the process.</td></tr>
            </tbody>
          </ArticleTable>
          <p>Keep qualitative notes alongside the numbers. The phrases in high-quality threads can improve positioning, onboarding copy, help content, and future articles. A Reddit lead generation program is therefore both a demand-generation channel and a source of customer language.</p>

          <SectionHeading>Common mistakes to avoid</SectionHeading>
          <p>The fastest way to make Reddit lead generation fail is to treat community participation as low-cost cold outreach. Mass DMs, copied comments, undisclosed affiliation, aggressive links, and multiple accounts designed to amplify a brand all create risk. Reddit’s spam guidance warns against unsolicited mass engagement and asks people whose contributions mainly link to a business to be thoughtful about frequency or consider advertising instead. <Citation id={2} /></p>
          <p>Choose fewer communities, listen closely, and contribute only when you have a real answer. If a community says no promotion, honor it. If a conversation does not need your product, do not insert it. That restraint is what makes useful opportunities easier to recognize.</p>

          <SectionHeading>Frequently asked questions</SectionHeading>
          <h3>Does Reddit work for B2B lead generation?</h3>
          <p>It can, particularly when buyers discuss the operational problem your product solves in relevant communities. The strongest B2B use case is not broad targeting; it is responding thoughtfully to specific questions and using the language in those conversations to improve your messaging.</p>
          <h3>Can I send Reddit DMs to prospects?</h3>
          <p>Do not use Reddit for unsolicited bulk messaging. Reddit’s spam policy prohibits repeated or unsolicited mass engagement, including sending large amounts of unsolicited chat or private messages. <Citation id={2} /> Use helpful public participation for organic work, and a consent-based form or another permissioned route when you need contact details.</p>
          <h3>What is the best first metric to track?</h3>
          <p>Start with qualified conversations found and helpful responses published. These measures show whether you are identifying real needs and participating in a way that earns trust. Add conversion metrics once the response and handoff process are consistent.</p>

          <section style={{ margin: "3.75rem 0 0", padding: "2rem", borderRadius: "16px", background: "#14181F", color: "#F9FAFB" }}>
            <p style={{ margin: "0 0 0.75rem", color: "#FDBA74", fontSize: "0.73rem", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase" }}>Build a better workflow</p>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.03em", lineHeight: 1.18 }}>Turn relevant conversations into thoughtful outreach.</h2>
            <p style={{ margin: "1rem 0 1.5rem", color: "#D1D5DB", fontSize: "1rem", lineHeight: 1.7 }}>SubRoast helps founders surface relevant Reddit conversations, assess context, and draft better responses—without losing the judgment and community awareness that make the channel work.</p>
            <a href={earlyAccessHref} style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.8rem 1.1rem", borderRadius: "999px", background: "#F67A31", color: "#fff", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none" }}>
              Get early access <ArrowRight size={16} aria-hidden="true" />
            </a>
          </section>

          <section aria-labelledby="references-heading" style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid #E5E7EB" }}>
            <h2 id="references-heading" style={{ color: "#14181F", fontSize: "1.3rem", fontWeight: 800, margin: "0 0 1rem" }}>References</h2>
            <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
              {references.map(reference => <li key={reference.id}><a className="article-link" href={reference.href} target="_blank" rel="noreferrer">{reference.label}</a></li>)}
            </ol>
          </section>
        </article>
      </main>

      <footer style={{ borderTop: "1px solid #E5E7EB", padding: "2rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", color: "#6B7280", fontSize: "0.86rem" }}>
          <a href="/" style={{ color: "#14181F", fontWeight: 800, textDecoration: "none" }}>Sub<span style={{ color: "#F67A31" }}>Roast</span></a>
          <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}><CheckCircle2 size={15} color="#F67A31" aria-hidden="true" /> Community-first Reddit growth for founders</span>
        </div>
      </footer>
    </div>
  );
}
