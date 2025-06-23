"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { RegisterSampleAnalysis } from "@/lib/actions/sample.action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CountrySelector from "./country-selector"

export default function SampleForm() {
  const [formData, setFormData] = useState({
    name: "",
    passportNo: "",
    nationality: "",
    mineralType: "",
    unit: "kilogram", // default unit
    amount: "",
  })

  const router = useRouter()
  const [refNumber, setRefNumber] = useState("")

  useEffect(() => {
    async function fetchRefId() {
      try {
        const res = await fetch("/api/ref-id")
        if (!res.ok) throw new Error("Failed to fetch ref ID")
        const data = await res.json()
        setRefNumber(data.refId)
      } catch (error) {
        console.error(error)
      }
    }
    fetchRefId()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNationalityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, nationality: value }))
  }

  const handleUnitChange = (value: string) => {
    setFormData((prev) => ({ ...prev, unit: value }))
  }

  // Convert amount to kilograms for database storage
  const convertToKilograms = (amount: string, unit: string): number => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return 0

    switch (unit) {
      case "milligram":
        return numAmount / 1000000 // mg to kg
      case "gram":
        return numAmount / 1000 // g to kg
      case "kilogram":
        return numAmount // kg to kg
      case "ton":
        return numAmount * 1000 // ton to kg
      default:
        return numAmount
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (
      !formData.name ||
      !formData.nationality ||
      !formData.passportNo ||
      !formData.amount ||
      !formData.unit ||
      !formData.mineralType
    ) {
      toast.error("Please fill in all required fields.")
      return
    }

    // Validate amount is a positive number
    const numAmount = Number.parseFloat(formData.amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount.")
      return
    }

    try {
      const kiloGramAmount = convertToKilograms(formData.amount, formData.unit)

      const result = await RegisterSampleAnalysis({
        ref_id: refNumber,
        name: formData.name,
        passport_no: formData.passportNo,
        amount: formData.amount, // Original amount as entered
        kilo_gram: kiloGramAmount.toString(), // Converted to kg for standardization
        unit: formData.unit,
        mineral_type: formData.mineralType,
        nationality: formData.nationality,
      })

      if (result) {
        toast.success("Sample registered successfully.")
        router.push("/sample-analysis")
      } else {
        toast.error("Something went wrong.")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Failed to register sample.")
    }
  }

  const today = new Date()
  const day = today.getDate()
  const month = today.toLocaleString("default", { month: "long" })
  const year = today.getFullYear()
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

  return (
    <div className="w-full max-w-[800px] mx-auto border my-3 bg-white p-8 relative text-black">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full border-8 border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <Image
              src="/assets/puntland_logo.svg"
              alt="Puntland Coat of Arms"
              width={400}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="text-left text-sm">
            <p>Dawlada Puntland ee Soomaaliya</p>
            <p>Wasaaradda Tamarta Macdanta & Biyaha</p>
            <p>Xafiiska Agaasimaha Guud</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-[100px] h-[80px] relative mb-1">
              <Image
                src="/assets/puntland_logo.svg"
                alt="Puntland Coat of Arms"
                width={100}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-center font-bold">Puntland States of Somalia</p>
            <p className="text-center">Ministry of Energy Minerals & Water</p>
            <p className="text-center text-sm">OFFICE OF THE DIRECTOR GENERAL</p>
          </div>

          <div className="text-right text-sm" dir="rtl">
            <p>ولاية بونت لاند الصومالية</p>
            <p>وزارة الطاقة والمعادن والمياه</p>
            <p>مكتب المدير العام</p>
          </div>
        </div>

        {/* Reference and Date */}
        <div className="border border-black mt-2">
          <div className="flex justify-between px-4 py-1">
            <div>REF: MOEMW/DG/{refNumber ?? "Loading..."}</div>
            <div>{formattedDate}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-12 text-center">
          <h2 className="font-bold text-xl">TO WHOM IT MAY CONCERN</h2>
        </div>

        <div className="mt-8">
          <p className="font-bold underline mb-4">Subject: Authorization of Sample Analysis</p>

          {/* Dynamic Form Inputs */}
          <p className="mb-6 text-justify leading-relaxed">
            Ministry of Energy, Minerals and Water (MOEMW) of Puntland hereby authorizes Mr./Ms.{" "}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mx-1 border-b border-black focus:outline-none w-[200px] px-1 bg-transparent"
              placeholder="Full Name"
              required
            />{" "}
            a citizen of{" "}
            <span className="inline-block">
              <CountrySelector
                value={formData.nationality}
                onChange={handleNationalityChange}
                placeholder="Select Country"
              />
            </span>{" "}
            holding Passport No.{" "}
            <input
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleChange}
              className="mx-1 border-b border-black focus:outline-none w-[150px] px-1 bg-transparent"
              placeholder="Passport Number"
              required
            />{" "}
            to take{" "}
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mx-1 border-b border-black focus:outline-none w-[80px] px-1 text-center bg-transparent"
              placeholder="Amount"
              min="0"
              step="0.001"
              required
            />{" "}
            <span className="inline-block">
              <Select value={formData.unit} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-[120px] mx-1 inline-flex border-0 border-b border-black rounded-none px-1 h-auto py-0 font-normal hover:bg-transparent focus:bg-transparent">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milligram">Milligram</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="kilogram">Kilogram</SelectItem>
                  <SelectItem value="ton">Metric Ton</SelectItem>
                </SelectContent>
              </Select>
            </span>{" "}
            of{" "}
            <input
              type="text"
              name="mineralType"
              value={formData.mineralType}
              onChange={handleChange}
              className="mx-1 border-b border-black focus:outline-none w-[150px] px-1 bg-transparent"
              placeholder="Mineral Type"
              required
            />{" "}
            samples of minerals from Puntland State of Somalia for testing and analysis purposes. These minerals have
            zero commercial value.
          </p>

          <p className="mb-12">This authorization shall be valid for one month from the date of issue.</p>
        </div>

        <div className="text-center mb-12">
          <p>Thanks for your kind cooperation</p>
        </div>

        {/* Signature */}
        <div className="mt-8 text-center">
          <p className="font-bold">Eng. Ismail Mohamed Hassan</p>
          <p className="mt-1">Director General of the Ministry of Energy, Minerals & Water</p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm border-t pt-2">
          <p>
            <span className="font-bold">Tel:</span> +252 907 993813, +252 661711119
            <span className="font-bold mx-2">Office Email:</span>
            <span className="text-blue-600 underline">dg.moemw@plstate.so</span>
            <span className="font-bold mx-2">Website:</span>
            <span className="text-blue-600 underline">www.moemw.pl.so</span>
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center print:hidden">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Save Sample Analysis
          </button>
        </div>
      </form>
    </div>
  )
}
