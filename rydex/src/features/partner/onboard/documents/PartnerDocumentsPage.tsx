"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  FileCheck,
  CheckCircle,
  Pencil,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

type DocKey = "aadhaar" | "license" | "rc";

type AIReviewItem = {
  status: "verified" | "needs_review" | "missing" | "unsupported";
  summary: string;
  extractedFields?: Record<string, string>;
  issues?: string[];
  confidence?: number;
};

type AIReview = {
  overallStatus: "clear" | "needs_review" | "incomplete";
  recommendation: "approve" | "manual_review" | "request_resubmission";
  summary: string;
  riskFlags: string[];
  aadhaar: AIReviewItem;
  license: AIReviewItem;
  rc: AIReviewItem;
  reviewedAt: string;
};

type DocumentsResponse = {
  aadhaarUrl?: string;
  licenseUrl?: string;
  rcUrl?: string;
  aiReview?: AIReview;
};

export default function PartnerDocumentsPage() {
  const router = useRouter();

  const [docs, setDocs] = useState<Record<DocKey, File | null>>({
    aadhaar: null,
    license: null,
    rc: null,
  });
  const [existingDocs, setExistingDocs] = useState<DocumentsResponse | null>(null);
  const [completed, setCompleted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);

  useEffect(() => {
    axios
      .get("/api/partner/documents")
      .then((res) => {
        if (res.data?.documents) {
          setCompleted(true);
          setExistingDocs(res.data.documents);
          setAiReview(res.data.documents.aiReview || null);
        }
      })
      .catch(() => {});
  }, []);

  const canContinue = completed && !editMode ? true : docs.aadhaar && docs.license && docs.rc;

  const handleFileChange = (key: DocKey, file: File | null) => {
    if (!file) return;
    setDocs((prev) => ({ ...prev, [key]: file }));
  };

  const submitDocuments = async () => {
    if (completed && !editMode) {
      router.push("/partner/onboard/bank");
      return;
    }

    if (!docs.aadhaar || !docs.license || !docs.rc) {
      setError("Please upload all required documents");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("aadhaar", docs.aadhaar);
      formData.append("license", docs.license);
      formData.append("rc", docs.rc);

      const res = await axios.post("/api/partner/documents", formData);
      setAiReview(res.data?.aiReview || null);
      setCompleted(true);
      setEditMode(false);
      router.push("/partner/onboard/bank");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      setError(message || "Document upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 2 of 3</p>
          <h1 className="text-2xl font-bold mt-1">Upload Documents</h1>
          <p className="text-sm text-gray-500 mt-2">Required for verification</p>

          {completed && !editMode && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                <CheckCircle size={16} />
                Uploaded successfully
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                className="text-xs font-semibold text-black underline flex items-center gap-1"
              >
                <Pencil size={12} />
                Edit documents
              </motion.button>
            </div>
          )}
        </div>

        <div className={`mt-8 space-y-5 ${completed && !editMode ? "opacity-50 pointer-events-none" : ""}`}>
          <DocUpload
            label="Aadhaar / ID Proof"
            desc="Government issued ID"
            file={docs.aadhaar}
            uploadedUrl={existingDocs?.aadhaarUrl}
            onChange={(f) => handleFileChange("aadhaar", f)}
          />

          <DocUpload
            label="Driving License"
            desc="Valid driving license"
            file={docs.license}
            uploadedUrl={existingDocs?.licenseUrl}
            onChange={(f) => handleFileChange("license", f)}
          />

          <DocUpload
            label="Vehicle RC"
            desc="Registration Certificate"
            file={docs.rc}
            uploadedUrl={existingDocs?.rcUrl}
            onChange={(f) => handleFileChange("rc", f)}
          />
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={16} className="mt-0.5" />
          <p>Documents are securely stored and manually verified by our team.</p>
        </div>

        {aiReview && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles size={16} className="text-blue-600" />
                  AI review summary
                </div>
                <p className="text-sm text-slate-600 mt-1">{aiReview.summary}</p>
              </div>
              <StatusPill value={aiReview.recommendation} />
            </div>

            {aiReview.riskFlags.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-700">
                  <AlertTriangle size={13} />
                  Review flags
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {aiReview.riskFlags.map((flag) => (
                    <span key={flag} className="rounded-full border border-amber-200 bg-white px-2 py-1 text-xs text-amber-800">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <AIReviewCard label="Aadhaar" review={aiReview.aadhaar} />
              <AIReviewCard label="License" review={aiReview.license} />
              <AIReviewCard label="RC" review={aiReview.rc} />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading || !canContinue}
          onClick={submitDocuments}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
        >
          {completed && !editMode ? "Continue" : editMode ? "Save & Continue" : loading ? "Uploading..." : "Continue"}
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}

function DocUpload({
  label,
  desc,
  file,
  uploadedUrl,
  onChange,
}: {
  label: string;
  desc: string;
  file: File | null;
  uploadedUrl?: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <motion.label
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
    >
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>

      <div className="flex items-center gap-3">
        {file ? (
          <span className="text-xs text-green-600 font-medium">Selected</span>
        ) : uploadedUrl ? (
          <span className="text-xs text-blue-600 font-medium">Uploaded</span>
        ) : (
          <span className="text-xs text-gray-400">Upload</span>
        )}

        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          <UploadCloud size={18} />
        </div>
      </div>

      <input type="file" accept="image/*,.pdf" hidden onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </motion.label>
  );
}

function AIReviewCard({ label, review }: { label: string; review: AIReviewItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <MiniPill value={review.status} />
      </div>

      <p className="text-xs text-slate-600">{review.summary}</p>

      {typeof review.confidence === "number" && (
        <p className="text-[11px] text-slate-500">Confidence: {Math.round(review.confidence * 100)}%</p>
      )}

      {review.extractedFields && Object.keys(review.extractedFields).length > 0 && (
        <div className="space-y-1">
          {Object.entries(review.extractedFields).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3 text-[11px]">
              <span className="text-slate-400 capitalize">{key}</span>
              <span className="text-slate-700 font-medium text-right">{value || "Not found"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ value }: { value: AIReview["recommendation"] }) {
  const tone =
    value === "approve"
      ? "bg-emerald-100 text-emerald-700"
      : value === "request_resubmission"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tone}`}>{value.replaceAll("_", " ")}</span>;
}

function MiniPill({ value }: { value: AIReviewItem["status"] }) {
  const tone =
    value === "verified"
      ? "bg-emerald-100 text-emerald-700"
      : value === "missing" || value === "unsupported"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${tone}`}>{value.replaceAll("_", " ")}</span>;
}
