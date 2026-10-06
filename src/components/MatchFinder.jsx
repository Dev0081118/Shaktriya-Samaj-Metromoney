import {
  ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import {
  translateGender,
  translateProfileFor
} from '../utils/translatedLabels';

const selectClass =
  "mt-[11px] w-full border-0 bg-transparent font-['Cormorant_Garamond'] text-[21px] font-medium text-[#33221e] outline-none";

export default function MatchFinder() {
  const { user } =
    useAuth();

  const navigate =
    useNavigate();

  const { t } =
    useTranslation();

  const [form, setForm] =
    useState({
      profileFor: 'Self',
      lookingFor: 'Female',
      ageMin: '24',
      ageMax: '30',
      state: 'Gujarat'
    });

  const change = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const criteria = {
      ...form,
      preferredGender:
        form.lookingFor
    };

    if (!user) {
      sessionStorage.setItem(
        'ksm_matchfinder',
        JSON.stringify(criteria)
      );

      navigate('/register');

      return;
    }

    const query =
      new URLSearchParams({
        lookingFor:
          form.lookingFor,
        ageMin:
          form.ageMin,
        ageMax:
          form.ageMax,
        state:
          form.state
      });

    navigate(
      `/discover?${query}`
    );
  };

  return (
    <form
      onSubmit={submit}
      className="page-container grid grid-cols-[1.1fr_1fr_1fr_1fr_0.95fr] overflow-hidden rounded-[3px] border border-[#dfd3c6] bg-[#f8f3ec] shadow-[0_22px_55px_#2e181323] max-[1024px]:grid-cols-2 max-[767px]:grid-cols-1"
    >
      <Finder
        label={t(
          'public.finderProfileFor'
        )}
      >
        <select
          className={selectClass}
          name="profileFor"
          value={form.profileFor}
          onChange={change}
        >
          {[
            'Self',
            'Son',
            'Daughter',
            'Brother',
            'Sister',
            'Relative'
          ].map((item) => (
            <option
              value={item}
              key={item}
            >
              {translateProfileFor(
                t,
                item
              )}
            </option>
          ))}
        </select>
      </Finder>

      <Finder
        label={t(
          'public.finderLookingFor'
        )}
      >
        <select
          className={selectClass}
          name="lookingFor"
          value={form.lookingFor}
          onChange={change}
        >
          <option value="Female">
            {translateGender(
              t,
              'Female'
            )}
          </option>

          <option value="Male">
            {translateGender(
              t,
              'Male'
            )}
          </option>
        </select>
      </Finder>

      <Finder
        label={t(
          'public.finderAge'
        )}
      >
        <div className="flex items-center">
          <select
            aria-label={t(
              'public.minimumAge'
            )}
            name="ageMin"
            value={form.ageMin}
            onChange={change}
            className={`${selectClass} min-w-[55px] !w-auto`}
          >
            {Array.from(
              {
                length: 43
              },
              (
                _,
                index
              ) =>
                18 + index
            ).map((age) => (
              <option key={age}>
                {age}
              </option>
            ))}
          </select>

          <span className="pt-4">
            &nbsp;&nbsp; – &nbsp;&nbsp;
          </span>

          <select
            aria-label={t(
              'public.maximumAge'
            )}
            name="ageMax"
            value={form.ageMax}
            onChange={change}
            className={`${selectClass} min-w-[55px] !w-auto`}
          >
            {Array.from(
              {
                length: 43
              },
              (
                _,
                index
              ) =>
                18 + index
            ).map((age) => (
              <option key={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
      </Finder>

      <Finder
        label={t(
          'public.finderLocation'
        )}
      >
        <select
          className={selectClass}
          name="state"
          value={form.state}
          onChange={change}
        >
          {[
            'Gujarat',
            'Rajasthan',
            'Maharashtra',
            'Delhi',
            'Madhya Pradesh',
            'Uttar Pradesh',
            'Other'
          ].map((state) => (
            <option key={state}>
              {state}
            </option>
          ))}
        </select>
      </Finder>

      <button className="flex min-h-[104px] items-center justify-between bg-[#7a2028] px-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[#641920] max-[1024px]:min-h-[78px] max-[767px]:min-h-[70px]">
        <span>
          {t(
            'public.finderSubmit'
          )}
        </span>

        <ArrowUpRight
          size={18}
        />
      </button>
    </form>
  );
}

function Finder({
  label,
  children
}) {
  return (
    <label className="min-h-[104px] border-r border-[#dfd3c6] px-[26px] py-[25px] max-[767px]:min-h-[86px] max-[767px]:border-b max-[767px]:border-r-0">
      <span className="block text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#9a816c]">
        {label}
      </span>

      {children}
    </label>
  );
}