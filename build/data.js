/* ============================================================
   PB Sec — site content
   Single source of truth for every page the generator emits.
   Edit here, re-run `node build/generate.js`, and all pages update.

   Plain prose only — build/generate.js escapes everything for you,
   so you can type &, <, > and " freely.
   ============================================================ */

const SITE = {
  name: 'PB Sec',
  tagline: 'Offensive security, honestly reported',
  email: 'praveen.jha.sec@gmail.com',
  // CHANGE THIS before launch — it drives canonical URLs, sitemap.xml and robots.txt.
  url: 'https://pbsec.com',
  description:
    'PB Sec delivers web, mobile, network, AI and red team penetration testing, plus threat detection. Find out what an attacker can really do — and what to fix first.'
};

/* ---------- top navigation ---------- */
const NAV = [
  { label: 'Services', href: 'services.html', key: 'services' },
  { label: 'Approach', href: 'index.html#approach', key: 'approach' },
  { label: 'Insights', href: 'insights.html', key: 'insights' },
  { label: 'About',    href: 'about.html',    key: 'about' },
  { label: 'Careers',  href: 'careers.html',  key: 'careers' }
];

/* ---------- standards and methodologies we work to ---------- */
const FRAMEWORKS = [
  'OWASP Top 10', 'OWASP MASVS', 'MITRE ATT&CK',
  'PTES', 'NIST CSF 2.0', 'ISO/IEC 27001'
];

/* ============================================================
   SERVICES
   ============================================================ */
