import {
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";

import { Link } from "react-router-dom";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { useGsapReveal } from "../motion/useGsapReveal";

const LEGAL_PAGES = [
  "privacy",
  "terms",
  "refunds"
];

export default function PublicInfoPage({
  type
}) {
  const { t } = useTranslation();

  const root = useRef(null);

  useGsapReveal(
    root,
    "[data-reveal]",
    [type]
  );

  const page = t(
    `publicPages:${type}`,
    {
      returnObjects: true
    }
  );

  const isLegal =
    LEGAL_PAGES.includes(type);

  return (
    <div
      ref={root}
      className={`public-shell public-shell-${type}`}
    >
      <Header solid />

      <main>
        {/* HERO */}

        <section
          className={`public-hero public-hero-${type}`}
        >
          <div
            data-reveal
            className="page-container"
          >
            <p className="eyebrow">
              {page.eyebrow}
            </p>

            <h1>
              {page.title}
            </h1>

            <p>
              {page.intro}
            </p>

            {isLegal && (
              <div className="document-meta">
                <span>
                  {t(
                    "redesign:public.document"
                  )}
                </span>

                <span>
                  {t(
                    "redesign:public.effective"
                  )}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* CONTENT */}

        <section
          className={`public-content public-content-${type} page-container`}
        >
          {isLegal && (
            <div className="legal-draft-notice">
              <strong>
                {t(
                  "publicPages:legal.title"
                )}
              </strong>

              <p>
                {t(
                  "publicPages:legal.body"
                )}
              </p>
            </div>
          )}

          {page.sections && (
            <div className="editorial-grid">
              {page.sections.map(
                (
                  [
                    title,
                    body
                  ],
                  index
                ) => (
                  <article
                    data-reveal
                    key={title}
                  >
                    {index % 3 === 0 ? (
                      <ShieldCheck />
                    ) : index % 3 === 1 ? (
                      <HeartHandshake />
                    ) : (
                      <LockKeyhole />
                    )}

                    <h2>
                      {title}
                    </h2>

                    <p>
                      {body}
                    </p>
                  </article>
                )
              )}
            </div>
          )}

          {!isLegal && (
            <div className="public-cta">
              <div>
                <p className="eyebrow">
                  {t(
                    "publicPages:cta.eyebrow"
                  )}
                </p>

                <h2>
                  {t(
                    "publicPages:cta.title"
                  )}
                </h2>
              </div>

              <Link
                className="primary-button"
                to="/register"
              >
                {t(
                  "publicPages:cta.action"
                )}

                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}