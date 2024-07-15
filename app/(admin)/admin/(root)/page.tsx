"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && session) {
      switch (session.user.role) {
        case "ADMIN":
          router.push("/admin/admins");
          break;
        case "USER":
          router.push("/admin/dashboards");
          break;
        case "CLAIM":
          router.push("/admin/adminClaim");
          break;
        case "SALE":
          router.push("/admin/adminOrder");
          break;
        default:
      }
    } else {
      router.push("/admin/sign-in");
    }
  }, [status]);

  return null;
}
