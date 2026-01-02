"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fredoka } from "@/utils/fonts";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { signInWithEmail, signUpWithEmail } from "../actions/auth";
import { Background } from "../../components/Background";
import { useAuthStoreMethods } from "../../store/auth";

interface AuthFormValues {
  username?: string;
  email: string;
  password: string;
  retypePassword?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuthStoreMethods();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is empty"),
    password: Yup.string()
      .min(8, "Minimum 8 characters")
      .required("Password is empty"),
  });

  const registerSchema = Yup.object({
    username: Yup.string().min(3, "Minimum 3 characters").required("Required"),
    email: Yup.string().email("Invalid email").required("Email is empty"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is empty"),
    retypePassword: Yup.string()
      .required("Please retype your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const handleSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    setFormError("");

    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        await register(values.username!, values.email, values.password);
      }

      router.push("/menu");
      // Redirect or update UI after successful login/register
    } catch (err: any) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${fredoka.className} relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-gray-900`}
    >
      {/* <div className="absolute inset-0 z-0">
        <Image
          src={"/gronscape-hero.jpg"}
          alt="University of Groningen Campus"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div> */}

      <Background />

      <div className="relative z-10 flex flex-col w-full max-w-2xl p-2 overflow-hidden border shadow-2xl bg-black/60 backdrop-blur-md rounded-3xl border-white/20 md:flex-row">
        <div className="flex flex-col justify-center flex-1 px-8 py-8 md:px-12">
          <h1
            className={`text-3xl md:text-4xl font-bold text-white text-center mb-10`}
          >
            {isLogin ? "Login to GroGuesser" : "Register to GroGuesser"}
          </h1>

          {formError && (
            <div className="p-3 mb-4 text-red-500 bg-red-100 rounded">
              {formError}
            </div>
          )}

          <Formik<AuthFormValues>
            initialValues={{
              username: "",
              email: "",
              password: "",
              retypePassword: "",
            }}
            validationSchema={isLogin ? loginSchema : registerSchema}
            onSubmit={handleSubmit}
            validateOnChange={false} // disables live validation while typing
            validateOnBlur={false}
          >
            {({ values, isSubmitting }) => (
              <Form className="flex flex-col w-full gap-5" noValidate>
                {/* Username - only for registration */}
                {!isLogin && (
                  <div className="flex flex-col w-full gap-1">
                    <label htmlFor="username" className="text-sm text-white">
                      Username
                    </label>
                    <Field
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      disabled={loading}
                      className="w-full p-4 text-white border rounded-xl bg-white/10 placeholder-white/60 border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="username"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="flex flex-col w-full gap-1">
                  <label htmlFor="email" className="text-sm text-white">
                    Email
                  </label>
                  <Field
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    disabled={loading}
                    className="w-full p-4 text-white border rounded-xl bg-white/10 placeholder-white/60 border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col w-full gap-1">
                  <label htmlFor="password" className="text-sm text-white">
                    Password
                  </label>
                  <Field
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full p-4 text-white border rounded-xl bg-white/10 placeholder-white/60 border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Retype Password - only for registration */}
                {!isLogin && (
                  <div className="flex flex-col w-full gap-1">
                    <label
                      htmlFor="retypePassword"
                      className="text-sm text-white"
                    >
                      Retype Password
                    </label>
                    <Field
                      id="retypePassword"
                      type="password"
                      name="retypePassword"
                      placeholder="Retype your password"
                      disabled={loading}
                      className="w-full p-4 text-white border rounded-xl bg-white/10 placeholder-white/60 border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="retypePassword"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full px-8 py-4 text-lg font-bold text-white transition-transform duration-300 shadow-lg rounded-2xl bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 hover:scale-[101%] disabled:opacity-50 flex items-center justify-center"
                >
                  {loading && (
                    <svg
                      className="w-5 h-5 mr-2 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  <span className="relative z-10">
                    {loading
                      ? isLogin
                        ? "Logging in..."
                        : "Registering..."
                      : isLogin
                      ? "Login"
                      : "Register"}
                  </span>
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-white/70">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="font-semibold text-purple-400 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <svg
            className="w-16 h-16 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}
