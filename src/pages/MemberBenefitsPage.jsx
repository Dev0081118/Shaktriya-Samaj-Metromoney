import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

/* eslint-disable react-hooks/exhaustive-deps */

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white';

export default function MemberBenefitsPage() {
  const [boost, setBoost] = useState(null);
  const [manager, setManager] = useState(null);
  const [entitlements, setEntitlements] = useState(null);

  const notify = useToast();

  const load = () =>
    Promise.all([
      api('/profile-boost'),
      api('/relationship-manager'),
      api('/entitlements')
    ]).then(
      ([
        boostResult,
        managerResult,
        entitlementResult
      ]) => {
        setBoost(boostResult.data);
        setManager(managerResult.data);
        setEntitlements(
          entitlementResult.data.entitlements
        );
      }
    );

  useEffect(() => {
    load().catch((error) =>
      notify(error.message, 'error')
    );
  }, []);

  const activate = async () => {
    try {
      await api('/profile-boost', {
        method: 'POST'
      });

      await load();

      notify(
        'Your profile boost is active for 24 hours.'
      );
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  if (
    !boost ||
    !manager ||
    !entitlements
  ) {
    return (
      <div className="page-skeleton">
        Loading membership benefits…
      </div>
    );
  }

  return (
    <>
      <header className="mb-[30px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Membership benefits
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          Put your plan to{' '}
          <em className="font-normal text-[#681d25]">
            work.
          </em>
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 max-[767px]:grid-cols-1">
        <article className="relative border border-[#ddd0c1] bg-[#fffdf8] p-[30px]">
          <h2 className="font-['Cormorant_Garamond'] text-[34px] font-medium">
            Profile boost
          </h2>

          <p className="my-5 text-[12px] leading-[1.8] text-[#756a60]">
            {entitlements.profileBoost
              ? boost.active
                ? `Active until ${formatDate(
                    boost.activeUntil,
                    undefined,
                    {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }
                  )}`
                : boost.nextEligibleAt &&
                    new Date(
                      boost.nextEligibleAt
                    ) > new Date()
                  ? `Available again ${formatDate(
                      boost.nextEligibleAt
                    )}`
                  : 'Move higher in discovery for 24 hours.'
              : 'Included with Premium and Assisted membership.'}
          </p>

          {entitlements.profileBoost ? (
            <button
              disabled={
                boost.active ||
                (boost.nextEligibleAt &&
                  new Date(
                    boost.nextEligibleAt
                  ) > new Date())
              }
              onClick={activate}
              className={primaryButtonClass}
            >
              {boost.active
                ? 'Boost active'
                : 'Activate boost'}
            </button>
          ) : (
            <Link
              to="/membership"
              className={outlineButtonClass}
            >
              View plans
            </Link>
          )}
        </article>

        <article className="relative border border-[#ddd0c1] bg-[#fffdf8] p-[30px]">
          <h2 className="font-['Cormorant_Garamond'] text-[34px] font-medium">
            Relationship manager
          </h2>

          {manager.included ? (
            manager.assignment ? (
              <>
                <p className="my-5 text-[12px] leading-[1.8] text-[#756a60]">
                  Your assigned relationship
                  manager:
                </p>

                <strong className="block">
                  {
                    manager.assignment
                      .manager?.email
                  }
                </strong>

                {manager.assignment.manager
                  ?.phone && (
                  <a
                    href={`tel:${manager.assignment.manager.phone}`}
                    className="mt-3 inline-block text-[12px] font-extrabold text-[#681d25]"
                  >
                    {
                      manager.assignment
                        .manager.phone
                    }
                  </a>
                )}
              </>
            ) : (
              <p className="my-5 text-[12px] leading-[1.8] text-[#756a60]">
                Your Assisted benefit is
                active. The team will assign
                your relationship manager
                shortly.
              </p>
            )
          ) : (
            <>
              <p className="my-5 text-[12px] leading-[1.8] text-[#756a60]">
                Personal relationship-manager
                guidance is included with
                Assisted membership.
              </p>

              <Link
                to="/membership"
                className={outlineButtonClass}
              >
                View Assisted
              </Link>
            </>
          )}
        </article>
      </div>
    </>
  );
}