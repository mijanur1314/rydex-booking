import Nav from "@/shared/components/Nav/Nav";
import Footer from "@/shared/components/Footer/Footer";
import PublicHome from "@/features/home/components/PublicHome";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Nav />
      <PublicHome />
      <Footer />
    </div>
  );
}
