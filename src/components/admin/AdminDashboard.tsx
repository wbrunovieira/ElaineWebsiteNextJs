'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const TABS: { key: Tab; label: string }[] = [
  { key: 'gallery', label: 'Galeria' },
  { key: 'videos', label: 'Vídeos' },
  { key: 'stories', label: 'Depoimentos' },
  { key: 'sessions', label: 'Sessões' },
  { key: 'locations', label: 'Locais' },
];

// Mux Free plan stores up to 10 videos at a time.
const MAX_VIDEOS = 10;

const newId = () =>
  `id-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const inputClass =
  'w-full rounded-lg border border-muted bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none';
const labelClass = 'text-sm font-lato text-muted-foreground';

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

  async function save() {
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
        text: `${added.length} foto(s) adicionada(s). Clique em Salvar para publicar.`,
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
      <header className="sticky top-0 z-10 border-b border-muted bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="font-playfair text-xl font-bold text-primary">
            Painel da Elaine
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 font-lato font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-muted px-4 py-2 font-lato text-foreground transition hover:bg-card"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 font-lato text-sm ${
              message.kind === 'ok'
                ? 'bg-secondary/15 text-secondary'
                : 'bg-primary/15 text-primary'
            }`}
            role="status"
          >
            {message.text}
          </div>
        )}

        <nav className="mb-6 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 font-lato text-sm transition ${
                tab === t.key
                  ? 'bg-primary text-background'
                  : 'bg-card text-foreground hover:bg-muted/40'
              }`}
            >
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary px-4 py-3 font-lato text-primary transition hover:bg-primary/10">
          <input
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={e => onAdd(e.target.files)}
          />
          {uploading ? 'Enviando…' : '+ Adicionar fotos'}
        </label>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm font-lato text-foreground">
        💡 <strong>Dica:</strong> arraste as fotos (pelo ícone{' '}
        <span className="rounded bg-background/70 px-1">⠿</span>) para
        reorganizá-las. A ordem que você definir aqui é exatamente a ordem
        em que elas aparecem no site. Lembre de clicar em{' '}
        <strong>Salvar</strong> para publicar.
      </div>

      <div className="rounded-lg bg-card p-3 text-sm font-lato text-muted-foreground">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
      className="overflow-hidden rounded-xl bg-card shadow"
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
          className="absolute left-2 top-2 cursor-grab touch-none rounded-md bg-background/80 px-2 py-1 text-sm shadow active:cursor-grabbing"
        >
          ⠿
        </button>
      </div>
      <div className="space-y-2 p-2">
        <label className="block">
          <span className="text-xs font-lato text-muted-foreground">
            Descrição (alt)
          </span>
          <input
            value={photo.alt}
            placeholder="Ex.: mulher recebendo ativação Kundalini"
            onChange={e => onAlt(photo.id, e.target.value)}
            className={inputClass + ' mt-1 text-xs'}
          />
        </label>
        <div className="flex items-center justify-end">
          <button
            onClick={() => onRemove(photo)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:underline"
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
      <p className="text-xs text-muted-foreground">
        Métricas indisponíveis.
      </p>
    );
  }
  if (!data) {
    return (
      <p className="text-xs text-muted-foreground">
        Carregando métricas…
      </p>
    );
  }
  const cell = (value: string, label: string) => (
    <div>
      <div className="font-semibold text-foreground">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-3 gap-1 text-center text-xs">
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`inline-flex items-center gap-2 rounded-lg border border-dashed border-primary px-4 py-3 font-lato text-primary transition ${
            busy || atLimit
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-primary/10'
          }`}
        >
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={busy || atLimit}
            onChange={e => onAdd(e.target.files?.[0])}
          />
          {busy ? 'Aguarde…' : '+ Adicionar vídeo'}
        </label>
        <span className="text-sm font-lato text-muted-foreground">
          {videos.length}/{MAX_VIDEOS} vídeos
        </span>
        {busy && (
          <p className="text-sm font-lato text-muted-foreground">
            {videoStatus}
          </p>
        )}
        {atLimit && !busy && (
          <p className="text-sm font-lato text-primary">
            Limite atingido — exclua um vídeo para adicionar outro.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm font-lato text-foreground">
        💡 <strong>Dica:</strong> os vídeos são otimizados automaticamente
        (qualquer tamanho, inclusive do celular). Depois de enviar, aguarde
        o processamento terminar e clique em <strong>Salvar</strong> para
        publicar.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map(v => (
          <div
            key={v.id}
            className="overflow-hidden rounded-xl bg-card shadow"
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
            <div className="space-y-2 p-2">
              <label className="block">
                <span className="text-xs font-lato text-muted-foreground">
                  Título (opcional)
                </span>
                <input
                  value={v.title ?? ''}
                  placeholder="Ex.: depoimento da Maria"
                  onChange={e => onTitle(v.id, e.target.value)}
                  className={inputClass + ' mt-1 text-xs'}
                />
              </label>
              {v.muxPlaybackId ? (
                <div className="rounded-md bg-background/60 p-2">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Métricas · últimos 30 dias
                  </div>
                  <MuxMetrics videoId={v.muxPlaybackId} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Métricas só para vídeos no Mux.
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {v.muxPlaybackId ? 'Mux' : 'Arquivo local'}
                </span>
                <button
                  onClick={() => onRemove(v)}
                  className="text-xs font-semibold text-primary hover:underline"
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
    <div className="space-y-4">
      {stories.map(story => (
        <div key={story.id} className="space-y-2 rounded-xl bg-card p-4 shadow">
          <div className="grid gap-2 sm:grid-cols-2">
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
            className="text-xs font-semibold text-primary hover:underline"
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
        className="rounded-lg border border-dashed border-primary px-4 py-2 font-lato text-primary hover:bg-primary/10"
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
    <div className="space-y-4">
      {sessions.map(s => (
        <div key={s.id} className="space-y-2 rounded-xl bg-card p-4 shadow">
          <div className="grid gap-2 sm:grid-cols-2">
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
            className="text-xs font-semibold text-primary hover:underline"
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
        className="rounded-lg border border-dashed border-primary px-4 py-2 font-lato text-primary hover:bg-primary/10"
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
    <div className="space-y-4">
      {locations.map(l => (
        <div key={l.id} className="space-y-2 rounded-xl bg-card p-4 shadow">
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
            className="text-xs font-semibold text-primary hover:underline"
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
        className="rounded-lg border border-dashed border-primary px-4 py-2 font-lato text-primary hover:bg-primary/10"
      >
        + Adicionar local
      </button>
    </div>
  );
}
