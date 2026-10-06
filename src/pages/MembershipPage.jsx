import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

/* eslint-disable react-hooks/set-state-in-effect */

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:opacity-55';

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing =
      document.querySelector(
        'script[data-razorpay-checkout]'
      );

    if (existing) {
      existing.addEventListener(
        'load',
        resolve,
        { once: true }
      );

      existing.addEventListener(
        'error',
        reject,
        { once: true }
      );

      return;
    }

    const script =
      document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.dataset.razorpayCheckout =
      'true';

    script.onload = resolve;

    script.onerror = () =>
      reject(
        new Error(
          'Secure checkout could not be loaded.'
        )
      );

    document.head.appendChild(script);
  });

export default function MembershipPage({
  publicView = false
}) {
  const [plans, setPlans] =
    useState([]);

  const [
    subscription,
    setSubscription
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [paying, setPaying] =
    useState('');

  const notify = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    t,
    i18n
  } = useTranslation();

  const refresh = useCallback(
    async () => {
      const requests = [
        api('/public/plans')
      ];

      if (user) {
        requests.push(
          api('/subscription/me')
        );
      }

      const [
        planResult,
        subscriptionResult
      ] = await Promise.all(
        requests
      );

      setPlans(
        planResult.data.plans || []
      );

      if (subscriptionResult) {
        setSubscription(
          subscriptionResult.data
        );
      }
    },
    [user]
  );

  useEffect(() => {
    refresh()
      .catch((error) =>
        notify(
          error.message,
          'error'
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, [
    refresh,
    notify
  ]);

  const choose = async (plan) => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (!plan.price) {
      notify(
        'Free access is already included with your account.'
      );

      return;
    }

    setPaying(plan.slug);

    try {
      const result = await api(
        '/payments/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            planSlug: plan.slug
          })
        }
      );

      const order =
        result.data.order;

      if (
        order.provider !==
        'razorpay'
      ) {
        throw new Error(
          order.notice ||
            'Live payments are not configured in this environment.'
        );
      }

      await loadRazorpay();

      await new Promise(
        (resolve, reject) => {
          const checkout =
            new window.Razorpay({
              key: order.keyId,

              amount: Math.round(
                order.amount * 100
              ),

              currency:
                order.currency,

              name:
                'Kshatriya Matrimonial Society',

              description:
                `${order.name} membership`,

              order_id:
                order.providerOrderId,

              prefill: {
                email:
                  user.email || '',
                contact:
                  user.phone || ''
              },

              theme: {
                color: '#681D25'
              },

              handler:
                async (response) => {
                  try {
                    await api(
                      '/payments/verify',
                      {
                        method:
                          'POST',

                        body:
                          JSON.stringify(
                            response
                          )
                      }
                    );

                    resolve();
                  } catch (error) {
                    reject(error);
                  }
                },

              modal: {
                ondismiss: () =>
                  reject(
                    new Error(
                      'Payment checkout was closed before completion.'
                    )
                  )
              }
            });

          checkout.on(
            'payment.failed',
            (event) => {
              reject(
                new Error(
                  event.error
                    ?.description ||
                    'Payment was not completed.'
                )
              );
            }
          );

          checkout.open();
        }
      );

      await refresh();

      window.dispatchEvent(
        new Event(
          'ksm:entitlements-updated'
        )
      );

      notify(
        'Payment verified. Your membership is now active.'
      );
    } catch (error) {
      notify(
        error.message,
        'error'
      );
    } finally {
      setPaying('');
    }
  };

  const content = loading ? (
    <div className="page-skeleton">
      {t('membership.loading')}
    </div>
  ) : (
    <>
      <header className="mx-auto mb-[54px] max-w-[800px] text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          {t('membership.title')}
        </p>

        <h1 className="mb-5 mt-3 font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          {t(
            'membership.heading'
          )}
        </h1>

        <p className="mx-auto mb-3 mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          {t(
            'membership.body'
          )}
        </p>

        {subscription && (
          <p className="inline-block rounded-[99px] border border-[#7c2d3533] px-4 py-[0.6rem]">
            <strong>
              {
                subscription
                  .plan.name
              }
            </strong>

            {' · '}

            {subscription.status}

            {subscription.endsAt &&
              ` · ${t(
                'membership.daysRemaining',
                {
                  count:
                    subscription.daysRemaining
                }
              )}`}
          </p>
        )}
      </header>

      <div className="mx-auto grid max-w-[760px] grid-cols-1 gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const current =
            subscription?.plan?.slug ===
            plan.slug;

          const featured =
            plan.slug ===
            'assisted';

          return (
            <article
              key={plan.slug}
              className={`relative border bg-[#fffdf8] p-[30px] ${
                featured
                  ? 'border-[#681d25] sm:-translate-y-[10px]'
                  : 'border-[#ddd0c1]'
              }`}
            >
              {featured && (
                <span className="absolute right-0 top-0 bg-[#681d25] px-[10px] py-[7px] text-[8px] uppercase text-white">
                  {t(
                    'membership.mostConsidered'
                  )}
                </span>
              )}

              <h2 className="font-['Cormorant_Garamond'] text-[34px] font-medium">
                {plan.name}
              </h2>

              <div className="my-5 font-['Cormorant_Garamond'] text-[32px] font-medium">
                {formatCurrency(
                  plan.price,
                  i18n.language
                )}

                <small className="font-['Manrope'] text-[10px] font-normal text-[#756a60]">
                  {' '}
                  /{' '}
                  {
                    plan.durationDays
                  }{' '}
                  {t(
                    'membership.days'
                  )}
                </small>
              </div>

              <ul className="grid min-h-[170px] content-start gap-[13px]">
                {Object.entries(
                  plan.features || {}
                )
                  .filter(
                    ([
                      ,
                      value
                    ]) =>
                      value !== false &&
                      value !== 0
                  )
                  .map(
                    ([
                      key,
                      value
                    ]) => (
                      <li
                        key={key}
                        className="flex gap-[9px] text-[11px] text-[#756a60]"
                      >
                        <Check
                          size={15}
                          className="shrink-0 text-[#681d25]"
                        />

                        <span>
                          {t(
                            `membership.features.${key}`,
                            {
                              defaultValue:
                                key
                            }
                          )}

                          {typeof value ===
                          'number'
                            ? `: ${value}`
                            : ''}
                        </span>
                      </li>
                    )
                  )}
              </ul>

              <button
                disabled={
                  current ||
                  paying === plan.slug
                }
                onClick={() =>
                  choose(plan)
                }
                className={
                  featured
                    ? primaryButtonClass
                    : outlineButtonClass
                }
              >
                {current
                  ? t(
                      'membership.currentPlan'
                    )
                  : paying ===
                      plan.slug
                    ? t(
                        'membership.opening'
                      )
                    : !user
                      ? t(
                          'actions.createProfile'
                        )
                      : t(
                          'membership.choosePlan'
                        )}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );

  if (!publicView) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Header solid />

      <main className="page-container relative py-[85px] pt-[300px] max-[767px]:py-[55px] max-[767px]:pt-[220px]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[65px] h-[210px] bg-[linear-gradient(90deg,rgba(36,14,16,.9),rgba(36,14,16,.15)),url('/assets/public/membership-lounge.webp')] bg-cover bg-[position:center_60%] max-[767px]:top-[35px] max-[767px]:h-[165px]"
        />

        <div className="relative">
          {content}
        </div>
      </main>

      <Footer />
    </div>
  );
}