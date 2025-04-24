
"use client"
import Image from "next/image";
import Link from 'next/link'

import MusicLogo from "@/app/assets/images/MusicLogo.png"
import { loginProvider, loginUser } from "@/services/authService";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import FacebookLogin from '@greatsumini/react-facebook-login';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Suspense } from 'react';

const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

function Login() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/admin/music";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data) => {
        loginUser(data).then(() => {
            router.push(redirectTo)
        }).catch((err) => {
            // toast.error(err);
        })
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
