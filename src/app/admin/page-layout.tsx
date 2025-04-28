"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  MusicalNoteIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { IoIosList } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import notification from "@/app/assets/images/notification.png";
import MusicLogo from "@/app/assets/images/MusicLogo.png";
import { logoutUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import userService from "@/services/userService";
import profilePlaceholder from "@/app/assets/images/profile-placeholder.jpg";
import CustomAudioPlayer from "../components/CustomPlayer/CustomAudioPlayer";

export const navLinks = [
  // {
  //   href: "/admin",
  //   icon: <HomeIcon className="w-6 h-6" />,
  //   label: "Home",
  // },
  // {
  //   href: "/admin/playlist",
  //   icon: <IoIosList className="w-6 h-6" />,
  //   label: "Playlist",
  // },
  {
    href: "/admin/music",
    icon: <MusicalNoteIcon className="w-6 h-6" />,
    label: "Music",
  },
  {
    href: "/admin/games",
    icon: <ComputerDesktopIcon className="w-6 h-6" />,
    label: "Games",
  },
];

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedSidebarState = localStorage.getItem("showSidebar") === "1";
    console.log("savedSidebarState", savedSidebarState);
    setShowSidebar(savedSidebarState);
  }, []);

  const mounted = useRef(false);
  const [profile, setProfile] = useState<any>({});

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  useEffect(() => {
    if (showSidebar !== null) {
      localStorage.setItem("showSidebar", showSidebar ? "1" : "0");
    }
  }, [showSidebar]);

  useEffect(() => {
    if (!mounted.current) {
      loadProfile();
      mounted.current = true;
    }
  })

  const loadProfile = async () => {
    // await userService.getProfile().then((user) => {
    //   setProfile(user)
    // })
  }

  return (
    <div className="h-screen flex dashboard-screen">
      <aside
        className={`sidebar fixed top-0 left-0 h-full text-white transition-transform duration-300 ease-in-out z-10 ${showSidebar ? "w-64" : "w-16"
          } transform`}
      >
        <div className="p-6">
          <Image src={MusicLogo} alt="Music Logo" />
        </div>
        <nav className="flex flex-col mt-4 space-y-3">
          {navLinks.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="px-6 py-2 hover:bg-gray-700 flex items-center space-x-2"
            >
              {icon}
              <span className={`${showSidebar ? "block" : "hidden"}`}>
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      <div
        className={`flex flex-1 flex-col h-screen transition-all duration-300 ${showSidebar ? "ml-64" : "ml-16"
          }`}
      >
        <header className="header-container flex justify-between items-center w-full p-6 text-white">
          <div className="flex items-center">
            <button
              aria-label={showSidebar ? "close sidebar" : "open sidebar"}
              onClick={() => setShowSidebar(!showSidebar)}
              className="focus:outline-none mr-4"
            >
              {showSidebar ? (
                <XMarkIcon className="w-6 h-6 text-white" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-white" />
              )}
            </button>
            <span>Good Morning, James</span>
          </div>

          <div className="flex items-center space-x-4">
            <Image
              className="object-contain"
              src={notification}
              alt="Notification"
            />

            {/* Dropdown for Profile */}
            <Menu as="div" className="relative">
              <MenuButton>
                <Image
                  className="object-contain rounded-full cursor-pointer"
                  height={50} width={50} src={profile.avatar ? profile.avatar : profilePlaceholder}
                  alt="User Avatar"
                />
              </MenuButton>
              <MenuItems className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        href="/profile"
                        className={`${focus ? "bg-gray-700" : ""
                          } block px-4 py-2 text-sm text-white`}
                      >
                        Profile
                      </Link>
                    )}
                  </MenuItem>

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-1"></div>

                  <MenuItem>
                    {({ focus }) => (
                      <span
                        onClick={handleLogout}
                        className={`${focus ? "bg-gray-700" : ""
                          } block px-4 py-2 text-sm text-white`}
                      >
                        Logout
                      </span>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-black">{children}</main>
        <footer className="w-full p-4 bg-black text-white text-center">
          <CustomAudioPlayer />
        </footer>
      </div>
    </div>
  );
}
