"use client";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Check, Copy, Key, RotateCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ApiKeyInfo {
  key_prefix: string;
  created_at: string;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keyInfo, setKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchKey = useCallback(async () => {
    try {
      const data = await api.get<ApiKeyInfo | null>(
        "/api/users/me/api-key",
      );
      setKeyInfo(data);
    } catch {
      setKeyInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.post<{ api_key: string }>(
        "/api/users/me/generate-api-key",
      );
      setNewKey(data.api_key);
      setShowModal(true);
      await fetchKey();
      toast("success", "API key generated");
    } catch {
      toast("error", "Failed to generate API key");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    try {
      await api.delete("/api/users/me/api-key");
      setKeyInfo(null);
      toast("success", "API key revoked");
    } catch {
      toast("error", "Failed to revoke API key");
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Current Key */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">API Key</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use your API key to authenticate requests
        </p>

        <div className="mt-4">
          {loading ? (
            <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ) : keyInfo ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-slate-400" />
                <code className="text-sm font-mono text-slate-700">
                  {keyInfo.key_prefix}****
                </code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  onClick={handleRevoke}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Revoke
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 py-8">
              <Key className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No API key generated</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate New Key"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Usage Instructions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Include your API key in the Authorization header
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">cURL</p>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
              <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  ${typeof window !== "undefined" ? window.location.origin : ""}/api/users/me`}</code>
            </pre>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">
              JavaScript (fetch)
            </p>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
              <code>{`fetch("/api/users/me", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
})`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <ApiKeyModal
          newKey={newKey}
          copied={copied}
          onCopy={handleCopy}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ApiKeyModal({
  newKey,
  copied,
  onCopy,
  onClose,
}: {
  newKey: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    doneRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="apikey-modal-title">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm modal-backdrop"
            onClick={onClose}
          />
          <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl modal-content">
            <div className="flex items-center justify-between">
              <h3 id="apikey-modal-title" className="text-lg font-semibold text-slate-900">
                Your New API Key
              </h3>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-medium text-amber-800">
                Copy this now — you won&apos;t see it again
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-800">
                {newKey}
              </code>
              <button
                onClick={onCopy}
                aria-label="Copy API key"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              ref={doneRef}
              onClick={onClose}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        </div>
  );
}
