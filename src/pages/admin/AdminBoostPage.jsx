import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  CircleDollarSign,
  Layers3,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Timer,
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
  'w-full border border-[#d8c9ba] bg-[#fffdf8] px-4 py-3 text-[12px] text-[#2c1a18] outline-none transition focus:border-[#681d25]';

const labelClass =
  'grid gap-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#756a60]';

const primaryButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#681d25] px-5 text-[10px] font-extrabold uppercase tracking-[0.05em] text-white transition hover:bg-[#431318] disabled:opacity-45';

const outlineButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#cbb8a4] bg-[#fffdf8] px-5 text-[10px] font-extrabold text-[#431318] transition hover:border-[#681d25] disabled:opacity-45';

const emptyPack =
  () => ({
    name:
      '',

    slug:
      '',

    price:
      '',

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
      },
      []
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

  const activePacks =
    packs.filter(
      (
        pack
      ) =>
        pack.active
    ).length;

  const configuredPlans =
    plans.filter(
      (
        plan
      ) =>
        Number(
          plan.boostConfig
            ?.includedCredits ||
            0
        ) >
        0
    ).length;

  const totalPackCredits =
    packs
      .filter(
        (
          pack
        ) =>
          pack.active
      )
      .reduce(
        (
          total,
          pack
        ) =>
          total +
          Number(
            pack.credits ||
              0
          ),
        0
      );

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
                        plan.boostConfig ||
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

      document
        .getElementById(
          'boost-pack-editor'
        )
        ?.scrollIntoView({
          behavior:
            'smooth',

          block:
            'start'
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
          editingPack._id
            ? 'Boost pack updated.'
            : 'Boost pack created.'
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
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#91683f]">
              Monetization · visibility
            </p>

            <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(46px,6vw,72px)] font-medium leading-[0.9] text-[#2c1a18]">
              Profile Boosts
            </h1>

            <p className="mt-4 max-w-[680px] text-[12px] leading-7 text-[#756a60]">
              Configure boost credits
              included with memberships
              and sell additional
              visibility packs
              independently.
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
                14
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
          <div className="py-24 text-center text-[12px] text-[#756a60]">
            Loading boost
            management…
          </div>
        ) : (
          <>
            {/* Stats */}

            <section className="mt-9 grid grid-cols-3 gap-4 max-[850px]:grid-cols-1">
              <div className="border border-[#ddd0c1] bg-[#fffdf8] p-5">
                <Layers3
                  size={
                    18
                  }
                  className="text-[#681d25]"
                />

                <strong className="mt-4 block font-['Cormorant_Garamond'] text-[36px] font-medium text-[#431318]">
                  {
                    configuredPlans
                  }
                </strong>

                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#756a60]">
                  Plans with boosts
                </span>
              </div>

              <div className="border border-[#ddd0c1] bg-[#fffdf8] p-5">
                <Rocket
                  size={
                    18
                  }
                  className="text-[#681d25]"
                />

                <strong className="mt-4 block font-['Cormorant_Garamond'] text-[36px] font-medium text-[#431318]">
                  {
                    activePacks
                  }
                </strong>

                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#756a60]">
                  Active packs
                </span>
              </div>

              <div className="border border-[#ddd0c1] bg-[#fffdf8] p-5">
                <Zap
                  size={
                    18
                  }
                  className="text-[#681d25]"
                />

                <strong className="mt-4 block font-['Cormorant_Garamond'] text-[36px] font-medium text-[#431318]">
                  {
                    totalPackCredits
                  }
                </strong>

                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#756a60]">
                  Credits across packs
                </span>
              </div>
            </section>

            {/* Membership plans */}

            <section className="mt-7 border border-[#ddd0c1] bg-[#fffdf8]">
              <div className="border-b border-[#e5d9cd] p-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#681d250a] text-[#681d25]">
                    <Zap
                      size={
                        17
                      }
                    />
                  </span>

                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-[32px] font-medium text-[#2c1a18]">
                      Membership
                      allowances
                    </h2>

                    <p className="text-[10px] text-[#756a60]">
                      Example: Premium
                      5 boosts, Assisted
                      10 boosts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#eee4d8]">
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
                        className="grid grid-cols-[minmax(180px,1fr)_150px_170px_auto] items-end gap-5 p-6 max-[950px]:grid-cols-2 max-[600px]:grid-cols-1"
                      >
                        <div>
                          <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#91683f]">
                            Membership
                            plan
                          </p>

                          <h3 className="mt-1 font-['Cormorant_Garamond'] text-[29px] font-medium text-[#2c1a18]">
                            {
                              plan.name
                            }
                          </h3>

                          <p className="mt-1 text-[9px] text-[#756a60]">
                            {formatCurrency(
                              plan.price
                            )}{' '}
                            ·{' '}
                            {
                              plan.durationDays
                            }{' '}
                            days
                          </p>
                        </div>

                        <label
                          className={
                            labelClass
                          }
                        >
                          Included boosts

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
                                event.target
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
                          Hours per boost

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
                                event.target
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
                              13
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

            {/* Existing packs */}

            <section className="mt-7 border border-[#ddd0c1] bg-[#fffdf8]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5d9cd] p-7">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683f]">
                    Individual sales
                  </p>

                  <h2 className="mt-1 font-['Cormorant_Garamond'] text-[32px] font-medium text-[#2c1a18]">
                    Boost packs
                  </h2>
                </div>

                <button
                  type="button"
                  className={
                    outlineButtonClass
                  }
                  onClick={() => {
                    setEditingPack(
                      emptyPack()
                    );

                    document
                      .getElementById(
                        'boost-pack-editor'
                      )
                      ?.scrollIntoView({
                        behavior:
                          'smooth'
                      });
                  }}
                >
                  <Plus
                    size={
                      14
                    }
                  />

                  New pack
                </button>
              </div>

              {packs.length ? (
                <div className="grid grid-cols-3 gap-px bg-[#e5d9cd] max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1">
                  {packs.map(
                    (
                      pack
                    ) => (
                      <article
                        key={
                          pack._id
                        }
                        className="bg-[#fffdf8] p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.08em] ${
                                pack.active
                                  ? 'bg-[#46634412] text-[#466344]'
                                  : 'bg-[#8a7e7312] text-[#756a60]'
                              }`}
                            >
                              {pack.active
                                ? 'Active'
                                : 'Inactive'}
                            </span>

                            <h3 className="mt-3 font-['Cormorant_Garamond'] text-[29px] font-medium text-[#2c1a18]">
                              {
                                pack.name
                              }
                            </h3>
                          </div>

                          <Rocket
                            size={
                              18
                            }
                            className="text-[#91683f]"
                          />
                        </div>

                        <div className="mt-5 flex items-end gap-2">
                          <strong className="font-['Cormorant_Garamond'] text-[42px] font-medium leading-none text-[#681d25]">
                            {
                              pack.credits
                            }
                          </strong>

                          <span className="mb-1 text-[9px] text-[#756a60]">
                            credits
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 border-y border-[#eee4d8] py-4 text-[9px] text-[#756a60]">
                          <span className="flex items-center gap-2">
                            <Timer
                              size={
                                12
                              }
                            />

                            {
                              pack.durationHours
                            }
                            h per boost
                          </span>

                          <span className="flex items-center gap-2">
                            <CircleDollarSign
                              size={
                                12
                              }
                            />

                            {formatCurrency(
                              pack.price
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`${outlineButtonClass} mt-5 w-full`}
                          onClick={() =>
                            editPack(
                              pack
                            )
                          }
                        >
                          Edit pack
                        </button>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <div className="p-10 text-center text-[11px] text-[#756a60]">
                  No individual boost
                  packs created yet.
                </div>
              )}
            </section>

            {/* Editor */}

            <form
              id="boost-pack-editor"
              className="mt-7 scroll-mt-8 border border-[#ddd0c1] bg-[#fffdf8] p-[clamp(24px,4vw,34px)]"
              onSubmit={
                savePack
              }
            >
              <div className="mb-7 flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#681d250a] text-[#681d25]">
                  <Plus
                    size={
                      17
                    }
                  />
                </span>

                <div>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#91683f]">
                    Pack editor
                  </p>

                  <h2 className="mt-1 font-['Cormorant_Garamond'] text-[32px] font-medium text-[#2c1a18]">
                    {editingPack._id
                      ? 'Edit boost pack'
                      : 'Create boost pack'}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
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
                    placeholder="Visibility 10"
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
                            event.target
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
                    placeholder="visibility-10"
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
                            event.target
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
                    placeholder="499"
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
                            event.target
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
                            event.target
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
                            event.target
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
                            event.target
                              .value
                        })
                      )
                    }
                  />
                </label>
              </div>

              <label className="mt-6 flex items-center gap-3 text-[10px] font-bold text-[#5e4e46]">
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
                          event.target
                            .checked
                      })
                    )
                  }
                />

                Publish this boost
                pack for members
              </label>

              <div className="mt-8 flex flex-wrap gap-3">
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
                      13
                    }
                  />

                  {savingPack
                    ? 'Saving…'
                    : editingPack._id
                      ? 'Update pack'
                      : 'Create pack'}
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
                    Cancel
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