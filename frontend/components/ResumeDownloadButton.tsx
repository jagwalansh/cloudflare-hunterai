"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumeDocument } from "@/components/ResumeDocument";
import { Download } from "lucide-react";

interface ResumeDownloadButtonProps {
  tailoredProfile: any;
  fileName: string;
}

export default function ResumeDownloadButton({ tailoredProfile, fileName }: ResumeDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<ResumeDocument data={tailoredProfile} />}
      fileName={fileName}
    >
      {({ blob, url, loading }) => (
        <button
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: loading ? "var(--border)" : "#00b4d8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            transition: "opacity 0.2s",
          }}
        >
          <Download size={16} />
          {loading ? "Preparing PDF..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
