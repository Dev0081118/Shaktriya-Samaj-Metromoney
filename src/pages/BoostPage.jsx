import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Clock3,
  Flame,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext';

import {
  useToast
} from '../context/ToastContext';

import {
  api
} from '../services/api';

import {
  formatCurrency
} from '../utils/formatters';

const primaryButtonClass =
  'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-transparent bg-[#681d25] px-6 text-[12px] font-extrabold text-white transition hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-50';

const outlineButtonClass =
  'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#cbb8a4] bg-[#fffdf8] px-6 text-[12px] font-extrabold text-[#431318] transition hover:border-[#681d25] disabled:cursor-not-allowed disabled:opacity-50';

const loadRazorpay =
  () =>
    new Promise(
      (
        resolve,
        reject
      ) => {
        if (
          window.Razorpay
        ) {
          resolve();

          return;
        }

        const existing =
          document.querySelector(
            'script[data-razorpay-checkout]'
          );

        if (
          existing
        ) {
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

const formatRemaining =
  (
    seconds
  ) => {
    const total =
      Math.max(
        0,
        Number(
          seconds ||
            0
        )
      );

    const hours =
      Math.floor(
        total /
          3600
      );

    const minutes =
      Math.floor(
        (
          total %
          3600
        ) /
          60
      );

    const secondsPart =
      total %
      60;

    if (
      hours >
      0
    ) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m ${secondsPart}s`;
  };

export default function BoostPage() {
  const [
    wallet,
    setWallet
  ] =
    useState(null);

  const [
    packs,
    setPacks
  ] =
    useState([]);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    activating,
    setActivating
  ] =
    useState(false);

  const [
    buying,
    setBuying
  ] =
    useState('');

  const [
    remainingSeconds,
    setRemainingSeconds
  ] =
    useState(0);

  const notify =
    useToast();

  const {
    user
  } =
    useAuth();

  const boostActive =
    Boolean(
      wallet?.active
    );

  const applyWallet =
    useCallback(
      (
        nextWallet
      ) => {
        setWallet(
          nextWallet
        );

        setRemainingSeconds(
          Math.max(
            0,
            Number(
              nextWallet
                ?.remainingSeconds ||
                0
            )
          )
        );
      },
      []
    );

  const load =
    useCallback(
      async () => {
        const result =
          await api(
            '/profile-boost'
          );

        applyWallet(
          result.data
            .wallet
        );

        setPacks(
          result.data
            .packs ||
            []
        );

        return result;
      },
      [
        applyWallet
      ]
    );

  /*
   * Initial wallet / pack load.
   *
   * API request is scheduled after mount so state
   * updates do not happen synchronously inside the
   * effect body.
   */
  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            load()
              .catch(
                (
                  error
                ) =>
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
          },
          0
        );

      return () =>
        window.clearTimeout(
          timer
        );
    },
    [
      load,
      notify
    ]
  );

  /*
   * Visible boost countdown.
   *
   * The server remains the source of truth for the
   * actual boost expiry. This timer is only for UI.
   */
  useEffect(
    () => {
      if (
        !boostActive
      ) {
        return undefined;
      }

      const timer =
        window.setInterval(
          () => {
            setRemainingSeconds(
              (
                current
              ) => {
                if (
                  current <=
                  0
                ) {
                  return 0;
                }

                return (
                  current -
                  1
                );
              }
            );
          },
          1000
        );

      return () =>
        window.clearInterval(
          timer
        );
    },
    [
      boostActive
    ]
  );

  /*
   * Once the local timer reaches zero, refresh the
   * wallet once so the backend can confirm the boost
   * has expired.
   */
  useEffect(
    () => {
      if (
        !boostActive ||
        remainingSeconds !==
          0
      ) {
        return undefined;
      }

      const timer =
        window.setTimeout(
          () => {
            load().catch(
              (
                error
              ) =>
                notify(
                  error.message,
                  'error'
                )
            );
          },
          250
        );

      return () =>
        window.clearTimeout(
          timer
        );
    },
    [
      boostActive,
      load,
      notify,
      remainingSeconds
    ]
  );

  const activate =
    async () => {
      setActivating(
        true
      );

      try {
        const result =
          await api(
            '/profile-boost',
            {
              method:
                'POST'
            }
          );

        applyWallet(
          result.data
            .wallet
        );

        notify(
          'Your profile boost is now active.'
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setActivating(
          false
        );
      }
    };

  const buy =
    async (
      pack
    ) => {
      setBuying(
        pack.slug
      );

      try {
        const result =
          await api(
            `/boost-packs/${pack.slug}/order`,
            {
              method:
                'POST'
            }
          );

        const order =
          result.data
            .order;

        if (
          order.provider !==
            'razorpay'
        ) {
          throw new Error(
            order.notice ||
              'Live payments are not configured.'
          );
        }

        await loadRazorpay();

        await new Promise(
          (
            resolve,
            reject
          ) => {
            const checkout =
              new window.Razorpay({
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
                  `${order.name} · ${order.credits} boosts`,

                order_id:
                  order
                    .providerOrderId,

                prefill: {
                  email:
                    user
                      ?.email ||
                    '',

                  contact:
                    user
                      ?.phone ||
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
                        '/boost-packs/verify',
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
              });

            checkout.on(
              'payment.failed',
              (
                event
              ) =>
                reject(
                  new Error(
                    event
                      .error
                      ?.description ||
                      'Payment was not completed.'
                  )
                )
            );

            checkout.open();
          }
        );

        await load();

        notify(
          `${pack.credits} boost credits added to your account.`
        );
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setBuying(
          ''
        );
      }
    };

  if (
    loading
  ) {
    return (
      <div className="py-20 text-center text-sm text-[#756a60]">
        Loading profile
        boosts…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <header className="mb-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Visibility
        </p>

        <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(42px,5vw,64px)] font-medium leading-none text-[#2c1a18]">
          Profile Boost
        </h1>

        <p className="mt-4 max-w-[700px] text-[13px] leading-7 text-[#756a60]">
          Move your profile higher
          in eligible discovery
          results for a limited
          time. Boosting never
          changes your compatibility
          score or bypasses community
          matching rules.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[clamp(24px,4vw,42px)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#681d2510] text-[#681d25]">
                {boostActive ? (
                  <Flame
                    size={
                      22
                    }
                  />
                ) : (
                  <Rocket
                    size={
                      22
                    }
                  />
                )}
              </span>

              <h2 className="mt-5 font-['Cormorant_Garamond'] text-[34px] font-medium text-[#2c1a18]">
                {boostActive
                  ? 'Boost Active'
                  : 'Ready to Boost'}
              </h2>

              <p className="mt-2 text-[12px] leading-6 text-[#756a60]">
                {boostActive
                  ? 'Your profile currently has increased visibility.'
                  : 'Use one available credit whenever you want extra visibility.'}
              </p>
            </div>

            <div className="min-w-[150px] border-l border-[#ddd0c1] pl-6">
              <strong className="block font-['Cormorant_Garamond'] text-[46px] font-medium leading-none text-[#681d25]">
                {wallet
                  ?.availableCredits ||
                  0}
              </strong>

              <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-[#756a60]">
                Boost credits
              </span>
            </div>
          </div>

          {boostActive && (
            <div className="mt-8 flex items-center gap-3 border border-[#cbb8a4] bg-[#f8f1e8] p-4">
              <Clock3
                size={
                  18
                }
                className="text-[#681d25]"
              />

              <div>
                <strong className="block text-[13px] text-[#431318]">
                  {formatRemaining(
                    remainingSeconds
                  )}{' '}
                  remaining
                </strong>

                {wallet
                  ?.activeUntil && (
                  <small className="text-[10px] text-[#756a60]">
                    Ends{' '}
                    {new Date(
                      wallet.activeUntil
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </small>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            className={`${primaryButtonClass} mt-8`}
            disabled={
              activating ||
              boostActive ||
              !wallet
                ?.availableCredits
            }
            onClick={
              activate
            }
          >
            <Zap
              size={
                16
              }
            />

            {activating
              ? 'Activating…'
              : boostActive
                ? 'Boost currently active'
                : 'Boost my profile'}
          </button>

          {!wallet
            ?.availableCredits &&
            !boostActive && (
              <p className="mt-3 text-[10px] text-[#8a5b44]">
                You currently have no
                boost credits. Purchase
                a pack below or choose a
                membership that includes
                boosts.
              </p>
            )}
        </article>

        <article className="border border-[#ddd0c1] bg-[#431318] p-[clamp(24px,4vw,38px)] text-white">
          <ShieldCheck
            size={
              25
            }
            className="text-[#d5b28c]"
          />

          <h2 className="mt-5 font-['Cormorant_Garamond'] text-[32px] font-medium">
            Fair visibility
          </h2>

          <div className="mt-5 grid gap-4 text-[11px] leading-6 text-white/70">
            <p>
              Same surname / Shakh
              exclusions always remain
              active.
            </p>

            <p>
              Blocked, paused or
              otherwise ineligible
              profiles remain excluded.
            </p>

            <p>
              Compatibility percentages
              are never increased by a
              paid boost.
            </p>

            <p>
              A boost only increases
              exposure among profiles
              that are already eligible
              to see you.
            </p>
          </div>
        </article>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#91683f]">
              Top up
            </p>

            <h2 className="mt-2 font-['Cormorant_Garamond'] text-[38px] font-medium text-[#2c1a18]">
              Buy Boost Credits
            </h2>
          </div>

          <Sparkles className="text-[#681d25]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packs.map(
            (
              pack
            ) => (
              <article
                key={
                  pack._id
                }
                className="border border-[#ddd0c1] bg-[#fffdf8] p-7"
              >
                <h3 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
                  {
                    pack.name
                  }
                </h3>

                <strong className="mt-4 block text-[26px] text-[#681d25]">
                  {
                    pack.credits
                  }{' '}
                  boosts
                </strong>

                <p className="mt-2 text-[11px] text-[#756a60]">
                  Each boost stays
                  active for{' '}
                  {
                    pack.durationHours
                  }{' '}
                  hours.
                </p>

                <p className="my-6 font-['Cormorant_Garamond'] text-[32px] font-medium">
                  {formatCurrency(
                    pack.price
                  )}
                </p>

                <button
                  type="button"
                  className={
                    outlineButtonClass
                  }
                  disabled={
                    buying ===
                    pack.slug
                  }
                  onClick={() =>
                    buy(
                      pack
                    )
                  }
                >
                  {buying ===
                  pack.slug
                    ? 'Opening checkout…'
                    : 'Buy boost pack'}
                </button>
              </article>
            )
          )}

          {!packs.length && (
            <div className="col-span-full border border-dashed border-[#cbb8a4] p-8 text-center text-[12px] text-[#756a60]">
              No individual boost packs
              are available right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}