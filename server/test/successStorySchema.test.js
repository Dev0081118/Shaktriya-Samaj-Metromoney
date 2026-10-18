import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import SuccessStory from '../src/models/SuccessStory.js';

const valid = () => new SuccessStory({
  submittedBy: new mongoose.Types.ObjectId(),
  partnerOneName: 'Example One', partnerTwoName: 'Example Two',
  title: 'A genuine family introduction',
  story: 'We met through the platform and took our time getting to know each other. Our families discussed our values, and we made a thoughtful decision together.',
  submitterConsent: true
});

test('new story cannot start published or partner-verified by default', () => {
  const s = valid();
  assert.equal(s.validateSync(), undefined);
  assert.equal(s.status, 'AwaitingConsent');
  assert.equal(s.partnerConsentStatus, 'NotRequested');
  assert.equal(s.photoConsentVerified, false);
  assert.equal(s.publishedAt, null);
});

test('story requires submission account and sufficient narrative', () => {
  const s = valid();
  s.submittedBy = undefined;
  s.story = 'Too short';
  const error = s.validateSync();
  assert.ok(error.errors.submittedBy);
  assert.ok(error.errors.story);
});
