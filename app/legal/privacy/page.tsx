// app/legal/privacy/page.tsx
'use client';

export default function Privacy() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="bg-neutral rounded-lg shadow p-8 text-primary">
        <h1 className="text-4xl font-bold mb-6">Eco-Source&nbsp;Privacy&nbsp;Policy</h1>
        <p className="text-sm opacity-70 mb-8 font-redditLight">
          Last updated: 19&nbsp;May&nbsp;2025
        </p>

        <Section title="1. Introduction">
          Eco-Source (“we,” “our,” “us”) respects your privacy. This Privacy
          Policy explains how we collect, use, and protect your personal
          information when you use ecosourceco.com (“Service”).
        </Section>

        <Section title="2. Information We Collect">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Account Data&nbsp;</strong>— name, email, password (hash), role, and profile details you voluntarily provide.</li>
            <li><strong>ERS Metrics&nbsp;</strong>— quantitative data (e.g., carbon footprint) and uploaded documents (certifications, policies).</li>
            <li><strong>Usage Data&nbsp;</strong>— log files, page views, and device information collected via cookies and similar technologies.</li>
            <li><strong>Messages &amp; Forum Content&nbsp;</strong>— posts, comments, and private messages you create.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Information">
          <ul className="list-disc list-inside space-y-2">
            <li>Provide and maintain the Service, including ERS scoring and search.</li>
            <li>Respond to inquiries and support requests.</li>
            <li>Send transactional emails (e.g., password resets, verification).</li>
            <li>Improve the Service via aggregated analytics (non-identifiable).</li>
            <li>
              Send newsletters <em>only</em> if you have opted&nbsp;in under
              <code>preferences.newsletter</code>.
            </li>
          </ul>
        </Section>

        <Section title="4. Legal Bases (GDPR)">
          We process your data on the bases of (a) contract—providing the
          Service you request; (b) legitimate interests—improving platform
          security and usability; and (c) consent—for optional newsletters and
          cookies.
        </Section>

        <Section title="5. Sharing &amp; Disclosure">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>No sale of data.</strong> We do not sell or rent your
              personal information.
            </li>
            <li>
              Service providers (AWS, MongoDB Atlas, email providers) process
              data on our behalf under strict confidentiality obligations.
            </li>
            <li>
              We may disclose data if required by law or to protect Eco-Source’s
              rights.
            </li>
          </ul>
        </Section>

        <Section title="6. Cookies &amp; Analytics">
          Essential cookies keep you logged in. Non-essential analytics cookies
          are set only after you click “Accept” on our Cookie&nbsp;Banner. See
          the full Cookie Policy for details.
        </Section>

        <Section title="7. Data Retention">
          Account data is retained while your account is active. You may delete
          your account at any time; data is erased within 30&nbsp;days, except
          minimal logs required for security and legal compliance.
        </Section>

        <Section title="8. Your Rights">
          Subject to local law (GDPR, CCPA), you have the right to access,
          correct, delete, or export your personal data. Email us at&nbsp;
          <a href="mailto:admin@ecosourceco.com" className="underline">
            admin@ecosourceco.com
          </a>{' '}
          with your request.
        </Section>

        <Section title="9. Security">
          Data is encrypted in transit (HTTPS) and at rest. Access to production
          databases is limited to authorized personnel and secured by MFA.
        </Section>

        <Section title="10. Children’s Privacy">
          Eco-Source is not directed to children under 13. We do not knowingly
          collect personal information from children. If you believe we have
          done so, please contact us for deletion.
        </Section>

        <Section title="11. Changes to This Policy">
          We will post any changes to this Privacy Policy here and update the
          “Last updated” date. Continued use of the Service after changes
          constitutes acceptance.
        </Section>

        <Section title="12. Contact">
          Questions or concerns? Email&nbsp;
          <a href="mailto:admin@ecosourceco.com" className="underline">
            admin@ecosourceco.com
          </a>
          .
        </Section>
      </div>
    </div>
  );
}

/* — reusable section wrapper — */
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
