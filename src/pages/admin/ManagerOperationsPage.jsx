import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  RefreshCw
} from 'lucide-react';

import AdminNav from '../../components/AdminNav';

import {
  useToast
} from '../../context/ToastContext';

import {
  api
} from '../../services/api';

import {
  formatDate
} from '../../utils/formatters';

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const fieldClass =
  "w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]";

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55";

const emptyAssignment = () => ({
  user:
    '',

  manager:
    '',

  notes:
    ''
});

function StatusBadge({
  status
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[8px] font-bold uppercase ${
        status ===
        'Active'
          ? 'border-[#76946f] text-[#45643f]'
          : status ===
              'Paused'
            ? 'border-[#b58a4c] text-[#75551f]'
            : 'border-[#b46a70] text-[#681d25]'
      }`}
    >
      {
        status
      }
    </span>
  );
}

export default function ManagerOperationsPage() {
  const [
    data,
    setData
  ] =
    useState(null);

  const [
    assignment,
    setAssignment
  ] =
    useState(
      emptyAssignment
    );

  const [
    error,
    setError
  ] =
    useState('');

  const [
    loading,
    setLoading
  ] =
    useState(false);

  const [
    saving,
    setSaving
  ] =
    useState(false);

  const [
    busyId,
    setBusyId
  ] =
    useState('');

  const notify =
    useToast();

  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError('');

        try {
          const result =
            await api(
              '/admin/relationship-managers'
            );

          setData(
            result.data
          );
        } catch (
          loadError
        ) {
          setError(
            loadError.message
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {
      let active =
        true;

      api(
        '/admin/relationship-managers'
      )
        .then(
          (
            result
          ) => {
            if (!active) {
              return;
            }

            setData(
              result.data
            );

            setError(
              ''
            );
          }
        )
        .catch(
          (
            loadError
          ) => {
            if (!active) {
              return;
            }

            setError(
              loadError.message
            );
          }
        );

      return () => {
        active =
          false;
      };
    },
    []
  );

  const selectMember =
    (
      memberId
    ) => {
      const member =
        data.members.find(
          (
            item
          ) =>
            String(
              item._id
            ) ===
            String(
              memberId
            )
        );

      setAssignment({
        user:
          memberId,

        manager:
          member
            ?.assignment
            ?.managerId
            ? String(
                member
                  .assignment
                  .managerId
              )
            : '',

        notes:
          member
            ?.assignment
            ?.notes ||
          ''
      });
    };

  const submit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !assignment.user ||
        !assignment.manager
      ) {
        notify(
          'Choose both an eligible member and an active relationship manager.',
          'error'
        );

        return;
      }

      setSaving(
        true
      );

      try {
        const result =
          await api(
            '/admin/relationship-managers/assignment',
            {
              method:
                'PUT',

              body:
                JSON.stringify(
                  assignment
                )
            }
          );

        notify(
          result.message ||
          'Relationship manager assigned.'
        );

        setAssignment(
          emptyAssignment()
        );

        await load();
      } catch (
        submitError
      ) {
        notify(
          submitError.message,
          'error'
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  const changeStatus =
    async (
      item,
      status
    ) => {
      if (
        status ===
        item.status
      ) {
        return;
      }

      setBusyId(
        item._id
      );

      try {
        const result =
          await api(
            `/admin/relationship-managers/assignment/${item._id}`,
            {
              method:
                'PATCH',

              body:
                JSON.stringify({
                  status,

                  notes:
                    item.notes ||
                    ''
                })
            }
          );

        setData(
          (
            current
          ) => ({
            ...current,

            assignments:
              current.assignments.map(
                (
                  existing
                ) =>
                  existing._id ===
                  item._id
                    ? result
                        .data
                        .assignment
                    : existing
              )
          })
        );

        notify(
          'Assignment status updated.'
        );

        await load();
      } catch (
        statusError
      ) {
        notify(
          statusError.message,
          'error'
        );

        await load();
      } finally {
        setBusyId(
          ''
        );
      }
    };

  const editAssignment =
    (
      item
    ) => {
      setAssignment({
        user:
          String(
            item.user
              ?._id ||
              item.user ||
              ''
          ),

        manager:
          String(
            item.manager
              ?._id ||
              item.manager ||
              ''
          ),

        notes:
          item.notes ||
          ''
      });

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth'
      });
    };

  const activeAssignments =
    data?.assignments
      ?.filter(
        (
          item
        ) =>
          item.status ===
          'Active'
      )
      .length ||
    0;

  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <header className="mb-[30px] flex items-end justify-between gap-5 max-[767px]:items-start">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              Assisted membership
            </p>

            <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
              Relationship managers
            </h1>

            <p className="mt-4 max-w-[680px] text-[13px] leading-7 text-[#756a60]">
              Assign active
              relationship managers
              only to members whose
              current membership
              includes assisted
              support.
            </p>
          </div>

          <button
            type="button"
            className={
              outlineButtonClass
            }
            disabled={
              loading
            }
            onClick={
              load
            }
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>
        </header>

        {error &&
        !data ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] p-10 text-center text-[12px] text-[#756a60]">
            {
              error
            }
          </div>
        ) : !data ? (
          <div className="page-skeleton">
            Loading assignments…
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-3 gap-[15px] max-[767px]:grid-cols-1">
              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {
                    data.managers
                      .length
                  }
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Active managers
                </span>
              </article>

              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {
                    data.members
                      .length
                  }
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Eligible Assisted
                  members
                </span>
              </article>

              <article className="border border-[#ddd0c1] bg-[#fffdf8] p-[25px]">
                <strong className="block font-['Cormorant_Garamond'] text-[34px] font-medium">
                  {
                    activeAssignments
                  }
                </strong>

                <span className="text-[9px] uppercase text-[#756a60]">
                  Active assignments
                </span>
              </article>
            </div>

            <form
              className="grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px] max-[767px]:p-5"
              onSubmit={
                submit
              }
              noValidate
            >
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-[32px] font-medium">
                  Assign or reassign
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
                  Selecting a member
                  with an existing
                  assignment will
                  preload their
                  current manager.
                </p>
              </div>

              <label
                className={
                  labelClass
                }
              >
                Eligible member

                <select
                  className={
                    fieldClass
                  }
                  value={
                    assignment.user
                  }
                  onChange={(
                    event
                  ) =>
                    selectMember(
                      event
                        .target
                        .value
                    )
                  }
                >
                  <option value="">
                    Choose member
                  </option>

                  {data.members.map(
                    (
                      member
                    ) => (
                      <option
                        value={
                          member._id
                        }
                        key={
                          member._id
                        }
                      >
                        {
                          member.email
                        }{' '}
                        —{' '}
                        {
                          member.plan
                        }
                        {member
                          .assignment
                          ?.managerEmail
                          ? ` — ${member.assignment.managerEmail}`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                className={
                  labelClass
                }
              >
                Relationship manager

                <select
                  className={
                    fieldClass
                  }
                  value={
                    assignment.manager
                  }
                  onChange={(
                    event
                  ) =>
                    setAssignment(
                      (
                        current
                      ) => ({
                        ...current,

                        manager:
                          event
                            .target
                            .value
                      })
                    )
                  }
                >
                  <option value="">
                    Choose manager
                  </option>

                  {data.managers.map(
                    (
                      manager
                    ) => (
                      <option
                        value={
                          manager._id
                        }
                        key={
                          manager._id
                        }
                      >
                        {
                          manager.email
                        }
                        {manager.phone
                          ? ` — ${manager.phone}`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                className={
                  labelClass
                }
              >
                Internal notes

                <textarea
                  rows="4"
                  maxLength="2000"
                  className={
                    fieldClass
                  }
                  value={
                    assignment.notes
                  }
                  onChange={(
                    event
                  ) =>
                    setAssignment(
                      (
                        current
                      ) => ({
                        ...current,

                        notes:
                          event
                            .target
                            .value
                      })
                    )
                  }
                  placeholder="Optional internal context for the relationship manager."
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className={
                    primaryButtonClass
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Saving…'
                    : 'Assign manager'}
                </button>

                {(assignment.user ||
                  assignment.manager ||
                  assignment.notes) && (
                  <button
                    type="button"
                    className={
                      outlineButtonClass
                    }
                    disabled={
                      saving
                    }
                    onClick={() =>
                      setAssignment(
                        emptyAssignment()
                      )
                    }
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
              <div className="py-6">
                <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                  Assignment history
                </h2>
              </div>

              {data
                .assignments
                .length ? (
                data.assignments.map(
                  (
                    item
                  ) => (
                    <div
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[850px]:grid-cols-2 max-[520px]:grid-cols-1"
                      key={
                        item._id
                      }
                    >
                      <div className="min-w-0">
                        <strong className="block break-all text-[11px]">
                          {item.user
                            ?.email ||
                            'Member unavailable'}
                        </strong>

                        <small className="mt-1 block break-all text-[9px] leading-5 text-[#756a60]">
                          Manager:{' '}
                          {item.manager
                            ?.email ||
                            'Unavailable'}
                          {item.manager
                            ?.phone
                            ? ` · ${item.manager.phone}`
                            : ''}
                        </small>

                        <small className="block text-[8px] text-[#91867d]">
                          Assigned{' '}
                          {formatDate(
                            item.assignedAt
                          )}
                        </small>

                        {item.notes && (
                          <p className="mt-2 max-w-[650px] text-[9px] leading-5 text-[#756a60]">
                            {
                              item.notes
                            }
                          </p>
                        )}
                      </div>

                      <StatusBadge
                        status={
                          item.status
                        }
                      />

                      <select
                        aria-label={`Assignment status for ${item.user?.email || item._id}`}
                        className="border border-[#ddd0c1] bg-white p-[10px] text-[10px]"
                        value={
                          item.status
                        }
                        disabled={
                          busyId ===
                          item._id
                        }
                        onChange={(
                          event
                        ) =>
                          changeStatus(
                            item,
                            event
                              .target
                              .value
                          )
                        }
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Paused">
                          Paused
                        </option>

                        <option value="Ended">
                          Ended
                        </option>
                      </select>

                      <button
                        type="button"
                        className={
                          outlineButtonClass
                        }
                        onClick={() =>
                          editAssignment(
                            item
                          )
                        }
                      >
                        Reassign
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="border-t border-[#ddd0c1] p-[25px] text-[12px] text-[#756a60]">
                  No relationship
                  manager assignments
                  yet.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}