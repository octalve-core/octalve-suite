import { ShellLayout } from "@/components/layout/ShellLayout";

export default function ClientLayout({ children }) {
    return <ShellLayout mode="client">{children}</ShellLayout>;
}
