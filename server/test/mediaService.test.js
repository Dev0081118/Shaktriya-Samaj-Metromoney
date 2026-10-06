import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectImageType
} from '../src/services/mediaService.js';

test(
  'detectImageType accepts JPEG magic bytes',
  () => {
    const buffer =
      Buffer.from([
        0xff,
        0xd8,
        0xff,
        0xe0,
        0x00,
        0x10,
        0x4a,
        0x46,
        0x49,
        0x46,
        0x00,
        0x01
      ]);

    assert.equal(
      detectImageType(
        buffer
      )?.mime,
      'image/jpeg'
    );
  }
);

test(
  'detectImageType accepts PNG magic bytes',
  () => {
    const buffer =
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x0d
      ]);

    assert.equal(
      detectImageType(
        buffer
      )?.mime,
      'image/png'
    );
  }
);

test(
  'detectImageType accepts WebP magic bytes',
  () => {
    const buffer =
      Buffer.from(
        'RIFF1234WEBP',
        'ascii'
      );

    assert.equal(
      detectImageType(
        buffer
      )?.mime,
      'image/webp'
    );
  }
);

test(
  'detectImageType rejects disguised arbitrary files',
  () => {
    const fake =
      Buffer.from(
        '<script>alert("fake image")</script>'
      );

    assert.equal(
      detectImageType(
        fake
      ),
      null
    );
  }
);