const SERVICES = [
  {
    slug: 'web-pentest',
    accent: 'magenta',
    icon: 'globe',
    nav: 'Web app testing',
    tag: 'Application security',
    title: 'Web application penetration testing',
    h1: 'Your web application is your front door',
    blurb: 'We attack your web apps and APIs the way a real adversary would, then show your developers exactly how to fix what we find.',
    lede:
      'We test your web applications and APIs the way a real attacker would — authentication, authorisation, business logic, and the API endpoints your mobile app quietly depends on — then show your developers exactly how to fix what we find.',
    tags: ['Web apps', 'REST & GraphQL', 'Auth & sessions', 'Business logic'],
    covers: [
      'OWASP Top 10 coverage, tested rather than scanned',
      'Authentication, session handling and account recovery flows',
      'Authorisation flaws including IDOR and broken object-level access',
      'Business logic and workflow abuse that scanners cannot see',
      'REST, GraphQL, webhook and third-party integration testing',
      'Injection classes, SSRF, file upload and deserialisation',
      'Client-side issues: XSS, CSRF, DOM and postMessage abuse',
      'Rate limiting, enumeration and abuse-resistance review'
    ],
    body: [
      {
        h2: 'Where web applications actually break',
        p: 'Most of the serious findings we report are not exotic. They are a missing authorisation check on an API endpoint, a password reset flow that trusts a user-supplied email address, an invoice total recalculated in the browser, or an export function that ignores who is asking. Automated scanners rarely find these, because finding them means understanding what the application is supposed to do — and then doing the opposite.'
      },
      {
        h2: 'The risk moved to the API',
        p: 'Modern applications are thin front ends sitting on a large API surface, and that surface is usually much bigger than anyone has inventoried. Every mobile app, partner integration, webhook and forgotten staging endpoint is part of it. We map the API properly before testing it, because an endpoint nobody knows about is an endpoint nobody is defending.'
      },
      {
        h2: 'Built on OWASP, extended past it',
        p: 'The OWASP Top 10 is a floor, not a specification. We use it to make sure nothing obvious is missed, then go well beyond it into the logic and authorisation problems that cause the breaches you actually read about.'
      },
      {
        h2: 'What every finding includes',
        ul: [
          'The exact request and response, so your developers can reproduce it',
          'The underlying weakness, not just the symptom',
          'What an attacker could realistically do with it, and how much effort that would take',
          'The specific code or configuration change we recommend',
          'How to verify the fix actually worked'
        ]
      }
    ],
    deliverables: [
      'A retest of every critical and high finding, included in the price',
      'Reproduction steps and raw evidence for each issue',
      'Business-impact rating alongside technical severity',
      'An executive summary a non-technical stakeholder can read in five minutes',
      'A prioritised remediation roadmap with effort estimates',
      'A debrief call with your developers, not just a PDF'
    ],
    faqs: [
      {
        q: 'Will you test our production application?',
        a: 'Usually yes, because that is where the real configuration and real data live — staging environments often have different rules and different mistakes. We agree scope and any off-limits functionality in writing first, and we run anything with a risk of disruption outside business hours.'
      },
      {
        q: 'Do you test APIs as well as the web interface?',
        a: 'Always. In most modern applications the API is where the actual risk sits, and a large share of the serious findings we report are API-only — reachable without ever loading the web interface. If we can find documentation or a mobile build, we will map the full surface before we start.'
      },
      {
        q: 'Will a penetration test find everything?',
        a: 'No, and anyone who says otherwise is selling you something. A test is a time-boxed sample of your attack surface carried out by fallible humans. What we can promise is that we will tell you exactly what we covered, what we did not, and where you should look next.'
      }
    ]
  },

  {
    slug: 'mobile-pentest',
    accent: 'amber',
    icon: 'smartphone',
    nav: 'Mobile app testing',
    tag: 'Mobile security',
    title: 'Android & iOS penetration testing',
    h1: 'Two platforms, two very different ways to fail',
    blurb: 'Android and iOS break in different places. We test both, on real devices, and we do not stop at the app boundary.',
    lede:
      'Android and iOS fail in different places — one leaks through exported components and over-permissive storage, the other through keychain misuse and weak tamper resistance. We test both on real devices, and we do not stop at the app boundary.',
    tags: ['Android', 'iOS', 'API layer', 'Reverse engineering'],
    covers: [
      'Static and dynamic analysis on real rooted and jailbroken devices',
      'Insecure local storage, keystore and keychain misuse',
      'Exported components, intents, URL schemes and deep-link abuse',
      'Certificate pinning and transport security bypass',
      'Authentication, session handling and biometric bypass',
      'The backend APIs your app depends on',
      'Reverse engineering, tampering and anti-debugging resistance',
      'MASVS and MASTG aligned reporting for both platforms'
    ],
    body: [
      {
        h2: 'The app is a client, not a system',
        p: 'A mobile app is a client sitting on a device you do not control, talking to a backend you do. That means everything shipped in the binary is public: API endpoints, keys, feature flags, internal hostnames, and sometimes credentials that were only ever meant to be temporary. We start by reading the binary the way an attacker would.'
      },
      {
        h2: 'Android and iOS need separate test plans',
        p: 'Treating them as one exercise misses the interesting parts. On Android, the common failures are exported activities and services, world-readable files, and permissive WebView configuration. On iOS, they tend to be keychain items stored with the wrong accessibility class, data cached in the wrong directory, and jailbreak detection that falls over to a single hook. We test each platform against its own failure modes.'
      },
      {
        h2: 'Most mobile findings are backend findings',
        p: 'In practice, a large share of what we report from a mobile engagement is really about the API behind it — an endpoint that trusts the client to enforce a rule, a user ID taken from the request rather than the session, or an authorisation check that only exists in the app. Breaking the client is often just the fastest route to proving the backend problem.'
      },
      {
        h2: 'How we run it',
        ol: [
          'Reverse the release build and map every endpoint and embedded secret',
          'Test local storage, keystore and keychain handling on a rooted or jailbroken device',
          'Attempt transport security and pinning bypass against a proxy',
          'Exercise authentication, session lifetime and biometric flows',
          'Attack the backend API directly, using the app as documentation',
          'Report against MASVS so the findings map onto a standard your team can act on'
        ]
      }
    ],
    deliverables: [
      'Testing on both Android and iOS, on real devices',
      'Decompiled evidence showing exactly where a secret or endpoint leaked',
      'API findings proven with raw requests, not screenshots',
      'MASVS-aligned findings with a clear pass or fail per control',
      'Retest of critical and high findings after your fix',
      'A debrief with your mobile and backend teams together'
    ],
    faqs: [
      {
        q: 'Do you need our source code?',
        a: 'It helps and it speeds things up, but it is not required. We can work entirely from a release build using static analysis and dynamic instrumentation. Source access mainly lets us give you a line number instead of a code location — useful, but not a blocker.'
      },
      {
        q: 'Can you test a build that is already in the app store?',
        a: 'Yes, and we usually should, because that is the build your users actually have. We will test the store version and, where you have one, a release candidate with debugging symbols so the reporting is more precise.'
      },
      {
        q: 'Should we obfuscate the app and add anti-tampering?',
        a: 'It raises the effort required and is worth doing, but treat it as a speed bump rather than a control. Anything shipped to a device can eventually be reverse engineered. The durable fixes are server-side: never trust the client, and never ship a secret you cannot rotate.'
      }
    ]
  },

  {
    slug: 'network-pentest',
    accent: 'blue',
    icon: 'network',
    nav: 'Network testing',
    tag: 'Infrastructure',
    title: 'Network penetration testing',
    h1: 'Assume the perimeter will be crossed',
    blurb: 'External and internal testing that answers the only question that matters: once an attacker has a foothold, how far do they get?',
    lede:
      'External and internal testing that answers the question which actually matters — once an attacker has any foothold at all, how far do they get, and what stops them?',
    tags: ['External', 'Internal', 'Active Directory', 'Lateral movement'],
    covers: [
      'External perimeter and every internet-facing service',
      'Internal testing from an assumed-breach starting position',
      'Active Directory enumeration and Kerberos abuse',
      'Privilege escalation on Windows and Linux hosts',
      'Lateral movement and cross-domain trust relationships',
      'Segmentation and firewall rule validation, proven not assumed',
      'Remote access, VPN and wireless where in scope',
      'Validation of scanner output rather than a scanner dump'
    ],
    body: [
      {
        h2: 'Scanners find candidates, testers find paths',
        p: 'A vulnerability scanner will hand you four thousand rows and no sense of which ones matter. Our job is to take that noise and turn it into a handful of proven attack paths — showing that this misconfiguration, combined with that reused local admin password, leads to domain admin from a single unpatched workstation.'
      },
      {
        h2: 'The internal test is the honest one',
        p: 'External testing tells you how hard you are to get into. Internal testing tells you what happens afterwards, which is where most of the damage occurs. We start from a realistic assumed-breach position — a standard user account, a compromised laptop, or a network port in a meeting room — and work outward from there.'
      },
      {
        h2: 'Active Directory is still the main prize',
        p: 'Almost every internal engagement we run ends up in Active Directory, because that is where the attacker wants to be. Kerberoasting, delegation misconfiguration, certificate services abuse, unconstrained delegation and plain old password reuse in a local administrator account are all still alive and well in 2026.'
      },
      {
        h2: 'What you get beyond a findings list',
        ul: [
          'A visual attack path from initial foothold to your most sensitive asset',
          'Proof of segmentation failures rather than an assumption that it works',
          'Evidence for every escalation step, so it can be reproduced',
          'A prioritised list ordered by what actually shortens the path',
          'Detection opportunities — where you should have caught us'
        ]
      }
    ],
    deliverables: [
      'External and internal testing with a documented starting position',
      'A proven attack path diagram from foothold to high-value target',
      'Segmentation and firewall validation results',
      'Active Directory findings with concrete hardening steps',
      'Detection gaps identified at each step of the attack',
      'Retest after remediation, with the same starting position'
    ],
    faqs: [
      {
        q: 'How disruptive is internal testing?',
        a: 'Much less than people fear. We avoid denial-of-service techniques, agree any risky action in advance, and can work entirely from a read-only position if you prefer. The noisiest part is usually the initial scan, which we will run in a window you choose.'
      },
      {
        q: 'Do you need a domain account?',
        a: 'Ideally yes — a single standard, non-privileged user account. That is the most realistic starting position and gives by far the most useful result. If you would rather we start from a network port with no credentials at all, we can do that too, and we will tell you it is a harder test.'
      },
      {
        q: 'Can you test without touching production?',
        a: 'For network testing, no — the network is production. What we can do is constrain the scope tightly: named subnets, agreed hours, a documented list of prohibited actions, and a direct line to your team so we can stop immediately if anything looks unstable.'
      }
    ]
  },

  {
    slug: 'ai-security',
    accent: 'cyan',
    icon: 'cpu',
    nav: 'AI security testing',
    tag: 'AI & LLM',
    title: 'AI security testing',
    h1: 'Your AI features shipped faster than their threat model',
    blurb: 'Prompt injection, data leakage, tool abuse and model supply chain risk — tested against your real deployment, not a demo notebook.',
    lede:
      'Prompt injection, data leakage, tool and agent abuse, and model supply chain risk — tested against your real deployment, with your real guardrails in place, rather than a demo notebook.',
    tags: ['LLM apps', 'Prompt injection', 'Agents & tools', 'RAG leakage'],
    covers: [
      'Direct prompt injection and jailbreak attempts',
      'Indirect injection through documents, web pages and retrieved content',
      'Data leakage via retrieval, context windows, logs and error messages',
      'Guardrail and content-filter bypass testing',
      'Tool, plugin and agent permission abuse',
      'Excessive agency and unsafe autonomous actions',
      'Training and fine-tuning data exposure review',
      'Model, dependency and supply chain assessment',
      'Output handling — XSS, SSRF and code execution via model output'
    ],
    body: [
      {
        h2: 'The new attack surface is language',
        p: 'Traditional application security assumes that input and instructions are different things. Language models have no such distinction: anything in the context window is, to some degree, an instruction. That single property breaks a lot of assumptions that your existing security controls were built on, and it is not something a WAF will catch.'
      },
      {
        h2: 'Indirect injection is the one that hurts',
        p: 'Direct injection — a user typing a jailbreak — is mostly a reputational problem. Indirect injection is the serious one: an attacker plants instructions in a document, a support ticket, a web page or a calendar invite, and your model reads them as part of its normal work. If that model has tools, the injected instructions get to use them.'
      },
      {
        h2: 'Agents change the blast radius',
        p: 'The moment a model can send email, query a database, write a file or call an API, a prompt injection stops being a text problem and becomes an access-control problem. We test what the agent can reach and what happens when its instructions are subverted — because that is the difference between a strange output and a data breach.'
      },
      {
        callout: {
          kind: 'warn',
          title: 'Treat model output as untrusted input',
          text: 'Anything a model produces should be validated, encoded and authorised exactly as if it came from an anonymous internet user — because after an indirect injection, that is precisely what it is.'
        }
      },
      {
        h2: 'How we approach an AI assessment',
        ol: [
          'Map the system: models, prompts, retrieval sources, tools, permissions and data flows',
          'Establish what the feature is meant to refuse, and test whether it actually does',
          'Attempt direct and indirect injection against every untrusted input path',
          'Probe retrieval and context handling for cross-tenant or cross-user data leakage',
          'Exercise every tool and agent permission to find what the model can reach',
          'Test output handling for injection into downstream systems',
          'Review the supply chain: model provenance, dependencies and update path'
        ]
      }
    ],
    deliverables: [
      'A threat model for each AI feature, written in plain language',
      'A catalogue of injection payloads that worked, with the delivery path used',
      'Proof of any data leakage across users, tenants or documents',
      'A permission review of every tool and agent the model can call',
      'Guardrail bypass findings with concrete hardening recommendations',
      'Retest after your mitigations are in place'
    ],
    faqs: [
      {
        q: 'Do you need access to our model or weights?',
        a: 'Almost never. The vulnerabilities we care about live in the application around the model — the prompts, the retrieval pipeline, the tools and the output handling. We test through the same interface your users and attackers would use, which is the more realistic assessment anyway.'
      },
      {
        q: 'Does this work for RAG systems?',
        a: 'That is where most of our AI work happens. Retrieval-augmented systems introduce two specific risks: poisoned content entering the context window, and cross-user data leakage through poorly scoped retrieval. Both are testable, and both are common.'
      },
      {
        q: 'Will our guardrails stop these attacks?',
        a: 'Sometimes, and we will tell you honestly which ones held up. Guardrails raise the cost of a successful attack, but no filter reliably distinguishes instruction from data. The durable mitigations are architectural: least-privilege tools, strict output handling, and never letting retrieved content carry authority.'
      }
    ]
  },

  {
    slug: 'threat-detection',
    accent: 'emerald',
    icon: 'pulse',
    nav: 'Threat detection',
    tag: 'Monitoring & response',
    title: 'Threat detection',
    h1: 'Know within minutes, not months',
    blurb: 'Detection engineering across endpoint, identity, cloud and network telemetry — tuned until every alert is worth reading.',
    lede:
      'Detection engineering across endpoint, identity, cloud and network telemetry — built on MITRE ATT&CK coverage, tuned until every alert is worth someone\'s attention, and triaged by a named human rather than a queue.',
    tags: ['Detection engineering', 'MITRE ATT&CK', 'Alert triage', 'Threat hunting'],
    covers: [
      'Telemetry review and log pipeline design',
      'Detection use-case build mapped to MITRE ATT&CK',
      'Continuous tuning to drive false positives down',
      'Alert triage with an agreed response time',
      'Proactive threat hunting on a regular schedule',
      'Coverage across endpoint, identity, cloud and network',
      'Detection-as-code, with change control and testing',
      'Response runbooks for the scenarios most likely to affect you'
    ],
    body: [
      {
        h2: 'Detection fails on tuning, not tooling',
        p: 'Most detection failures are not platform failures. A system that fires four hundred alerts a week gets muted within a month, and a muted system detects nothing at all. We treat alert quality as the product: every rule we ship has to be worth someone\'s attention, and anything that is not gets fixed or removed.'
      },
      {
        h2: 'Coverage you can see, not a maturity score',
        p: 'Our detection coverage is organised around MITRE ATT&CK, so we can show you precisely which techniques you would catch and which you would miss. That gap list is far more useful than a generic maturity rating, because it tells you exactly where to spend the next month of effort.'
      },
      {
        h2: 'What happens when something fires',
        p: 'You get a person, not a ticket. The first response is a triage judgement: is this real, what is the blast radius, and what should happen next? If it is a genuine incident we move straight into containment, rather than waiting for a scheduled call.'
      },
      {
        callout: {
          kind: 'info',
          title: 'Alert fatigue is a security risk',
          text: 'A team that ignores its alerts is worse off than a team with no alerts at all, because the false confidence hides the real problem. Cutting noise is not a nice-to-have — it is the core of the job.'
        }
      }
    ],
    deliverables: [
      'A documented log pipeline that you own and can inspect',
      'An ATT&CK coverage map showing what you catch and what you miss',
      'Tuned detection rules with a written rationale for each',
      'A named on-call engineer and an agreed response time',
      'A monthly review of what fired, what was real, and what changed',
      'Runbooks for the scenarios most likely to affect you'
    ],
    faqs: [
      {
        q: 'Do we need to replace our SIEM?',
        a: 'Usually not. If your existing platform already collects the right telemetry, the problem is almost always content and tuning rather than the tool itself. Fixing that is far cheaper than a migration, and we take no commission either way.'
      },
      {
        q: 'How quickly will you respond to an alert?',
        a: 'For retainer clients we agree a response time in writing, typically fifteen minutes for high-severity alerts during covered hours. Outside those hours the commitment depends on the tier you choose — we would rather quote honestly than promise round-the-clock coverage and quietly miss it.'
      },
      {
        q: 'We have almost no logging today. Where do we start?',
        a: 'That is a common starting point. We begin with the two or three sources that catch the most real-world attacks — identity, cloud admin activity and endpoints — and build outward from there. You get useful detection in weeks, not a year-long platform project.'
      }
    ]
  },

  {
    slug: 'red-teaming',
    accent: 'rose',
    icon: 'target',
    nav: 'Red teaming',
    tag: 'Adversary simulation',
    title: 'Red teaming',
    h1: 'Test the whole organisation, not just the technology',
    blurb: 'A goal-based adversary simulation against your people, processes and technology — measured against a real objective.',
    lede:
      'A goal-based adversary simulation that tests the whole organisation — people, process and technology — and measures success against an objective a real attacker would actually want, rather than a count of findings.',
    tags: ['Objective-based', 'Social engineering', 'Physical', 'Purple-team debrief'],
    covers: [
      'Objective definition with your leadership, agreed in writing',
      'Open-scope reconnaissance and open-source intelligence gathering',
      'Social engineering: phishing, vishing, pretexting and smishing',
      'Physical intrusion and on-site access where in scope',
      'Initial access, persistence and privilege escalation',
      'Objective achievement, with evidence of exactly how',
      'Continuous measurement of your detection and response',
      'A purple-team debrief that turns every action into a detection'
    ],
    body: [
      {
        h2: 'A red team is not a bigger penetration test',
        p: 'A penetration test asks "what is broken?". A red team asks "can a motivated adversary achieve a specific goal against this organisation?". The difference matters, because a red team is allowed to use anything — a phishing email, a phone call, a badge borrowed from a smoking area, an unlocked meeting room — and the result is measured in whether the objective was met, not in how many findings were filed.'
      },
      {
        h2: 'The objective is the point',
        p: 'We agree the objective with your leadership before anything starts. It might be access to a specific dataset, the ability to approve a payment, or read access to source code. A clear objective keeps the engagement honest: it stops us from wandering into interesting but irrelevant corners, and it gives you a binary answer at the end rather than a score.'
      },
      {
        h2: 'Measuring your defenders, not just your systems',
        p: 'Every action we take is timestamped, and your detection and response team is measured against it. Did anyone notice? How long did it take? Was the response effective? That record is often the most valuable output of the whole engagement, because it tells you what your security operations actually look like under pressure rather than what the runbook says they should.'
      },
      {
        callout: {
          kind: 'info',
          title: 'The debrief is a purple-team exercise',
          text: 'We walk through every action with your defenders, mapping each step to a detection opportunity. That is where a red team engagement turns into permanent capability rather than a one-off event.'
        }
      },
      {
        h2: 'What makes a good objective',
        ul: [
          'Specific and verifiable — we either achieved it or we did not',
          'Valuable enough that a real attacker would want it',
          'Achievable without causing disruption to production',
          'Known to a very small number of people, so the test is genuine',
          'Agreed in writing, along with the rules of engagement'
        ]
      }
    ],
    deliverables: [
      'A written objective and rules of engagement agreed before the start',
      'A full narrative of the engagement, including what failed',
      'Evidence of objective achievement, or an honest report of failure',
      'Detection and response timings measured at every step',
      'A purple-team debrief mapping actions to detection opportunities',
      'A prioritised list of the changes that would have stopped us fastest'
    ],
    faqs: [
      {
        q: 'How long does a red team engagement take?',
        a: 'Typically four to eight weeks of elapsed time, though the active work is concentrated into bursts. Social engineering and physical elements need scheduling and cannot be compressed. We will give you a realistic timeline rather than an optimistic one.'
      },
      {
        q: 'Will you phish our staff?',
        a: 'Usually yes, and that is the point — but never punitively. We report by team and by process, not by naming individuals who clicked. The goal is to find where the process fails, not to embarrass the people inside it. If you would rather exclude social engineering entirely, we can scope it out.'
      },
      {
        q: 'What if you get caught early?',
        a: 'Then we report it, because being caught quickly is genuinely good news and you paid for that information. We will also tell you what gave us away, and whether it was a control working as designed or an accident.'
      }
    ]
  }
];

