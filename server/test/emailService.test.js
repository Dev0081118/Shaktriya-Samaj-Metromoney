import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderEmailHtml
} from '../src/services/emailService.js';

test(
  'email HTML escapes untrusted template data',
  () => {
    const html =
      renderEmailHtml(
        'welcome',
        {
          name:
            '<script>alert("xss")</script>'
        }
      );

    assert.equal(
      html.includes(
        '<script>alert("xss")</script>'
      ),
      false
    );

    assert.equal(
      html.includes(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      ),
      true
    );
  }
);

test(
  'password reset template keeps the reset code',
  () => {
    const html =
      renderEmailHtml(
        'password-reset',
        {
          code:
            '123456',

          expiresIn:
            '15 minutes'
        }
      );

    assert.equal(
      html.includes(
        '123456'
      ),
      true
    );
  }
);

test(
  'sensitive template fields are not rendered into email HTML',
  () => {
    const html =
      renderEmailHtml(
        'welcome',
        {
          name:
            'Member',

          password:
            'SecretPassword123!',

          authorization:
            'Bearer hidden-value',

          token:
            'hidden-token'
        }
      );

    assert.equal(
      html.includes(
        'SecretPassword123!'
      ),
      false
    );

    assert.equal(
      html.includes(
        'Bearer hidden-value'
      ),
      false
    );

    assert.equal(
      html.includes(
        'hidden-token'
      ),
      false
    );

    assert.equal(
      html.includes(
        'Member'
      ),
      true
    );
  }
);