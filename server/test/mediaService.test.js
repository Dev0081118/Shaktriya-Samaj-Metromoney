import test from 'node:test';
import assert from 'node:assert/strict';

import sharp from 'sharp';

import {
  detectImageType,
  optimizeImage
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

test(
  'optimizeImage converts uploaded JPEG to WebP',
  async () => {
    const source =
      await sharp({
        create: {
          width:
            800,

          height:
            600,

          channels:
            3,

          background: {
            r:
              180,

            g:
              120,

            b:
              90
          }
        }
      })
        .jpeg({
          quality:
            95
        })
        .toBuffer();

    const optimized =
      await optimizeImage(
        source
      );

    assert.equal(
      optimized.mime,
      'image/webp'
    );

    assert.equal(
      optimized.extension,
      '.webp'
    );

    assert.equal(
      optimized.width,
      800
    );

    assert.equal(
      optimized.height,
      600
    );

    assert.ok(
      optimized.buffer
        .length >
        0
    );

    assert.equal(
      optimized.bytes,
      optimized.buffer
        .length
    );

    const metadata =
      await sharp(
        optimized.buffer
      ).metadata();

    assert.equal(
      metadata.format,
      'webp'
    );

    assert.equal(
      metadata.width,
      800
    );

    assert.equal(
      metadata.height,
      600
    );
  }
);

test(
  'optimizeImage limits large images to 1600px maximum dimensions',
  async () => {
    const source =
      await sharp({
        create: {
          width:
            3200,

          height:
            2400,

          channels:
            3,

          background: {
            r:
              110,

            g:
              90,

            b:
              70
          }
        }
      })
        .jpeg()
        .toBuffer();

    const optimized =
      await optimizeImage(
        source
      );

    const metadata =
      await sharp(
        optimized.buffer
      ).metadata();

    assert.equal(
      metadata.format,
      'webp'
    );

    assert.equal(
      metadata.width,
      1600
    );

    assert.equal(
      metadata.height,
      1200
    );

    assert.ok(
      metadata.width <=
        1600
    );

    assert.ok(
      metadata.height <=
        1600
    );
  }
);

test(
  'optimizeImage does not enlarge smaller images',
  async () => {
    const source =
      await sharp({
        create: {
          width:
            500,

          height:
            400,

          channels:
            3,

          background: {
            r:
              100,

            g:
              100,

            b:
              100
          }
        }
      })
        .png()
        .toBuffer();

    const optimized =
      await optimizeImage(
        source
      );

    const metadata =
      await sharp(
        optimized.buffer
      ).metadata();

    assert.equal(
      metadata.width,
      500
    );

    assert.equal(
      metadata.height,
      400
    );

    assert.equal(
      metadata.format,
      'webp'
    );
  }
);

test(
  'optimizeImage rejects non-image buffers',
  async () => {
    const fake =
      Buffer.from(
        'this is not an image'
      );

    await assert.rejects(
      () =>
        optimizeImage(
          fake
        ),
      (
        error
      ) => {
        assert.equal(
          error.statusCode ||
            error.status,
          400
        );

        return true;
      }
    );
  }
);