/* ============================================================
   INSIGHTS
   ============================================================ */
const CATEGORIES = [
  { key: 'all',       label: 'All' },
  { key: 'web',       label: 'Web',              accent: 'magenta' },
  { key: 'mobile',    label: 'Mobile',           accent: 'amber' },
  { key: 'network',   label: 'Network',          accent: 'blue' },
  { key: 'ai',        label: 'AI security',      accent: 'cyan' },
  { key: 'detection', label: 'Threat detection', accent: 'emerald' },
  { key: 'redteam',   label: 'Red teaming',      accent: 'rose' }
];

const INSIGHTS = [
  {
    slug: 'what-a-web-pentest-covers',
    category: 'web',
    categoryLabel: 'Web',
    accent: 'magenta',
    title: 'What a web application penetration test actually covers',
    excerpt:
      'Most scoping documents list the same six bullet points. Here is what those bullets really mean, and which one is usually where the serious findings are hiding.',
    lede:
      'Almost every web application test begins with a scoping document listing the same categories. The words are consistent, but what sits behind them varies enormously between one tester and the next. Here is what each area actually involves — and where the findings that matter usually come from.',
    readTime: '6 min read',
    body: [
      { h2: 'Authentication and session handling', p: 'This is not just "does the login work". It is whether the application lets you enumerate valid usernames, whether the password reset flow can be pointed at an address the attacker controls, whether sessions survive a password change, whether tokens expire, and whether the logout button actually invalidates anything server-side. Password reset flows are one of the most productive places we look, because they are written once and rarely revisited.' },
      { h2: 'Authorisation — where most serious findings live', p: 'If you only care about one category, care about this one. Authorisation bugs mean one user can reach another user\'s data by changing an identifier, or a low-privileged account can perform a privileged action by calling an endpoint directly. These are rarely found by scanners, because a scanner cannot know that object 4021 does not belong to the person requesting it. In our experience this single category accounts for more high-severity findings than everything else combined.' },
      { h2: 'Business logic', p: 'Logic flaws are the findings that make clients wince, because they are specific to how their product works and no tool will ever find them. Applying a discount code twice. Approving your own expense claim. Skipping a step in a multi-stage checkout. Submitting a negative quantity and being credited. Testing this means understanding what the application is for — which is exactly why it needs a human.' },
      { h2: 'Injection, SSRF and the rest', p: 'SQL injection still exists, but it is no longer the headline. Server-side request forgery, insecure deserialisation, template injection and file-upload handling are all more likely to appear in a modern application. We test them properly, with validation rather than payload spraying, because an unvalidated scanner hit wastes your developers\' time and damages trust in the report.' },
      { h2: 'Client-side issues', p: 'Cross-site scripting has not gone away, it has moved. Modern single-page applications introduce DOM-based variants, postMessage handling bugs and dangerously-permissive content security policies that quietly undo the protections you thought you had. We test the browser as a platform, not just the server.' },
      { h2: 'APIs, which are usually the real scope', p: 'In most modern applications the API surface is far larger than the web interface and considerably less well understood. Every mobile build, partner integration and webhook is part of it. If the scoping conversation does not include the API, the test has not really started — and this is where we recommend spending the largest share of the budget.' },
      { h2: 'What a good report looks like', p: 'A finding should tell you what was done, why it worked, what an attacker could realistically achieve, what to change, and how to confirm the change worked. If a report gives you a severity score and a screenshot but no reproduction path, you have been sold a scan with better typography.' }
    ],
    takeaways: [
      'Authorisation flaws, not injection, produce most serious web findings',
      'Password reset and session flows are consistently productive',
      'Business logic bugs are invisible to scanners and specific to your product',
      'If the API is not in scope, the test has barely begun',
      'A finding without a reproduction path is not actionable'
    ]
  },

  {
    slug: 'android-and-ios-fail-differently',
    category: 'mobile',
    categoryLabel: 'Mobile',
    accent: 'amber',
    title: 'Android and iOS fail differently',
    excerpt:
      'Treating mobile as one platform means missing the interesting parts. The two ecosystems have genuinely different failure modes, and the test plan should reflect that.',
    lede:
      'Mobile testing is often sold as a single service, as though Android and iOS were interchangeable. They are not. The two platforms have different permission models, different storage primitives and different classes of mistake — and a test plan that ignores that will miss real findings on both.',
    readTime: '6 min read',
    body: [
      { h2: 'The binary is public property', p: 'Whatever you ship to an app store can be downloaded, unpacked and read. That includes API endpoints, feature flags, internal hostnames, third-party keys and occasionally credentials someone assumed would be temporary. Decompiling a release build is the first thing an attacker does and should be the first thing a test does. Anything that is genuinely sensitive needs to be server-side, not obfuscated in the client.' },
      { h2: 'Where Android tends to leak', p: 'The most common Android findings we report are exported components that should not be exported — activities, services and content providers reachable by any other app on the device. Then there is local storage: files written to external storage, shared preferences left world-readable on a rooted device, and WebView configurations that permit file access or JavaScript bridges far beyond what the app needs. Deep links and intent handling are another recurring source of authorisation bypass.' },
      { h2: 'Where iOS tends to leak', p: 'iOS failures cluster differently. Keychain items stored with an accessibility class that allows access while the device is locked. Sensitive data cached in a directory that ends up in an unencrypted backup. Screenshot and app-switcher caches that capture a balance or a medical record. And jailbreak detection that is defeated by a single hook, giving false confidence that the protection exists at all.' },
      { h2: 'Pinning is a speed bump, not a wall', p: 'Certificate pinning is worth implementing, and it reliably breaks naive interception. It also reliably falls to a few lines of instrumentation on a rooted or jailbroken device, which is the position any serious attacker will be in. Treat pinning as something that raises effort, and put your real trust boundary on the server where it can be enforced.' },
      { h2: 'The backend is usually where the finding is', p: 'The single most common outcome of a mobile engagement is a backend finding. An endpoint that takes the user ID from the request rather than the session. A rule enforced only in the app, so a direct API call bypasses it. A feature flag that gates a screen but not the endpoint behind it. The mobile app is frequently just the most convenient way to document the API for us.' },
      { h2: 'Report against MASVS, not a homegrown scale', p: 'The OWASP Mobile Application Security Verification Standard gives you a shared vocabulary and a per-control pass or fail. It makes findings comparable between releases and between vendors, and it gives your developers a checklist they can actually work through. A bespoke severity scale helps nobody six months later.' }
    ],
    takeaways: [
      'Everything shipped in the binary is public — plan accordingly',
      'Android leaks through exported components and local storage',
      'iOS leaks through keychain classes, caches and weak jailbreak detection',
      'Certificate pinning raises effort but does not enforce trust',
      'Most mobile engagements produce backend findings'
    ]
  },

  {
    slug: 'where-network-tests-find-problems',
    category: 'network',
    categoryLabel: 'Network',
    accent: 'blue',
    title: 'Where network penetration tests still find real problems',
    excerpt:
      'External testing tells you how hard you are to enter. Internal testing tells you what happens next — and that is where the damage usually is.',
    lede:
      'Network penetration testing has a reputation problem: people assume the easy wins are gone and that it is mostly a compliance exercise. In our experience the opposite is true. The findings have moved, but they have not disappeared.',
    readTime: '6 min read',
    body: [
      { h2: 'The external scan is the least interesting part', p: 'Internet-facing exposure testing is valuable, but it is also the most automated and the most likely to have been done before. Its real purpose is to confirm what a remote attacker can see and to catch the forgotten service — a staging environment, an old VPN appliance, an admin panel someone stood up during an incident and never took down. Those forgotten systems are where external findings usually come from.' },
      { h2: 'Assume the foothold, then measure the damage', p: 'The genuinely useful question is what happens after a single machine is compromised. Starting from one standard user account on one workstation, how far can an attacker get, how quickly, and what stops them? This is where most of the value in a network engagement sits, and it is the test most organisations have never actually run.' },
      { h2: 'Active Directory is still the main prize', p: 'In almost every internal engagement we run, the path ends in Active Directory, because that is what an attacker wants. Kerberoasting against service accounts with weak passwords. Unconstrained delegation. Certificate services misconfiguration that hands out domain admin. A local administrator password reused across every workstation in the estate. None of these are exotic, and all of them are still present in environments that consider themselves well managed.' },
      { h2: 'Segmentation is usually assumed, not proven', p: 'Ask a network team whether the finance subnet is isolated from the corporate network and you will get a confident yes. Ask when it was last tested and the confidence drops. Segmenting on paper and enforcing it in practice are different things, and firewall rules accumulate exceptions over years. We prove segmentation by trying to cross it.' },
      { h2: 'The detection question', p: 'At every step we record whether anything should have noticed. A path that takes four hours to traverse and generates zero alerts is a very different finding from one that gets caught in ten minutes. Reporting both the technical path and the detection gap gives your security operations team something concrete to build against.' },
      { h2: 'Why scanners cannot do this', p: 'A scanner will report every unpatched service and every weak cipher suite, producing a list of thousands of items with no sense of which combination is dangerous. What we produce instead is a small number of proven paths — this misconfiguration plus that reused credential reaches your domain controller — which is a document a team can actually act on.' }
    ],
    takeaways: [
      'External findings usually come from forgotten or shadow systems',
      'The valuable test is the one that starts from an assumed foothold',
      'Active Directory remains the destination in most internal engagements',
      'Segmentation should be proven by crossing it, not assumed',
      'Report the detection gap alongside the technical path'
    ]
  },

  {
    slug: 'prompt-injection-the-ai-attack-surface',
    category: 'ai',
    categoryLabel: 'AI security',
    accent: 'cyan',
    title: 'Prompt injection: the attack surface nobody scoped',
    excerpt:
      'Language models have no reliable distinction between data and instructions. That single property undermines a lot of assumptions your existing security controls are built on.',
    lede:
      'Most application security assumes that input and instructions are separable things. You validate the input, and the code decides what to do with it. Language models break that assumption completely, and the consequences are only starting to be understood.',
    readTime: '7 min read',
    body: [
      { h2: 'Everything in the context window is an instruction', p: 'A language model does not have a privileged channel for developer intent. The system prompt, the user message, the retrieved document, the web page it just fetched and the output of a tool call are all, to some degree, competing sources of instruction. There is no parser that reliably separates them. This means any content the model reads is potentially content that can direct it.' },
      { h2: 'Direct injection is annoying; indirect injection is dangerous', p: 'Direct injection is a user typing a jailbreak to get the model to say something it should not. It is a reputational and product problem, and it is what most vendors mean when they talk about AI security. Indirect injection is different in kind: an attacker plants instructions in a document, a support ticket, a shared calendar invite, a job application or a web page, and waits. Your model reads that content during normal operation and follows the embedded instructions.' },
      { h2: 'Guardrails raise cost, they do not enforce boundaries', p: 'Content filters and safety classifiers do help, and we test them. But no filter reliably distinguishes instruction from data in all cases, because that distinction does not exist at the level the filter operates on. Treat guardrails as defence in depth and put your real controls where they can be enforced deterministically: permissions, output handling and authorisation.' },
      { h2: 'Retrieval systems leak across boundaries', p: 'Retrieval-augmented generation introduces a second class of problem. If retrieval is scoped by a filter rather than by hard authorisation, a carefully phrased query can surface another user\'s documents or another tenant\'s data. This is an access-control bug wearing an AI costume, and it is far more common than most teams expect.' },
      { h2: 'Agents turn a text problem into an access problem', p: 'The moment a model can call a tool — send email, query a database, write a file, invoke an internal API — a successful injection stops being an odd output and becomes an action taken with your model\'s credentials. The critical question is not "can the model be tricked?" but "what can the model reach when it is tricked?" Least privilege for agents is the single highest-value mitigation available.' },
      { h2: 'Treat model output as hostile input', p: 'Model output flows into browsers, databases, shell commands, SQL and other APIs. It should be validated, encoded and authorised exactly as if it had arrived from an anonymous internet user, because after a successful indirect injection that is precisely what it is. Injection into downstream systems via model output is one of the least-tested and most damaging classes we find.' },
      { h2: 'A practical starting point', p: 'If you are shipping an AI feature and have not done this yet, the sequence below will find most of what matters without any specialist tooling.' },
      { ol: [
        'Write down every input path into the context window, including documents and retrieved content',
        'List every tool, API and data source the model can reach, and what permissions it holds',
        'Ask what the worst action an attacker could take via injection would be, and reduce it',
        'Test retrieval with cross-user and cross-tenant queries before you ship',
        'Validate and encode every output that reaches another system',
        'Keep a human in the loop for anything irreversible'
      ] }
    ],
    takeaways: [
      'Models do not reliably separate data from instructions',
      'Indirect injection through stored content is the serious threat',
      'Guardrails raise cost but cannot enforce a trust boundary',
      'Retrieval scoping is an access-control problem in disguise',
      'Least privilege for agents is the highest-value mitigation'
    ]
  },

  {
    slug: 'detection-is-a-tuning-problem',
    category: 'detection',
    categoryLabel: 'Threat detection',
    accent: 'emerald',
    title: 'Detection is a tuning problem, not a tool problem',
    excerpt:
      'A platform that fires four hundred alerts a week gets muted within a month. Alert quality, not coverage, is what decides whether detection actually works.',
    lede:
      'When detection fails, the instinct is to blame the platform. In our experience the platform is rarely the problem. The problem is that nobody owns the quality of what it produces, so it slowly becomes noise that everyone learns to ignore.',
    readTime: '6 min read',
    body: [
      { h2: 'The muting death spiral', p: 'It happens in almost every environment. A new detection rule fires too often, so someone adds an exclusion. Then another. Within a few months the rule is so narrow that it no longer catches the thing it was written for, but it still shows as enabled in the console. The coverage report says you are covered. The reality is that you are not, and no one will find out until an incident review.' },
      { h2: 'Every rule needs an owner and a reason', p: 'A detection rule is a hypothesis: "if an attacker does this, we will see that". It should have a named owner, a documented reason for existing, and a review date. If nobody can explain what a rule is for, it is not protecting anything — it is training your analysts to skim.' },
      { h2: 'Measure precision, not rule count', p: 'Vendors compete on the number of rules shipped, which is a meaningless metric. What matters is the ratio of alerts that turn out to be real. If fewer than one in ten alerts leads to an investigation, the detection content needs work before anything new is added. Adding rules to a noisy system makes it worse, not better.' },
      { h2: 'Map to ATT&CK so you can see the holes', p: 'Frameworks get a bad reputation because they are often used for scoring. Used properly, MITRE ATT&CK is a coverage map: here is what we would catch, here is what we would miss, and here is the gap we are closing this quarter. That is a conversation you can have with an engineering team. A maturity score of 3.2 out of 5 is not.' },
      { h2: 'Telemetry first, rules second', p: 'No rule can fire on data you do not collect. Before writing any detection content, confirm that the events you need actually exist, are parsed correctly and are retained long enough to investigate. A surprising amount of detection work is really log pipeline work, and skipping that step produces rules that look fine and never fire.' },
      { h2: 'Triage is a skill, not a queue', p: 'Someone has to decide, quickly and repeatedly, whether an alert is real and what to do about it. That judgement is the product. If your triage process is a queue with a service-level target measured in days, you do not have detection — you have a historical record of things that already happened.' },
      { h2: 'What good looks like', p: 'A useful detection programme looks boring from the outside.' },
      { ul: [
        'A small number of rules, each with an owner, a reason and a review date',
        'An alert-to-investigation ratio that analysts trust',
        'ATT&CK coverage you can show and a plan for the gaps',
        'A named human on call, with an agreed response time',
        'A monthly review that removes as much as it adds'
      ] }
    ],
    takeaways: [
      'Exclusions accumulate silently until coverage is fiction',
      'Every rule needs an owner, a reason and a review date',
      'Measure precision, not the number of rules',
      'ATT&CK is a coverage map, not a score',
      'Triage judgement is the actual product'
    ]
  },

  {
    slug: 'red-teaming-vs-penetration-testing',
    category: 'redteam',
    categoryLabel: 'Red teaming',
    accent: 'rose',
    title: 'Red teaming vs penetration testing: what is the difference?',
    excerpt:
      'One asks "what is broken?". The other asks "can a motivated adversary reach a specific goal?". The distinction changes how you scope, measure and get value from the work.',
    lede:
      'The two terms get used interchangeably, usually by people selling one of them. They answer different questions, produce different outputs and are appropriate at different stages of maturity. Confusing them leads to engagements that are expensive and unsatisfying.',
    readTime: '6 min read',
    body: [
      { h2: 'A penetration test is bounded and technical', p: 'A penetration test takes a defined scope — these applications, this subnet, these apps — and asks what is wrong with them. It is time-boxed, highly repeatable and produces a list of findings with severity ratings and remediation advice. It is excellent at answering "are there exploitable weaknesses here?" and it is the right first step for almost every organisation.' },
      { h2: 'A red team is goal-based and unbounded', p: 'A red team engagement defines an objective a real attacker would want — access to a specific dataset, the ability to approve a payment, read access to source code — and then uses anything legitimate to get there. Phishing, phone calls, physical access, a supplier relationship, an abandoned building entrance. The output is not a findings list. It is a binary answer plus a narrative of how the objective was or was not reached.' },
      { h2: 'The measurement is completely different', p: 'A penetration test is measured by what was found. A red team is measured by whether the goal was achieved, and critically by what your defenders did while it was happening. Did anyone notice? After how long? Was the response effective? A red team engagement that achieves nothing but reveals your detection fires reliably in four minutes is a good result, and it should be reported as one.' },
      { h2: 'Red teaming tests people and process, which is uncomfortable', p: 'Technology testing is comfortable because the findings are about systems. Red teaming produces findings about decisions: someone clicked, someone let a visitor through a door without a badge, someone approved a payment after a convincing phone call. This is why the reporting must be blameless. The purpose is to find where the process fails, not to identify who to blame — a lesson learned badly is worse than no lesson at all.' },
      { h2: 'When each one is appropriate', p: 'If you have never had an external assessment, do that first — a red team against an untested environment mostly proves that untested environments are easy. Red teaming becomes valuable once you have the fundamentals in place and want to understand how your organisation performs against a determined adversary rather than against a checklist.' },
      { h2: 'Where the two meet: purple teaming', p: 'The most valuable part of a red team engagement is usually the debrief, where every action is mapped to a detection opportunity and your defenders get to ask "how would we have seen that?". That collaborative process — red team actions feeding blue team detection — is what people mean by purple teaming, and it is where the permanent improvement comes from.' },
      { h2: 'Questions to settle before you buy either', p: 'Whichever you choose, agree these in writing before the engagement begins.' },
      { ul: [
        'What is the objective, and who decided it?',
        'What is explicitly out of scope — and why?',
        'How will success be measured at the end?',
        'Will social engineering or physical access be included?',
        'How many people inside the organisation will know this is happening?',
        'What are the rules of engagement for something genuinely dangerous?'
      ] }
    ],
    takeaways: [
      'Penetration testing asks what is broken; red teaming asks whether a goal is reachable',
      'Red teams are measured by objective achieved and defender response, not findings count',
      'Red team reporting must be blameless to be useful',
      'Fix the fundamentals before investing in adversary simulation',
      'The purple-team debrief is where the lasting value is'
    ]
  }
];

