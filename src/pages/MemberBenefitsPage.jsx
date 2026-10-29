import {
  useEffect,
  useState
} from 'react';

import {
  ArrowRight,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import {
  Link
} from 'react-router-dom';

import {
  useToast
} from '../context/ToastContext';

import {
  api
} from '../services/api';

import {
  formatDate
} from '../utils/formatters';

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[11px] font-extrabold text-white transition duration-200 hover:bg-[#431318]';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[11px] font-extrabold text-[#431318] transition duration-200 hover:bg-white';

export default function MemberBenefitsPage() {
  const [
    wallet,
    setWallet
  ] =
    useState(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const notify =
    useToast();

  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            api(
              '/profile-boost'
            )
              .then(
                (boostResult) => {
                  setWallet(
                    boostResult.data
                      .wallet
                  );
                }
              )
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
      notify
    ]
  );

  if (
    loading
  ) {
    return (
      <div className="page-skeleton">
        Loading membership
        benefits…
      </div>
    );
  }

  return (
    <>
      <header className="mb-[34px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Membership benefits
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          Put your plan to{' '}

          <em className="font-normal text-[#681d25]">
            work.
          </em>
        </h1>

        <p className="mt-5 max-w-[650px] text-[12px] leading-7 text-[#756a60]">
          Review the benefits
          currently available to your
          account and use them from one
          place.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-5 max-[850px]:grid-cols-1">
        {/* Boost */}

        <article className="relative overflow-hidden border border-[#ddd0c1] bg-[#fffdf8] p-[30px]">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-14 h-44 w-44 rounded-full border border-[#681d2510]"
          />

          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#681d250a] text-[#681d25]">
            <Rocket
              size={
                19
              }
            />
          </span>

          <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
            Visibility
          </p>

          <h2 className="mt-1 font-['Cormorant_Garamond'] text-[36px] font-medium text-[#2c1a18]">
            Profile boost
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="border border-[#eee4d8] p-4">
              <span className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8a7e73]">
                Credits
              </span>

              <strong className="mt-2 block font-['Cormorant_Garamond'] text-[31px] font-medium text-[#681d25]">
                {wallet
                  ?.availableCredits ||
                  0}
              </strong>
            </div>

            <div className="border border-[#eee4d8] p-4">
              <span className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8a7e73]">
                Status
              </span>

              <strong className="mt-2 block text-[11px] font-extrabold text-[#431318]">
                {wallet?.active
                  ? 'Active now'
                  : 'Not active'}
              </strong>
            </div>
          </div>

          <p className="my-5 text-[11px] leading-6 text-[#756a60]">
            {wallet?.active
              ? `Your visibility boost is active until ${formatDate(
                  wallet.activeUntil,
                  undefined,
                  {
                    dateStyle:
                      'medium',

                    timeStyle:
                      'short'
                  }
                )}.`
              : wallet
                    ?.availableCredits >
                  0
                ? 'You have boost credits ready to use whenever you want extra profile visibility.'
                : 'You can receive boosts through eligible memberships or purchase individual boost packs.'}
          </p>

          <Link
            to="/boosts"
            className={
              primaryButtonClass
            }
          >
            Manage boosts

            <ArrowRight
              size={
                14
              }
            />
          </Link>
        </article>

        {/* Live Support & Concierge */}

        <article className="relative overflow-hidden border border-[#ddd0c1] bg-[#fffdf8] p-[30px]">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#681d250a] text-[#681d25]">
            <MessageCircle
              size={19}
            />
          </span>

          <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
            Direct assistance
          </p>

          <h2 className="mt-1 font-['Cormorant_Garamond'] text-[36px] font-medium text-[#2c1a18]">
            Live Concierge Support
          </h2>

          <p className="my-5 text-[11px] leading-6 text-[#756a60]">
            Connect directly with platform administration for personalized guidance on profile verification, Gotra consultation, and priority member support.
          </p>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('ksm:open-live-chat'))}
            className={outlineButtonClass}
          >
            Open Live Concierge
            <ArrowRight size={14} />
          </button>
        </article>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-4 max-[800px]:grid-cols-1">
        <div className="border border-[#ddd0c1] bg-[#f4ece3] p-5">
          <ShieldCheck
            size={
              18
            }
            className="text-[#681d25]"
          />

          <h3 className="mt-4 text-[11px] font-extrabold text-[#431318]">
            Privacy remains protected
          </h3>

          <p className="mt-2 text-[9px] leading-5 text-[#756a60]">
            Membership and boost
            benefits never reveal
            private contact information
            automatically.
          </p>
        </div>

        <div className="border border-[#ddd0c1] bg-[#f4ece3] p-5">
          <Sparkles
            size={
              18
            }
            className="text-[#681d25]"
          />

          <h3 className="mt-4 text-[11px] font-extrabold text-[#431318]">
            Compatibility stays real
          </h3>

          <p className="mt-2 text-[9px] leading-5 text-[#756a60]">
            Boosting improves exposure,
            not your calculated
            matrimonial compatibility.
          </p>
        </div>

        <div className="border border-[#ddd0c1] bg-[#f4ece3] p-5">
          <ShieldCheck
            size={
              18
            }
            className="text-[#681d25]"
          />

          <h3 className="mt-4 text-[11px] font-extrabold text-[#431318]">
            Community rules stay first
          </h3>

          <p className="mt-2 text-[9px] leading-5 text-[#756a60]">
            Same surname, blocking and
            eligibility protections
            cannot be bypassed by a
            boost.
          </p>
        </div>
      </section>
    </>
  );
}