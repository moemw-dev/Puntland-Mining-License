"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RegisterSampleAnalysis } from "@/lib/actions/sample.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SampleForm() {
  const [formData, setFormData] = useState({
    name: "",
    passportNo: "",
    kilo_gram: "",
  });

  const router = useRouter();

  const [refNumber, setRefNumber] = useState("");

  useEffect(() => {
    async function fetchRefId() {
      try {
        const res = await fetch("/api/ref-id");
        if (!res.ok) throw new Error("Failed to fetch ref ID");
        const data = await res.json();
        setRefNumber(data.refId);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRefId();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await RegisterSampleAnalysis({
        ref_id: refNumber,
        name: formData.name,
        passport_no: formData.passportNo,
        kilo_gram: formData.kilo_gram,
      });

      if (result) {
        toast.success("Sample registered successfully.");
        router.push("/sample-analysis");
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to register sample.");
    }
  };

  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();

  const formattedDate = `${day}${getDaySuffix(day)} ${month}, ${year}`;

  function getDaySuffix(day: number) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
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
            <p className="text-center text-sm">
              OFFICE OF THE DIRECTOR GENERAL
            </p>
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
          <p className="font-bold underline mb-4">
            Subject: Authorization of Sample Analysis
          </p>

          <p className="mb-6 text-justify">
            Ministry of Energy, Minerals and Water (MOEMW) of Puntland hereby
            authorize Mr/Ms.
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mx-2 border-b border-black focus:outline-none w-[200px] px-1"
              required
            />
            holding Passport No.
            <input
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleChange}
              className="mx-2 border-b border-black focus:outline-none w-[200px] px-1"
              required
            />
            , to take,
            <input
              type="text"
              name="kilo_gram"
              value={formData.kilo_gram}
              onChange={handleChange}
              className="mx-2 border-b border-black focus:outline-none w-[80px] px-1 text-center"
              required
            />
            KILOGRAM of soil and rocks samples of minerals from Puntland State
            of Somalia, for testing, and analysis purposes. These minerals have
            zero value.
          </p>

          <p className="mb-12">
            This authorization shall be valid for one month from the date of
            issue.
          </p>
        </div>

        <div className="text-center mb-12">
          <p>Thanks for your kind cooperation</p>
        </div>

        {/* Signature */}
        <div className="mt-8">
          <p className="font-bold">Eng. Ismail Mohamed Hassan</p>
          <p className="mt-1">
            Director General of the Ministry of Energy, Minerals & Water
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm border-t pt-2">
          <p>
            <span className="font-bold">Tel:</span> +252 907 993813,+252
            661711119
            <span className="font-bold mx-2">Office Email:</span>
            <span className="text-blue-600 underline">dg.moemw@plstate.so</span>
            <span className="font-bold mx-2">Website:</span>
            <span className="text-blue-600 underline">www.moemw.pl.so</span>
          </p>
        </div>

        {/* Print Button - Hidden when printing */}
        <div className="mt-8 text-center print:hidden">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
