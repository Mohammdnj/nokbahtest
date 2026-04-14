"use client";
import CommercialContractPage from "../commercial/page";

// Residential lease wizard — same 6-step form as commercial (different pricing
// is handled via contract_type in sessionStorage + backend).
export default function ResidentialContractPage() {
  return <CommercialContractPage />;
}
