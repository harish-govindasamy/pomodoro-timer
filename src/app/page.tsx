import HomeContent from "@/components/HomeContent";

// Force dynamic rendering to avoid static generation issues with client-side stores
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeContent />;
}
