"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Image, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "photo" | "manual";

export default function ScanPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("photo");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopStream = useCallback(() => {
    setStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError("Fotocamera non disponibile. Usa la galleria.");
    }
  }, []);

  useEffect(() => {
    if (activeTab === "photo" && !capturedImage) {
      startCamera();
    }
    return () => {
      stopStream();
    };
  }, [activeTab, capturedImage, startCamera, stopStream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleFlash = useCallback(async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const newFlash = !flashEnabled;
    try {
      await track.applyConstraints({
        advanced: [{ torch: newFlash } as MediaTrackConstraintSet],
      });
      setFlashEnabled(newFlash);
    } catch {
      // torch not supported
    }
  }, [stream, flashEnabled]);

  const uploadImage = useCallback(
    async (blob: Blob) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", blob, "scan.jpg");
        const res = await fetch("/api/scans/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        router.push(`/scan/confirm?scanId=${data.scanId}`);
      } catch {
        setIsUploading(false);
        setCapturedImage(null);
        toast.error("Errore durante il caricamento. Riprova.");
      }
    },
    [router],
  );

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopStream();
    canvas.toBlob(
      (blob) => {
        if (blob) uploadImage(blob);
      },
      "image/jpeg",
      0.85,
    );
  }, [stopStream, uploadImage]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      setCapturedImage((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return objectUrl;
      });
      stopStream();
      uploadImage(file);
    },
    [stopStream, uploadImage],
  );

  return (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-[oklch(0.97_0.01_85)]">
      {/* Tab Toggle */}
      <div className="flex gap-1 px-4 pb-2 pt-2">
        <button
          className={cn(
            "flex-1 rounded-full py-2 px-3 text-[13px] font-semibold text-center transition-all",
            activeTab === "photo"
              ? "bg-[oklch(0.25_0.02_50)] text-white"
              : "bg-[oklch(0.93_0.015_85)] text-[oklch(0.55_0.02_50)]",
          )}
          onClick={() => setActiveTab("photo")}
        >
          {"📷 Foto"}
        </button>
        <button
          className={cn(
            "flex-1 rounded-full py-2 px-3 text-[13px] font-semibold text-center transition-all",
            activeTab === "manual"
              ? "bg-[oklch(0.25_0.02_50)] text-white"
              : "bg-[oklch(0.93_0.015_85)] text-[oklch(0.55_0.02_50)]",
          )}
          onClick={() => setActiveTab("manual")}
        >
          {"✏️ Manuale"}
        </button>
      </div>

      {/* PHOTO MODE */}
      {activeTab === "photo" && (
        <div>
          {/* Viewfinder */}
          <div className="px-4 py-3">
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-3xl",
                "bg-[oklch(0.15_0.01_50)]",
                "aspect-[3/4]",
              )}
            >
              {/* Camera feed or captured image */}
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Scansione"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center",
                    "bg-[radial-gradient(circle_at_center,transparent_40%,oklch(0.10_0.01_50/0.6)_100%),linear-gradient(180deg,oklch(0.22_0.02_50),oklch(0.18_0.02_50))]",
                  )}
                >
                  {/* Live video (hidden behind hint if no stream) */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover",
                      !stream && "hidden",
                    )}
                  />

                  {/* Hint when no camera */}
                  {!stream && (
                    <div className="text-center text-[oklch(0.99_0_0/0.7)]">
                      {cameraError ? (
                        <p className="text-[13px] font-medium tracking-wide px-6">
                          {cameraError}
                        </p>
                      ) : (
                        <>
                          <div className="mb-2 text-[2.5rem] animate-pulse">
                            {"🔍"}
                          </div>
                          <div className="text-[13px] font-medium tracking-wide">
                            Inquadra i tuoi ingredienti
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Corner guides */}
              {!capturedImage && (
                <div className="pointer-events-none absolute inset-6">
                  {/* Top-left */}
                  <div
                    className="absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-[2.5px] border-l-[2.5px]"
                    style={{ borderColor: "oklch(0.99 0 0 / 0.5)" }}
                  />
                  {/* Top-right */}
                  <div
                    className="absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-[2.5px] border-r-[2.5px]"
                    style={{ borderColor: "oklch(0.99 0 0 / 0.5)" }}
                  />
                  {/* Bottom-left */}
                  <div
                    className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-[2.5px] border-l-[2.5px]"
                    style={{ borderColor: "oklch(0.99 0 0 / 0.5)" }}
                  />
                  {/* Bottom-right */}
                  <div
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-[2.5px] border-r-[2.5px]"
                    style={{ borderColor: "oklch(0.99 0 0 / 0.5)" }}
                  />
                </div>
              )}

              {/* Scanning / uploading overlay */}
              {isUploading && (
                <div
                  className={cn(
                    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3",
                    "rounded-3xl bg-[oklch(0.10_0.01_50/0.75)] backdrop-blur-sm",
                  )}
                >
                  <div className="flex gap-2">
                    <span className="h-[10px] w-[10px] animate-pulse rounded-full bg-white" />
                    <span className="h-[10px] w-[10px] animate-pulse rounded-full bg-white [animation-delay:0.2s]" />
                    <span className="h-[10px] w-[10px] animate-pulse rounded-full bg-white [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[13px] font-medium text-white">
                    Identifico gli ingredienti...
                  </span>
                  <span className="text-[12px] text-[oklch(0.99_0_0/0.6)]">
                    AI Vision in azione
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shutter Controls */}
          <div className="flex items-center justify-center gap-8 px-4 py-5">
            {/* Gallery */}
            <button
              className="flex flex-col items-center gap-1 text-[oklch(0.55_0.02_50)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <span
                className={cn(
                  "flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full",
                  "bg-[oklch(0.93_0.015_85)] text-[1.2rem] transition-colors hover:bg-[oklch(0.88_0.005_50)]",
                )}
              >
                <Image size={20} />
              </span>
              <span className="text-[11px] font-medium">Galleria</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Shutter */}
            <button
              aria-label="Scatta foto"
              className={cn(
                "h-[4.5rem] w-[4.5rem] rounded-full",
                "bg-[oklch(0.55_0.22_25)] border-4 border-white",
                "shadow-[0_0_0_3px_oklch(0.55_0.22_25),0_4px_20px_oklch(0.55_0.22_25/0.4)]",
                "transition-transform active:scale-95 hover:scale-[1.06]",
              )}
              onClick={capturePhoto}
            />

            {/* Flash */}
            <button
              className="flex flex-col items-center gap-1 text-[oklch(0.55_0.02_50)]"
              onClick={toggleFlash}
            >
              <span
                className={cn(
                  "flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full",
                  "text-[1.2rem] transition-colors",
                  flashEnabled
                    ? "bg-[oklch(0.55_0.22_25)] text-white"
                    : "bg-[oklch(0.93_0.015_85)] hover:bg-[oklch(0.88_0.005_50)]",
                )}
              >
                <Zap size={20} />
              </span>
              <span className="text-[11px] font-medium">Flash</span>
            </button>
          </div>
        </div>
      )}

      {/* MANUAL MODE */}
      {activeTab === "manual" && (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-[oklch(0.55_0.02_50)] text-[13px] font-medium">
            Coming soon in US-003
          </p>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
