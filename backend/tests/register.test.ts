import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  duration: "30s",

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const unique = `${__VU}-${__ITER}-${Date.now()}`;

  const payload = JSON.stringify({
    fullName: `Test`,
    email: `user${unique}@test.com`,
    password: "Test@12345",
    acceptTerms: true,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(
    "http://localhost:5000/api/auth/register",
    payload,
    params,
  );

  check(res, {
    "status is 202": (r) => r.status === 202,
  });

  sleep(1);
}
