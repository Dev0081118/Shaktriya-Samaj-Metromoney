import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  ArrowRight,
  Check,
  Clock3,
  Crown,
  Flame,
  Gem,
  Rocket,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap
} from 'lucide-react';

import {
  Link
} from 'react-router-dom';

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
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-transparent bg-[#681d25] px-6 text-[11px] font-extrabold uppercase tracking-[0.06em] text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-45';

const outlineButtonClass =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#cbb8a4] bg-[#fffdf8] px-6 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#431318] transition duration-200 hover:border-[#681d25] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45';

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

const sourceLabel =
  (
    source
  ) => {
    if (
      source ===
      'Subscription'
    ) {
      return 'Membership';
    }

    if (
      source ===
      'BoostPack'
    ) {
      return 'Purchased pack';
    }

    return 'Admin credit';
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

  const subscriptionCredits =
    (
      wallet?.grants ||
      []
    )
      .filter(
        (
          grant
        ) =>
          grant.sourceType ===
          'Subscription'
      )
      .reduce(
        (
          total,
          grant
        ) =>
          total +
          Number(
            grant.creditsRemaining ||
              0
          ),
        0
      );

  const purchasedCredits =
    (
      wallet?.grants ||
      []
    )
      .filter(
        (
          grant
        ) =>
          grant.sourceType ===
          'BoostPack'
      )
      .reduce(
        (
          total,
          grant
        ) =>
          total +
          Number(
            grant.creditsRemaining ||
              0
          ),
        0
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
      },
      [
        applyWallet
      ]
    );

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
              ) =>
                current <=
                0
                  ? 0
                  : current -
                    1
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
          300
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
                  order.providerOrderId,

                prefill: {
                  email:
                    user?.email ||
                    '',

                  contact:
                    user?.phone ||
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
                    event.error
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
          `${pack.credits} boost credits added successfully.`
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
      <div className="page-skeleton">
        Loading profile
        boosts…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] pb-10">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[linear-gradient(125deg,#351012_0%,#681d25_58%,#8b4b43_100%)] px-[clamp(24px,5vw,56px)] py-[clamp(34px,5vw,56px)] text-white">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-[340px] w-[340px] rounded-full border border-white/10"
        />

        <div
          aria-hidden="true"
          className="absolute -right-2 top-8 h-[220px] w-[220px] rounded-full border border-white/10"
        />

        <div className="relative grid grid-cols-[1fr_auto] items-end gap-8 max-[800px]:grid-cols-1">
          <div className="max-w-[720px]">
            <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#e9cdb1]">
              <Sparkles
                size={
                  14
                }
              />

              Profile visibility
            </div>

            <h1 className="mt-4 font-['Cormorant_Garamond'] text-[clamp(48px,7vw,82px)] font-medium leading-[0.88]">
              Be seen at the
              <br />

              <em className="font-normal text-[#f0d6bb]">
                right moment.
              </em>
            </h1>

            <p className="mt-6 max-w-[620px] text-[12px] leading-7 text-white/70">
              Use one boost credit to
              increase your profile
              exposure among eligible
              Rajput matrimonial
              members. Your compatibility
              percentage and community
              safety rules never change.
            </p>
          </div>

          <div className="min-w-[190px] border-l border-white/15 pl-8 max-[800px]:border-l-0 max-[800px]:border-t max-[800px]:pl-0 max-[800px]:pt-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/55">
              Available balance
            </p>

            <strong className="mt-2 block font-['Cormorant_Garamond'] text-[68px] font-medium leading-none">
              {wallet
                ?.availableCredits ||
                0}
            </strong>

            <span className="mt-2 block text-[10px] text-white/60">
              boost credits
            </span>
          </div>
        </div>
      </section>

      {/* Main status */}

      <section className="mt-6 grid grid-cols-[1.35fr_.65fr] gap-5 max-[900px]:grid-cols-1">
        <article className="border border-[#d9cbbb] bg-[#fffdf8] p-[clamp(24px,4vw,40px)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                  boostActive
                    ? 'bg-[#681d25] text-white'
                    : 'bg-[#681d250a] text-[#681d25]'
                }`}
              >
                {boostActive ? (
                  <Flame
                    size={
                      21
                    }
                  />
                ) : (
                  <Rocket
                    size={
                      21
                    }
                  />
                )}
              </span>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#91683f]">
                  Current status
                </p>

                <h2 className="mt-1 font-['Cormorant_Garamond'] text-[38px] font-medium leading-none text-[#2c1a18]">
                  {boostActive
                    ? 'Your boost is live'
                    : 'Ready when you are'}
                </h2>

                <p className="mt-3 max-w-[520px] text-[11px] leading-6 text-[#756a60]">
                  {boostActive
                    ? 'Your profile currently receives increased exposure in eligible discovery and closely matched recommendation results.'
                    : 'Activate a boost when you want additional visibility. One activation consumes one credit.'}
                </p>
              </div>
            </div>
          </div>

          {boostActive && (
            <div className="mt-7 grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
              <div className="border border-[#dfd2c4] bg-[#f8f1e8] p-4">
                <div className="flex items-center gap-2 text-[#681d25]">
                  <Clock3
                    size={
                      16
                    }
                  />

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.1em]">
                    Time remaining
                  </span>
                </div>

                <strong className="mt-3 block font-['Cormorant_Garamond'] text-[31px] font-medium text-[#431318]">
                  {formatRemaining(
                    remainingSeconds
                  )}
                </strong>
              </div>

              <div className="border border-[#dfd2c4] bg-[#f8f1e8] p-4">
                <div className="flex items-center gap-2 text-[#681d25]">
                  <TimerReset
                    size={
                      16
                    }
                  />

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.1em]">
                    Ends at
                  </span>
                </div>

                <strong className="mt-3 block text-[12px] font-extrabold leading-5 text-[#431318]">
                  {wallet
                    ?.activeUntil
                    ? new Date(
                        wallet.activeUntil
                      ).toLocaleString(
                        'en-IN',
                        {
                          dateStyle:
                            'medium',

                          timeStyle:
                            'short'
                        }
                      )
                    : '—'}
                </strong>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={
                primaryButtonClass
              }
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
                  15
                }
              />

              {activating
                ? 'Activating…'
                : boostActive
                  ? 'Boost active'
                  : 'Boost my profile'}
            </button>

            <Link
              to="/discover"
              className={
                outlineButtonClass
              }
            >
              View discovery

              <ArrowRight
                size={
                  14
                }
              />
            </Link>
          </div>

          {!wallet
            ?.availableCredits &&
            !boostActive && (
              <p className="mt-4 text-[10px] leading-5 text-[#8a5b44]">
                You currently have no
                boost credits. Purchase
                a pack below or choose a
                membership that includes
                boosts.
              </p>
            )}
        </article>

        {/* Wallet */}

        <article className="border border-[#d9cbbb] bg-[#f1e7dc] p-[clamp(24px,4vw,34px)]">
          <div className="flex items-center gap-3">
            <Gem
              size={
                20
              }
              className="text-[#681d25]"
            />

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
                Boost wallet
              </p>

              <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium text-[#2c1a18]">
                Your credits
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="flex items-center justify-between border-b border-[#d8c8b8] pb-4">
              <span className="text-[11px] text-[#66574f]">
                Membership credits
              </span>

              <strong className="font-['Cormorant_Garamond'] text-[28px] font-medium text-[#681d25]">
                {
                  subscriptionCredits
                }
              </strong>
            </div>

            <div className="flex items-center justify-between border-b border-[#d8c8b8] pb-4">
              <span className="text-[11px] text-[#66574f]">
                Purchased credits
              </span>

              <strong className="font-['Cormorant_Garamond'] text-[28px] font-medium text-[#681d25]">
                {
                  purchasedCredits
                }
              </strong>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-extrabold text-[#431318]">
                Total available
              </span>

              <strong className="font-['Cormorant_Garamond'] text-[34px] font-medium text-[#431318]">
                {wallet
                  ?.availableCredits ||
                  0}
              </strong>
            </div>
          </div>

          <p className="mt-6 text-[9px] leading-5 text-[#756a60]">
            Membership credits are
            consumed first because they
            expire with the membership.
            Purchased credits are kept
            separately.
          </p>
        </article>
      </section>

      {/* Credit sources */}

      {wallet
        ?.grants
        ?.length >
        0 && (
        <section className="mt-6 border border-[#ddd0c1] bg-[#fffdf8] p-6">
          <div className="mb-5">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
              Credit sources
            </p>

            <h2 className="mt-1 font-['Cormorant_Garamond'] text-[30px] font-medium text-[#2c1a18]">
              Where your boosts came
              from
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
            {wallet.grants.map(
              (
                grant
              ) => (
                <div
                  key={
                    grant.id
                  }
                  className="border border-[#e5d9cd] bg-[#fcf8f2] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#91683f]">
                      {sourceLabel(
                        grant.sourceType
                      )}
                    </span>

                    <strong className="font-['Cormorant_Garamond'] text-[27px] font-medium text-[#681d25]">
                      {
                        grant.creditsRemaining
                      }
                    </strong>
                  </div>

                  <p className="mt-2 text-[10px] text-[#756a60]">
                    {
                      grant.durationHours
                    }
                    h visibility per
                    credit
                  </p>

                  {grant.expiresAt && (
                    <p className="mt-2 text-[9px] text-[#8a7e73]">
                      Expires{' '}
                      {new Date(
                        grant.expiresAt
                      ).toLocaleDateString(
                        'en-IN'
                      )}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Fair exposure */}

      <section className="mt-10 grid grid-cols-[.75fr_1.25fr] overflow-hidden border border-[#d9cbbb] max-[850px]:grid-cols-1">
        <div className="bg-[#431318] p-[clamp(26px,5vw,48px)] text-white">
          <ShieldCheck
            size={
              26
            }
            className="text-[#e2c4a5]"
          />

          <h2 className="mt-5 font-['Cormorant_Garamond'] text-[38px] font-medium leading-none">
            Visibility,
            <br />

            not compatibility.
          </h2>

          <p className="mt-5 text-[11px] leading-6 text-white/65">
            A paid boost never makes an
            incompatible profile look
            like a stronger matrimonial
            match.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-[#ddd0c1] max-[650px]:grid-cols-1">
          {[
            [
              '01',
              'Community rules stay first',
              'Same surname / Shakh exclusions remain absolute even during an active boost.'
            ],

            [
              '02',
              'Compatibility stays genuine',
              'Your percentage is calculated from real preferences and is never increased by payment.'
            ],

            [
              '03',
              'Discovery exposure improves',
              'Eligible active boosted profiles are surfaced ahead of normal profiles in manual discovery.'
            ],

            [
              '04',
              'Recommendations stay relevant',
              'Boost gets priority only among already closely matched candidates.'
            ]
          ].map(
            ([
              number,
              title,
              body
            ]) => (
              <article
                key={
                  number
                }
                className="bg-[#fffdf8] p-6"
              >
                <span className="font-['Cormorant_Garamond'] text-[24px] text-[#b99a7c]">
                  {
                    number
                  }
                </span>

                <h3 className="mt-3 text-[12px] font-extrabold text-[#431318]">
                  {
                    title
                  }
                </h3>

                <p className="mt-2 text-[10px] leading-5 text-[#756a60]">
                  {
                    body
                  }
                </p>
              </article>
            )
          )}
        </div>
      </section>

      {/* Packs */}

      <section className="mt-[58px]">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#91683f]">
              Individual top-up
            </p>

            <h2 className="mt-2 font-['Cormorant_Garamond'] text-[clamp(36px,5vw,50px)] font-medium leading-none text-[#2c1a18]">
              Buy boost credits
              separately.
            </h2>

            <p className="mt-3 max-w-[620px] text-[11px] leading-6 text-[#756a60]">
              You do not need to change
              your membership. Purchase
              only the additional
              visibility credits you
              need.
            </p>
          </div>

          <Crown
            size={
              28
            }
            className="shrink-0 text-[#681d25]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[650px]:grid-cols-1">
          {packs.map(
            (
              pack,
              index
            ) => (
              <article
                key={
                  pack._id
                }
                className={`relative overflow-hidden border bg-[#fffdf8] p-7 ${
                  index ===
                  1
                    ? 'border-[#681d25]'
                    : 'border-[#ddd0c1]'
                }`}
              >
                {index ===
                  1 && (
                  <span className="absolute right-0 top-0 bg-[#681d25] px-3 py-2 text-[8px] font-extrabold uppercase tracking-[0.1em] text-white">
                    Popular
                  </span>
                )}

                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
                  Visibility pack
                </p>

                <h3 className="mt-3 font-['Cormorant_Garamond'] text-[34px] font-medium leading-none text-[#2c1a18]">
                  {
                    pack.name
                  }
                </h3>

                <div className="mt-6 flex items-end gap-2">
                  <strong className="font-['Cormorant_Garamond'] text-[52px] font-medium leading-none text-[#681d25]">
                    {
                      pack.credits
                    }
                  </strong>

                  <span className="mb-1 text-[10px] font-bold text-[#756a60]">
                    boosts
                  </span>
                </div>

                <ul className="mt-6 grid gap-3 border-y border-[#e8ddd2] py-5">
                  <li className="flex items-center gap-2 text-[10px] text-[#66574f]">
                    <Check
                      size={
                        14
                      }
                      className="text-[#681d25]"
                    />

                    {
                      pack.durationHours
                    }{' '}
                    hours per boost
                  </li>

                  <li className="flex items-center gap-2 text-[10px] text-[#66574f]">
                    <Check
                      size={
                        14
                      }
                      className="text-[#681d25]"
                    />

                    Purchased separately
                  </li>

                  <li className="flex items-center gap-2 text-[10px] text-[#66574f]">
                    <Check
                      size={
                        14
                      }
                      className="text-[#681d25]"
                    />

                    Does not alter match
                    score
                  </li>
                </ul>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <strong className="font-['Cormorant_Garamond'] text-[34px] font-medium text-[#2c1a18]">
                    {formatCurrency(
                      pack.price
                    )}
                  </strong>

                  <button
                    type="button"
                    className={
                      primaryButtonClass
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
                      ? 'Opening…'
                      : 'Buy pack'}
                  </button>
                </div>
              </article>
            )
          )}

          {!packs.length && (
            <div className="col-span-full border border-dashed border-[#cbb8a4] bg-[#fffdf8] p-10 text-center">
              <Rocket
                size={
                  25
                }
                className="mx-auto text-[#91683f]"
              />

              <h3 className="mt-4 font-['Cormorant_Garamond'] text-[30px] font-medium text-[#2c1a18]">
                No boost packs
                available
              </h3>

              <p className="mt-2 text-[10px] text-[#756a60]">
                Individual boost packs
                have not been published
                by the administrator
                yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}