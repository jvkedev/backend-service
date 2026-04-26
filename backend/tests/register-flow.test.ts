import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const registerTrend = new Trend("register_duration");
const verifyTrend = new Trend("verify_duration");

export const options = {
  vus: 100,
  iterations: 100,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
    register_duration: ["p(95)<2000"],
    verify_duration: ["p(95)<1000"],
  },
};

export default function () {
  const unique = `${__VU}-${__ITER}-${Date.now()}`;
  const email = `user${unique}@test.com`;
  const password = "Test@123";

  const headers = {
    "Content-Type": "application/json",
  };

  const registerRes = http.post(
    "http://localhost:5000/api/auth/register",
    JSON.stringify({
      fullName: "Test User",
      email,
      password,
      acceptTerms: true,
    }),
    { headers },
  );

  registerTrend.add(registerRes.timings.duration);

  check(registerRes, {
    "register ok": (r) => [200, 201, 202].includes(r.status),
  });

  sleep(0.5);

  const verifyRes = http.post(
    "http://localhost:5000/api/auth/verify-otp",
    JSON.stringify({
      email,
      otp: "123456",
    }),
    { headers },
  );

  verifyTrend.add(verifyRes.timings.duration);

  check(verifyRes, {
    "verify ok": (r) => r.status === 200,
  });

  if (registerRes.status >= 400) {
    console.log(
      `REGISTER FAIL | ${email} | ${registerRes.status} | ${registerRes.body}`,
    );
  }

  if (verifyRes.status >= 400) {
    console.log(
      `VERIFY FAIL | ${email} | ${verifyRes.status} | ${verifyRes.body}`,
    );
  }

  sleep(1);
}
