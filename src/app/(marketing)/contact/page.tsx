import { env } from "@/lib/env";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "Contact" };
export default function Contact() {
  return (
    <article className="legal-page">
      <span className="section-eyebrow">LET’S CONNECT</span>
      <h1>
        Something on <em>your mind?</em>
      </h1>
      <p>
        Whether you’re working on a campaign, need help with billing, or have an
        idea for the studio, we’d like to hear from you.
      </p>
      <div className="contact-grid">
        <section className="panel">
          <h2>Say hello</h2>
          <p>General questions, feedback, and creative possibilities.</p>
          <a className="text-link" href={`mailto:${env.CONTACT_EMAIL}`}>
            {env.CONTACT_EMAIL}
            <ArrowUpRight size={15} />
          </a>
        </section>
        <section className="panel">
          <h2>Need a hand?</h2>
          <p>
            For billing or generation issues, include your account email and
            generation ID from History. Please do not email passwords or
            payment-card details.
          </p>
          <a
            className="text-link"
            href={`mailto:${env.CONTACT_EMAIL}?subject=Habib%20AI%20Studio%20support`}
          >
            Contact support <ArrowUpRight size={15} />
          </a>
        </section>
      </div>
      <h2>Privacy requests</h2>
      <p>
        For access, correction, deletion, or stored-asset removal, email us with
        the subject “Privacy request.” You can also export campaigns and delete
        your account from Settings.
      </p>
    </article>
  );
}
