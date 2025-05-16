import Link from 'next/link';

interface LogoProps {
  showLogo?: boolean;
  showLabel?: boolean;
  alwaysShowLabel?: boolean;
  onClick?: () => void;
}

export default function Logo({
  // showLogo = true,
  showLabel = true,
  alwaysShowLabel = false,
  onClick,
}: LogoProps) {
  const label = 'Smart Agri';

  return (
    <Link
      href="/onboarding?nextUrl=/&withWorkspace=true"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      {showLabel && (
        <div
          className={`text-xl font-semibold text-black transition duration-200 dark:text-white ${
            alwaysShowLabel ||
            'group-hover:static group-hover:translate-x-0 group-hover:opacity-100 md:-translate-x-2 md:opacity-0'
          }`}
        >
          {label}
        </div>
      )}
    </Link>
  );
}