/* ============================================================
   ABOUT
   ============================================================ */
const ABOUT_VALUES = [
  {
    accent: 'magenta', icon: 'compass',
    title: 'Independent by design',
    text: 'We do not resell licences and we take no vendor commission. Our only product is judgement, which is worth very little if it is for sale.'
  },
  {
    accent: 'rose', icon: 'target',
    title: 'Offence informs defence',
    text: 'Our testers and our defenders sit in the same room. A technique that works against you becomes a detection rule the same week.'
  },
  {
    accent: 'amber', icon: 'chat',
    title: 'Plain language, always',
    text: 'If a finding cannot be explained to the person who has to fund the fix, it is not finished. Jargon is usually a way of hiding uncertainty.'
  },
  {
    accent: 'emerald', icon: 'scale',
    title: 'Honest about limits',
    text: 'We say when we do not know, when a control is theatre, and when a cheaper option would do the job just as well.'
  },
  {
    accent: 'cyan', icon: 'clock',
    title: 'Built for the long haul',
    text: 'Security is a programme, not a project. We scope retainers in days per month so the work continues after the report lands.'
  },
  {
    accent: 'blue', icon: 'shield',
    title: 'Small on purpose',
    text: 'You work with the people who did the work. No account managers relaying messages, no juniors quietly learning on your estate.'
  }
];

