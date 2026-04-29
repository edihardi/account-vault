"use client";

import { useState, useTransition } from "react";
import { restoreItemAction, permanentDeleteAction, emptyTrashAction } from "@/app/actions/trash";
import type { TrashItem } from "@/app/api/trash/route";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-card text-muted-foreground text-xs uppercase tracking-wide border-b border-border">
              <th className="px-3 py-3 text-left">Item</th>
              <th className="px-3 py-3 text-left hidden sm:table-cell">Tipe</th>
              <th className="px-3 py-3 text-left hidden sm:table-cell">Dihapus</th>
              <th className="px-3 py-3 text-right w-16">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(item => (
              <tr
                key={`${item.type}-${item.id}`}
                className="bg-background border-t border-border hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">{getIcon(item)}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${item.type === "email" ? "syntax-string" : "syntax-keyword"}`}>
                        {item.label}
                      </p>
                      {item.sublabel && (
                        <p className="text-xs syntax-variable truncate">
                          {item.type === "account" && item.sublabel.startsWith("+") ? "" : item.type === "account" ? "@" : ""}
                          {item.sublabel}
                        </p>
                      )}
                      {item.parentEmail && (
                        <p className="text-xs syntax-string/60 truncate">
                          📧 {item.parentEmail.emailAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ring-1
                    ${item.type === "email"
                      ? "bg-[#ce9178]/10 text-[#ce9178] ring-[#ce9178]/20"
                      : "bg-[#c586c0]/10 text-[#c586c0] ring-[#c586c0]/20"
                    }`}>
                    {item.type === "email" ? "Email" : "Akun"}
                  </span>
                </td>
                <td className="px-3 py-3 hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground/60">
                    {relativeTime(item.deletedAt)}
                  </span>
                </td>
                <td className="px-3 py-3 w-16">
                  <div className="flex gap-1 justify-end">
                    {/* Mobile: icon only */}
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={isPending}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-muted disabled:opacity-40"
                      title="Pulihkan"
                    >
                      {/* Restore icon (mobile) / text (desktop) */}
                      <span className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </span>
                      <span className="hidden md:inline text-xs px-1">Pulihkan</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      disabled={isPending}
                      className="p-1.5 text-destructive hover:opacity-80 transition-colors rounded hover:bg-muted disabled:opacity-40"
                      title="Hapus Permanen"
                    >
                      <span className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </span>
                      <span className="hidden md:inline text-xs px-1">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
