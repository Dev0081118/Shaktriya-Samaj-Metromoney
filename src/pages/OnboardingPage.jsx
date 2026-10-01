import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, assetUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
/* eslint-disable react-hooks/exhaustive-deps */
const steps = [
  ['Profile for', 'Who are you creating this profile for?'],
  ['Verification', 'Verify the account mobile number'],
  ['Basics', 'Tell us the essential details'],
  ['Community', 'Share heritage and background'],
  ['Education & career', 'Study and professional journey'],
  ['Family', 'Introduce the family'],
  ['About & lifestyle', 'Add personality and preferences'],
  ['Partner preferences', 'Who would feel compatible?'],
  ['Photographs', 'Add a warm first impression'],
  ['Review', 'Review before moderation']
];
const fields = {
  2: [
    ['firstName', 'First name'],
    ['middleName', 'Middle name'],
    ['lastName', 'Last name'],
    ['gender', 'Gender'],
    ['dateOfBirth', 'Date of birth', 'date'],
    ['height', 'Height in cm', 'number'],
    ['maritalStatus', 'Marital status'],
    ['city', 'City'],
    ['district', 'District'],
    ['state', 'State'],
    ['country', 'Country']
  ],
  3: [
    ['communityName', 'Community'],
    ['subCommunity', 'Sub-community'],
    ['nativePlace', 'Native place'],
    ['clan', 'Clan / Gotra'],
    ['familyOrigin', 'Family origin']
  ],
  4: [
    ['highestEducation', 'Highest education'],
    ['degree', 'Degree'],
    ['specialization', 'Specialization'],
    ['college', 'College'],
    ['occupationType', 'Occupation type'],
    ['occupation', 'Occupation'],
    ['designation', 'Designation'],
    ['companyName', 'Company'],
    ['businessName', 'Business'],
    ['annualIncome', 'Annual income', 'number']
  ],
  5: [
    ['fatherName', 'Father’s name'],
    ['fatherOccupation', 'Father’s occupation'],
    ['motherName', 'Mother’s name'],
    ['motherOccupation', 'Mother’s occupation'],
    ['siblings', 'Siblings'],
    ['familyType', 'Family type'],
    ['familyLocation', 'Family location'],
    ['familyDescription', 'About the family']
  ],
  6: [
    ['aboutMe', 'About me'],
    ['diet', 'Diet'],
    ['smoking', 'Smoking'],
    ['drinking', 'Drinking'],
    ['interests', 'Interests'],
    ['marriageTimeline', 'Marriage timeline']
  ],
  7: [
    ['ageMin', 'Minimum age', 'number'],
    ['ageMax', 'Maximum age', 'number'],
    ['heightMin', 'Minimum height', 'number'],
    ['heightMax', 'Maximum height', 'number'],
    ['locations', 'Preferred cities'],
    ['states', 'Preferred states'],
    ['educationPreferences', 'Education preferences'],
    ['occupationPreferences', 'Occupation preferences'],
    ['dietPreferences', 'Diet preferences'],
    ['communityPreferences', 'Community preferences'],
    ['additionalPreferences', 'Anything else?']
  ]
};
const flatten = (p) => ({
  ...p,
  city: p.location?.city || '',
  district: p.location?.district || '',
  state: p.location?.state || '',
  country: p.location?.country || 'India',
  nativePlace: p.location?.nativePlace || '',
  communityName: p.community?.name || '',
  subCommunity: p.community?.subCommunity || '',
  clan: p.community?.clan || '',
  familyOrigin: p.community?.familyOrigin || '',
  ...p.education,
  ...p.career,
  ...p.lifestyle,
  interests: (p.lifestyle?.interests || []).join(', '),
  ...p.family,
  dateOfBirth: p.dateOfBirth?.slice?.(0, 10) || ''
});
const list = (v) =>
  String(v || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
const profilePayload = (d, visibility = 'draft') => ({
  profileFor: d.profileFor,
  firstName: d.firstName,
  middleName: d.middleName,
  lastName: d.lastName,
  gender: d.gender,
  dateOfBirth: d.dateOfBirth,
  height: Number(d.height) || undefined,
  maritalStatus: d.maritalStatus,
  location: {
    city: d.city,
    district: d.district,
    state: d.state,
    country: d.country || 'India',
    nativePlace: d.nativePlace
  },
  community: {
    name: d.communityName,
    subCommunity: d.subCommunity,
    clan: d.clan,
    familyOrigin: d.familyOrigin
  },
  education: {
    highestEducation: d.highestEducation,
    degree: d.degree,
    specialization: d.specialization,
    college: d.college,
    educationDetails: d.educationDetails
  },
  career: {
    occupationType: d.occupationType,
    occupation: d.occupation,
    designation: d.designation,
    companyName: d.companyName,
    businessName: d.businessName,
    annualIncome: Number(d.annualIncome) || undefined
  },
  lifestyle: {
    diet: d.diet,
    smoking: d.smoking,
    drinking: d.drinking,
    interests: list(d.interests)
  },
  family: {
    fatherName: d.fatherName,
    fatherOccupation: d.fatherOccupation,
    motherName: d.motherName,
    motherOccupation: d.motherOccupation,
    siblings: d.siblings,
    familyType: d.familyType,
    familyLocation: d.familyLocation,
    familyDescription: d.familyDescription
  },
  marriageTimeline: d.marriageTimeline,
  aboutMe: d.aboutMe,
  profilePhoto: d.profilePhoto,
  visibility
});
const preferencePayload = (d) => ({
  ageMin: Number(d.ageMin) || undefined,
  ageMax: Number(d.ageMax) || undefined,
  heightMin: Number(d.heightMin) || undefined,
  heightMax: Number(d.heightMax) || undefined,
  locations: list(d.locations),
  states: list(d.states),
  countries: list(d.countries),
  educationPreferences: list(d.educationPreferences),
  occupationPreferences: list(d.occupationPreferences),
  dietPreferences: list(d.dietPreferences),
  communityPreferences: list(d.communityPreferences),
  marriageTimeline: list(d.preferredMarriageTimeline),
  additionalPreferences: d.additionalPreferences
});
export default function OnboardingPage() {
  const nav = useNavigate(),
    notify = useToast(),
    { user } = useAuth();
  const [step, setStep] = useState(
      () => Number(localStorage.getItem('ksm_onboarding_step')) || 0
    ),
    [data, setData] = useState(() =>
      JSON.parse(localStorage.getItem('ksm_onboarding') || '{}')
    ),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [otpSent, setOtpSent] = useState(false),
    [otp, setOtp] = useState(''),
    [verified, setVerified] = useState(!!user?.phoneVerified),
    [busy, setBusy] = useState(false),
    [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    Promise.allSettled([api('/profiles/me'), api('/preferences')])
      .then(([p, pref]) => {
        if (p.status === 'fulfilled') {
          const loaded = flatten(p.value.data.profile);
          const existing = localStorage.getItem('ksm_onboarding');
          setData(
            existing
              ? (d) => ({ ...loaded, ...d, phone: d.phone || user?.phone })
              : { ...loaded, phone: user?.phone || '' }
          );
        }
        if (pref.status === 'fulfilled')
          setData((d) => ({
            ...d,
            ...Object.fromEntries(
              Object.entries(pref.value.data.preferences || {}).map(
                ([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v]
              )
            )
          }));
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    localStorage.setItem('ksm_onboarding', JSON.stringify(data));
    localStorage.setItem('ksm_onboarding_step', step);
  }, [data, step]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(
      () => setCooldown((x) => Math.max(0, x - 1)),
      1000
    );
    return () => clearInterval(timer);
  }, [cooldown]);
  const sendOtp = async () => {
    setBusy(true);
    try {
      await api('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: data.phone })
      });
      setOtpSent(true);
      setCooldown(30);
      notify('Verification code sent.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const verify = async () => {
    setBusy(true);
    try {
      await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: data.phone, code: otp })
      });
      setVerified(true);
      notify('Mobile number verified.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file) => {
    setBusy(true);
    try {
      await api('/profiles', {
        method: 'POST',
        body: JSON.stringify(profilePayload(data))
      });
      const body = new FormData();
      body.append('photo', file);
      const r = await api('/profiles/photo', { method: 'POST', body });
      setData((d) => ({ ...d, profilePhoto: r.data.path }));
      notify('Photo uploaded.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const next = async () => {
    if (step === 0 && !data.profileFor)
      return setError('Please choose who this profile is for.');
    if (step === 1 && !verified)
      return setError('Verify the mobile number before continuing.');
    setError('');
    if (step === 7) {
      try {
        await api('/profiles', {
          method: 'POST',
          body: JSON.stringify(profilePayload(data))
        });
        await api('/preferences', {
          method: 'PUT',
          body: JSON.stringify(preferencePayload(data))
        });
      } catch (e) {
        return setError(e.message);
      }
    }
    if (step === 9) {
      setBusy(true);
      try {
        await api('/profiles', {
          method: 'POST',
          body: JSON.stringify(profilePayload(data, 'pending_review'))
        });
        localStorage.removeItem('ksm_onboarding');
        localStorage.removeItem('ksm_onboarding_step');
        notify('Profile submitted for review.');
        nav('/dashboard');
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    setStep(Math.min(9, step + 1));
  };
  if (loading)
    return <div className="app-loading">Preparing your profile…</div>;
  return (
    <div className="onboarding-shell">
      <aside>
        <a href="/">
          KSHATRIYA<small>Matrimonial Society</small>
        </a>
        <div>
          <p className="eyebrow">A thoughtful introduction</p>
          <h1>
            Every family story deserves to be told with <em>care.</em>
          </h1>
        </div>
        <p>Saved privately as you progress.</p>
      </aside>
      <main>
        <header>
          <button
            onClick={() => (step ? setStep(step - 1) : nav('/dashboard'))}
          >
            <ArrowLeft />
          </button>
          <div>
            <span>Step {step + 1} of 10</span>
            <div className="progress">
              <i style={{ width: `${(step + 1) * 10}%` }} />
            </div>
          </div>
          <button className="save-exit" onClick={() => nav('/dashboard')}>
            <Save /> Save & exit
          </button>
        </header>
        <section className="onboarding-form">
          <p className="eyebrow">{steps[step][0]}</p>
          <h2>{steps[step][1]}</h2>
          {step === 0 && (
            <div className="choice-grid">
              {['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative'].map(
                (x) => (
                  <button
                    className={data.profileFor === x ? 'selected' : ''}
                    onClick={() => setData({ ...data, profileFor: x })}
                    key={x}
                  >
                    {x}
                  </button>
                )
              )}
            </div>
          )}
          {step === 1 && (
            <>
              <label>
                Mobile number
                <input
                  value={data.phone || ''}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                />
              </label>
              <button
                disabled={busy || cooldown > 0}
                onClick={sendOtp}
                className="outline-button"
                type="button"
              >
                {cooldown ? `Resend in ${cooldown}s` : 'Send verification code'}
              </button>
              {otpSent && (
                <div className="otp-row">
                  <label>
                    Six-digit code
                    <input
                      inputMode="numeric"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </label>
                  <button
                    disabled={busy || verified}
                    onClick={verify}
                    className="primary-button"
                  >
                    {verified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              )}
            </>
          )}
          {fields[step] && (
            <div className="onboarding-fields">
              {fields[step].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  {key.includes('Description') ||
                  key === 'aboutMe' ||
                  key === 'additionalPreferences' ? (
                    <textarea
                      rows="3"
                      value={data[key] || ''}
                      onChange={(e) =>
                        setData({ ...data, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={type || 'text'}
                      value={data[key] || ''}
                      onChange={(e) =>
                        setData({ ...data, [key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          )}
          {step === 8 && (
            <div className="upload-drop">
              {data.profilePhoto && (
                <img
                  className="upload-preview"
                  src={assetUrl(data.profilePhoto)}
                  alt="Preview"
                />
              )}
              <h3>
                {data.profilePhoto
                  ? 'Replace profile photograph'
                  : 'Add profile photograph'}
              </h3>
              <p>JPG, PNG or WebP. Maximum 5 MB.</p>
              <input
                disabled={busy}
                onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          )}
          {step === 9 && (
            <div className="review-card">
              <h3>
                {data.firstName || 'Your'} {data.lastName || 'profile'}
              </h3>
              <p>
                {data.city || 'Location'} • {data.occupation || 'Profession'}
              </p>
              <dl>
                {[
                  ['Profile for', data.profileFor],
                  ['Education', data.highestEducation],
                  ['Community', data.communityName],
                  ['Family', data.familyType]
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v || 'Not shared'}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Submitting sends this profile to moderation. You can edit it
                later.
              </p>
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <button
            disabled={busy}
            className="primary-button next-button"
            onClick={next}
          >
            {step === 9 ? 'Submit for review' : 'Continue'}
            <ArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}
