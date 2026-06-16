'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as UpChunk from '@mux/upchunk';
import { reorderById } from '@/lib/gallery';
import type {
  SiteContent,
  Story,
  SessionOption,
  LocationItem,
  GalleryPhoto,
  VideoTestimonial,
} from '@/lib/content';

type Tab =
  | 'gallery'
  | 'stories'
  | 'sessions'
  | 'locations'
  | 'videos';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'gallery', label: 'Galeria', icon: '🖼️' },
  { key: 'videos', label: 'Vídeos', icon: '🎬' },
  { key: 'stories', label: 'Depoimentos', icon: '💬' },
  { key: 'sessions', label: 'Sessões', icon: '🗓️' },
  { key: 'locations', label: 'Locais', icon: '📍' },
];

// Mux Free plan stores up to 10 videos at a time.
const MAX_VIDEOS = 10;

const newId = () =>
  `id-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const inputClass =
  'w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-base text-foreground transition placeholder:text-muted/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15';
const labelClass =
  'mb-1 block text-sm font-lato font-semibold text-foreground/70';
const cardClass =
  'rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-[0_4px_24px_rgba(43,45,66,0.06)] backdrop-blur-sm';
const addBtnClass =
  'inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 px-5 py-3 font-lato text-base font-semibold text-primary transition hover:border-primary hover:bg-primary/5';

/** Reads natural dimensions of an image File. */
function readDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

/** True for HEIC/HEIF files (often from iPhones); type may be empty. */
function isHeic(file: File): boolean {
  const t = file.type.toLowerCase();
  return (
    t === 'image/heic' ||
    t === 'image/heif' ||
    /\.hei[cf]$/i.test(file.name)
  );
}

/**
 * Converts HEIC/HEIF to JPEG in the browser (most browsers can't decode HEIC
 * into a canvas). Other formats pass through untouched. heic2any is loaded
 * lazily so it only ships when an iPhone HEIC is actually selected.
 */
async function toBrowserReadable(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  const heic2any = (await import('heic2any')).default;
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const name =
    file.name.replace(/\.(heic|heif)$/i, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}

/** Builds a tiny base64 blur placeholder from an image File. */
async function makeBlur(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('blur failed'));
      i.src = url;
    });
    const w = 12;
    const h = Math.max(
      1,
      Math.round((img.naturalHeight / img.naturalWidth) * w)
    );
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.5);
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface MuxStatusResult {
  status: 'processing' | 'ready' | 'error';
  assetId?: string;
  playbackId?: string;
}

/** Polls the Mux status endpoint until the asset is ready/errored. */
async function pollMuxStatus(
  uploadId: string,
  maxMs = 5 * 60 * 1000
): Promise<MuxStatusResult> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const res = await fetch(
      `/api/admin/mux/status?uploadId=${encodeURIComponent(uploadId)}`
    );
    if (res.ok) {
      const data = (await res.json()) as MuxStatusResult;
      if (data.status === 'ready' || data.status === 'error') {
        return data;
      }
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  return { status: 'error' };
}

export default function AdminDashboard({
  initial,
}: {
  initial: SiteContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initial);
  const [tab, setTab] = useState<Tab>('gallery');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Empty string = idle; otherwise a status line shown during video upload.
  const [videoStatus, setVideoStatus] = useState('');
  const [message, setMessage] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);

  function patch(update: Partial<SiteContent>) {
    setContent(prev => ({ ...prev, ...update }));
  }

  // Auto-dismiss the toast (errors linger a bit longer than successes).
  useEffect(() => {
    if (!message) return;
    const ms = message.kind === 'err' ? 8000 : 4000;
    const t = setTimeout(() => setMessage(null), ms);
    return () => clearTimeout(t);
  }, [message]);

  async function save() {
    // Every gallery photo must have an alt (accessibility + SEO).
    const missingAlt = content.gallery.some(p => !p.alt.trim());
    if (missingAlt) {
      setTab('gallery');
      setMessage({
        kind: 'err',
        text: 'Toda foto precisa de uma descrição (alt). Preencha os campos destacados em vermelho.',
      });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erro ${res.status}`);
      }
      setMessage({ kind: 'ok', text: 'Salvo! As mudanças já estão no site.' });
    } catch (e) {
      setMessage({ kind: 'err', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    try {
      const added: GalleryPhoto[] = [];
      for (const original of Array.from(files)) {
        // iPhone HEIC → JPEG first (most browsers can't decode HEIC otherwise).
        const readable = await toBrowserReadable(original);
        const compressed = await imageCompression(readable, {
          maxWidthOrHeight: 2400,
          maxSizeMB: 1.5,
          useWebWorker: true,
          fileType: 'image/webp',
        });
        const [{ width, height }, blurDataURL] = await Promise.all([
          readDimensions(compressed),
          makeBlur(compressed),
        ]);
        const form = new FormData();
        form.set('file', compressed, `${newId()}.webp`);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: form,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Falha no upload');
        }
        const { url } = await res.json();
        added.push({
          id: newId(),
          src: url,
          width,
          height,
          alt: '',
          blurDataURL,
        });
      }
      patch({ gallery: [...content.gallery, ...added] });
      setMessage({
        kind: 'ok',
        text: `${added.length} foto(s) adicionada(s). Preencha a descrição (alt) de cada uma e clique em Salvar.`,
      });
    } catch (e) {
      setMessage({ kind: 'err', text: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photo: GalleryPhoto) {
    patch({
      gallery: content.gallery.filter(p => p.id !== photo.id),
    });
    // Best-effort: delete from storage if it's an uploaded Blob.
    if (photo.src.includes('.public.blob.vercel-storage.com')) {
      fetch('/api/admin/blob/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: photo.src }),
      }).catch(() => {});
    }
  }

  async function addVideo(file: File | undefined) {
    if (!file) return;
    if (content.videoTestimonials.length >= MAX_VIDEOS) {
      setMessage({
        kind: 'err',
        text: `Limite de ${MAX_VIDEOS} vídeos atingido (plano Free do Mux). Exclua um para adicionar outro.`,
      });
      return;
    }
    setMessage(null);
    setVideoStatus('Preparando envio…');
    try {
      // 1. Ask the server for a Mux direct-upload URL.
      const res = await fetch('/api/admin/mux/upload', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Não foi possível iniciar o upload.');
      const { uploadId, uploadUrl } = await res.json();

      // 2. Upload the file straight to Mux (chunked, resumable).
      await new Promise<void>((resolve, reject) => {
        const up = UpChunk.createUpload({ endpoint: uploadUrl, file });
        up.on('progress', e => {
          setVideoStatus(
            `Enviando… ${Math.round(
              (e as CustomEvent<{ progress: number }>).detail.progress
            )}%`
          );
        });
        up.on('success', () => resolve());
        up.on('error', e =>
          reject(
            new Error(
              (e as CustomEvent<{ message?: string }>).detail?.message ||
                'Falha no upload'
            )
          )
        );
      });

      // 3. Poll Mux until the asset finishes processing.
      setVideoStatus('Processando o vídeo no Mux…');
      const result = await pollMuxStatus(uploadId);
      if (result.status !== 'ready' || !result.playbackId) {
        throw new Error('O Mux não conseguiu processar este vídeo.');
      }

      patch({
        videoTestimonials: [
          ...content.videoTestimonials,
          {
            id: newId(),
            title: '',
            muxPlaybackId: result.playbackId,
            muxAssetId: result.assetId,
          },
        ],
      });
      setMessage({
        kind: 'ok',
        text: 'Vídeo adicionado! Clique em Salvar para publicar.',
      });
    } catch (e) {
      setMessage({ kind: 'err', text: (e as Error).message });
    } finally {
      setVideoStatus('');
    }
  }

  function removeVideo(video: VideoTestimonial) {
    patch({
      videoTestimonials: content.videoTestimonials.filter(
        v => v.id !== video.id
      ),
    });
    if (video.muxAssetId) {
      fetch('/api/admin/mux/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ assetId: video.muxAssetId }),
      }).catch(() => {});
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-primary sm:text-3xl">
              Painel da Elaine
            </h1>
            <p className="font-lato text-sm text-foreground/60">
              Atualize o conteúdo do site
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-primary px-5 py-2.5 font-lato text-base font-semibold text-background shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              onClick={logout}
              className="rounded-xl border border-border px-5 py-2.5 font-lato text-base text-foreground transition hover:bg-foreground/5"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div
            key={message.text}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="alert"
            aria-live="assertive"
            className={`fixed left-1/2 top-5 z-50 flex w-[min(92vw,30rem)] -translate-x-1/2 items-start gap-3 rounded-2xl px-5 py-4 font-lato text-base shadow-2xl ${
              message.kind === 'ok'
                ? 'bg-secondary text-background'
                : 'bg-primary text-background'
            }`}
          >
            <span className="mt-0.5 text-xl leading-none">
              {message.kind === 'ok' ? '✓' : '⚠'}
            </span>
            <p className="flex-1 font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              aria-label="Fechar"
              className="ml-1 shrink-0 text-background/80 hover:text-background"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-lato text-base font-medium transition ${
                tab === t.key
                  ? 'bg-primary text-background shadow-lg shadow-primary/25'
                  : 'border border-border bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground'
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'gallery' && (
          <GalleryEditor
            photos={content.gallery}
            uploading={uploading}
            onAdd={addPhotos}
            onRemove={removePhoto}
            onReorder={gallery => patch({ gallery })}
            onAlt={(id, alt) =>
              patch({
                gallery: content.gallery.map(p =>
                  p.id === id ? { ...p, alt } : p
                ),
              })
            }
          />
        )}

        {tab === 'videos' && (
          <VideosEditor
            videos={content.videoTestimonials}
            videoStatus={videoStatus}
            onAdd={addVideo}
            onRemove={removeVideo}
            onTitle={(id, title) =>
              patch({
                videoTestimonials: content.videoTestimonials.map(v =>
                  v.id === id ? { ...v, title } : v
                ),
              })
            }
          />
        )}

        {tab === 'stories' && (
          <StoriesEditor
            stories={content.stories}
            onChange={stories => patch({ stories })}
          />
        )}

        {tab === 'sessions' && (
          <SessionsEditor
            sessions={content.sessions}
            onChange={sessions => patch({ sessions })}
          />
        )}

        {tab === 'locations' && (
          <LocationsEditor
            locations={content.locations}
            onChange={locations => patch({ locations })}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Gallery ----------------------------- */

function GalleryEditor({
  photos,
  uploading,
  onAdd,
  onRemove,
  onReorder,
  onAlt,
}: {
  photos: GalleryPhoto[];
  uploading: boolean;
  onAdd: (files: FileList | null) => void;
  onRemove: (photo: GalleryPhoto) => void;
  onReorder: (photos: GalleryPhoto[]) => void;
  onAlt: (id: string, alt: string) => void;
}) {
  const sensors = useSensors(
    // A small drag threshold keeps clicks on the alt input / delete button working.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    onReorder(
      reorderById(photos, String(active.id), String(over.id))
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className={addBtnClass + ' cursor-pointer'}>
          <input
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={e => onAdd(e.target.files)}
          />
          {uploading ? 'Enviando…' : '＋ Adicionar fotos'}
        </label>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 font-lato text-base text-foreground">
        💡 <strong>Dica:</strong> arraste as fotos (pelo ícone{' '}
        <span className="rounded bg-background px-1">⠿</span>) para
        reorganizá-las. A ordem que você definir é seguida no site — as
        primeiras aparecem no topo e as últimas embaixo. O layout pode
        reposicionar levemente para encaixar melhor fotos de tamanhos
        diferentes, então pode não ficar <em>exatamente</em> igual. Lembre
        de clicar em <strong>Salvar</strong> para publicar.
      </div>

      <div className={cardClass + ' text-base text-foreground/70'}>
        <strong className="text-foreground">O que é a descrição (alt)?</strong>{' '}
        É um texto curto que descreve o que aparece na foto. Ele é lido em
        voz alta para pessoas com deficiência visual (acessibilidade), ajuda
        o Google a entender a imagem (SEO) e aparece caso a foto não carregue.
        Ex.: <em>&quot;Elaine conduzindo uma ativação Kundalini em grupo&quot;</em>.
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map(p => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map(photo => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onRemove={onRemove}
                onAlt={onAlt}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePhoto({
  photo,
  onRemove,
  onAlt,
}: {
  photo: GalleryPhoto;
  onRemove: (photo: GalleryPhoto) => void;
  onAlt: (id: string, alt: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 shadow-[0_4px_24px_rgba(43,45,66,0.06)] transition hover:shadow-[0_8px_30px_rgba(43,45,66,0.12)]"
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.alt}
          className="aspect-square w-full object-cover"
        />
        {/* Drag handle — only this grabs, so the input/button stay usable */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
          className="absolute left-2 top-2 cursor-grab touch-none rounded-lg bg-background/90 px-2.5 py-1.5 text-base shadow-md active:cursor-grabbing"
        >
          ⠿
        </button>
      </div>
      <div className="space-y-3 p-3">
        <label className="block">
          <span className={labelClass}>
            Descrição (alt) <span className="text-primary">*</span>
          </span>
          <input
            value={photo.alt}
            placeholder="Ex.: mulher recebendo ativação Kundalini"
            onChange={e => onAlt(photo.id, e.target.value)}
            aria-invalid={!photo.alt.trim()}
            className={
              inputClass +
              ' text-sm' +
              (!photo.alt.trim()
                ? ' border-primary ring-2 ring-primary/30'
                : '')
            }
          />
        </label>
        <div className="flex items-center justify-end">
          <button
            onClick={() => onRemove(photo)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Videos ----------------------------- */

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/** Per-video Mux Data metrics (last 30 days), fetched on mount. */
function MuxMetrics({ videoId }: { videoId: string }) {
  const [data, setData] = useState<{
    views: number;
    avgWatchTimeMs: number;
    totalWatchTimeMs: number;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/mux/metrics?videoId=${encodeURIComponent(videoId)}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => active && setData(d))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [videoId]);

  if (failed) {
    return (
      <p className="text-sm text-foreground/50">Métricas indisponíveis.</p>
    );
  }
  if (!data) {
    return (
      <p className="text-sm text-foreground/50">Carregando métricas…</p>
    );
  }
  const cell = (value: string, label: string) => (
    <div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-3 gap-1 text-center">
      {cell(String(data.views), 'views')}
      {cell(formatDuration(data.avgWatchTimeMs), 'média')}
      {cell(formatDuration(data.totalWatchTimeMs), 'total')}
    </div>
  );
}

function VideosEditor({
  videos,
  videoStatus,
  onAdd,
  onRemove,
  onTitle,
}: {
  videos: VideoTestimonial[];
  videoStatus: string;
  onAdd: (file: File | undefined) => void;
  onRemove: (video: VideoTestimonial) => void;
  onTitle: (id: string, title: string) => void;
}) {
  const busy = !!videoStatus;
  const atLimit = videos.length >= MAX_VIDEOS;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={
            addBtnClass +
            (busy || atLimit
              ? ' cursor-not-allowed opacity-50'
              : ' cursor-pointer')
          }
        >
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={busy || atLimit}
            onChange={e => onAdd(e.target.files?.[0])}
          />
          {busy ? 'Aguarde…' : '＋ Adicionar vídeo'}
        </label>
        <span className="rounded-full bg-foreground/5 px-3 py-1 text-sm font-semibold text-foreground/70">
          {videos.length}/{MAX_VIDEOS} vídeos
        </span>
        {busy && (
          <p className="font-lato text-base text-foreground/70">
            {videoStatus}
          </p>
        )}
        {atLimit && !busy && (
          <p className="font-lato text-base font-medium text-primary">
            Limite atingido — exclua um vídeo para adicionar outro.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 font-lato text-base text-foreground">
        💡 <strong>Dica:</strong> os vídeos são otimizados automaticamente
        (qualquer tamanho, inclusive do celular). Depois de enviar, aguarde
        o processamento terminar e clique em <strong>Salvar</strong> para
        publicar.
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map(v => (
          <div
            key={v.id}
            className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 shadow-[0_4px_24px_rgba(43,45,66,0.06)]"
          >
            {v.muxPlaybackId ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://image.mux.com/${v.muxPlaybackId}/thumbnail.webp?width=480`}
                alt=""
                className="aspect-video w-full bg-muted/30 object-cover"
              />
            ) : v.src ? (
              <video
                src={v.src}
                muted
                className="aspect-video w-full object-cover"
              />
            ) : null}
            <div className="space-y-3 p-3">
              <label className="block">
                <span className={labelClass}>Título (opcional)</span>
                <input
                  value={v.title ?? ''}
                  placeholder="Ex.: depoimento da Maria"
                  onChange={e => onTitle(v.id, e.target.value)}
                  className={inputClass + ' text-sm'}
                />
              </label>
              {v.muxPlaybackId ? (
                <div className="rounded-xl bg-foreground/[0.04] p-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
                    Métricas · últimos 30 dias
                  </div>
                  <MuxMetrics videoId={v.muxPlaybackId} />
                </div>
              ) : (
                <p className="text-sm text-foreground/50">
                  Métricas só para vídeos no Mux.
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-semibold text-foreground/60">
                  {v.muxPlaybackId ? 'Mux' : 'Arquivo local'}
                </span>
                <button
                  onClick={() => onRemove(v)}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Stories ----------------------------- */

function StoriesEditor({
  stories,
  onChange,
}: {
  stories: Story[];
  onChange: (stories: Story[]) => void;
}) {
  const update = (id: string, field: keyof Story, value: string) =>
    onChange(
      stories.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  return (
    <div className="space-y-5">
      {stories.map(story => (
        <div key={story.id} className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-[0_4px_24px_rgba(43,45,66,0.06)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Nome</span>
              <input
                value={story.name}
                onChange={e => update(story.id, 'name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Cidade</span>
              <input
                value={story.city}
                onChange={e => update(story.id, 'city', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <span className={labelClass}>Depoimento</span>
            <textarea
              value={story.content}
              rows={4}
              onChange={e => update(story.id, 'content', e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            onClick={() => onChange(stories.filter(s => s.id !== story.id))}
            className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Excluir depoimento
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([
            ...stories,
            { id: newId(), name: '', city: '', content: '' },
          ])
        }
        className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 px-5 py-3 font-lato text-base font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
      >
        + Adicionar depoimento
      </button>
    </div>
  );
}

/* ----------------------------- Sessions ----------------------------- */

function SessionsEditor({
  sessions,
  onChange,
}: {
  sessions: SessionOption[];
  onChange: (sessions: SessionOption[]) => void;
}) {
  const update = (
    id: string,
    field: keyof SessionOption,
    value: string
  ) =>
    onChange(
      sessions.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  return (
    <div className="space-y-5">
      {sessions.map(s => (
        <div key={s.id} className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-[0_4px_24px_rgba(43,45,66,0.06)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Título</span>
              <input
                value={s.title}
                onChange={e => update(s.id, 'title', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Tipo</span>
              <select
                value={s.iconType}
                onChange={e => update(s.id, 'iconType', e.target.value)}
                className={inputClass}
              >
                <option value="map">Presencial</option>
                <option value="video">Online</option>
              </select>
            </div>
            <div>
              <span className={labelClass}>Local</span>
              <input
                value={s.local ?? ''}
                onChange={e => update(s.id, 'local', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Horário</span>
              <input
                value={s.horario ?? ''}
                onChange={e => update(s.id, 'horario', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Preço</span>
              <input
                value={s.price}
                onChange={e => update(s.id, 'price', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Data</span>
              <input
                value={s.date}
                onChange={e => update(s.id, 'date', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <span className={labelClass}>Descrição</span>
            <textarea
              value={s.description}
              rows={2}
              onChange={e => update(s.id, 'description', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <span className={labelClass}>Link (Eventbrite)</span>
            <input
              value={s.link}
              onChange={e => update(s.id, 'link', e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            onClick={() => onChange(sessions.filter(x => x.id !== s.id))}
            className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Excluir sessão
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([
            ...sessions,
            {
              id: newId(),
              iconType: 'map',
              title: '',
              description: '',
              price: '',
              link: '',
              date: 'Coming soon',
              local: '',
              horario: '',
            },
          ])
        }
        className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 px-5 py-3 font-lato text-base font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
      >
        + Adicionar sessão
      </button>
    </div>
  );
}

/* ----------------------------- Locations ----------------------------- */

function LocationsEditor({
  locations,
  onChange,
}: {
  locations: LocationItem[];
  onChange: (locations: LocationItem[]) => void;
}) {
  const update = (
    id: string,
    field: keyof LocationItem,
    value: string
  ) =>
    onChange(
      locations.map(l => (l.id === id ? { ...l, [field]: value } : l))
    );
  const fields: { key: keyof LocationItem; label: string }[] = [
    { key: 'name', label: 'Nome do local' },
    { key: 'date', label: 'Data' },
    { key: 'time', label: 'Horário' },
    { key: 'googleMapsUrl', label: 'Link Google Maps' },
    { key: 'wazeUrl', label: 'Link Waze' },
    { key: 'mapEmbedSrc', label: 'URL do mapa incorporado (embed)' },
  ];
  return (
    <div className="space-y-5">
      {locations.map(l => (
        <div key={l.id} className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-[0_4px_24px_rgba(43,45,66,0.06)]">
          {fields.map(f => (
            <div key={f.key}>
              <span className={labelClass}>{f.label}</span>
              <input
                value={(l[f.key] as string) ?? ''}
                onChange={e => update(l.id, f.key, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
          <button
            onClick={() => onChange(locations.filter(x => x.id !== l.id))}
            className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Excluir local
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([
            ...locations,
            {
              id: newId(),
              name: '',
              date: 'Coming soon',
              time: '',
              googleMapsUrl: '',
              wazeUrl: '',
              mapEmbedSrc: '',
            },
          ])
        }
        className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 px-5 py-3 font-lato text-base font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
      >
        + Adicionar local
      </button>
    </div>
  );
}
