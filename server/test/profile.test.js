import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAge,
  evaluatePreferences,
  calculateCompatibility
} from '../src/utils/profile.js';
import MatrimonialProfile from '../src/models/MatrimonialProfile.js';
test('calculateAge handles a valid adult date', () => {
  const year = new Date().getFullYear() - 30;
  const age = calculateAge(new Date(year, 0, 1));
  assert.ok(age === 29 || age === 30);
});
test('preferences reject incompatible gender-neutral profile attributes', () => {
  const result = evaluatePreferences(
    { ageMin: 25, ageMax: 30, states: ['Gujarat'] },
    {
      dateOfBirth: new Date(new Date().getFullYear() - 40, 0, 1),
      location: { state: 'Rajasthan' }
    }
  );
  assert.ok(result.unmatchedFactors.includes('Preferred age range'));
  assert.ok(result.unmatchedFactors.includes('Location preference'));
});
test('compatibility is symmetric average', () => {
  const a = {
      dateOfBirth: new Date(1995, 0, 1),
      height: 175,
      location: { state: 'Gujarat' }
    },
    b = {
      dateOfBirth: new Date(1997, 0, 1),
      height: 165,
      location: { state: 'Gujarat' }
    };
  const result = calculateCompatibility(a, { states: ['Gujarat'] }, b, {
    states: ['Gujarat']
  });
  assert.equal(result.score, 100);
});
test('remarriage compatibility respects accepted marital statuses', () => {
  const accepted = evaluatePreferences(
    { acceptedMaritalStatuses: ['Divorced', 'Widowed'] },
    { maritalStatus: 'Divorced' }
  );
  const excluded = evaluatePreferences(
    { acceptedMaritalStatuses: ['Never Married'] },
    { maritalStatus: 'Divorced' }
  );
  assert.ok(accepted.matchedFactors.includes('Marital status'));
  assert.ok(excluded.unmatchedFactors.includes('Marital status'));
});
test('profile schema validates bounded structured family data', () => {
  const valid = new MatrimonialProfile({
    userId: '507f1f77bcf86cd799439011', profileFor: 'Self', firstName: 'A',
    maritalStatus: 'Widowed',
    maritalHistory: { status: 'Widowed', childrenCount: 1 },
    family: { siblingDetails: [{ relation: 'Sister', gender: 'Female', maritalStatus: 'Married' }] },
    familyAssets: { agricultureLand: { hasLand: true, approximateArea: 4, unit: 'Acre' } }
  });
  assert.equal(valid.validateSync(), undefined);
  valid.familyAssets.agricultureLand.unit = 'Square Feet';
  assert.ok(valid.validateSync().errors['familyAssets.agricultureLand.unit']);
});
