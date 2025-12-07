'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentProps, MouseEvent } from 'react';

type TransitionLinkProps = ComponentProps<typeof Link>;

export default function TransitionLink({ href, children, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const url = href.toString();

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      router.push(url);
      return;
    }

    // Start view transition
    document.startViewTransition(() => {
      router.push(url);
    });
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
