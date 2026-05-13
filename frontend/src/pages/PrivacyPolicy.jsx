export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <article className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 prose">
        <h1>Privacy Policy</h1>
        <p><strong>Draft — pending legal review.</strong> Do not deploy this policy as-is.</p>
        <p>This service is a private information-sharing platform for Australian beauty
        businesses. It is operated in accordance with the Australian Privacy Principles (APPs)
        under the Privacy Act 1988 (Cth).</p>
        <h2>What we collect</h2>
        <ul>
          <li>Contact details (phone, email) of consumers — stored as one-way SHA-256 hashes at the network level</li>
          <li>Plain-text contact and name held only by the member salon that uploaded an incident</li>
          <li>Incident metadata: type, date, amount, factual description, evidence files</li>
          <li>Audit logs of all searches</li>
        </ul>
        <h2>How we use it</h2>
        <p>Member salons may search the network at the point of booking, having obtained
        consent from the consumer through their own booking T&Cs. Results returned to a
        searching salon never identify the other salons that have reported a contact.</p>
        <h2>Retention</h2>
        <p>Incidents auto-expire 12 months after creation. Audit logs are retained for 7 years.</p>
        <h2>Your rights</h2>
        <p>You may access, correct, or dispute any entry concerning you via the dispute
        portal at <a href="/dispute">/dispute</a>. Decisions are reviewable within 14 days,
        after which an unanswered dispute results in the entry being withdrawn.</p>
        <h2>Not a credit report</h2>
        <p>This service is not a credit reporting body and does not supply information to
        credit reporting bodies. Entries here do not affect any individual's credit file.</p>
        <h2>Data breach</h2>
        <p>We comply with the Notifiable Data Breaches scheme and will notify affected
        individuals and the OAIC of any eligible data breach.</p>
      </article>
    </div>
  );
}
