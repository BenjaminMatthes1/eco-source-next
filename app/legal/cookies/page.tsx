// app/legal/cookies/page.tsx
'use client';

export default function CookiePolicy() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="bg-neutral rounded-lg shadow p-8 text-primary">
        <h1 className="text-4xl font-bold mb-6">Cookie&nbsp;Policy</h1>
        <p className="text-sm opacity-70 mb-8 font-redditLight">
          Last updated: 19&nbsp;May&nbsp;2025
        </p>

        <Section title="1. What Are Cookies?">
          Cookies are small text files stored on your device when you visit a
          website. They help the site recognize your browser and remember
          information such as login status or preferences.
        </Section>

        <Section title="2. How Eco-Source Uses Cookies">
          We use three categories of cookies:
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>
              <strong>Essential&nbsp;</strong>— required for core functions
              like secure login and session persistence (<code>eco-session</code>).
            </li>
            <li>
              <strong>Preference&nbsp;</strong>— store interface choices such as
              dark-mode and preferred units (metric/imperial).
            </li>
            <li>
              <strong>Analytics&nbsp;</strong>— anonymous statistics that help
              us understand site usage (e.g., page views). Set <em>only</em> if
              you click “Accept” on our cookie&nbsp;banner.
            </li>
          </ul>
        </Section>

        <Section title="3. Consent &amp; Control">
          When you first visit Eco-Source, a banner asks you to accept or
          decline non-essential cookies. Your choice is stored in
          <code> localStorage&nbsp;(eco_consent)</code> and honored for future
          visits.
          <br />
          You can change your decision anytime:
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>Clear site data in your browser settings, <em>or</em></li>
            <li>
              Click the “Cookie settings” link in the footer (coming soon) to
              re-display the banner.
            </li>
          </ol>
        </Section>

        <Section title="4. Third-Party Cookies">
          We currently set no third-party cookies. If we integrate external
          analytics (e.g., Plausible, Google Analytics) in the future, they will
          load only after you opt in.
        </Section>

        <Section title="5. Managing Cookies in Your Browser">
          Most browsers allow you to:
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Delete specific cookies.</li>
            <li>Block cookies from certain sites.</li>
            <li>Block all cookies (may break site functionality).</li>
          </ul>
          Refer to your browser’s help section for details.
        </Section>

        <Section title="6. Changes to This Policy">
          We may update this Cookie Policy to reflect new technologies or legal
          requirements. Updates will appear on this page with a revised “Last
          updated” date.
        </Section>

        <Section title="7. Contact">
          Questions about our cookie use? Email&nbsp;
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
