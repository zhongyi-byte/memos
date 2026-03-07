import { useState } from "react";
import { setAccessToken } from "@/auth-state";
import { Button } from "@/components/ui/button";
import { setConfiguredServerUrl } from "@/utils/server-config";

const PERMANENT_TOKEN_EXPIRY = new Date("2099-12-31T23:59:59.000Z");

const NativeServerSetup = () => {
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = () => {
    const normalizedUrl = serverUrl.trim().replace(/\/+$/, "");
    const normalizedToken = token.trim();

    if (!normalizedUrl || !normalizedToken) {
      return;
    }

    setConfiguredServerUrl(normalizedUrl);
    setAccessToken(normalizedToken, PERMANENT_TOKEN_EXPIRY, { persistent: true, refreshable: false });
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f5efe7_0%,#efe7dd_100%)] px-5 py-8 text-[#2e2924]">
      <div className="w-full max-w-sm rounded-[28px] border border-[#e0d5c8] bg-white/90 p-6 shadow-[0_24px_80px_rgba(85,66,48,0.12)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a28b76]">Android Setup</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Connect to your Memos server</h1>
        <p className="mt-2 text-sm leading-6 text-[#7c6859]">
          Enter the server address and a personal access token to use this app on Android.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#5c4c3f]">Server URL</span>
            <input
              className="h-12 w-full rounded-2xl border border-[#dfd2c3] bg-[#fbf7f2] px-4 text-sm outline-none transition-colors focus:border-[#b99d84]"
              type="url"
              value={serverUrl}
              placeholder="https://memos.example.com"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => setServerUrl(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#5c4c3f]">Access Token</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-[#dfd2c3] bg-[#fbf7f2] px-4 py-3 text-sm outline-none transition-colors focus:border-[#b99d84]"
              value={token}
              placeholder="Paste your personal access token"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
        </div>

        <Button className="mt-6 h-11 w-full rounded-full bg-[#8d6d58] text-white hover:bg-[#7c5e4b]" onClick={handleSubmit}>
          Save and Continue
        </Button>
      </div>
    </div>
  );
};

export default NativeServerSetup;
