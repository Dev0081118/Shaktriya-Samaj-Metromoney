import test from 'node:test';

import assert from 'node:assert/strict';

import sharp from 'sharp';

import {
  detectImageType,
  optimizeImage,
  cloudinaryThumbnailUrl
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
  'optimizeImage converts uploaded image to WebP',
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

    assert.ok(
      optimized.buffer.length >
        0
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
  'optimizeImage limits large images to maximum 1600px dimensions',
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

    assert.ok(
      metadata.width <=
        1600
    );

    assert.ok(
      metadata.height <=
        1600
    );

    assert.equal(
      metadata.width,
      1600
    );

    assert.equal(
      metadata.height,
      1200
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
  }
);

test(
  'cloudinaryThumbnailUrl creates optimized 400px square delivery URL',
  () => {
    const original =
      'https://res.cloudinary.com/demo/image/upload/v123/kshatriya/profiles/photo.webp';

    const thumbnail =
      cloudinaryThumbnailUrl(
        original
      );

    assert.equal(
      thumbnail,
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,w_400,h_400/v123/kshatriya/profiles/photo.webp'
    );
  }
);