const ABOUT_PRINCIPLES = [
  {
    n: '01',
    title: 'Sequence beats spend',
    text: 'Most security budgets fail because the work happens in the wrong order — a platform bought before the problem is understood. Fix the order and a modest budget goes a long way.'
  },
  {
    n: '02',
    title: 'Test what you actually shipped',
    text: 'The build in the app store, the API in production, the model with its real guardrails. Testing a sanitised copy produces findings you cannot act on and misses the ones you can.'
  },
  {
    n: '03',
    title: 'A finding without a fix is a complaint',
    text: 'Every issue we report comes with the specific change we recommend and a way to verify it worked. If we cannot suggest a fix, we say so and explain why.'
  },
  {
    n: '04',
    title: 'Measure what you fixed, not what you own',
    text: 'A tool count is not a security posture. We report on findings closed, attack paths removed and detection coverage gained — the things that actually changed.'
  },
  {
    n: '05',
    title: 'The report is not the deliverable',
    text: 'A document that sits unread has protected nobody. The deliverable is a change in your environment, and the report is just how we explain it.'
  }
];

const ABOUT_FACTS = [
  { accent: 'magenta', b: 'Vendor-neutral', s: 'No resale, no commission, no referral fees — ever.' },
  { accent: 'rose', b: 'Offence-led', s: 'Every technique that works against you becomes a detection.' },
  { accent: 'emerald', b: 'Remote-first', s: 'Working alongside teams across multiple time zones.' }
];

