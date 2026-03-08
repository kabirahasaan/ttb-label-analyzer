'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect route for /applications
 * This route handles requests to the legacy /applications path
 * and redirects them to the actual application management page at /application-form
 *
 * Note: /applications is a backend API endpoint (GET /api/applications)
 * This frontend route ensures users who access /applications are redirected
 * to the correct application management interface.
 */
export default function ApplicationsRedirect(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Redirect to application-form which has the full application management UI
    router.replace('/application-form');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Application Form...</p>
      </div>
    </div>
  );
}
