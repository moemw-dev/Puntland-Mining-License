"use server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { licenses } from "@/database/schema";
import { actionClient } from "@/lib/safe-action";
import {
  deleteLicenseSchema,
  licensesSchema,
  updateLicenseSchema,
  updateLicenseSignatureSchema,
  updateLicenseStatusSchema,
} from "@/types/license-schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const RegisterLicense = actionClient.schema(licensesSchema).action(
  async ({
    parsedInput: {
      company_name,
      business_type,
      company_address,
      region,
      district,
      country_of_origin,

      // Personal Info
      full_name,
      mobile_number,
      email_address,
      id_card_number,

      // Document Info
      passport_photos,
      company_profile,
      receipt_of_payment,
      environmental_assessment_plan,
      experience_profile,
      risk_management_plan,
      bank_statement,

      // License Info
      license_type,
      license_category,
      license_fee,
      license_area,
    },
  }) => {
    
    // Get the user's session
    const session = await auth();

    if (!session || !session.user) {
      return redirect('/login');
    }

    function generateLicenseRefId(): string {
      const prefix = "WTMB";
      const now = new Date();
      const year = String(now.getFullYear()).slice(2); // 25
      const month = String(now.getMonth() + 1)
        .toString()
        .padStart(2, "0"); // 05
      const randomPart = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit random

      return `${prefix}-${year}${month}-${randomPart}`;
    }

    await db.insert(licenses).values({
      license_ref_id: generateLicenseRefId(),

      company_name: company_name,
      business_type: business_type,
      company_address: company_address,
      region: region,
      district_id: district,
      country_of_origin: country_of_origin,

      // Personal Info
      full_name: full_name,
      mobile_number: mobile_number,
      email_address: email_address,
      id_card_number: id_card_number,

      // Document Info
      passport_photos: passport_photos,
      company_profile: company_profile,
      receipt_of_payment: receipt_of_payment,
      environmental_assessment_plan: environmental_assessment_plan,
      experience_profile: experience_profile,
      risk_management_plan: risk_management_plan,
      bank_statement: bank_statement,

      // License Info
      license_type: license_type,
      license_category: license_category,
      license_area: license_area,
      calculated_fee: license_fee,
    });

    return { success: "License registered successfully" };
  }
);

export const UpdateLicense = actionClient
  .schema(updateLicenseSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, ...updateData } = parsedInput;

      // Remove undefined values
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([value]) => value !== undefined)
      );

      // Only proceed if there are fields to update
      if (Object.keys(filteredUpdateData).length === 0) {
        return { error: "No fields to update" };
      }

      // Update the license
      await db
        .update(licenses)
        .set({
          ...filteredUpdateData,
          updated_at: new Date(), // Keep as Date object since that's what the database expects
        })
        .where(eq(licenses.id, id));

      return { success: "License updated successfully" };
    } catch (error) {
      console.error("Error updating license:", error);
      return {
        error: `Failed to update license: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });

// Create the delete license action
export const DeleteLicense = actionClient
  .schema(deleteLicenseSchema)
  .action(async ({ parsedInput: { license_ref_id } }) => {
    try {
      // Delete the license where the license_ref_id matches
      await db
        .delete(licenses)
        .where(eq(licenses.license_ref_id, license_ref_id));

      return { success: "License deleted successfully" };
    } catch (error) {
      console.error("Error deleting license:", error);
      return { error: "Failed to delete license" };
    }
  });

// Update license approval status
export const UpdateLicenseStatus = actionClient
  .schema(updateLicenseStatusSchema)
  .action(async ({ parsedInput: { id, status } }) => {
    try {
      // Update only the status field
      await db
        .update(licenses)
        .set({
          status: status,
          updated_at: new Date(),
        })
        .where(eq(licenses.id, id));

      const statusText =
        status === "PENDING"
          ? "pending"
          : status === "APPROVED"
            ? "approved"
            : "removed";
      return { success: `License ${statusText} successfully` };
    } catch (error) {
      console.error("Error updating license status:", error);
      return {
        error: `Failed to update license status: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });

// Update license signature only
export const UpdateLicenseSignature = actionClient
  .schema(updateLicenseSignatureSchema)
  .action(async ({ parsedInput: { id, signature } }) => {
    try {
      console.log("Updating license signature with ID:", id);
      console.log("New signature status:", signature);

      // Update only the signature field
      await db
        .update(licenses)
        .set({
          signature: signature,
          updated_at: new Date(),
        })
        .where(eq(licenses.id, id));

      const actionText = signature ? "signed" : "revoked";
      return { success: `License ${actionText} successfully` };
    } catch (error) {
      console.error("Error updating license signature:", error);
      return {
        error: `Failed to update license signature: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
