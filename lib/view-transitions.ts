import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function navigate(router: AppRouterInstance, url: string) {
  // Just use regular navigation for now
  // View transitions in SPAs with async routing needs a more complex setup
  router.push(url);
}
