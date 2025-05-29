// app/legal/terms/page.tsx
'use client';

export default function Terms() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="bg-neutral rounded-lg shadow p-8 text-primary">
        <h1 className="text-4xl font-bold mb-6">Eco-Source Terms of Use</h1>
        <p className="text-sm opacity-70 mb-8 font-redditLight">
          Last updated: 19 May 2025
        </p>

        {/** 1 — Acceptance **/}
        <Section title="1. Acceptance of Terms">
          By creating an account, browsing, or otherwise using Eco-Source
          (“Service”), you agree to be bound by these Terms of Use (“Terms”). If
          you do not accept all terms, do not use the Service.
        </Section>

        {/** 2 — The Service **/}
        <Section title="2. The Service">
          Eco-Source is a free online directory and discussion platform that
          connects buyers with suppliers of eco-friendly products and services.
          Eco-Source does <strong>not</strong> process payments, hold inventory,
          or act as an agent in any transaction.
        </Section>

        {/** 3 — User Accounts **/}
        <Section title="3. User Accounts">
          <ul className="list-disc list-inside space-y-2">
            <li>Provide accurate, up-to-date information.</li>
            <li>You are responsible for all activity under your account.</li>
            <li>
              We may suspend or terminate accounts that violate these Terms or
              our Community Guidelines.
            </li>
          </ul>
        </Section>

        {/** 4 — Content & IP **/}
        <Section title="4. Content & Intellectual Property">
          You retain ownership of any text, images, or documents you upload
          (“User Content”). By posting, you grant Eco-Source a non-exclusive,
          worldwide, royalty-free license to display that content on the
          Service according to your privacy settings.
          <br />
          Eco-Source’s name, logo, ERS graphics, and code are our intellectual
          property and may not be reproduced without permission.
        </Section>

        {/** 5 — Forum & Messaging Rules **/}
        <Section title="5. Forum & Messaging Rules">
          <strong>Allowed:</strong> respectful debate, sharing sustainability
          tips, posting verified data and citations.
          <br />
          <strong>Prohibited:</strong>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Harassment, hate speech, or personal attacks.</li>
            <li>Unverified or misleading sustainability claims (“greenwashing”).</li>
            <li>Spam, commercial solicitation, or bulk messaging.</li>
            <li>
              Sharing private documents without the owner’s written consent.
            </li>
          </ul>
          Violations may result in content removal, account suspension, or
          termination.
        </Section>

        {/** 6 — ERS Disclaimer **/}
        <Section title="6. ERS Metrics Disclaimer">
          ERS scores are calculated from self-reported data and third-party
          documents. While we strive for accuracy, Eco-Source makes no warranty
          as to the completeness or fitness of any ERS score for a particular
          purpose.
        </Section>

        {/** 7 — Prohibited Conduct (general) **/}
        <Section title="7. Prohibited Conduct">
          You agree not to:
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Use the Service for unlawful purposes.</li>
            <li>
              Upload viruses, malware, or attempt to disrupt the Service.
            </li>
            <li>
              Reverse-engineer, decompile, or copy any part of the Service not
              expressly permitted by these Terms.
            </li>
          </ul>
        </Section>

        {/** 8 — Termination **/}
        <Section title="8. Termination">
          You may delete your account at any time. Eco-Source may suspend or
          terminate the Service, or your account, with notice for any reason
          including breach of these Terms.
        </Section>

        {/** 9 — Third-Party Links **/}
        <Section title="9. Third-Party Links">
          The Service may contain links to external websites. Eco-Source is not
          responsible for the content or privacy practices of those sites.
        </Section>

        {/** 10 — Limitation of Liability **/}
        <Section title="10. Limitation of Liability">
          To the fullest extent permitted by law, Eco-Source will not be liable
          for indirect, incidental, or consequential damages arising from your
          use of the Service.
        </Section>

        {/** 11 — Changes **/}
        <Section title="11. Changes to Terms">
          We may update these Terms periodically. Continued use of the Service
          after updates constitutes acceptance of the revised Terms.
        </Section>

        {/** 12 — Governing Law **/}
        <Section title="12. Governing Law">
          These Terms are governed by the laws of the State of California, USA,
          without regard to conflict-of-law principles.
        </Section>

        {/** 13 — Contact **/}
        <Section title="13. Contact">
          Questions about these Terms? Email us at 
          <a href="mailto:admin@ecosourceco.com" className="underline">
            admin@ecosourceco.com
          </a>
          .
        </Section>
      </div>
    </div>
  );
}

/* — Reusable section wrapper —*/
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 mb-8 font-redditLight">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="opacity-90">{children}</div>
    </section>
  );
}
