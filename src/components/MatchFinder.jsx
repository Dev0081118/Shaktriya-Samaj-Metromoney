import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { translateGender, translateProfileFor } from "../utils/translatedLabels";

export default function MatchFinder() {
  const { user } = useAuth(),
    navigate = useNavigate(), { t } = useTranslation();
  const [form, setForm] = useState({
    profileFor: "Self",
    lookingFor: "Female",
    ageMin: "24",
    ageMax: "30",
    state: "Gujarat"
  });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const criteria = { ...form, preferredGender: form.lookingFor };
    if (!user) {
      sessionStorage.setItem("ksm_matchfinder", JSON.stringify(criteria));
      navigate("/register");
      return;
    }
    const q = new URLSearchParams({
      lookingFor: form.lookingFor,
      ageMin: form.ageMin,
      ageMax: form.ageMax,
      state: form.state
    });
    navigate(`/discover?${q}`);
  };
  return (
    <form onSubmit={submit} className="page-container finder-grid">
      <Finder label={t('public.finderProfileFor')}>
        <select name="profileFor" value={form.profileFor} onChange={change}>
          {["Self", "Son", "Daughter", "Brother", "Sister", "Relative"].map(
            (x) => (
              <option value={x} key={x}>{translateProfileFor(t, x)}</option>
            )
          )}
        </select>
      </Finder>
      <Finder label={t('public.finderLookingFor')}>
        <select name="lookingFor" value={form.lookingFor} onChange={change}>
          <option value="Female">{translateGender(t, 'Female')}</option>
          <option value="Male">{translateGender(t, 'Male')}</option>
        </select>
      </Finder>
      <Finder label={t('public.finderAge')}>
        <div className="finder-range">
          <select
            aria-label={t('public.minimumAge')}
            name="ageMin"
            value={form.ageMin}
            onChange={change}
          >
            {Array.from({ length: 43 }, (_, i) => 18 + i).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <span className="pt-4">&nbsp;&nbsp;  – &nbsp;&nbsp;</span>
          <select
            aria-label={t('public.maximumAge')}
            name="ageMax"
            value={form.ageMax}
            onChange={change}
          >
            {Array.from({ length: 43 }, (_, i) => 18 + i).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </Finder>
      <Finder label={t('public.finderLocation')}>
        <select name="state" value={form.state} onChange={change}>
          {[
            "Gujarat",
            "Rajasthan",
            "Maharashtra",
            "Delhi",
            "Madhya Pradesh",
            "Uttar Pradesh",
            "Other"
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </Finder>
      <button className="finder-submit">
        <span>{t('public.finderSubmit')}</span>
        <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
function Finder({ label, children }) {
  return (
    <label className="finder-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
