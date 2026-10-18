import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import SuccessStory from '../src/models/SuccessStory.js';

const valid = () => new SuccessStory({
  submittedBy: new mongoose.Types.ObjectId(),
  partnerOneName: 'Member One', partnerTwoName: 'Member Two',
  title: 'Our matrimonial journey',
  story: 'Our families connected respectfully and we took the time to understand our expectations and plans for the future together.',
  submitterConsent: true
});

test('partner consent starts unverified, public publishing is blocked by default', async () => {
  const record = valid();
  await record.validate();
  assert.equal(record.status, 'AwaitingConsent');
  assert.equal(record.partnerConsentStatus, 'NotRequested');
  assert.equal(record.photoConsentVerified, false);
  assert.equal(record.publishedAt, null);
  assert.equal(record.partnerUser, null);
});

test('partner must have distinct account field and consent state is enumerated', async () => {
  const record = valid();
  record.partnerUser = new mongoose.Types.ObjectId();
  record.partnerConsentStatus = 'Pending';
  record.partnerInviteExpiresAt = new Date(Date.now() + 86400000);
  await record.validate();
  record.partnerConsentStatus = 'BadValue';
  await assert.rejects(record.validate(), { name: 'ValidationError' });
});

test('revoked consent status is representable and cannot be mistaken for verified', async () => {
  const record = valid();
  record.status = 'Withdrawn';
  record.partnerConsentStatus = 'Withdrawn';
  await record.validate();
  assert.notEqual(record.partnerConsentStatus, 'Verified');
  assert.equal(record.photoConsentVerified, false);
});
