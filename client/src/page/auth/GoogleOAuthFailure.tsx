import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader, CheckCircle, XCircle } from "lucide-react";

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    // If no status parameter, this might be a successful redirect from backend
    // The backend should have already redirected to the workspace
    if (!status) {
      // Wait a moment and redirect to sign-in if we're still here
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  if (!status) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <Logo />
            WONDER BOARD
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Processing...</h1>
              <p className="text-muted-foreground">
                Completing your Google sign-in...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <Logo />
            WONDER BOARD
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">
                Authentication Failed
              </h1>
              <p className="text-muted-foreground mb-4">
                We couldn't sign you in with Google. Please try again.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success case (though this should rarely be seen due to backend redirect)
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          WONDER BOARD
        </Link>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Success!</h1>
            <p className="text-muted-foreground mb-4">
              You've been signed in successfully. Redirecting...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleOAuthCallback;
