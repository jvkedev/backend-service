// tests/login.test.ts

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  duration: "30s",

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  const payload = JSON.stringify({
    email: "jvkedev@gmail.com",
    password: "Billie@182001",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(
    "http://localhost:5000/api/auth/login",
    payload,
    params,
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "token exists": (r) => Boolean(r.json("token")),
    "user exists": (r) => Boolean(r.json("user")),
  });

  sleep(1);
}
