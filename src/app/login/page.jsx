"use client"
import Image from "next/image";
import Link from 'next/link'

import MusicLogo from "@/app/assets/images/MusicLogo.png"
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

function Login() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const getRedirectPath = (role) => {
        switch (role) {
            case 'admin':
                return '/admin/music';
            case 'artist':
                return '/artist/music';
            default:
                return '/';
        }
    };

    const onSubmit = async (data) => {
        try {
            const result = await login(data.email, data.password);
            if (result.success) {
                toast.success("Login successful!");
                
                // Get the redirect path based on user role
                const redirectPath = getRedirectPath(result.user.role);
                
                // If there's a specific redirectTo in the URL, use that instead
                const redirectTo = searchParams.get("redirectTo");
                
                router.push(redirectTo || redirectPath);
            } else {
                toast.error(result.error || "Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error(err.message || "Login failed. Please try again.");
        }
    };

    return (
        <>
            <div className="h-screen flex flex-col flex-auto flex-shrink-0 antialiased ">
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <div className="Music-login-page-logo">
                            <Image src={MusicLogo} alt="MusicLogo" />
                        </div>
                        <div className="mt-5 Login-music-font text-center ">
                            <p className="pt-5">Login</p>
                        </div>
                        <form className="w-full  mt-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4 login-mobile-field">
                                {/* <i className="text-gray-500 mr-2"></i> */}
                                <input
                                    type="text"
                                    {...register("email")}
                                    placeholder="Your email address"
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.email ? 'border-red-500' : ''}`}
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>

                            <div className="mb-4 login-mobile-field">
                                {/* <i className="text-gray-500 mr-2"></i> */}
                                <input
                                    type="password"
                                    {...register("password")}
                                    placeholder="Password"
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.password ? 'border-red-500' : ''}`}
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            </div>

                            <div className="text-sm text-end">
                                <a href="#" className="forget-password-text">Forgot Password?</a>
                            </div>

                            <div className="mt-5 px-3">
                                <button type="submit" className="group sign-in-corner-cut justify-center">
                                    Login
                                </button>
                            </div>
                            <p className="mt-5 do-not-next">
                                Don&apos;t have an account?
                                <Link href="/register">
                                    <span className="sign-up-bottom">Register</span>
                                </Link>

                            </p>
                        </form>
                    </div>
                </div>

            </div>

        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Login />
        </Suspense>
    );
}
