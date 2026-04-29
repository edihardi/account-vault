"use client";

import { useState, useTransition } from "react";
import { restoreItemAction, permanentDeleteAction, emptyTrashAction } from "@/app/actions/trash";
import type { TrashItem } from "@/app/api/trash/route";
import DeleteConfirmModal from "./DeleteConfirmModal";

const PLATFORM_ICONS: Record<string, string> = {
  discord: "🎮", "x (twitter)": "𝕏", telegram: "✈️",
  instagram: "📸", tiktok: "🎵", facebook: "📘",
  reddit: "🤖", github: "🐙", steam: "🕹️",
  youtube: "▶️", twitch: "💜", spotify: "🎧",
};

function getIcon(item: TrashItem) {
  if (item.type === "email") return "📧";
  return PLATFORM_ICONS[item.label.toLowerCase()] ?? "🔑";
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hari ini";
  if (days === 1) return "kemarin";
  return `${days} hari lalu`;
}

interface Props {
  items: TrashItem[];
}

export default function TrashList({ items }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<TrashItem | null>(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRestore(item: TrashItem) {
    startTransition(async () => {
      await restoreItemAction(item.id, item.type);
    });
  }

  function handlePermanentDelete(item: TrashItem) {
    startTransition(async () => {
      await permanentDeleteAction(item.id, item.type);
      setDeleteTarget(null);
    });
  }

  function handleEmptyTrash() {
    startTransition(async () => {
      await emptyTrashAction();
      setEmptyConfirm(false);
    });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-4xl mb-4">🗑️</p>
        <p className="text-sm">Trash kosong</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} item di trash</p>
        <button
          onClick={() => setEmptyConfirm(true)}
          disabled={isPending}
          className="text-xs text-destructive hover:opacity-80 transition-colors px-3 py-1.5 rounded-lg border border-destructive/30 hover:bg-destructive/10 disabled:opacity-40"
        >
          Kosongkan Trash
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="bg-card text-muted-foreground text-xs uppercase tracking-wide border-b border-border">
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Tipe</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Dihapus</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={`${item.type}-${item.id}`}
                className="bg-background border-t border-border hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">{getIcon(item)}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.label}
                      </p>
                      {item.sublabel && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.type === "account" && item.sublabel.startsWith("+") ? "" : item.type === "account" ? "@" : ""}
                          {item.sublabel}
                        </p>
                      )}
                      {item.parentEmail && (
                        <p className="text-xs text-muted-foreground/60 truncate">
                          📧 {item.parentEmail.emailAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${item.type === "email"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-violet-500/10 text-violet-400"
                    }`}>
                    {item.type === "email" ? "Email" : "Akun"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground/60">
                    {relativeTime(item.deletedAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
                    >
                      Pulihkan
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      disabled={isPending}
                      className="text-xs text-destructive hover:opacity-80 transition-colors px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          label={`${deleteTarget.label}${deleteTarget.sublabel ? ` — ${deleteTarget.sublabel}` : ""}`}
          onConfirm={() => handlePermanentDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          danger
          confirmText="Hapus Permanen"
          description={
            deleteTarget.type === "email"
              ? "Email ini beserta semua akun sosmednya akan dihapus permanen. Tidak dapat dipulihkan."
              : "Akun ini akan dihapus permanen. Tidak dapat dipulihkan."
          }
        />
      )}

      {emptyConfirm && (
        <DeleteConfirmModal
          label="semua item di trash"
          onConfirm={handleEmptyTrash}
          onClose={() => setEmptyConfirm(false)}
          danger
          confirmText="Kosongkan Semua"
          description="Semua item di trash akan dihapus permanen. Tidak dapat dipulihkan."
        />
      )}
    </>
  );
}
