import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  iterations: 100,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

const users = Array.from({ length: 100 }, (_, i) => ({
  email: `user${i + 1}@test.com`,
  otp: "123456",
}));

export default function () {
  const user = users[__VU - 1];

  const payload = JSON.stringify({
    email: user.email,
    otp: user.otp,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(
    "http://localhost:5000/api/auth/verify-otp",
    payload,
    params,
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
