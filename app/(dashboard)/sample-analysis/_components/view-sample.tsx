"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useReactToPrint } from "react-to-print"
import Image from "next/image"
import { toast } from "sonner"
import type { FormEvent, ChangeEvent } from "react"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { UpdateSampleSignature } from "@/lib/actions/sample.action"

// Update the interface to be more flexible for reusable component
interface SampleData {
  id?: string 
  ref_id: string
  name: string
  passport_no: string
  kilo_gram: string 
  signature?: boolean 
  created_at?: string
  updated_at?: string
}

// Define the component props
interface ReusableSampleFormProps {
  mode: "insert" | "update" | "view"
  initialData?: SampleData
  onSubmit: (data: SampleData) => Promise<boolean>
}

export default function ReusableSampleForm({ mode, initialData, onSubmit }: ReusableSampleFormProps) {
  // Initialize form data with initial data or empty values
  const [formData, setFormData] = useState<SampleData>({
    ref_id: "",
    name: "",
    passport_no: "",
    kilo_gram: "",
    signature: false, // Default to false as per schema
    // Don't set created_at here - let it be undefined for new records
  })

  const componentRef = useRef(null)
  const { data: session } = useSession()

  // Initialize signature state with the default value from schema
  const [signature, setSignature] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const handlePrint = useReactToPrint({
    documentTitle: "Sample Analysis",
    contentRef: componentRef,
  })

  // Update form data and signature state when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      // Set signature state from initialData, defaulting to false if not provided
      setSignature(initialData.signature ?? false)
    }
  }, [initialData])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (mode === "view") return

    try {
      // Include the current signature state in the form data
      const dataToSubmit = {
        ...formData,
        signature: signature,
      }

      const result = await onSubmit(dataToSubmit)

      if (result) {
        toast.success(mode === "insert" ? "Sample registered successfully." : "Sample updated successfully.")
      } else {
        toast.error("Something went wrong.")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error(mode === "insert" ? "Failed to register sample." : "Failed to update sample.")
    }
  }

  // Use the created_at date from formData if available, otherwise use current date
  const documentDate = formData.created_at ? new Date(formData.created_at) : new Date()
  const day = documentDate.getDate()
  const month = documentDate.toLocaleString("default", { month: "long" })
  const year = documentDate.getFullYear()
  const formattedDate = `${day}${getDaySuffix(day)} ${month}, ${year}`

  function getDaySuffix(day: number) {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  // Determine if fields should be readonly
  const isReadOnly = mode === "view"

  // Determine button text based on mode
  const buttonText = mode === "insert" ? "Save" : mode === "update" ? "Update" : "Print"

  const handleSignatureToggle = async (newSignatureStatus: boolean) => {

    startTransition(async () => {
      try {
        const result = await UpdateSampleSignature({
          id: formData.id!,
          signature: newSignatureStatus,
        })

        if (result?.data?.error) {
          toast.error("Failed to update signature")
          // Revert the checkbox state on error
          setSignature(!newSignatureStatus)
        } else if (result?.data?.success) {
          toast.success("Signature updated successfully")
          // Update formData to keep it in sync
          setFormData((prev) => ({ ...prev, signature: newSignatureStatus }))
          setSignature(newSignatureStatus)
          if (typeof window !== "undefined") {
            window.location.reload()
          }
        }
      } catch (error) {
        toast.error("Failed to update signature")
        console.error("Error updating signature:", error)
        // Revert the checkbox state on error
        setSignature(!newSignatureStatus)
      }
    })
  }

  return (
    <div ref={componentRef} className="a4-paper mx-auto p-8 relative border my-3 bg-white">

      {/* Signature Toggle - only for admin users and when record exists */}
      {session?.user?.role === "GENERAL_DIRECTOR" && formData.id && mode === "update" && (
        <div className="flex items-center justify-between absolute top-2 right-2">
          {/* Toggle Switch */}
          <div className="relative">
            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={signature}
                disabled={isPending}
                onChange={(e) => {
                  const newValue = e.target.checked
                  setSignature(newValue) // Optimistic update
                  handleSignatureToggle(newValue)
                }}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">{signature ? "Signed" : "Sign"}</span>
            </label>
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full border-8 border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <Image
              src="/assets/puntland_logo.svg"
              alt="Puntland Coat of Arms"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        {/* Header */}
        <div>
          <div className="grid grid-cols-5 gap-4 text-[14px] text-center items-center">
            <div className="text-sm font-bold col-span-2">
              <p>Dawlada Puntland ee Soomaaliya Wasaaradda Tamarta Macdanta & Biyaha Xafiiska Agaasimaha Guud</p>
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <div className="w-[130px] h-[100px] relative mb-1">
                <Image
                  src="/assets/puntland_logo.svg"
                  alt="Puntland Coat of Arms"
                  width={130}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-sm font-bold col-span-2">
              <p>ولاية بونت لاند الصومالية وزارة الطاقة والمعادن والمياه مكتب المدير العام</p>
            </div>
          </div>
          <div className="text-center font-bold text-sm">
            <p>Puntland States of Somalia</p>
            <p>Ministry of Energy Minerals & Water</p>
            <p className="border p-1 my-0.5 border-black">OFFICE OF THE DIRECTOR GENERAL</p>
          </div>
        </div>

        {/* Reference and Date */}
        <div className="flex justify-between px-4 py-1">
          <div>
            REF:
            {isReadOnly ? (
              <span className="ml-1">{formData.ref_id}</span>
            ) : (
              <input
                type="text"
                name="ref_id"
                value={formData.ref_id}
                onChange={handleChange}
                className="ml-1 border-b border-black focus:outline-none px-1"
                required
              />
            )}
          </div>
          <div>{formattedDate}</div>
        </div>

        {/* Main Content */}
        <div className="mt-12 text-center">
          <h2 className="font-bold text-xl">TO WHOM IT MAY CONCERN</h2>
        </div>

        <div className="mt-8">
          <p className="font-bold underline mb-4">Subject: Authorization of Sample Analysis</p>

          <p className="mb-6 text-justify">
            Ministry of Energy, Minerals and Water (MOEMW) of Puntland hereby authorize Mr/Ms.
            {isReadOnly ? (
              <span className="mx-2 font-medium">{formData.name}</span>
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mx-2 border-b border-black focus:outline-none w-[300px] px-1"
                required
                readOnly={isReadOnly}
              />
            )}
            holding Passport No.
            {isReadOnly ? (
              <span className="mx-2 font-medium">{formData.passport_no}</span>
            ) : (
              <input
                type="text"
                name="passport_no"
                value={formData.passport_no}
                onChange={handleChange}
                className="mx-2 border-b border-black focus:outline-none w-[200px] px-1"
                required
                readOnly={isReadOnly}
              />
            )}
            , to take,
            {isReadOnly ? (
              <span className="mx-2 font-medium">{formData.kilo_gram}</span>
            ) : (
              <input
                type="text"
                name="kilo_gram"
                value={formData.kilo_gram}
                onChange={handleChange}
                className="mx-2 border-b border-black focus:outline-none w-[80px] px-1 text-center"
                required
                readOnly={isReadOnly}
              />
            )}
            KILOGRAM of soil and rocks samples of minerals from Puntland State of Somalia, for testing, and analysis
            purposes. These minerals have zero value.
          </p>

          <p className="mb-12">This authorization shall be valid for one month from the date of issue.</p>
        </div>

        <div className="text-center mb-12">
          <p>Thanks for your kind cooperation</p>
        </div>

        {/* Signature Section - Show signature image only when signed */}
        <div className="mt-32 text-center">
          <p className="font-bold">Eng. Ismail Mohamed Hassan</p>
          <p className="mt-1">Director General of the Ministry of Energy, Minerals & Water</p>
          {/* Show signature image only when signature is true */}
          {signature && (
            <div className="flex justify-center">
              <div className="relative w-[140px] h-[70px] print:w-[200px] print:h-[100px]">
                <Image src="/assets/director-signature.png" alt="Signature" fill className="object-contain" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm border-t pt-8">
          <p>
            <span className="font-bold">Tel:</span> +252 907 993813,+252 661711119
            <span className="font-bold mx-2">Office Email:</span>
            <span className="text-primary underline">dg.moemw@plstate.so</span>
            <span className="font-bold mx-2">Website:</span>
            <span className="text-primary underline">www.moemw.pl.so</span>
          </p>
        </div>

        {/* Button - Hidden when printing */}
        <div className="mt-6 text-center print:hidden">
          <button
            type={mode === "view" ? "button" : "submit"}
            onClick={mode === "view" ? () => handlePrint() : undefined}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary w-full"
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  )
}
