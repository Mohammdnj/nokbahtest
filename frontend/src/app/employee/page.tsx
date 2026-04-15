"use client";
// Employee queue is identical in shape to admin contracts list, so we redirect.
// Keeping this route exists so the mobile nav + sidebar can link here.
import AdminContractsPage from "@/app/admin/contracts/page";

export default function EmployeePage() {
  return <AdminContractsPage />;
}
