import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function transitionHelper({
  skipTransition = false,
  updateDOM,
}: {
  skipTransition?: boolean;
  updateDOM: () => Promise<void> | void;
}) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM());
    return {
      ready: Promise.reject(Error('View transitions unsupported')),
      updateCallbackDone,
      finished: updateCallbackDone,
      skipTransition: () => {},
    };
  }

  return document.startViewTransition(updateDOM);
}

export function navigate(router: AppRouterInstance, url: string) {
  transitionHelper({
    updateDOM: () => {
      router.push(url);
    },
  });
}
