import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Authentication System</h1>
      <p className="mt-2 text-sm text-gray-500">
        Securely register, verify your email, and sign in to your account.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/register"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
