import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  const [state, setState] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Account",
    message: ""
  });
  const [status, setStatus] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setStatus(t('publicPages:contact.sending'));
    try {
      await api("/support", { method: "POST", body: JSON.stringify(state) });
      setStatus(t('publicPages:contact.success'));
      setState({
        name: "",
        email: "",
        phone: "",
        category: "Account",
        message: ""
      });
    } catch (error) {
      setStatus(error.message);
    }
  };
  return (
    <div className="public-shell">
      <Header solid />
      <main>
        <section className="public-hero">
          <div className="page-container">
            <p className="eyebrow">{t('publicPages:contact.eyebrow')}</p>
            <h1>{t('publicPages:contact.title')}</h1>
            <p>{t('publicPages:contact.intro')}</p>
          </div>
        </section>
        <section className="contact-section page-container">
          <div>
            <p className="eyebrow">{t('publicPages:contact.desk')}</p>
            <h2>{t('publicPages:contact.formTitle')}</h2>
            <p>{t('publicPages:contact.warning')}</p>
          </div>
          <form onSubmit={submit} className="contact-form">
            <label>
              {t('publicPages:contact.name')}
              <input
                required
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
            </label>
            <label>
              {t('publicPages:contact.email')}
              <input
                required
                type="email"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
              />
            </label>
            <label>
              {t('publicPages:contact.phone')}
              <input
                value={state.phone}
                onChange={(e) => setState({ ...state, phone: e.target.value })}
              />
            </label>
            <label>
              {t('publicPages:contact.category')}
              <select
                value={state.category}
                onChange={(e) =>
                  setState({ ...state, category: e.target.value })
                }
              >
                {t('publicPages:contact.categories', { returnObjects: true }).map((label, index) => (
                  <option value={["Account", "Profile", "Payment", "Safety", "Technical", "Other"][index]} key={label}>{label}</option>
                ))}
              </select>
            </label>
            <label className="full">
              {t('publicPages:contact.message')}
              <textarea
                required
                minLength="10"
                rows="6"
                value={state.message}
                onChange={(e) =>
                  setState({ ...state, message: e.target.value })
                }
              />
            </label>
            <button className="primary-button">{t('publicPages:contact.send')}</button>
            {status && <p role="status">{status}</p>}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
