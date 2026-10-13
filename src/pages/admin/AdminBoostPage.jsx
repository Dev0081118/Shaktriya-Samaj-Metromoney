import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Zap
} from 'lucide-react';

import AdminNav from '../../components/AdminNav';

import {
  useToast
} from '../../context/ToastContext';

import {
  api
} from '../../services/api';

import {
  formatCurrency
} from '../../utils/formatters';

const inputClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-4 py-3 text-[13px] outline-none focus:border-[#681d25]';

const labelClass =
  'grid gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const primaryButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#681d25] px-5 text-[11px] font-extrabold text-white disabled:opacity-50';

const outlineButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#cbb8a4] px-5 text-[11px] font-extrabold text-[#431318] disabled:opacity-50';

const emptyPack =
  () => ({
    name:
      '',

    slug:
      '',

    price:
      0,

    credits:
      10,

    durationHours:
      12,

    active:
      true,

    sortOrder:
      0
  });

export default function AdminBoostPage() {
  const [
    plans,
    setPlans
  ] =
    useState([]);

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
    refreshing,
    setRefreshing
  ] =
    useState(false);

  const [
    savingPlan,
    setSavingPlan
  ] =
    useState('');

  const [
    editingPack,
    setEditingPack
  ] =
    useState(
      emptyPack
    );

  const [
    savingPack,
    setSavingPack
  ] =
    useState(false);

  const notify =
    useToast();

  const load =
    useCallback(
      async () => {
        const result =
          await api(
            '/admin/boost-management'
          );

        setPlans(
          result.data
            .plans ||
            []
        );

        setPacks(
          result.data
            .packs ||
            []
        );

        return result;
      },
      []
    );

  /*
   * Initial loading is scheduled after mount instead of
   * synchronously invoking a state-setting function inside
   * the effect body.
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

  const refresh =
    async () => {
      setRefreshing(
        true
      );

      try {
        await load();
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setRefreshing(
          false
        );
      }
    };

  const updatePlan =
    (
      planId,
      key,
      value
    ) => {
      setPlans(
        (
          current
        ) =>
          current.map(
            (
              plan
            ) =>
              plan._id ===
              planId
                ? {
                    ...plan,

                    boostConfig: {
                      includedCredits:
                        0,

                      durationHours:
                        12,

                      active:
                        true,

                      ...(
                        plan
                          .boostConfig ||
                        {}
                      ),

                      [
                        key
                      ]:
                        value
                    }
                  }
                : plan
          )
      );
    };

  const savePlan =
    async (
      plan
    ) => {
      setSavingPlan(
        plan._id
      );

      try {
        const config =
          plan.boostConfig ||
          {};

        await api(
          `/admin/boost-plan-configs/${plan._id}`,
          {
            method:
              'PUT',

            body:
              JSON.stringify({
                includedCredits:
                  Number(
                    config.includedCredits ||
                      0
                  ),

                durationHours:
                  Number(
                    config.durationHours ||
                      12
                  ),

                active:
                  config.active !==
                  false
              })
          }
        );

        notify(
          `${plan.name} boost configuration saved.`
        );

        await load();
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setSavingPlan(
          ''
        );
      }
    };

  const editPack =
    (
      pack
    ) => {
      setEditingPack({
        ...pack
      });

      window.scrollTo({
        top:
          document.body
            .scrollHeight,

        behavior:
          'smooth'
      });
    };

  const savePack =
    async (
      event
    ) => {
      event.preventDefault();

      setSavingPack(
        true
      );

      try {
        await api(
          editingPack._id
            ? `/admin/boost-packs/${editingPack._id}`
            : '/admin/boost-packs',
          {
            method:
              editingPack._id
                ? 'PATCH'
                : 'POST',

            body:
              JSON.stringify({
                name:
                  editingPack.name,

                slug:
                  editingPack.slug,

                price:
                  Number(
                    editingPack.price
                  ),

                credits:
                  Number(
                    editingPack.credits
                  ),

                durationHours:
                  Number(
                    editingPack
                      .durationHours
                  ),

                active:
                  editingPack.active !==
                  false,

                sortOrder:
                  Number(
                    editingPack
                      .sortOrder ||
                      0
                  )
              })
          }
        );

        notify(
          'Boost pack saved.'
        );

        setEditingPack(
          emptyPack()
        );

        await load();
      } catch (
        error
      ) {
        notify(
          error.message,
          'error'
        );
      } finally {
        setSavingPack(
          false
        );
      }
    };

  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <header className="mb-9 flex items-end justify-between gap-5 max-[700px]:items-start">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              Revenue & visibility
            </p>

            <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-none text-[#2c1a18]">
              Profile Boosts
            </h1>

            <p className="mt-4 max-w-[720px] text-[13px] leading-7 text-[#756a60]">
              Control subscription
              boost allowances,
              duration per credit
              and individually
              purchasable boost
              packs.
            </p>
          </div>

          <button
            type="button"
            className={
              outlineButtonClass
            }
            disabled={
              refreshing
            }
            onClick={
              refresh
            }
          >
            <RefreshCw
              size={
                15
              }
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing…'
              : 'Refresh'}
          </button>
        </header>

        {loading ? (
          <div className="py-20 text-center text-[#756a60]">
            Loading boost
            configuration…
          </div>
        ) : (
          <>
            <section className="border border-[#ddd0c1] bg-[#fffdf8] p-[30px]">
              <div className="flex items-center gap-3">
                <Rocket className="text-[#681d25]" />

                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-[32px] font-medium">
                    Membership boost
                    credits
                  </h2>

                  <p className="text-[11px] text-[#756a60]">
                    Set 5 for Premium,
                    10 for Assisted,
                    or any value you
                    choose.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4">
                {plans.map(
                  (
                    plan
                  ) => {
                    const config =
                      plan.boostConfig ||
                      {
                        includedCredits:
                          0,

                        durationHours:
                          12,

                        active:
                          true
                      };

                    return (
                      <article
                        key={
                          plan._id
                        }
                        className="grid grid-cols-[minmax(160px,1fr)_150px_170px_auto] items-end gap-4 border-t border-[#ddd0c1] pt-5 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1"
                      >
                        <div>
                          <strong className="block text-[14px] text-[#2c1a18]">
                            {
                              plan.name
                            }
                          </strong>

                          <span className="mt-1 block text-[10px] text-[#756a60]">
                            {formatCurrency(
                              plan.price
                            )}{' '}
                            ·{' '}
                            {
                              plan.durationDays
                            }{' '}
                            days
                          </span>
                        </div>

                        <label
                          className={
                            labelClass
                          }
                        >
                          Included
                          credits

                          <input
                            className={
                              inputClass
                            }
                            type="number"
                            min="0"
                            max="1000"
                            value={
                              config.includedCredits ??
                              0
                            }
                            onChange={(
                              event
                            ) =>
                              updatePlan(
                                plan._id,
                                'includedCredits',
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>

                        <label
                          className={
                            labelClass
                          }
                        >
                          Hours per
                          boost

                          <input
                            className={
                              inputClass
                            }
                            type="number"
                            min="1"
                            max="168"
                            value={
                              config.durationHours ??
                              12
                            }
                            onChange={(
                              event
                            ) =>
                              updatePlan(
                                plan._id,
                                'durationHours',
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className={
                            primaryButtonClass
                          }
                          disabled={
                            savingPlan ===
                            plan._id
                          }
                          onClick={() =>
                            savePlan(
                              plan
                            )
                          }
                        >
                          <Save
                            size={
                              14
                            }
                          />

                          {savingPlan ===
                          plan._id
                            ? 'Saving…'
                            : 'Save'}
                        </button>
                      </article>
                    );
                  }
                )}
              </div>
            </section>

            <section className="mt-8 border border-[#ddd0c1] bg-[#fffdf8] p-[30px]">
              <div className="flex items-center gap-3">
                <Zap className="text-[#681d25]" />

                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-[32px] font-medium">
                    Individual boost
                    packs
                  </h2>

                  <p className="text-[11px] text-[#756a60]">
                    These packs can be
                    purchased separately
                    from a membership.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {packs.map(
                  (
                    pack
                  ) => (
                    <div
                      key={
                        pack._id
                      }
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-5 border-t border-[#ddd0c1] py-4 max-[700px]:grid-cols-1"
                    >
                      <div>
                        <strong className="block text-[13px]">
                          {
                            pack.name
                          }
                        </strong>

                        <span className="mt-1 block text-[10px] text-[#756a60]">
                          {
                            pack.credits
                          }{' '}
                          boosts ·{' '}
                          {
                            pack.durationHours
                          }
                          h each ·{' '}
                          {
                            pack.active
                              ? 'Active'
                              : 'Inactive'
                          }
                        </span>
                      </div>

                      <strong className="text-[14px]">
                        {formatCurrency(
                          pack.price
                        )}
                      </strong>

                      <button
                        type="button"
                        className={
                          outlineButtonClass
                        }
                        onClick={() =>
                          editPack(
                            pack
                          )
                        }
                      >
                        Edit
                      </button>
                    </div>
                  )
                )}

                {!packs.length && (
                  <p className="py-6 text-center text-[11px] text-[#756a60]">
                    No boost packs
                    created yet.
                  </p>
                )}
              </div>
            </section>

            <form
              className="mt-8 border border-[#ddd0c1] bg-[#fffdf8] p-[30px]"
              onSubmit={
                savePack
              }
            >
              <div className="mb-6 flex items-center gap-3">
                <Plus className="text-[#681d25]" />

                <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
                  {editingPack._id
                    ? 'Edit Boost Pack'
                    : 'Create Boost Pack'}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                <label
                  className={
                    labelClass
                  }
                >
                  Pack name

                  <input
                    className={
                      inputClass
                    }
                    required
                    value={
                      editingPack.name
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingPack(
                        (
                          current
                        ) => ({
                          ...current,

                          name:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  />
                </label>

                <label
                  className={
                    labelClass
                  }
                >
                  Slug

                  <input
                    className={
                      inputClass
                    }
                    required
                    value={
                      editingPack.slug
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingPack(
                        (
                          current
                        ) => ({
                          ...current,

                          slug:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  />
                </label>

                <label
                  className={
                    labelClass
                  }
                >
                  Price ₹

                  <input
                    className={
                      inputClass
                    }
                    type="number"
                    min="1"
                    required
                    value={
                      editingPack.price
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingPack(
                        (
                          current
                        ) => ({
                          ...current,

                          price:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  />
                </label>

                <label
                  className={
                    labelClass
                  }
                >
                  Credits

                  <input
                    className={
                      inputClass
                    }
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={
                      editingPack.credits
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingPack(
                        (
                          current
                        ) => ({
                          ...current,

                          credits:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  />
                </label>

                <label
                  className={
                    labelClass
                  }
                >
                  Hours per boost

                  <input
                    className={
                      inputClass
                    }
                    type="number"
                    min="1"
                    max="168"
                    required
                    value={
                      editingPack
                        .durationHours
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingPack(
                        (
                          current
                        ) => ({
                          ...current,

                          durationHours:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  />
                </label>

                <label
                  className={
                    labelClass
                  }
                >
                  Sort order

                  <input
                    className={
                      inputClass
                    }
                    type="number"
                    value={
                      editingPack
                        .sortOrder
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingPack(
                        (
                          current
                        ) => ({
                          ...current,

                          sortOrder:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  />
                </label>
              </div>

              <label className="mt-5 flex items-center gap-2 text-[11px] font-bold text-[#5e4e46]">
                <input
                  type="checkbox"
                  checked={
                    editingPack
                      .active !==
                    false
                  }
                  onChange={(
                    event
                  ) =>
                    setEditingPack(
                      (
                        current
                      ) => ({
                        ...current,

                        active:
                          event
                            .target
                            .checked
                      })
                    )
                  }
                />

                Pack is active
              </label>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className={
                    primaryButtonClass
                  }
                  disabled={
                    savingPack
                  }
                >
                  <Save
                    size={
                      14
                    }
                  />

                  {savingPack
                    ? 'Saving…'
                    : 'Save boost pack'}
                </button>

                {editingPack._id && (
                  <button
                    type="button"
                    className={
                      outlineButtonClass
                    }
                    onClick={() =>
                      setEditingPack(
                        emptyPack()
                      )
                    }
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}