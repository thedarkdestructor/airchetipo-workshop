import { BottomNav } from "@/components/BottomNav";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
