import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white bg-opacity-80 shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 w-full z-10 backdrop-blur-sm">
      <Link href="/" className="text-2xl font-bold text-gray-800">
        Jules Wellness
      </Link>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link href="/mood-tracker" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
              Mood Tracker
            </Link>
          </li>
          <li>
            <Link href="/therapists" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
              Therapists
            </Link>
          </li>
          <li>
            <Link href="/meditation-journaling" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
              Meditation & Journaling
            </Link>
          </li>
          <li>
            <Link href="/community" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
              Community
            </Link>
          </li>
          <li>
            <Link href="/crisis-support" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
              Crisis Support
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
