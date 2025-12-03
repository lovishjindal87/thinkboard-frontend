import React, { useMemo, useState } from 'react'
import { Link } from "react-router"
import {PlusIcon} from "lucide-react"
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  const [avatarError, setAvatarError] = useState(false);

  const avatarSrc = useMemo(() => {
    if (!user?.picture || avatarError) return null;
    if (!user.picture.startsWith("http")) return null;
    return user.picture;
  }, [user?.picture, avatarError]);

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
            Thinkboard
          </h1>
          <div className="flex items-center gap-4">
            {!loading && user && (
              <Link to={"/create"} className="btn btn-primary">
                <PlusIcon className="size-5" />
                <span>New Task</span>
              </Link>
            )}
            {!loading && !user && (
              <button className="btn btn-outline btn-sm" onClick={loginWithGoogle}>
                Sign in with Google
              </button>
            )}
            {!loading && user && (
              <div className="flex items-center gap-2">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-base-content/20"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-base-content/20 bg-base-200 flex items-center justify-center text-xs font-semibold text-base-content/80">
                    {initials || "?"}
                  </div>
                )}
                <span className="text-sm text-base-content/80">{user.name}</span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar