import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Notification } from '../src/models/Platform.js';
import { notifications, readNotification } from '../src/controllers/interactionController.js';

const user = new mongoose.Types.ObjectId();
const otherUser = new mongoose.Types.ObjectId();
const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const call = async (handler, req) => {
  const res = response();
  let caught;
  await handler(req, res, (error) => { caught = error; });
  if (caught) throw caught;
  return res.body;
};

test('unread summary groups only current user notifications, independent of recent 50', async () => {
  const beforeFind = Notification.find;
  const beforeCount = Notification.countDocuments;
  const beforeAggregate = Notification.aggregate;
  const captured = {};
  Notification.find = (filter) => {
    captured.find = filter;
    return { sort: () => ({ limit: (limit) => { captured.limit = limit; return Promise.resolve([]); } }) };
  };
  Notification.countDocuments = async (filter) => { captured.count = filter; return 101; };
  Notification.aggregate = async (pipeline) => {
    captured.pipeline = pipeline;
    return [{ _id: 'NEW_INTEREST', count: 75 }, { _id: 'NEW_MATCH', count: 26 }];
  };
  try {
    const body = await call(notifications, { user: { id: String(user) } });
    assert.equal(body.data.unreadCount, 101);
    assert.deepEqual(body.data.unreadByType, { NEW_INTEREST: 75, NEW_MATCH: 26 });
    assert.equal(captured.limit, 50);
    assert.equal(String(captured.pipeline[0].$match.user), String(user));
    assert.equal(captured.pipeline[0].$match.read, false);
    assert.equal(captured.count.read, false);
    assert.equal(String(captured.find.user), String(user));
    assert.notEqual(String(captured.pipeline[0].$match.user), String(otherUser));
  } finally {
    Notification.find = beforeFind;
    Notification.countDocuments = beforeCount;
    Notification.aggregate = beforeAggregate;
  }
});

test('bulk unread category read is filtered to authenticated user and one notification type', async () => {
  const previous = Notification.updateMany;
  const received = [];
  Notification.updateMany = async (selector, update) => { received.push([selector, update]); return { modifiedCount: 2 }; };
  try {
    for (const [id, type] of [['category-interests', 'NEW_INTEREST'], ['category-matches', 'NEW_MATCH']]) {
      const body = await call(readNotification, { params: { id }, user: { id: String(user) } });
      assert.equal(body.success, true);
      const [selector, update] = received.at(-1);
      assert.deepEqual(selector, { user: String(user), read: false, type });
      assert.deepEqual(update, { $set: { read: true } });
    }
  } finally { Notification.updateMany = previous; }
});

test('mark all read is restricted to authenticated user', async () => {
  const previous = Notification.updateMany;
  let selector;
  Notification.updateMany = async (query) => { selector = query; return { modifiedCount: 2 }; };
  try {
    await call(readNotification, { params: { id: 'all' }, user: { id: String(user) } });
    assert.deepEqual(selector, { user: String(user), read: false });
  } finally { Notification.updateMany = previous; }
});

test('invalid notification id does not update any record', async () => {
  const previous = Notification.updateMany;
  let called = false;
  Notification.updateMany = async () => { called = true; };
  try {
    await assert.rejects(call(readNotification, { params: { id: 'not-an-id' }, user: { id: String(user) } }), /Invalid record ID/);
    assert.equal(called, false);
  } finally { Notification.updateMany = previous; }
});
