import { useEffect, useState } from 'react';
import {
  Bell,
  Bookmark,
  HeartHandshake,
  UsersRound
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useToast } from '../context/ToastContext';
import {
  api,
  assetUrl
} from '../services/api';
import { formatDate } from '../utils/formatters';

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

const config = {
  interests: {
    icon: HeartHandshake,
    title: 'Interests',
    body: 'When another family expresses interest, it will appear here.'
  },
  matches: {
    icon: UsersRound,
    title: 'Mutual matches',
    body: "We're still looking for profiles that align with your preferences."
  },
  shortlisted: {
    icon: Bookmark,
    title: 'Your shortlist',
    body: 'Profiles you save will appear here.'
  },
  notifications: {
    icon: Bell,
    title: 'Notifications',
    body: 'Important updates will appear here.'
  }
};

const primaryButtonClass =
  "inline-flex min-h-[36px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-[14px] text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]";

const outlineButtonClass =
  "inline-flex min-h-[36px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-[14px] text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white";

const textLinkClass =
  "border-b border-[#c49b70] pb-[3px] text-[12px] font-extrabold text-[#681d25]";

export default function CollectionPage({
  type
}) {
  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [tab, setTab] =
    useState('incoming');

  const notify = useToast();

  const load = async () => {
    setLoading(true);

    try {
      const path =
        type === 'interests'
          ? `/interests/${tab}`
          : type === 'matches'
            ? '/matches'
            : type ===
                'shortlisted'
              ? '/shortlist'
              : '/notifications';

      const result = (
        await api(path)
      ).data;

      setData(
        result.interests ||
          result.matches ||
          result.shortlist ||
          result.notifications ||
          []
      );
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [
    type,
    tab
  ]);

  const interestAction =
    async (id, action) => {
      try {
        await api(
          `/interests/${id}/${action}`,
          {
            method: 'PATCH'
          }
        );

        notify(
          action === 'accept'
            ? 'Interest accepted. A mutual match was created.'
            : `Interest ${action}d.`
        );

        load();
      } catch (caught) {
        notify(
          caught.message,
          'error'
        );
      }
    };

  const remove = async (id) => {
    try {
      await api(
        `/shortlist/${id}`,
        {
          method: 'DELETE'
        }
      );

      notify(
        'Removed from shortlist.'
      );

      load();
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  const read = async (id) => {
    await api(
      `/notifications/${id}/read`,
      {
        method: 'PATCH'
      }
    );

    setData((current) =>
      current.map(
        (notification) =>
          notification._id === id
            ? {
                ...notification,
                read: true
              }
            : notification
      )
    );
  };

  const currentConfig =
    config[type];

  const Icon =
    currentConfig.icon;

  if (loading) {
    return (
      <div className="page-skeleton">
        Loading{' '}
        {currentConfig.title.toLowerCase()}
        …
      </div>
    );
  }

  return (
    <>
      <header className="mb-[30px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Private activity
        </p>

        <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
          {currentConfig.title}
        </h1>
      </header>

      {type ===
        'interests' && (
        <div className="mb-[22px] flex gap-1 border-b border-[#ddd0c1]">
          <button
            className={`px-5 py-3 text-[11px] ${
              tab === 'incoming'
                ? 'border-b-2 border-[#681d25] text-[#681d25]'
                : 'text-[#756a60]'
            }`}
            onClick={() =>
              setTab('incoming')
            }
          >
            Incoming
          </button>

          <button
            className={`px-5 py-3 text-[11px] ${
              tab === 'outgoing'
                ? 'border-b-2 border-[#681d25] text-[#681d25]'
                : 'text-[#756a60]'
            }`}
            onClick={() =>
              setTab('outgoing')
            }
          >
            Sent
          </button>
        </div>
      )}

      {type ===
        'notifications' &&
        data.some(
          (item) => !item.read
        ) && (
          <button
            className={textLinkClass}
            onClick={async () => {
              await api(
                '/notifications/all/read',
                {
                  method: 'PATCH'
                }
              );

              setData(
                (current) =>
                  current.map(
                    (notification) => ({
                      ...notification,
                      read: true
                    })
                  )
              );
            }}
          >
            Mark all read
          </button>
        )}

      {error ? (
        <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
          <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
            {error}
          </p>
        </div>
      ) : data.length ? (
        <div className="grid border border-[#ddd0c1] bg-[#fffdf8]">
          {data.map((item) => {
            const profile =
              item.profile;

            return (
              <article
                key={
                  item._id ||
                  item.matchId
                }
                className={`grid grid-cols-[58px_1fr_auto] items-center gap-[18px] border-b border-[#ddd0c1] p-[18px] last:border-b-0 max-[767px]:grid-cols-[45px_1fr] ${
                  item.read === false
                    ? 'bg-[#f1e7db]'
                    : ''
                }`}
              >
                {profile ? (
                  profile.profilePhoto ? (
                    <img
                      src={assetUrl(
                        profile.profilePhoto
                      )}
                      alt=""
                      className="h-[58px] w-[58px] rounded-full object-cover max-[767px]:h-[45px] max-[767px]:w-[45px]"
                    />
                  ) : (
                    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                      {
                        profile
                          .firstName?.[0]
                      }
                    </span>
                  )
                ) : (
                  <Icon className="text-[#aa7a42]" />
                )}

                <div>
                  {profile ? (
                    <>
                      <strong className="block font-['Cormorant_Garamond'] text-[22px] font-medium">
                        {
                          profile.firstName
                        }{' '}
                        {
                          profile.lastName
                        }
                      </strong>

                      <small className="mt-[3px] block text-[10px] text-[#756a60]">
                        {profile.location
                          ?.city ||
                          'India'}{' '}
                        •{' '}
                        {profile.career
                          ?.occupation ||
                          'Profession not shared'}
                      </small>
                    </>
                  ) : (
                    <>
                      <strong className="block font-['Cormorant_Garamond'] text-[22px] font-medium">
                        {item.title}
                      </strong>

                      <small className="mt-[3px] block text-[10px] text-[#756a60]">
                        {item.message}
                      </small>
                    </>
                  )}

                  <time className="mt-[3px] block text-[10px] text-[#756a60]">
                    {formatDate(
                      item.createdAt ||
                        item.matchedAt
                    )}
                  </time>
                </div>

                <div className="flex items-center gap-2 max-[767px]:col-span-full max-[767px]:flex-wrap">
                  {type ===
                    'interests' &&
                    item.status ===
                      'Pending' &&
                    (tab ===
                    'incoming' ? (
                      <>
                        <button
                          onClick={() =>
                            interestAction(
                              item._id,
                              'accept'
                            )
                          }
                          className={
                            primaryButtonClass
                          }
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            interestAction(
                              item._id,
                              'decline'
                            )
                          }
                          className={
                            outlineButtonClass
                          }
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          interestAction(
                            item._id,
                            'withdraw'
                          )
                        }
                        className={
                          outlineButtonClass
                        }
                      >
                        Withdraw
                      </button>
                    ))}

                  {profile && (
                    <Link
                      className={
                        textLinkClass
                      }
                      to={`/profile/${profile.profileId}`}
                    >
                      View profile
                    </Link>
                  )}

                  {type ===
                    'shortlisted' && (
                    <button
                      onClick={() =>
                        remove(
                          profile._id
                        )
                      }
                      className={
                        outlineButtonClass
                      }
                    >
                      Remove
                    </button>
                  )}

                  {type ===
                    'notifications' &&
                    !item.read && (
                      <button
                        onClick={() =>
                          read(item._id)
                        }
                        className={
                          textLinkClass
                        }
                      >
                        Mark read
                      </button>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[380px] flex-col items-center justify-center border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
          <Icon
            size={34}
            className="text-[#aa7a42]"
          />

          <h2 className="m-[15px] font-['Cormorant_Garamond'] text-[34px] font-medium">
            Nothing here yet
          </h2>

          <p className="max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
            {currentConfig.body}
          </p>
        </div>
      )}
    </>
  );
}