import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { resolveOldUrl } from "@/utils/redirects";

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = resolveOldUrl(location.pathname);
    if (redirect) {
      navigate(redirect, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found.</p>
      <Link to="/" className="mt-6 inline-block text-sm font-medium hover:underline">
        Go home
      </Link>
    </div>
  );
}
