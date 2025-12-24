"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl"; ///dashboard/settings/account/page.tsx]
import * as z from "zod";
import Cropper from "react-easy-crop";
import { useAuthStore } from "@/store/use-auth-store";
import { useUserMutations } from "@/hooks/use-mutations";
import { userService } from "@/services/user-service";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import getCroppedImg from "@/lib/canvas-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/error-utils";
import { validateImageFile } from "@/lib/file-validation";
import { useWorkspaces } from "@/hooks/use-queries";

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
});
type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const t = useTranslations("ProfilePage"); ///dashboard/settings/account/page.tsx]
  const user = useAuthStore((state) => state.user);
  const { data: workspaces } = useWorkspaces();
  const queryClient = useQueryClient();

  const { uploadAvatar, deleteAvatar } = useUserMutations();

  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName: string }) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      if (workspaces) {
        workspaces.forEach(w => {
          queryClient.invalidateQueries({ queryKey: ["workspaces", "members", w.id] });
        });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("displayName", user.displayName || "");
    }
  }, [user, setValue]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [isCropping, setIsCropping] = useState(false);

  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const validation = await validateImageFile(file);

      if (!validation.isValid) {
        toast.error(t("messages.invalid_file") || "Invalid file.");
        e.target.value = "";
        return;
      }

      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropping(true);
      e.target.value = "";
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const performCrop = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        setPreviewBlob(croppedBlob);
        setPreviewUrl(URL.createObjectURL(croppedBlob));
        setIsCropping(false);
        setZoom(1);
      }
    } catch (e) {
      console.error(e);
      toast.error(t("messages.crop_failed"));
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
    setZoom(1);
  };

  const handleDeleteAvatar = () => {
    deleteAvatar.mutate(undefined, {
      onSuccess: () => {
        setPreviewBlob(null);
        setPreviewUrl(null);
        setIsDeleteModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["users", "me"] });
        if (workspaces) {
          workspaces.forEach(w => {
            queryClient.invalidateQueries({ queryKey: ["workspaces", "members", w.id] });
          });
        }
      }
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    let actionsTaken = 0;

    try {
      if (isDirty) {
        await updateProfileMutation.mutateAsync({ displayName: data.displayName });
        actionsTaken++;
      }

      if (previewBlob) {
        const file = new File([previewBlob], "avatar.jpg", { type: "image/jpeg" });
        await uploadAvatar.mutateAsync(file);
        actionsTaken++;
      }

      if (actionsTaken > 0) {
        setPreviewBlob(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        reset({ displayName: data.displayName });
      }
    } catch (error) {
      console.error(t("messages.update_failed"), error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="max-w-2xl mx-auto w-full py-8">

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAvatar}
        title={t("delete_modal.title")}
        description={t("delete_modal.description")}
        confirmText={t("delete_modal.confirm")}
        variant="danger"
        isLoading={deleteAvatar.isPending}
      />

      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 animate-in fade-in duration-200">
          <div className="relative flex-1 w-full bg-[#1a2430]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              cropShape="round"
            />
          </div>

          <div className="bg-white dark:bg-[#1a2430] p-6 border-t border-[#e8edf3] dark:border-[#2d3a4a] flex flex-col gap-4">
            <div className="max-w-md mx-auto w-full space-y-2">
              <div className="flex justify-between text-xs text-[#507395] dark:text-[#94a3b8] font-medium uppercase tracking-wider">
                <span>{t("crop.zoom")}</span>
                <span>{(zoom * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelCrop}
                className="px-6 py-2 rounded-lg text-white font-bold text-sm bg-gray-600 hover:bg-gray-700 transition-colors hover:cursor-pointer"
              >
                {t("crop.cancel")}
              </button>
              <button
                onClick={performCrop}
                className="px-6 py-2 rounded-lg text-white font-bold text-sm bg-primary hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 hover:cursor-pointer"
              >
                {t("crop.apply")}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2">{t("title")}</h2>
      <p className="text-[#507395] dark:text-[#94a3b8] mb-8">{t("subtitle")}</p>

      <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm p-8">

        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* 1. Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {previewUrl && (
                <span className="absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-in zoom-in">
                  {t("avatar.preview")}
                </span>
              )}

              <div className={`size-32 rounded-full overflow-hidden relative ring-4 transition-all ${previewUrl ? "ring-amber-400" : "ring-white dark:ring-[#2d3a4a]"
                } shadow-md`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-4xl">
                    {user?.displayName?.charAt(0) || "U"}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 cursor-pointer backdrop-blur-[2px]"
                >
                  <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                  <span className="text-xs font-bold uppercase tracking-wide">{t("avatar.change")}</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              {user?.avatarUrl && !previewUrl && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-[#2d3a4a] text-red-500 hover:text-red-600 rounded-full shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors hover:cursor-pointer"
                  title={t("avatar.remove_title")}
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">delete</span>
                </button>
              )}

              {previewUrl && (
                <button
                  onClick={() => { setPreviewUrl(null); setPreviewBlob(null); }}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-[#2d3a4a] text-gray-500 hover:text-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors hover:cursor-pointer"
                  title={t("avatar.discard")}
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">undo</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#507395] dark:text-[#94a3b8]">{t("avatar.info")}</p>
          </div>

          {/* 2. Form Section */}
          <div className="flex-1 w-full max-w-md space-y-6 pt-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="displayName">
                {t("form.display_name")}
              </label>
              <input
                {...register("displayName")}
                id="displayName"
                type="text"
                className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-[#f8fafb] dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm"
              />
              {errors.displayName ? (
                <p className="text-red-500 text-xs">{errors.displayName.message}</p>
              ) : (
                <p className="text-xs text-[#507395] dark:text-[#94a3b8] mt-1">{t("form.display_name_info")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]">
                {t("form.email")}
              </label>
              <div className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-gray-100 dark:bg-[#111921]/50 py-2.5 px-4 text-[#507395] dark:text-gray-500 text-sm cursor-not-allowed">
                {user?.email}
              </div>
              <p className="text-xs text-[#507395] dark:text-[#94a3b8] mt-1">{t("form.email_info")}</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={(!isDirty && !previewBlob) || isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 hover:cursor-pointer"
              >
                {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                {isSubmitting ? t("form.saving") : t("form.save")}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}