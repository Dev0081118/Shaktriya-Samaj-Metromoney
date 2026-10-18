import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const controller = fs.readFileSync(new URL('../src/controllers/successStoryController.js', import.meta.url), 'utf8');
const routes = fs.readFileSync(new URL('../src/routes/successStoryRoutes.js', import.meta.url), 'utf8');

test('moderation write endpoint is restricted to admins', () => {
  assert.match(routes, /\/admin\/success-stories\/:id', protect, permit\('admin', 'super_admin'\), adminModerateSuccessStory/);
});
test('approval demands independently verified partner consent', () => {
  const handler = controller.slice(controller.indexOf('export const adminModerateSuccessStory'));
  assert.match(handler, /'PendingReview'/);
  assert.match(handler, /partnerConsentStatus: 'Verified'/);
  assert.match(handler, /partnerConsentVerifiedAt: \{ \$ne: null \}/);
  assert.match(handler, /\$expr: \{ \$ne: \['\$submittedBy', '\$partnerUser'\] \}/);
});
test('public API filters approved and verified submissions without exposing photos', () => {
  const handler = controller.slice(controller.indexOf('export const publicApprovedSuccessStories'));
  assert.match(handler, /status: 'Approved'/);
  assert.match(handler, /partnerConsentWithdrawnAt: null/);
  const selected = handler.match(/\.select\('([^']+)'\)/)?.[1];
  assert.ok(selected);
  assert.doesNotMatch(selected, /photo|partnerUser|submittedBy|email/i);
});
