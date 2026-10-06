import { Check } from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useTranslation
} from 'react-i18next';

import { api } from '../services/api';

import {
  useToast
} from '../context/ToastContext';

import {
  useAuth
} from '../context/AuthContext';

import Header from '../components/Header';
import Footer from '../components/Footer';

import {
  formatCurrency
} from '../utils/formatters';

/* eslint-disable react-hooks/set-state-in-effect */

const loadRazorpay = () =>
  new Promise(
    (resolve, reject) => {
      if (window.Razorpay) {
        return resolve();
      }

      const existing =
        document.querySelector(
          'script[data-razorpay-checkout]'
        );

      if (existing) {
        existing.addEventListener(
          'load',
          resolve,
          {
            once:
              true
          }
        );

        existing.addEventListener(
          'error',
          reject,
          {
            once:
              true
          }
        );

        return;
      }

      const script =
        document.createElement(
          'script'
        );

      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';

      script.async =
        true;

      script.dataset.razorpayCheckout =
        'true';

      script.onload =
        resolve;

      script.onerror =
        () =>
          reject(
            new Error(
              'Secure checkout could not be loaded.'
            )
          );

      document.head.appendChild(
        script
      );
    }
  );

export default function MembershipPage({
  publicView = false
}) {
  const [
    plans,
    setPlans
  ] =
    useState([]);

  const [
    subscription,
    setSubscription
  ] =
    useState(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    paying,
    setPaying
  ] =
    useState('');

  const notify =
    useToast();

  const navigate =
    useNavigate();

  const {
    user
  } =
    useAuth();

  const {
    t,
    i18n
  } =
    useTranslation();

  const refresh =
    useCallback(
      async () => {
        const requests = [
          api(
            '/public/plans'
          )
        ];

        if (user) {
          requests.push(
            api(
              '/subscription/me'
            )
          );
        }

        const [
          planResult,
          subscriptionResult
        ] =
          await Promise.all(
            requests
          );

        setPlans(
          planResult.data.plans
        );

        if (
          subscriptionResult
        ) {
          setSubscription(
            subscriptionResult.data
          );
        }
      },
      [user]
    );

  useEffect(() => {
    refresh()
      .catch(
        (error) =>
          notify(
            error.message,
            'error'
          )
      )
      .finally(
        () =>
          setLoading(
            false
          )
      );
  }, [
    refresh,
    notify
  ]);

  const choose =
    async (plan) => {
      if (!user) {
        return navigate(
          '/register'
        );
      }

      if (!plan.price) {
        return notify(
          'Free access is already included with your account.'
        );
      }

      setPaying(
        plan.slug
      );

      try {
        const result =
          await api(
            '/payments/orders',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  planSlug:
                    plan.slug
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
          (
            resolve,
            reject
          ) => {
            const checkout =
              new window.Razorpay(
                {
                  key:
                    order.keyId,

                  amount:
                    Math.round(
                      order.amount *
                        100
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
                      user.email ||
                      '',

                    contact:
                      user.phone ||
                      ''
                  },

                  theme: {
                    color:
                      '#681D25'
                  },

                  handler:
                    async (
                      response
                    ) => {
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
                      } catch (
                        error
                      ) {
                        reject(
                          error
                        );
                      }
                    },

                  modal: {
                    ondismiss:
                      () =>
                        reject(
                          new Error(
                            'Payment checkout was closed before completion.'
                          )
                        )
                  }
                }
              );

            checkout.on(
              'payment.failed',
              (event) =>
                reject(
                  new Error(
                    event.error
                      ?.description ||
                      'Payment was not completed.'
                  )
                )
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

  const content =
    loading ? (
      <div className="page-skeleton">
        {t(
          'membership.loading'
        )}
      </div>
    ) : (
      <>
        <header className="page-heading centered">
          <p className="eyebrow">
            {t(
              'membership.title'
            )}
          </p>

          <h1 className="mb-5">
            {t(
              'membership.heading'
            )}
          </h1>

          <p className="mb-3">
            {t(
              'membership.body'
            )}
          </p>

          {subscription && (
            <p className="membership-status">
              <strong>
                {
                  subscription
                    .plan
                    .name
                }
              </strong>

              {' · '}

              {
                subscription.status
              }

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

        <div className="plans-grid ">
          {plans.map(
            (plan) => {
              const current =
                subscription
                  ?.plan
                  ?.slug ===
                plan.slug;

              return (
                <article
                  key={
                    plan.slug
                  }
                  className={
                    plan.slug ===
                    'assisted'
                      ? 'featured'
                      : ''
                  }
                >
                  {plan.slug ===
                    'assisted' && (
                    <span className="plan-label">
                      {t(
                        'membership.mostConsidered'
                      )}
                    </span>
                  )}

                  <h2>
                    {
                      plan.name
                    }
                  </h2>

                  <div className="plan-price">
                    {formatCurrency(
                      plan.price,
                      i18n.language
                    )}

                    <small>
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

                  <ul>
                    {Object.entries(
                      plan.features ||
                        {}
                    )
                      .filter(
                        ([
                          ,
                          value
                        ]) =>
                          value !==
                            false &&
                          value !==
                            0
                      )
                      .map(
                        ([
                          key,
                          value
                        ]) => (
                          <li
                            key={
                              key
                            }
                          >
                            <Check
                              size={
                                15
                              }
                            />

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
                          </li>
                        )
                      )}
                  </ul>

                  <button
                    disabled={
                      current ||
                      paying ===
                        plan.slug
                    }
                    onClick={() =>
                      choose(
                        plan
                      )
                    }
                    className={ 
                      plan.slug ===
                      'assisted'
                        ? 'primary-button'
                        : 'outline-button'
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
            }
          )}
        </div>

        <p className="payment-note">
          Payments activate
          only after
          server-side
          signature
          verification.
          Closing or failing
          checkout will not
          activate your
          membership.
        </p>
      </>
    );

  if (!publicView) {
    return content;
  }

  return (
    <div className="public-shell membership-public">
      <Header solid />

      <main className="page-container public-membership">
        {content}
      </main>

      <Footer />
    </div>
  );
}