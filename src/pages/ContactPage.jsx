import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { api } from '../services/api';

const labelClass =
  "grid gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const fieldClass =
  "border border-[#ddd0c1] bg-white p-[14px] tracking-normal normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]";

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]";

export default function ContactPage() {
  const { t } = useTranslation();

  const [state, setState] =
    useState({
      name: '',
      email: '',
      phone: '',
      category: 'Account',
      message: ''
    });

  const [status, setStatus] =
    useState('');

  const submit = async (event) => {
    event.preventDefault();

    setStatus(
      t(
        'publicPages:contact.sending'
      )
    );

    try {
      await api('/support', {
        method: 'POST',
        body: JSON.stringify(state)
      });

      setStatus(
        t(
          'publicPages:contact.success'
        )
      );

      setState({
        name: '',
        email: '',
        phone: '',
        category: 'Account',
        message: ''
      });
    } catch (error) {
      setStatus(error.message);
    }
  };

  const categories = t(
    'publicPages:contact.categories',
    {
      returnObjects: true
    }
  );

  const categoryValues = [
    'Account',
    'Profile',
    'Payment',
    'Safety',
    'Technical',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Header solid />

      <main>
        <section className="border-b border-[#ddd0c1] bg-[linear-gradient(135deg,#f1e5d6,#fffdf8)] pb-[90px] pt-[110px] max-[767px]:pb-[60px] max-[767px]:pt-[75px]">
          <div className="page-container">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              {t(
                'publicPages:contact.eyebrow'
              )}
            </p>

            <h1 className="mt-[18px] max-w-[920px] font-['Cormorant_Garamond'] text-[clamp(52px,7vw,92px)] font-medium leading-[0.94] tracking-[-0.03em] text-[#431318]">
              {t(
                'publicPages:contact.title'
              )}
            </h1>

            <p className="mt-[27px] max-w-[700px] text-[15px] leading-[1.9] text-[#756a60]">
              {t(
                'publicPages:contact.intro'
              )}
            </p>
          </div>
        </section>

        <section className="page-container grid grid-cols-[0.8fr_1.2fr] gap-20 py-[85px] max-[767px]:grid-cols-1 max-[767px]:gap-[35px] max-[767px]:py-[55px]">
          <div className="min-h-[520px] bg-[linear-gradient(0deg,rgba(39,14,17,.86),rgba(54,26,22,.18)),url('/assets/public/contact-support.webp')] bg-cover bg-center p-[42px] text-white max-[767px]:min-h-[400px] max-[767px]:p-[30px]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#e2bd88]">
              {t(
                'publicPages:contact.desk'
              )}
            </p>

            <h2 className="mt-6 font-['Cormorant_Garamond'] text-[35px] font-medium leading-[1.05]">
              {t(
                'publicPages:contact.formTitle'
              )}
            </h2>

            <p className="mt-4 text-[13px] leading-[1.9] text-[#ffffffbd]">
              {t(
                'publicPages:contact.warning'
              )}
            </p>
          </div>

          <form
            onSubmit={submit}
            className="grid grid-cols-2 gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[38px] max-[767px]:grid-cols-1 max-[767px]:p-[25px]"
          >
            <label className={labelClass}>
              {t(
                'publicPages:contact.name'
              )}

              <input
                required
                className={fieldClass}
                value={state.name}
                onChange={(event) =>
                  setState({
                    ...state,
                    name:
                      event.target.value
                  })
                }
              />
            </label>

            <label className={labelClass}>
              {t(
                'publicPages:contact.email'
              )}

              <input
                required
                type="email"
                className={fieldClass}
                value={state.email}
                onChange={(event) =>
                  setState({
                    ...state,
                    email:
                      event.target.value
                  })
                }
              />
            </label>

            <label className={labelClass}>
              {t(
                'publicPages:contact.phone'
              )}

              <input
                className={fieldClass}
                value={state.phone}
                onChange={(event) =>
                  setState({
                    ...state,
                    phone:
                      event.target.value
                  })
                }
              />
            </label>

            <label className={labelClass}>
              {t(
                'publicPages:contact.category'
              )}

              <select
                className={fieldClass}
                value={
                  state.category
                }
                onChange={(event) =>
                  setState({
                    ...state,
                    category:
                      event.target.value
                  })
                }
              >
                {categories.map(
                  (label, index) => (
                    <option
                      value={
                        categoryValues[
                          index
                        ]
                      }
                      key={label}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className={`${labelClass} col-span-full max-[767px]:col-span-1`}>
              {t(
                'publicPages:contact.message'
              )}

              <textarea
                required
                minLength="10"
                rows="6"
                className={fieldClass}
                value={state.message}
                onChange={(event) =>
                  setState({
                    ...state,
                    message:
                      event.target.value
                  })
                }
              />
            </label>

            <button
              className={
                primaryButtonClass
              }
            >
              {t(
                'publicPages:contact.send'
              )}
            </button>

            {status && (
              <p
                role="status"
                className="col-span-full text-[12px] text-[#681d25] max-[767px]:col-span-1"
              >
                {status}
              </p>
            )}
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}