/* ============================================================
   CAREERS
   NOTE: illustrative roles — replace with your real openings.
   ============================================================ */
const ROLES = [
  {
    accent: 'magenta',
    title: 'Web & API Penetration Tester',
    status: 'Open',
    statusKind: 'open',
    text:
      'You will test web applications and APIs across a range of stacks, write findings that developers actually act on, and work alongside our detection team so what you break gets caught next time.',
    tags: ['Full time', 'Remote', '3+ years experience', 'OSCP or equivalent']
  },
  {
    accent: 'amber',
    title: 'Mobile Security Engineer',
    status: 'Open',
    statusKind: 'open',
    text:
      'You will reverse Android and iOS builds, test on real devices, and chase findings past the app boundary into the backend APIs behind them. Both platforms, not one.',
    tags: ['Full time', 'Remote', 'Android & iOS', 'MASVS / MASTG']
  },
  {
    accent: 'cyan',
    title: 'AI Security Researcher',
    status: 'Open',
    statusKind: 'open',
    text:
      'You will break LLM applications — prompt injection, retrieval leakage, agent tool abuse — and help build the testing methodology as the field develops. Comfort with ambiguity required.',
    tags: ['Full time', 'Remote', 'LLM applications', 'Research + delivery']
  },
  {
    accent: 'emerald',
    title: 'Detection Engineer',
    status: 'Always interested',
    statusKind: 'pipeline',
    text:
      'You will build and tune detection content across cloud, identity, endpoint and network telemetry, keep false positives low enough that people still read the alerts, and turn red team findings into coverage.',
    tags: ['Full time', 'Remote', 'Detection engineering', 'SIEM & cloud logs']
  }
];

module.exports = {
  SITE, NAV, FRAMEWORKS,
  SERVICES, CATEGORIES, INSIGHTS,
  ABOUT_VALUES, ABOUT_PRINCIPLES, ABOUT_FACTS,
  ROLES
};
