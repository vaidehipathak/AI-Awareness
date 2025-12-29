/*
 * End-to-end happy-path test for ADMIN 2FA.
 * Prerequisites: backend running at http://localhost:8000 with Django session cookies enabled.
 */

import { totp } from 'otplib';

const BASE_URL = 'http://localhost:8000';

type Json = Record<string, any>;

let cookieHeader = '';

const updateCookies = (response: Response) => {
  const headerApi = (response.headers as any).getSetCookie?.() as string[] | undefined;
  const cookies = headerApi?.length
    ? headerApi
    : response.headers.get('set-cookie')?.split(',') ?? [];

  if (cookies.length) {
    // Keep only name=value pairs; discard attributes
    cookieHeader = cookies
      .map((c) => c.split(';')[0].trim())
      .filter(Boolean)
      .join('; ');
  }
};

const fetchJson = async (
  path: string,
  init: RequestInit & { expectStatus?: number } = {},
): Promise<Json> => {
  const { expectStatus, headers, ...rest } = init;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  updateCookies(response);

  if (expectStatus && response.status !== expectStatus) {
    const body = await response.text();
    throw new Error(`Expected ${expectStatus} but received ${response.status}: ${body}`);
  }

  return response.json();
};

const logStep = (label: string, data?: any) => {
  const output = data ? `${label}: ${JSON.stringify(data, null, 2)}` : label;
  console.log(`\n=== ${label} ===`);
  if (data) console.log(output);
};

(async () => {
  const email = `admin+${Date.now()}@example.com`;
  const password = 'Admin2FA!123';

  // 1) Register admin
  logStep('Register admin');
  const registerData = await fetchJson('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      email,
      username: email.split('@')[0],
      password,
      password2: password,
      role: 'ADMIN',
    }),
    expectStatus: 201,
  });
  logStep('Register response', registerData);

  // 2) Login should require enrollment
  logStep('Login expecting enrollment');
  const login1 = await fetchJson('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    expectStatus: 200,
  });
  if (!login1.requires_enrollment) {
    throw new Error('Expected requires_enrollment on first admin login');
  }

  // 3) Start enrollment (requires password)
  logStep('Start enrollment');
  const enroll = await fetchJson('/auth/otp/enroll/', {
    method: 'POST',
    body: JSON.stringify({ user_id: login1.user_id, email, password }),
    expectStatus: 200,
  });
  if (!enroll.secret || !enroll.device_id) {
    throw new Error('Missing secret or device_id from enrollment response');
  }

  // 4) Confirm enrollment using TOTP
  const totpCode = totp.generate(enroll.secret);
  logStep('Confirm enrollment');
  const confirm = await fetchJson('/auth/otp/confirm-enroll/', {
    method: 'POST',
    body: JSON.stringify({ user_id: login1.user_id, device_id: enroll.device_id, token: totpCode }),
    expectStatus: 200,
  });
  if (!confirm.access) {
    throw new Error('Enrollment confirmation did not return tokens');
  }

  // 5) Login again should require OTP
  logStep('Login expecting OTP step');
  const login2 = await fetchJson('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    expectStatus: 200,
  });
  if (!login2.requires_otp || !login2.temp_token) {
    throw new Error('Expected requires_otp on admin login after enrollment');
  }

  // 6) Verify OTP using same secret
  const otpCode = totp.generate(enroll.secret);
  logStep('Verify OTP');
  const verify = await fetchJson('/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ temp_token: login2.temp_token, otp_token: otpCode }),
    expectStatus: 200,
  });
  if (!verify.access) {
    throw new Error('OTP verification did not return tokens');
  }

  console.log('\n✅ Admin 2FA enrollment + login flow passed');
})().catch((err) => {
  console.error('\n❌ E2E test failed');
  console.error(err);
  process.exit(1);
});
