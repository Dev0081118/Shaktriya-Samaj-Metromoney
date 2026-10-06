import { useEffect, useState } from 'react';

import AdminNav from '../../components/AdminNav';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

/* eslint-disable react-hooks/exhaustive-deps */

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const selectClass =
  "w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]";

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55";

const rowClass =
  "grid grid-cols-[auto_1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-[auto_1fr_auto]";

export default function ManagerOperationsPage() {
  const [data, setData] = useState(null);
  const [assignment, setAssignment] = useState({
    user: '',
    manager: ''
  });

  const notify = useToast();

  const load = () =>
    api('/admin/relationship-managers').then((result) =>
      setData(result.data)
    );

  useEffect(() => {
    load().catch((error) => notify(error.message, 'error'));
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    try {
      await api('/admin/relationship-managers/assignment', {
        method: 'PUT',
        body: JSON.stringify(assignment)
      });

      await load();

      notify('Relationship manager assigned.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <header className="mb-[30px]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            Assisted membership
          </p>

          <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
            Relationship managers
          </h1>
        </header>

        {!data ? (
          <div className="page-skeleton">
            Loading assignments…
          </div>
        ) : (
          <>
            <form
              className="grid gap-[18px] border border-[#ddd0c1] bg-[#fffdf8] p-[35px]"
              onSubmit={submit}
            >
              <label className={labelClass}>
                Member

                <select
                  required
                  className={selectClass}
                  value={assignment.user}
                  onChange={(event) =>
                    setAssignment((current) => ({
                      ...current,
                      user: event.target.value
                    }))
                  }
                >
                  <option value="">Choose member</option>

                  {data.members.map((member) => (
                    <option value={member._id} key={member._id}>
                      {member.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Manager

                <select
                  required
                  className={selectClass}
                  value={assignment.manager}
                  onChange={(event) =>
                    setAssignment((current) => ({
                      ...current,
                      manager: event.target.value
                    }))
                  }
                >
                  <option value="">Choose manager</option>

                  {data.managers.map((manager) => (
                    <option value={manager._id} key={manager._id}>
                      {manager.email}
                    </option>
                  ))}
                </select>
              </label>

              <button className={primaryButtonClass}>
                Assign manager
              </button>
            </form>

            <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
              {data.assignments.map((item) => (
                <div className={rowClass} key={item._id}>
                  <div>
                    <strong className="block text-[11px]">
                      {item.user?.email}
                    </strong>

                    <small className="block text-[9px] text-[#756a60]">
                      {item.manager?.email} ·{' '}
                      {item.manager?.phone || 'No phone'}
                    </small>
                  </div>

                  <time className="col-start-3 text-[9px] text-[#756a60] max-[767px]:hidden">
                    {item.status}
                  </time>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}