/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import {
  Link,
  Route,
  Routes,
  useParams,
  useSearchParams
} from 'react-router-dom';

import AdminNav from '../../components/AdminNav';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const primaryButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55";

const outlineButtonClass =
  "inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:opacity-55";

const inputClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[13px] outline-none";

const adminRowClass =
  "grid grid-cols-[auto_1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 text-inherit no-underline max-[767px]:grid-cols-[auto_1fr_auto]";

const operationCardClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-6";

const operationTitleClass =
  "font-['Cormorant_Garamond'] text-[24px] font-medium";

const dlClass =
  "grid gap-[10px]";

const detailRowClass =
  "flex justify-between gap-5 border-b border-[#ddd0c1] pb-2";

const dtClass =
  "capitalize text-[#756a60]";

const ddClass =
  "text-right";

const date = (value) =>
  formatDate(value, undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="mb-[30px]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
        {eyebrow}
      </p>

      <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
        {title}
      </h1>

      {children}
    </header>
  );
}

function EmptyError({ children }) {
  return (
    <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
      <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
        {children}
      </p>
    </div>
  );
}

function CustomerList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const query = params.toString();

  useEffect(() => {
    api(`/admin/customers${query ? `?${query}` : ''}`)
      .then((response) => setData(response.data))
      .catch((requestError) => setError(requestError.message));
  }, [query]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    if (key !== 'page') {
      next.set('page', '1');
    }

    setParams(next);
  };

  return (
    <>
      <PageHeader eyebrow="Customer operations" title="Customers">
        <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          Search an account once, then open its complete support history.
        </p>
      </PageHeader>

      <div className="my-6 flex gap-3 max-[767px]:flex-col">
        <input
          aria-label="Search customers"
          placeholder="Name, email, phone or profile ID"
          className={`${inputClass} flex-1`}
          value={params.get('search') || ''}
          onChange={(event) => update('search', event.target.value)}
        />

        <select
          className={inputClass}
          value={params.get('status') || ''}
          onChange={(event) => update('status', event.target.value)}
        >
          <option value="">All account statuses</option>

          {['Active', 'Suspended', 'Blocked', 'Deleted'].map(
            (status) => (
              <option key={status}>
                {status}
              </option>
            )
          )}
        </select>
      </div>

      {error ? (
        <EmptyError>{error}</EmptyError>
      ) : !data ? (
        <div className="page-skeleton">
          Loading customers…
        </div>
      ) : (
        <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
          {data.items.map((item) => (
            <Link
              className={adminRowClass}
              to={`/admin/customers/${item._id}`}
              key={item._id}
            >
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                {item.profile?.firstName?.[0] ||
                  item.email?.[0]?.toUpperCase()}
              </span>

              <div>
                <strong className="block text-[11px]">
                  {item.profile
                    ? `${item.profile.firstName} ${
                        item.profile.lastName || ''
                      }`
                    : item.email}
                </strong>

                <small className="block text-[9px] text-[#756a60]">
                  {item.profile?.profileId || 'No profile'} ·{' '}
                  {item.email} · {item.phone || 'No phone'}
                </small>
              </div>

              <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                {formatDate(item.createdAt)}
              </time>

              <span className="rounded-[99px] border border-[#8d6e45] px-[9px] py-[5px] text-[9px] uppercase text-[#694c26]">
                {item.status}
              </span>
            </Link>
          ))}

          {!data.items.length && (
            <p className="p-[25px] text-[12px] text-[#756a60]">
              No customers match these filters.
            </p>
          )}

          <div className="flex items-center justify-center gap-[15px] p-5">
            <button
              className="border border-[#ddd0c1] bg-transparent px-3 py-2 disabled:opacity-50"
              disabled={data.pagination.page <= 1}
              onClick={() =>
                update(
                  'page',
                  String(data.pagination.page - 1)
                )
              }
            >
              Previous
            </button>

            <span>
              Page {data.pagination.page} of{' '}
              {data.pagination.totalPages}
            </span>

            <button
              className="border border-[#ddd0c1] bg-transparent px-3 py-2 disabled:opacity-50"
              disabled={
                data.pagination.page >=
                data.pagination.totalPages
              }
              onClick={() =>
                update(
                  'page',
                  String(data.pagination.page + 1)
                )
              }
            >
              Next
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function CustomerDetail() {
  const { userId } = useParams();

  const notify = useToast();

  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [pendingStatus, setPendingStatus] = useState('');
  const [reason, setReason] = useState('');

  const load = () =>
    api(`/admin/customers/${userId}`)
      .then((response) => setData(response.data))
      .catch((error) => notify(error.message, 'error'));

  useEffect(() => {
    load();
  }, [userId]);

  const addNote = async (event) => {
    event.preventDefault();

    try {
      await api(`/admin/customers/${userId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          category
        })
      });

      setText('');

      await load();

      notify('Internal note added.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const updateStatus = async (event) => {
    event.preventDefault();

    try {
      await api(`/admin/customers/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: pendingStatus,
          reason
        })
      });

      setPendingStatus('');
      setReason('');

      await load();

      notify('Account status updated and audited.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  if (!data) {
    return (
      <div className="page-skeleton">
        Loading Customer 360…
      </div>
    );
  }

  const { user, profile } = data;

  return (
    <>
      <Link
        to="/admin/customers"
        className="flex items-center gap-2 text-[12px] text-white"
      >
        ← Customers
      </Link>

      <PageHeader
        eyebrow="Customer 360"
        title={
          profile
            ? `${profile.firstName} ${profile.lastName || ''}`
            : user.email
        }
      >
        <p className="mt-[18px] max-w-[680px] text-[14px] leading-[1.8] text-[#756a60]">
          {profile?.profileId || 'No matrimonial profile'} ·{' '}
          {user.status}
        </p>

        <div className="mt-7 flex gap-[10px] max-[767px]:flex-wrap">
          {['Active', 'Suspended', 'Blocked']
            .filter((status) => status !== user.status)
            .map((status) => (
              <button
                className={
                  status === 'Active'
                    ? primaryButtonClass
                    : outlineButtonClass
                }
                onClick={() => setPendingStatus(status)}
                key={status}
              >
                {status === 'Active' ? 'Activate' : status}
              </button>
            ))}
        </div>
      </PageHeader>

      {pendingStatus && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#1d1110aa] p-5"
          role="presentation"
        >
          <form
            className="w-full max-w-[480px] border border-[#b89a65] bg-[#fffdf8] p-7 shadow-[0_25px_80px_#0005]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-title"
            onSubmit={updateStatus}
          >
            <h2
              id="status-title"
              className="font-['Cormorant_Garamond'] text-[30px] font-medium"
            >
              {pendingStatus} this account?
            </h2>

            <p>
              This high-impact operation is recorded in the audit log.
            </p>

            {pendingStatus !== 'Active' && (
              <label className="mt-4 block w-full">
                Reason

                <textarea
                  autoFocus
                  required
                  minLength="5"
                  className="mt-2 block min-h-[90px] w-full border border-[#ddd0c1] p-3"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                />
              </label>
            )}

            <div className="mt-7 flex gap-[10px] max-[767px]:flex-wrap">
              <button className={primaryButtonClass}>
                Confirm {pendingStatus.toLowerCase()}
              </button>

              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => setPendingStatus('')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1">
        <section className={operationCardClass}>
          <h2 className={operationTitleClass}>
            Account
          </h2>

          <dl className={dlClass}>
            <div className={detailRowClass}>
              <dt className={dtClass}>Email</dt>
              <dd className={ddClass}>{user.email}</dd>
            </div>

            <div className={detailRowClass}>
              <dt className={dtClass}>Phone</dt>
              <dd className={ddClass}>
                {user.phone || '—'}
              </dd>
            </div>

            <div className={detailRowClass}>
              <dt className={dtClass}>Status</dt>
              <dd className={ddClass}>{user.status}</dd>
            </div>

            <div className={detailRowClass}>
              <dt className={dtClass}>Joined</dt>
              <dd className={ddClass}>
                {date(user.createdAt)}
              </dd>
            </div>

            <div className={detailRowClass}>
              <dt className={dtClass}>Last login</dt>
              <dd className={ddClass}>
                {date(user.lastLoginAt)}
              </dd>
            </div>

            <div className={detailRowClass}>
              <dt className={dtClass}>Verified</dt>

              <dd className={ddClass}>
                Phone {user.phoneVerified ? 'Yes' : 'No'} · Email{' '}
                {user.emailVerified ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </section>

        <section className={operationCardClass}>
          <h2 className={operationTitleClass}>
            Profile
          </h2>

          {profile ? (
            <dl className={dlClass}>
              <div className={detailRowClass}>
                <dt className={dtClass}>Status</dt>
                <dd className={ddClass}>
                  {profile.visibility}
                </dd>
              </div>

              <div className={detailRowClass}>
                <dt className={dtClass}>Completion</dt>
                <dd className={ddClass}>
                  {profile.completionPercentage}%
                </dd>
              </div>

              <div className={detailRowClass}>
                <dt className={dtClass}>Location</dt>

                <dd className={ddClass}>
                  {profile.location?.city},{' '}
                  {profile.location?.state}
                </dd>
              </div>

              <div className={detailRowClass}>
                <dt className={dtClass}>Last active</dt>
                <dd className={ddClass}>
                  {date(profile.lastActiveAt)}
                </dd>
              </div>
            </dl>
          ) : (
            <p>No member profile exists.</p>
          )}
        </section>

        <section className={operationCardClass}>
          <h2 className={operationTitleClass}>
            Matrimonial activity
          </h2>

          <dl className={dlClass}>
            {Object.entries(data.activity).map(
              ([key, value]) => (
                <div className={detailRowClass} key={key}>
                  <dt className={dtClass}>{key}</dt>
                  <dd className={ddClass}>{value}</dd>
                </div>
              )
            )}
          </dl>
        </section>

        <section className={operationCardClass}>
          <h2 className={operationTitleClass}>
            Membership
          </h2>

          {data.subscriptions.length ? (
            data.subscriptions.map((subscription) => (
              <p key={subscription._id}>
                <strong>
                  {subscription.planNameSnapshot ||
                    subscription.plan?.name}
                </strong>

                <br />

                {subscription.status} ·{' '}
                {date(subscription.endsAt)}
              </p>
            ))
          ) : (
            <p>No subscription history.</p>
          )}
        </section>
      </div>

      <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
        <h2 className={operationTitleClass}>
          Payments
        </h2>

        {data.payments.map((payment) => (
          <div
            className={adminRowClass}
            key={payment._id}
          >
            <div>
              <strong className="block text-[11px]">
                {payment.plan?.name || 'Plan'}
              </strong>

              <small className="block text-[9px] text-[#756a60]">
                {payment.providerOrderId || 'No provider order'} ·{' '}
                {payment.providerPaymentId || 'No payment ID'}
              </small>
            </div>

            <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
              {date(payment.createdAt)}
            </time>

            <span>
              {formatCurrency(payment.amount)} · {payment.status}
            </span>
          </div>
        ))}

        {!data.payments.length && (
          <p className="p-[25px] text-[12px] text-[#756a60]">
            No payments.
          </p>
        )}
      </section>

      <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
        <h2 className={operationTitleClass}>
          Support tickets
        </h2>

        {data.tickets.map((ticket) => (
          <div
            className={adminRowClass}
            key={ticket._id}
          >
            <div>
              <strong className="block text-[11px]">
                {ticket.category} · {ticket.priority}
              </strong>

              <small className="block text-[9px] text-[#756a60]">
                {ticket.message}
              </small>
            </div>

            <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
              {date(ticket.createdAt)}
            </time>

            <span>{ticket.status}</span>
          </div>
        ))}

        {!data.tickets.length && (
          <p className="p-[25px] text-[12px] text-[#756a60]">
            No support tickets.
          </p>
        )}
      </section>

      <section className={`${operationCardClass} mt-10`}>
        <h2 className={operationTitleClass}>
          Internal customer notes
        </h2>

        <form
          className="my-[15px] mb-[25px] grid gap-[10px]"
          onSubmit={addNote}
        >
          <select
            className={inputClass}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            {[
              'General',
              'Support',
              'Safety',
              'Payment',
              'Verification',
              'Relationship Manager'
            ].map((option) => (
              <option key={option}>
                {option}
              </option>
            ))}
          </select>

          <textarea
            required
            maxLength="2000"
            className={`${inputClass} min-h-[90px] resize-y`}
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Add an internal operational note…"
          />

          <button className={primaryButtonClass}>
            Add note
          </button>
        </form>

        {data.notes.map((note) => (
          <div
            className="border-t border-[#ddd0c1] py-[15px]"
            key={note._id}
          >
            <strong>{note.category}</strong>

            <p className="my-[6px]">
              {note.text}
            </p>

            <small className="text-[#756a60]">
              {note.author?.email} · {date(note.createdAt)}
            </small>
          </div>
        ))}
      </section>
    </>
  );
}

export default function CustomerOperationsPage() {
  return (
    <div className="admin-shell min-h-screen bg-[#f5f0e8]">
      <AdminNav />

      <main className="min-w-0 p-[55px] max-[767px]:px-[15px] max-[767px]:py-[30px]">
        <Routes>
          <Route index element={<CustomerList />} />

          <Route
            path=":userId"
            element={<CustomerDetail />}
          />
        </Routes>
      </main>
    </div>
  );
}