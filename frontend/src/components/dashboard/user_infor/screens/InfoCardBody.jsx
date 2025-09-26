// src/components/InfoCardBody.jsx
import React from "react";
import Avatar from "../../widget/sceens/Avatar";
import { userDetails } from "../lib/userDetails";
import { documentStatuses } from "../lib/documentStatuses";

export default function InfoCardBody() {
  return (
    <>
      {/* Header trong card */}
      <div className="min-h-[84px] md:h-[100px] w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6 items-center">
        <div className="flex items-center gap-4">
          <Avatar
            size={56}
            src="https://c.animaapp.com/mfm83o18SmdVol/img/ellipse-48.png"
            alt="Nick Reynolds"
          />
          <div className="leading-tight">
            <div className="text-lg md:text-xl">Nick Reynolds</div>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-[#9296ad]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[#9296ad] text-sm">Uae Dubai</span>
            </div>
          </div>
        </div>

        {/* Cards tiền */}
        <div className="md:ml-auto grid grid-cols-2 md:flex gap-3 md:gap-6">
          <div className="bg-white rounded-lg p-3 md:p-4 text-center min-w-[140px] md:min-w-[160px]">
            <div className="text-[#9296ad] text-sm font-bold tracking-[1px] mb-2">
              CREDIT LIMIT
            </div>
            <div className="flex justify-center items-center gap-4">
              <img
                src="https://c.animaapp.com/mfm83o18SmdVol/img/5y9tbc-tif.png"
                alt=""
                className="w-[40px] h-[26px] md:w-[47px] md:h-[31px]"
              />
              <div className="text-3xl md:text-4xl font-bold">$50,000</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 md:p-4 text-center min-w-[140px] md:min-w-[160px]">
            <div className="text-[#9296ad] text-sm font-bold tracking-[1px] mb-2">
              DEPOSIT AMOUNT
            </div>
            <div className="flex justify-center items-center gap-4">
              <img
                src="https://c.animaapp.com/mfm83o18SmdVol/img/bdmtaa-tif.png"
                alt=""
                className="w-[40px] h-[40px] md:w-[47px] md:h-[47px]"
              />
              <div className="text-3xl md:text-4xl font-bold">$40,250</div>
            </div>
          </div>
        </div>
      </div>

      {/* Doc statuses (trái) + Details (phải 1 cột) */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 mb-8">
        <div className="flex-1 w-full">
          <div className="space-y-3 ml-2 md:ml-10">
            {userDetails.map((d) => (
              <div key={d.label} className="flex">
                <span className="text-base md:text-lg min-w-[180px] md:min-w-[260px]">{d.label}</span>
                <span className="text-base md:text-lg">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 w-full lg:w-auto">
          <div className="flex flex-row flex-wrap gap-4 md:gap-6 mt-6 md:mt-10">
            {documentStatuses.map((doc) => (
              <div key={doc.label} className="text-center">
                <img
                  src={doc.icon}
                  alt={doc.label}
                  className="w-[30px] h-8 md:w-[35px] md:h-10 mx-auto mb-2 mt-2"
                />
                <div className="text-base font-bold text-[#9296ad] tracking-[1.6px]">
                  {doc.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-[#95979f] mb-4 md:mb-6" />

      {/* Chart header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4">
        <div className="flex items-center gap-6 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-5 md:w-[26px] h-3 bg-[#fc0d1b] rounded-[5px]" />
            <span className="text-[11px] text-[#4d4f5c]">Bid Activity</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-5 md:w-[26px] h-3 bg-[#8d6cab] rounded-[5px]" />
            <span className="text-[11px] text-[#4d4f5c]">Browsing Activity</span>
          </div>
        </div>

        <select className="w-[119px] h-[29px] text-[11px] border border-[#d7dae2] rounded px-2 shadow-[0_2px_1.5px_rgba(0,0,0,0.05)]">
          <option>Last 30 Days</option>
          <option>Last 60 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      {/* Chart */}
      <div className="relative w-full h-[220px] md:h-[265px] bg-white rounded-lg border border-[#f0f0f0]">
        <div className="absolute left-2 top-4 h-[180px] md:h-[220px] flex flex-col justify-between">
          {["$25k", "$20k", "$15k", "$10k", "$5k"].map((t) => (
            <div key={t} className="text-sm opacity-50">{t}</div>
          ))}
        </div>
        <div className="absolute right-2 top-4 h-[180px] md:h-[220px] flex flex-col justify-between">
          {["$25k", "$20k", "$15k", "$10k", "$5k"].map((t) => (
            <div key={t} className="text-sm opacity-50">{t}</div>
          ))}
        </div>

        <div className="absolute left-[30px] md:left-[37px] top-4 right-[30px] md:right-[37px] h-[180px] md:h-[220px]">
          <div className="w-full h-full border-l border-b border-gray-200 rounded relative">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: `${i * 25}%` }} />
            ))}
            {[...Array(7)].map((_, i) => (
              <div key={i} className="absolute h-full border-l border-gray-200" style={{ left: `${i * 16.66}%` }} />
            ))}
          </div>
        </div>

        <div className="absolute left-11 top-[60px] md:top-[77px] right-11 h-[140px] md:h-[165px]">
          <svg className="w-full h-full" viewBox="0 0 400 165" preserveAspectRatio="none">
            <path d="M0,120 Q50,100 100,80 T200,60 T300,40 T400,30" stroke="#fc0d1b" strokeWidth="3" fill="none" />
            <path d="M0,140 Q50,130 100,110 T200,90 T300,70 T400,50" stroke="#8d6cab" strokeWidth="3" fill="none" />
          </svg>
        </div>

        <div className="absolute bottom-2 left-[45px] right-[45px] flex justify-between text-sm opacity-50">
          <span>Nov 10, 2017</span>
          <span>Dec 10, 2017</span>
        </div>
      </div>
    </>
  );
}
