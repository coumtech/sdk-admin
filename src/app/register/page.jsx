"use client"
import Link from 'next/link'
import Image from "next/image";
import MusicLogo from "@/app/assets/images/MusicLogo.png"
import { useGoogleLogin } from "@react-oauth/google";
import { socialSignup, registerUser } from "@/services/authService";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from 'next/navigation';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), ''], "Passwords must match")
        .required("Confirm Password is required"),
});

function Signup() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const referralId = searchParams.get('ref');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data) => {
        data.referralId = parseInt(referralId);
        registerUser(data).then(() => {
            router.push('/profile-completion')
        })
    };

    const facebookLogin = (response) => {
        const token = response?.accessToken;
        if (token) {
            socialSignup({ provider: 'facebook', token }).then(() => {
                router.push(redirectTo)
            })
        } else {
            console.log('Login Failed:');
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: (response) => {
            const token = response.access_token;
            socialSignup({ provider: 'google', token }).then(() => {
                router.push('/profile-completion')
            })
        },
        onError: (error) => {
            console.log('Login Failed:', error);
        },
    });
    return (
        <section className="Sign-Up-Section">
            <div className="flex flex-col flex-auto flex-shrink-0 antialiased ">
                <div className="flex justify-center items-center">
                    <div className="text-center">
                        <div className="Music-login-page-logo ">
                            <Image src={MusicLogo} alt="MusicLogo" className="mt-20" />
                        </div>
                        <div className="mt-5 Login-music-font text-center ">
                            <p className="pt-5">
                                Sign Up
                            </p>
                        </div>
                        <form className="w-full max-w-md mt-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4 items-center">
                                <i className="text-gray-500 mr-2"></i>
                                <input
                                    type="text"
                                    {...register("email")}
                                    placeholder="Your email address"
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.email ? 'border-red-500' : ''}`}
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>

                            <div className="mb-4 items-center">
                                <i className="text-gray-500 mr-2"></i>
                                <input
                                    type="password"
                                    {...register("password")}
                                    placeholder="Password"
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.password ? 'border-red-500' : ''}`}
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            </div>

                            <div className="mb-4 items-center">
                                <i className="text-gray-500 mr-2"></i>
                                <input
                                    type="password"
                                    {...register("confirmPassword")}
                                    placeholder="Confirm Password"
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                            </div>

                            <div className="text-sm text-end">
                                <a href="#" className="forget-password-text">
                                    By Signing up, I agree to COUM’s Terms & Privacy Policy
                                </a>
                            </div>

                            <div className="mt-5 px-3">
                                <button type="submit" className="group sign-in-corner-cut justify-center">
                                    Sign Up
                                </button>
                            </div>

                            {/* <div className="add-music-btn flex justify-center mt-5 items-center space-x-4">
                                <FacebookLogin
                                    appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
                                    autoLoad={false}
                                    fields="name,email,picture"
                                    onSuccess={facebookLogin}
                                    onFail={(error) => {
                                        console.log('Signup Failed!', error);
                                    }}
                                    render={({ logout, ...props }) => (
                                        <button {...props} type="button" className="form-music-next-btn-one py-2 focus:outline-none btn-cut-login-page-button">
                                            Sign up with Facebook
                                        </button>
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    className="form-music-next-btn-one py-2 focus:outline-none btn-cut-login-page-button"
                                >
                                    Sign in with Google
                                </button>
                            </div> */}

                            <p className="mt-5 do-not-next">
                                Already have an account?
                                <Link href="/login">
                                    <span className="sign-up-bottom">Sign In</span>
                                </Link>

                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function SignupPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Signup />
      </Suspense>
    );
  }
