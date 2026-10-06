import { ArrowLeft, ArrowRight, Save, LockKeyhole, Plus, Trash2 } from 'lucide-react';
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
  siblingDetails: p.family?.siblingDetails || [],
  ...p.maritalHistory,
  ...p.maternalFamily,
  ...p.paternalFamily,
  hasLand: p.familyAssets?.agricultureLand?.hasLand || false,
  approximateArea: p.familyAssets?.agricultureLand?.approximateArea || '',
  landUnit: p.familyAssets?.agricultureLand?.unit || 'Vigha',
  propertySummary: p.familyAssets?.propertySummary || '',
  primaryResidenceType: p.familyAssets?.primaryResidenceType || '',
  businessAssetsSummary: p.familyAssets?.businessAssetsSummary || '',
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
  maritalHistory: {
    status: d.maritalStatus,
    isRemarriage: d.maritalStatus && d.maritalStatus !== 'Never Married',
    previousMarriageEndedAt: d.previousMarriageEndedAt || undefined,
    divorceFinalized: d.maritalStatus === 'Divorced' ? !!d.divorceFinalized : undefined,
    childrenFromPreviousMarriage: !!d.childrenFromPreviousMarriage,
    childrenCount: d.childrenFromPreviousMarriage ? Number(d.childrenCount) || 0 : 0,
    childrenLivingWith: d.childrenFromPreviousMarriage ? d.childrenLivingWith : undefined,
    notes: d.maritalHistoryNotes
  },
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
    siblingDetails: d.siblingDetails || [],
    familyType: d.familyType,
    familyLocation: d.familyLocation,
    familyDescription: d.familyDescription
  },
  paternalFamily: {
    ancestralVillage: d.ancestralVillage,
    nativePlace: d.paternalNativePlace,
    district: d.paternalDistrict,
    state: d.paternalState,
    familySurname: d.paternalFamilySurname,
    clan: d.paternalClan,
    notes: d.paternalNotes
  },
  maternalFamily: {
    maternalGrandfatherName: d.maternalGrandfatherName,
    maternalFamilySurname: d.maternalFamilySurname,
    maternalNativePlace: d.maternalNativePlace,
    maternalVillage: d.maternalVillage,
    maternalDistrict: d.maternalDistrict,
    maternalState: d.maternalState,
    maternalClan: d.maternalClan,
    notes: d.maternalNotes
  },
  familyAssets: {
    agricultureLand: {
      hasLand: !!d.hasLand,
      approximateArea: d.hasLand ? Number(d.approximateArea) || undefined : undefined,
      unit: d.hasLand ? d.landUnit || 'Vigha' : undefined
    },
    propertySummary: d.propertySummary,
    primaryResidenceType: d.primaryResidenceType,
    businessAssetsSummary: d.businessAssetsSummary
  },
  privacy: {
    familyOverviewVisibility: d.familyOverviewVisibility || 'AcceptedInterests',
    maternalFamilyVisibility: d.maternalFamilyVisibility || 'AcceptedInterests',
    siblingDetailsVisibility: d.siblingDetailsVisibility || 'AcceptedInterests',
    assetVisibility: d.assetVisibility || 'Private'
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
  acceptedMaritalStatuses: list(d.acceptedMaritalStatuses),
  willingForRemarriage: d.willingForRemarriage || 'Open to Discuss',
  additionalPreferences: d.additionalPreferences
});
const profileBasicsError = (data) => {
  if (!data.firstName?.trim()) return 'Enter the first name before continuing.';
  if (!['Male', 'Female'].includes(data.gender))
    return 'Select a gender before continuing.';
  if (!data.dateOfBirth) return 'Enter the date of birth before continuing.';
  const birth = new Date(data.dateOfBirth),
    age = (Date.now() - birth.getTime()) / (365.25 * 864e5);
  return !Number.isFinite(age) || age < 18 || age > 80
    ? 'Age must be between 18 and 80 years.'
    : '';
};
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
  const updateSibling = (index, key, value) => setData((current) => ({
    ...current,
    siblingDetails: (current.siblingDetails || []).map((sibling, i) => i === index ? { ...sibling, [key]: value } : sibling)
  }));
  useEffect(() => {
    Promise.allSettled([
      api('/profiles/me?optional=true'),
      api('/preferences?optional=true')
    ])
      .then(([p, pref]) => {
        if (p.status === 'fulfilled' && p.value.data.profile) {
          const loaded = flatten(p.value.data.profile);
          const existing = localStorage.getItem('ksm_onboarding');
          setData(
            existing
              ? (d) => ({ ...loaded, ...d, phone: d.phone || user?.phone })
              : { ...loaded, phone: user?.phone || '' }
          );
        }
        if (pref.status === 'fulfilled' && pref.value.data.preferences)
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
    const basicsError = profileBasicsError(data);
    if (basicsError) {
      setStep(2);
      setError(basicsError);
      return;
    }
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
    if (step === 2 || step >= 7) {
      const basicsError = profileBasicsError(data);
      if (basicsError) {
        if (step > 2) setStep(2);
        return setError(basicsError);
      }
    }
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
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ivory)] font-['Cormorant_Garamond'] text-[28px] text-[var(--wine)]">
        Preparing your profile…
      </div>
    );
  }
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
                  ) : key === 'gender' ? (
                    <select
                      value={data[key] || ''}
                      onChange={(e) =>
                        setData({ ...data, [key]: e.target.value })
                      }
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : key === 'maritalStatus' ? (
                    <select value={data[key] || ''} onChange={(e) => setData({ ...data, [key]: e.target.value })}>
                      <option value="">Select marital status</option>
                      {['Never Married', 'Divorced', 'Widowed', 'Annulled', 'Separated'].map((status) => <option key={status}>{status}</option>)}
                    </select>
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
          {step === 2 && data.maritalStatus && data.maritalStatus !== 'Never Married' && (
            <div className="sensitive-panel">
              <p className="privacy-cue"><LockKeyhole size={15} /> Private context — shown only after an accepted introduction.</p>
              <div className="onboarding-fields">
                <label>Previous marriage ended on (optional)<input type="date" value={data.previousMarriageEndedAt || ''} onChange={(e) => setData({ ...data, previousMarriageEndedAt: e.target.value })} /></label>
                {data.maritalStatus === 'Divorced' && <label className="checkbox-label"><input type="checkbox" checked={!!data.divorceFinalized} onChange={(e) => setData({ ...data, divorceFinalized: e.target.checked })} /> Divorce legally finalized</label>}
                <label className="checkbox-label"><input type="checkbox" checked={!!data.childrenFromPreviousMarriage} onChange={(e) => setData({ ...data, childrenFromPreviousMarriage: e.target.checked })} /> Children from previous marriage</label>
                {data.childrenFromPreviousMarriage && <><label>Number of children<input type="number" min="0" max="20" value={data.childrenCount || ''} onChange={(e) => setData({ ...data, childrenCount: e.target.value })} /></label><label>Children living with<input value={data.childrenLivingWith || ''} onChange={(e) => setData({ ...data, childrenLivingWith: e.target.value })} /></label></>}
              </div>
              {data.maritalStatus === 'Separated' && <p className="form-note">Separated is distinct from legally divorced. This profile will retain that status clearly.</p>}
            </div>
          )}
          {step === 5 && (
            <div className="family-context-stack">
              <div className="sensitive-panel"><p className="privacy-cue"><LockKeyhole size={15} /> Maternal family — private by default</p><div className="onboarding-fields">
                {['maternalGrandfatherName','maternalFamilySurname','maternalNativePlace','maternalVillage','maternalDistrict','maternalState','maternalClan'].map((key) => <label key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (x) => x.toUpperCase())}<input value={data[key] || ''} onChange={(e) => setData({ ...data, [key]: e.target.value })} /></label>)}
              </div></div>
              <div className="sensitive-panel"><div className="panel-heading"><div><h3>Sibling context</h3><p>Optional. Spouse-family details appear only for married siblings.</p></div><button type="button" className="outline-button" onClick={() => setData({ ...data, siblingDetails: [...(data.siblingDetails || []), { relation: 'Brother', maritalStatus: 'Unmarried' }] })}><Plus size={15}/> Add sibling</button></div>
                {(data.siblingDetails || []).map((sibling, index) => <div className="sibling-editor" key={index}><div className="onboarding-fields"><label>Relation<select value={sibling.relation || ''} onChange={(e) => updateSibling(index, 'relation', e.target.value)}><option>Brother</option><option>Sister</option></select></label><label>Name<input value={sibling.name || ''} onChange={(e) => updateSibling(index, 'name', e.target.value)} /></label><label>Marital status<select value={sibling.maritalStatus || ''} onChange={(e) => updateSibling(index, 'maritalStatus', e.target.value)}><option>Unmarried</option><option>Married</option></select></label><label>Occupation<input value={sibling.occupation || ''} onChange={(e) => updateSibling(index, 'occupation', e.target.value)} /></label>{sibling.maritalStatus === 'Married' && <><label>Spouse name<input value={sibling.spouseName || ''} onChange={(e) => updateSibling(index, 'spouseName', e.target.value)} /></label><label>Spouse family surname<input value={sibling.spouseFamilySurname || ''} onChange={(e) => updateSibling(index, 'spouseFamilySurname', e.target.value)} /></label><label>Spouse native place<input value={sibling.spouseNativePlace || ''} onChange={(e) => updateSibling(index, 'spouseNativePlace', e.target.value)} /></label></>}</div><button type="button" className="icon-action" aria-label="Remove sibling" onClick={() => setData({ ...data, siblingDetails: data.siblingDetails.filter((_, i) => i !== index) })}><Trash2 size={16}/></button></div>)}
              </div>
              <div className="sensitive-panel"><p className="privacy-cue"><LockKeyhole size={15} /> Family assets — optional and never public</p><label className="checkbox-label"><input type="checkbox" checked={!!data.hasLand} onChange={(e) => setData({ ...data, hasLand: e.target.checked })}/> Family has agricultural land</label>{data.hasLand && <div className="onboarding-fields"><label>Approximate area<input type="number" min="0" value={data.approximateArea || ''} onChange={(e) => setData({ ...data, approximateArea: e.target.value })}/></label><label>Unit<select value={data.landUnit || 'Vigha'} onChange={(e) => setData({ ...data, landUnit: e.target.value })}><option>Vigha</option><option>Acre</option><option>Hectare</option></select></label></div>}<div className="onboarding-fields"><label>Property summary (no exact address)<textarea rows="2" value={data.propertySummary || ''} onChange={(e) => setData({ ...data, propertySummary: e.target.value })}/></label><label>Primary residence type<input value={data.primaryResidenceType || ''} onChange={(e) => setData({ ...data, primaryResidenceType: e.target.value })}/></label></div></div>
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
