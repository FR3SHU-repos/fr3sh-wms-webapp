import WMSSidebarLayout from "@/shared/components/WMSSidebarLayout";

export default function WMSLayout({ children }: { children: React.ReactNode }) {
  return <WMSSidebarLayout>{children}</WMSSidebarLayout>;
}
