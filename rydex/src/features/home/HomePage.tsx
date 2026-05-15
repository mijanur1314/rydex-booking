import { auth } from "@/auth";
import Nav from "@/shared/components/Nav/Nav";
import Footer from "@/shared/components/Footer/Footer";
import VendorDashboard from "@/features/partner/components/VendorDashboard";
import User from "@/models/user.model";
import connectDb from "@/lib/db";
import PublicHome from "@/features/home/components/PublicHome";

export default async function Home() {
  const session = await auth();

  let vendorData: {
    vendorStep: number;
    vendorStatus: "pending" | "approved" | "rejected";
  } | null = null;

  let isVendor = false;

  // ✅ DATABASE = SINGLE SOURCE OF TRUTH
  if (session?.user?.id) {
    await connectDb();

    const user = await User.findById(session.user.id)
      .select("role vendorOnboardingStep vendorStatus")
      .lean();

    if (user?.role === "vendor") {
      isVendor = true;
      vendorData = {
        vendorStep: user.vendorOnboardingStep ?? 0,
        vendorStatus: user.vendorStatus ?? "pending",
      };
    }
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav />
      {isVendor && vendorData ? (
        <VendorDashboard
          vendorStep={vendorData.vendorStep}
          vendorStatus={vendorData.vendorStatus}
        />
      ) : (
        <PublicHome />
      )}

      <Footer />
    </div>
  );
}
