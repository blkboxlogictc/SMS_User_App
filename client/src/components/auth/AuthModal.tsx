import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
  defaultUserType?: "patron" | "business";
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "signin",
  defaultUserType = "patron",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [userType, setUserType] = useState<"patron" | "business">(
    defaultUserType
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [resendingEmail, setResendingEmail] = useState(false);

  const { signIn, signUp, resendVerificationEmail } = useAuth();

  // Reset form state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setUserType(defaultUserType);
      setError(null);
      setCreatedUserId(null);
      setShowVerificationMessage(false);
      setUserEmail("");
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      });
    }
  }, [isOpen, defaultMode, defaultUserType]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        // Sign up - Create account only (business info collected later)
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: userType,
        };

        console.log("Starting signup process for:", {
          email: formData.email,
          role: userType,
        });

        const { user, error } = await signUp(
          formData.email,
          formData.password,
          userData
        );

        if (error) {
          console.error("Signup error details:", error);
          setError(`Signup failed: ${error.message}`);
        } else if (user) {
          console.log("Signup successful:", user);
          setCreatedUserId(user.id);
          setUserEmail(formData.email);

          // Check if user needs email verification
          if (!user.email_confirmed_at) {
            setShowVerificationMessage(true);
          } else {
            // Both patron and business signup complete here
            // Business info will be added later via account page
            onClose();
          }
        }
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (mode === "signin") return "Sign In";
    return "Create Account";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getModalTitle()}
              </h2>
              {mode === "signup" && userType === "business" && (
                <p className="text-sm text-gray-600 mt-1">
                  You can add your business information after creating your
                  account
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Email Verification Message */}
          {showVerificationMessage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Check Your Email
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      We've sent a verification link to{" "}
                      <strong>{userEmail}</strong>. Please check your email and
                      click the verification link to activate your account.
                    </p>
                    <p className="mt-2">
                      Don't see the email? Check your spam folder or{" "}
                      <button
                        onClick={async () => {
                          if (resendingEmail) return;

                          setResendingEmail(true);
                          try {
                            const { error } = await resendVerificationEmail(
                              userEmail
                            );
                            if (error) {
                              setError("Failed to resend verification email");
                            } else {
                              setError(null);
                              // Could add a success message here
                            }
                          } catch (err) {
                            setError("Failed to resend verification email");
                          } finally {
                            setResendingEmail(false);
                          }
                        }}
                        disabled={resendingEmail}
                        className="underline hover:no-underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendingEmail ? "sending..." : "click here to resend"}
                      </button>
                      .
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={onClose}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Creation/Sign In Form */}
          {!showVerificationMessage && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          value="patron"
                          checked={userType === "patron"}
                          onChange={(e) =>
                            setUserType(e.target.value as "patron" | "business")
                          }
                          className="mr-2"
                        />
                        Patron
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          value="business"
                          checked={userType === "business"}
                          onChange={(e) =>
                            setUserType(e.target.value as "patron" | "business")
                          }
                          className="mr-2"
                        />
                        Business Owner
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>
          )}

          {/* Sign in/Sign up toggle */}
          {!showVerificationMessage && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-blue-600 hover:text-blue-800"
              >
                {mode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
