"use client"
import Link from 'next/link';
import Image from "next/image";
import MusicLogo from "@/app/assets/images/MusicLogo.png";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from 'next/navigation';
import { countries } from "@/data/countries";
import userService from "@/services/userService";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

const profileSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    country: yup.string().required("Country is required"),
});

export default function ProfileCompletion() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profileSchema),
    });

    useEffect(() => {
        userService.getProfile().then((user) => {
            setValue("name", user.name || "");
            setValue("country", user.country || "");
        })
    }, [])

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
            setIsLoading(true);
            const payload = {
                name: data.name,
                country: data.country
            };

            await userService.updateProfile(payload);
            toast.success("Profile updated successfully!");
            
            // Get the redirect path based on user role
            const redirectPath = getRedirectPath(user?.role);
            router.push(redirectPath);
        } catch (err) {
            console.error("Profile update error:", err);
            toast.error(err.message || "Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="Profile-Completion-Section">
            <div className="flex flex-col flex-auto flex-shrink-0 antialiased">
                <div className="flex justify-center items-center">
                    <div className="text-center">
                        <div className="Music-login-page-logo">
                            <Image src={MusicLogo} alt="MusicLogo" className="mt-20" />
                        </div>
                        <div className="mt-5 Login-music-font text-center">
                            <p className="pt-5">
                                Complete Your Profile
                            </p>
                        </div>
                        <form className="w-full max-w-md mt-5 profile-view-mobile" onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4 items-center">
                                <input
                                    type="text"
                                    {...register("name")}
                                    placeholder="Full Name"
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.name ? 'border-red-500' : ''}`}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>

                            <div className="mb-4 items-center w-full">
                                <select
                                    {...register("country")}
                                    className={`mt-1 p-2 w-full music-form-input-type btn-cut-login-page-button ${errors.country ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                            </div>

                            <div className="mt-5 px-3">
                                <button 
                                    type="submit" 
                                    className="group sign-in-corner-cut justify-center"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating...' : 'Complete Profile'}
                                </button>
                            </div>

                            <p className="mt-5 do-not-next">
                                Already completed your profile?&nbsp;
                                <Link href={getRedirectPath(user?.role)}>
                                    <span className="sign-up-bottom">Go to Dashboard</span>
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
