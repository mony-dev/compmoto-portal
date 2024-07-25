"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home({
  params,
}: {
  params: { locale: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && session) {
      switch (session.user.role) {
        case "ADMIN":
          router.push(`/${params.locale}/admin/admins`);
          break;
        case "USER":
          router.push(`/${params.locale}/admin/dashboards`);
          break;
        case "CLAIM":
          router.push(`/${params.locale}/admin/adminClaim`);
          break;
        case "SALE":
          router.push(`/${params.locale}/admin/adminOrder`);
          break;
        default:
      }
    } else {
      router.push(`/${params.locale}/admin/sign-in`);
    }
  }, [status]);

  return null;
}
