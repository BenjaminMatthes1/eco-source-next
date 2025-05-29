// app/faq/page.tsx
'use client';

export default function FAQ() {
  const faqs = [
    {
      q: 'What is Eco-Source?',
      a: `Eco-Source is a free platform that connects buyers with suppliers of
          sustainable products and services. We provide transparency through
          ERS (Environmental–Responsibility) metrics and verified documents.`,
    },
    {
      q: 'Who can join?',
      a: `Any individual, small business, or enterprise committed to eco-friendly
          practices can create an account. Suppliers complete a short
          verification to start listing products or services.`,
    },
    {
      q: 'How are ERS metrics calculated?',
      a: `Each user, product, or service selects the metrics that best describe
          its impact (e.g., carbon footprint, ethical labor, circular design).
          • Every metric is normalized to a 0–10 scale.\n
          • Uploaded certifications (e.g., FSC, Cradle-to-Cradle) add weight and
            unlock bonus points after admin review.\n
          • The final score is a weighted blend (60 % quantitative data,
            40 % certifications & peer reviews) scaled to 0–100.\n
          You can see a full breakdown in **Dashboard → Metrics → ERS-Extended**.`,
    },
    {
      q: 'Are my documents public?',
      a: `By default, uploaded PDFs and images are **private**. You decide per
          document whether it can be displayed on your public profile.\n
          • Toggle “Make public” in the upload panel.\n
          • Even private docs still count toward your verified score once our
            admins approve them.`,
    },
    {
      q: 'Is Eco-Source really free?',
      a: `Yes. Listing, browsing, and messaging are all 100 % free. We do not
          process payments or charge transaction fees at this stage.`,
    },
    {
      q: 'How do I delete my account?',
      a: `Go to **Dashboard → Settings → Delete Account** and confirm. All
          personal data is removed within 30 days, in line with our Privacy Policy.`,
    },
  ];

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">Frequently Asked Questions</h1>

      <div className="space-y-4">
        {faqs.map(({ q, a }) => (
          <div key={q} className="collapse collapse-arrow bg-neutral rounded-lg shadow">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-lg font-semibold text-primary">
              {q}
            </div>
            <div className="collapse-content font-redditLight whitespace-pre-line opacity-90">
              {a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
