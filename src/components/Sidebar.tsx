import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Sidebar() {
  const { user, isLoading } = useUser();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-4">EmpiFi</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/simulator" className="hover:underline">
              Future Scenarios
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/investment-map" className="hover:underline">
              Investment Map
            </Link>
          </li>
          <li className="mt-8 pt-4 border-t border-gray-700">
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : user ? (
              <>
                <div className="mb-2">
                  <span className="text-sm text-gray-400">
                    Signed in as {user.email}
                  </span>
                </div>
                <Link
                  href="/api/auth/logout"
                  className="text-red-400 hover:text-red-300"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <Link
                href="/api/auth/login"
                className="text-green-400 hover:text-green-300"
              >
                Sign In
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}
