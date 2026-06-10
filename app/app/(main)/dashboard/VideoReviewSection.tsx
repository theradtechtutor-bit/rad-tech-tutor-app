'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import TrackedYoutubeLink from '@/app/app/_components/TrackedYoutubeLink';
import { captureEvent } from '@/lib/analytics';

const MINI_MOCK_1_YOUTUBE_URL = 'https://www.youtube.com/watch?v=Q-3Ntw8z7xk';
const MINI_MOCK_1_VIDEO_URL = '/review-videos/mini-mock-1-review.mp4';
const MINI_MOCK_1_AUDIO_URL = '/review-audio/mini-mock-1-review.mp3';
const MINI_MOCK_1_POSTER_URL =
  '/review-videos/mini-mock-1-review-poster.jpg';
const MEDIA_SEEK_SECONDS = 5;

type ReviewStatus = 'Now Available' | 'Coming Soon';

type MiniMockReview = {
  qbankLabel: string;
  miniMockLabel: string;
  miniMockNumber: number;
  videoTitle: string;
  audioTitle: string;
  videoSrc: string;
  audioSrc: string;
  youtubeUrl: string;
  posterSrc: string;
  videoAvailable: boolean;
  audioAvailable: boolean;
};

type WebkitFullscreenVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitEnterFullScreen?: () => void;
};

const miniMockReviews: MiniMockReview[] = Array.from({ length: 10 }, (_, idx) => {
  const miniMockNumber = idx + 1;
  const isMiniMockOne = miniMockNumber === 1;
  const qbankLabel = 'QBank 1';
  const miniMockLabel = `Mini Mock ${miniMockNumber}`;

  return {
    qbankLabel,
    miniMockLabel,
    miniMockNumber,
    videoTitle: `${qbankLabel} ${miniMockLabel} Video Review`,
    audioTitle: `${qbankLabel} ${miniMockLabel} Audio Review`,
    videoSrc: isMiniMockOne ? MINI_MOCK_1_VIDEO_URL : '',
    audioSrc: isMiniMockOne ? MINI_MOCK_1_AUDIO_URL : '',
    youtubeUrl: isMiniMockOne ? MINI_MOCK_1_YOUTUBE_URL : '',
    posterSrc: isMiniMockOne ? MINI_MOCK_1_POSTER_URL : '',
    videoAvailable: isMiniMockOne,
    audioAvailable: isMiniMockOne,
  };
});

function getReviewStatus(available: boolean): ReviewStatus {
  return available ? 'Now Available' : 'Coming Soon';
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function clampMediaTime(time: number, duration: number) {
  const maxTime = Number.isFinite(duration) && duration > 0 ? duration : time;
  return Math.max(0, Math.min(time, maxTime));
}

function seekMediaBy(media: HTMLMediaElement, seconds: number) {
  media.currentTime = clampMediaTime(media.currentTime + seconds, media.duration);
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

function updateMediaSession({
  media,
  title,
  album,
}: {
  media: HTMLMediaElement;
  title: string;
  album: string;
}) {
  if (
    typeof navigator === 'undefined' ||
    !('mediaSession' in navigator) ||
    typeof window === 'undefined' ||
    typeof window.MediaMetadata === 'undefined'
  ) {
    return;
  }

  navigator.mediaSession.metadata = new window.MediaMetadata({
    title,
    artist: 'Rad Tech Tutor',
    album,
    artwork: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  });

  navigator.mediaSession.setActionHandler('play', () => {
    void media.play().catch(() => {});
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    media.pause();
  });
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    seekMediaBy(media, -MEDIA_SEEK_SECONDS);
  });
  navigator.mediaSession.setActionHandler('seekforward', () => {
    seekMediaBy(media, MEDIA_SEEK_SECONDS);
  });
}

function PlayIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.86l11.1-6.86a1 1 0 0 0 0-1.72L9.52 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function PauseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M8 5a2 2 0 0 0-2 2v10a2 2 0 1 0 4 0V7a2 2 0 0 0-2-2Zm8 0a2 2 0 0 0-2 2v10a2 2 0 1 0 4 0V7a2 2 0 0 0-2-2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-3.5 w-3.5 rounded-full border border-white/20"
    >
      <span className="absolute left-[6px] top-[3px] h-[5px] w-px rounded-full bg-white/25" />
      <span className="absolute left-[6px] top-[7px] h-px w-[4px] rounded-full bg-white/25" />
    </span>
  );
}

function FullscreenIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function VolumeIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function HeadphonesIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
    </svg>
  );
}

function AudioWaveform() {
  const bars = [
    18, 26, 14, 34, 22, 40, 28, 48, 24, 36, 20, 32, 16, 30, 22, 38, 18, 44,
    24, 34, 16, 42, 28, 50, 20, 36, 24, 46, 18, 32, 26, 40, 22, 30, 16, 28,
  ];

  return (
    <div className="flex h-16 min-w-0 flex-1 items-center justify-between gap-1 overflow-hidden">
      {bars.map((height, idx) => (
        <span
          key={idx}
          className="w-0.5 shrink-0 rounded-full bg-violet-300/80 shadow-[0_0_10px_rgba(167,139,250,0.35)] sm:w-1"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function ComingSoonPlayer({
  miniMockNumber,
  kind,
}: {
  miniMockNumber: number;
  kind: 'Video' | 'Audio';
}) {
  return (
    <div className="mt-4 flex aspect-video w-full max-w-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center shadow-[inset_0_0_36px_rgba(255,255,255,0.03)]">
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
        Mini Mock {miniMockNumber}
      </div>
      <div className="mt-3 text-xl font-semibold uppercase tracking-[0.14em] text-white/55">
        {kind} Review
      </div>
      <div className="mt-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-200/80">
        Coming Soon
      </div>
    </div>
  );
}

function BrandedVideoPlayer({
  review,
  variant = 'preview',
  onOpenModal,
}: {
  review: MiniMockReview;
  variant?: 'preview' | 'modal';
  onOpenModal?: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPreview = variant === 'preview';
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
  }, [review.videoSrc]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (isPreview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const video = videoRef.current;
      if (!video) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekMediaBy(video, MEDIA_SEEK_SECONDS);
        setCurrentTime(video.currentTime);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekMediaBy(video, -MEDIA_SEEK_SECONDS);
        setCurrentTime(video.currentTime);
      } else if (event.key === ' ') {
        event.preventDefault();
        if (video.paused) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreview]);

  if (!review.videoAvailable || !review.videoSrc) {
    return (
      <ComingSoonPlayer miniMockNumber={review.miniMockNumber} kind="Video" />
    );
  }

  const togglePlay = async () => {
    if (isPreview) {
      onOpenModal?.();
      return;
    }

    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {}
    } else {
      video.pause();
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = nextVolume;
    setVolume(nextVolume);
  };

  const handlePlaybackRate = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRate = Number(event.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    const video = videoRef.current as WebkitFullscreenVideoElement | null;

    if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }

    if (video?.webkitEnterFullScreen) {
      video.webkitEnterFullScreen();
      return;
    }

    await wrapperRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden bg-black shadow-[inset_0_0_36px_rgba(250,204,21,0.08)] ${
        isFullscreen
          ? 'm-0 flex h-screen w-screen max-w-none flex-col rounded-none border-0'
          : isPreview
            ? 'mt-4 max-w-[420px] rounded-2xl border border-yellow-400/35 bg-black/60'
            : 'max-w-full rounded-2xl border border-yellow-400/35 bg-black/60 [@media_(orientation:landscape)]:flex [@media_(orientation:landscape)]:h-full [@media_(orientation:landscape)]:min-h-0 [@media_(orientation:landscape)]:flex-col [@media_(orientation:landscape)]:overflow-hidden'
      }`}
    >
      <div
        className={`relative grid w-full place-items-center overflow-hidden bg-black ${
          isFullscreen
            ? 'min-h-0 flex-1'
            : isPreview
              ? 'aspect-video'
              : 'aspect-video [@media_(orientation:landscape)]:flex [@media_(orientation:landscape)]:min-h-[clamp(150px,42dvh,420px)] [@media_(orientation:landscape)]:basis-0 [@media_(orientation:landscape)]:flex-1 [@media_(orientation:landscape)]:items-center [@media_(orientation:landscape)]:justify-center [@media_(orientation:landscape)]:aspect-auto'
        }`}
        onClick={isPreview ? onOpenModal : togglePlay}
      >
        {isPreview && review.posterSrc ? (
          <div
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${review.posterSrc})` }}
            role="img"
            aria-label={review.videoTitle}
          />
        ) : (
          <video
            ref={videoRef}
            className="m-0 block h-full w-full max-h-full max-w-full object-contain object-center"
            poster={review.posterSrc || undefined}
            preload="metadata"
            playsInline
            controls={false}
            muted={isPreview}
            onClick={(event) => {
              event.stopPropagation();
              if (isPreview) {
                onOpenModal?.();
                return;
              }
              void togglePlay();
            }}
            onPlay={() => setIsPlaying(true)}
            onPlaying={(event) => {
              updateMediaSession({
                media: event.currentTarget,
                title: review.videoTitle,
                album: 'Mini Mock Video Reviews',
              });
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration || 0);
              event.currentTarget.volume = volume;
              event.currentTarget.playbackRate = playbackRate;
            }}
            onTimeUpdate={(event) =>
              setCurrentTime(event.currentTarget.currentTime)
            }
          >
            <source src={review.videoSrc} type="video/mp4" />
          </video>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isPreview) {
              onOpenModal?.();
              return;
            }
            void togglePlay();
          }}
          className={`absolute inset-0 grid place-items-center transition duration-300 ${
            isPreview
              ? 'cursor-pointer bg-black/10 opacity-100 hover:bg-black/20'
              : isPlaying
                ? 'pointer-events-none bg-transparent opacity-0'
                : 'bg-black/5 opacity-100 hover:bg-black/15'
          }`}
          aria-label={
            isPreview ? `Open ${review.videoTitle}` : 'Play video review'
          }
          aria-hidden={!isPreview && isPlaying}
          tabIndex={!isPreview && isPlaying ? -1 : 0}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-black/60 text-yellow-200 shadow-[0_0_24px_rgba(250,204,21,0.24)]">
            <PlayIcon className="ml-1 h-6 w-6" />
          </span>
        </button>

        {hasError ? (
          <div className="absolute inset-x-3 bottom-3 rounded-xl border border-yellow-400/20 bg-black/80 px-3 py-2 text-xs font-medium text-yellow-100">
            Add the video file at {review.videoSrc} to play this review.
          </div>
        ) : null}
      </div>

      {!isPreview ? (
        <div
          className={`shrink-0 space-y-3 ${
            isFullscreen
              ? 'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-14 sm:p-5 sm:pt-16'
              : 'p-2.5 sm:p-3 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:space-y-1.5 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:p-2'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-3 text-xs font-semibold text-white/65 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:gap-2">
            <span className="w-10 tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={handleSeek}
              className="h-1.5 min-w-0 flex-1 accent-yellow-400"
              aria-label="Video progress"
            />
            <span className="w-10 text-right tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-yellow-300 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:px-3 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:py-1"
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <div className="flex items-center gap-2 text-white/60">
              <VolumeIcon className="h-4 w-4" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolume}
                className="h-1.5 w-20 accent-yellow-400"
                aria-label="Video volume"
              />
            </div>

            <select
              value={playbackRate}
              onChange={handlePlaybackRate}
              className="rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs font-semibold text-white/70 outline-none"
              aria-label="Video playback speed"
            >
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleFullscreen}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-yellow-300/40 hover:text-yellow-100 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:h-8 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:w-8"
              aria-label={
                isFullscreen ? 'Exit fullscreen video' : 'Fullscreen video'
              }
            >
              <FullscreenIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VideoReviewModal({
  review,
  onClose,
}: {
  review: MiniMockReview;
  onClose: () => void;
}) {
  const [selectedReview, setSelectedReview] = useState(review);
  const [comingSoonMessage, setComingSoonMessage] = useState('');

  useEffect(() => {
    setSelectedReview(review);
    setComingSoonMessage('');
  }, [review]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/82 px-2 py-2 backdrop-blur-sm sm:px-4 sm:py-4 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:px-1.5 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:py-1.5"
      role="dialog"
      aria-modal="true"
      aria-label={review.videoTitle}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !document.fullscreenElement) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-[96vw] flex-col overflow-hidden rounded-3xl border border-yellow-400/25 bg-zinc-950 px-2.5 pb-4 pt-2.5 shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:max-h-[94dvh] sm:max-w-[94vw] sm:px-3 sm:pb-5 sm:pt-3 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:max-h-[calc(100dvh-0.75rem)] [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:max-w-[98vw] [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:rounded-2xl [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:px-2 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:pb-2 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:pt-1.5">
        <div className="flex shrink-0 items-center justify-between gap-3 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:gap-2">
          <div className="min-w-0">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-200/75 sm:text-[10px] [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:text-[8px]">
              Video Review
            </div>
            <h2 className="mt-0.5 truncate text-sm font-semibold text-white sm:text-lg [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:text-sm">
              {selectedReview.videoTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-yellow-300/40 hover:text-yellow-100 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:h-8 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:w-8"
            aria-label="Close video review"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 grid min-h-0 flex-1 overflow-hidden gap-2 xl:grid-cols-[minmax(0,78fr)_minmax(220px,22fr)] [@media_(orientation:landscape)_and_(max-width:1199px)]:grid-cols-[minmax(0,1fr)_minmax(200px,260px)] [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:mt-1.5 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:grid-cols-[minmax(0,1fr)_minmax(178px,218px)] [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:gap-1.5">
          <div className="min-h-0 min-w-0 overflow-hidden [@media_(orientation:landscape)]:h-full">
            <BrandedVideoPlayer review={selectedReview} variant="modal" />
          </div>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-2.5 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:rounded-xl [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:p-2">
            <h3 className="shrink-0 text-sm font-semibold text-white [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:text-xs">
              Mini Mock Reviews
            </h3>
            {comingSoonMessage ? (
              <div className="mt-2 shrink-0 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-medium text-yellow-100">
                {comingSoonMessage}
              </div>
            ) : null}
            <div className="mt-2 grid max-h-[30dvh] min-h-0 gap-1.5 overflow-y-auto pr-1 md:max-h-[18dvh] xl:max-h-none xl:flex-1 [@media_(orientation:landscape)_and_(max-width:1199px)]:max-h-none [@media_(orientation:landscape)_and_(max-width:1199px)]:flex-1 [@media_(orientation:landscape)_and_(max-height:600px)_and_(max-width:1024px)]:gap-1">
              {miniMockReviews.map((item) => (
                <VideoModalPlaylistRow
                  key={item.miniMockNumber}
                  review={item}
                  selected={
                    item.miniMockNumber === selectedReview.miniMockNumber
                  }
                  onSelect={(nextReview) => {
                    captureEvent('video_review_item_clicked', {
                      miniMockNumber: nextReview.miniMockNumber,
                      title: nextReview.videoTitle,
                      availability: getReviewStatus(nextReview.videoAvailable),
                      source: 'site',
                    });

                    if (!nextReview.videoAvailable) {
                      setComingSoonMessage(
                        `${nextReview.videoTitle} is coming soon.`,
                      );
                      return;
                    }

                    setComingSoonMessage('');
                    setSelectedReview(nextReview);
                  }}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function VideoModalPlaylistRow({
  review,
  selected,
  onSelect,
}: {
  review: MiniMockReview;
  selected: boolean;
  onSelect: (review: MiniMockReview) => void;
}) {
  const status = getReviewStatus(review.videoAvailable);
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.04]">
          {review.videoAvailable ? (
            <PlayIcon className="h-3 w-3 text-yellow-300" />
          ) : (
            <ClockIcon />
          )}
        </span>
        <span className="truncate cursor-inherit" title={review.videoTitle}>
          {review.videoTitle}
        </span>
      </span>
      <span
        className={
          review.videoAvailable
            ? 'shrink-0 rounded-full bg-emerald-400/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-200'
            : 'shrink-0 text-[11px] text-white/45'
        }
      >
        {status}
      </span>
    </>
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(review)}
      title={review.videoTitle}
      className={`flex min-h-9 w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
        selected
          ? 'border-yellow-400/65 bg-yellow-400/12 text-white'
          : review.videoAvailable
            ? 'border-white/10 bg-white/[0.025] text-white hover:border-yellow-300/45 hover:bg-yellow-400/10'
            : 'border-white/10 bg-white/[0.025] text-white/55 hover:border-yellow-300/30 hover:bg-yellow-400/[0.06]'
      }`}
    >
      {content}
    </button>
  );
}

function BrandedAudioPlayer({ review }: { review: MiniMockReview }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
  }, [review.audioSrc]);

  if (!review.audioAvailable || !review.audioSrc) {
    return (
      <ComingSoonPlayer miniMockNumber={review.miniMockNumber} kind="Audio" />
    );
  }

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {}
    } else {
      audio.pause();
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = nextVolume;
    setVolume(nextVolume);
  };

  const handlePlaybackRate = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRate = Number(event.target.value);
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    seekMediaBy(audio, seconds);
    setCurrentTime(audio.currentTime);
  };

  return (
    <div className="mt-4 w-full max-w-[420px] rounded-2xl border border-violet-300/25 bg-[radial-gradient(circle_at_25%_20%,rgba(139,92,246,0.22),transparent_38%),rgba(0,0,0,0.48)] p-5 shadow-[inset_0_0_36px_rgba(139,92,246,0.08)]">
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={(event) => {
          setIsPlaying(true);
          updateMediaSession({
            media: event.currentTarget,
            title: review.audioTitle,
            album: 'Mini Mock Audio Reviews',
          });
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          event.currentTarget.volume = volume;
          event.currentTarget.playbackRate = playbackRate;
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      >
        <source src={review.audioSrc} type="audio/mpeg" />
      </audio>

      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-violet-300/25 bg-violet-400/10 text-violet-300 shadow-[0_0_28px_rgba(139,92,246,0.18)]">
          <HeadphonesIcon className="h-10 w-10" />
        </div>
        <AudioWaveform />
      </div>

      {hasError ? (
        <div className="mt-4 rounded-xl border border-violet-300/20 bg-black/30 px-4 py-3 text-sm font-medium text-violet-100">
          Add the audio file at {review.audioSrc} to play this review.
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-white/65">
        <span className="w-10 tabular-nums">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={handleSeek}
          className="h-1.5 min-w-0 flex-1 accent-yellow-400"
          aria-label="Audio progress"
        />
        <span className="w-10 text-right tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSkip(-MEDIA_SEEK_SECONDS)}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-violet-300/25 bg-white/[0.04] px-3 text-xs font-bold text-violet-100 transition hover:border-violet-200/45 hover:bg-violet-300/10"
            aria-label="Skip audio back 5 seconds"
          >
            -5
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-300"
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(MEDIA_SEEK_SECONDS)}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-violet-300/25 bg-white/[0.04] px-3 text-xs font-bold text-violet-100 transition hover:border-violet-200/45 hover:bg-violet-300/10"
            aria-label="Skip audio forward 5 seconds"
          >
            +5
          </button>
        </div>

        <div className="flex items-center gap-2 text-white/60">
          <VolumeIcon className="h-4 w-4" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolume}
            className="h-1.5 w-24 accent-yellow-400"
            aria-label="Audio volume"
          />
        </div>

        <select
          value={playbackRate}
          onChange={handlePlaybackRate}
          className="rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs font-semibold text-white/70 outline-none"
          aria-label="Audio playback speed"
        >
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <option key={rate} value={rate}>
              {rate}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function VideoReviewRow({
  review,
  selected,
  onSelect,
}: {
  review: MiniMockReview;
  selected: boolean;
  onSelect: (review: MiniMockReview) => void;
}) {
  const status = getReviewStatus(review.videoAvailable);
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.04]">
          {review.videoAvailable ? (
            <PlayIcon className="h-3 w-3 text-yellow-300" />
          ) : (
            <ClockIcon />
          )}
        </span>
        <span className="truncate cursor-inherit" title={review.videoTitle}>
          {review.videoTitle}
        </span>
      </span>
      <span
        className={
          review.videoAvailable
            ? 'shrink-0 rounded-full bg-emerald-400/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-200'
            : 'shrink-0 text-[11px] text-white/45'
        }
      >
        {status}
      </span>
    </>
  );

  return (
    <button
      type="button"
      onClick={() => {
        captureEvent('video_review_item_clicked', {
          miniMockNumber: review.miniMockNumber,
          title: review.videoTitle,
          availability: status,
          source: 'site',
        });
        onSelect(review);
      }}
      title={review.videoTitle}
      className={`flex min-h-8 w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl border px-3 py-1.5 text-left text-xs font-medium transition ${
        selected
          ? 'border-yellow-400/65 bg-yellow-400/12 text-white'
          : review.videoAvailable
            ? 'border-white/10 bg-white/[0.025] text-white hover:border-yellow-300/45 hover:bg-yellow-400/10'
            : 'border-white/10 bg-white/[0.025] text-white/55 hover:border-yellow-300/30 hover:bg-yellow-400/[0.06]'
      }`}
    >
      {content}
    </button>
  );
}

function AudioReviewRow({
  review,
  selected,
  onSelect,
}: {
  review: MiniMockReview;
  selected: boolean;
  onSelect: (review: MiniMockReview) => void;
}) {
  const status = getReviewStatus(review.audioAvailable);
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.04] text-violet-300">
          <HeadphonesIcon className="h-3.5 w-3.5" />
        </span>
        <span className="truncate cursor-inherit" title={review.audioTitle}>
          {review.audioTitle}
        </span>
      </span>
      <span
        className={
          review.audioAvailable
            ? 'shrink-0 rounded-full bg-emerald-400/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-200'
            : 'shrink-0 text-[11px] text-white/45'
        }
      >
        {status}
      </span>
    </>
  );

  return (
    <button
      type="button"
      onClick={() => {
        captureEvent('audio_review_item_clicked', {
          miniMockNumber: review.miniMockNumber,
          title: review.audioTitle,
          availability: status,
          source: 'site',
        });
        onSelect(review);
      }}
      title={review.audioTitle}
      className={`flex min-h-8 w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl border px-3 py-1.5 text-left text-xs font-medium transition ${
        selected
          ? 'border-yellow-400/65 bg-yellow-400/12 text-white'
          : review.audioAvailable
            ? 'border-white/10 bg-white/[0.025] text-white hover:border-yellow-300/45 hover:bg-yellow-400/10'
            : 'border-white/10 bg-white/[0.025] text-white/55 hover:border-yellow-300/30 hover:bg-yellow-400/[0.06]'
      }`}
    >
      {content}
    </button>
  );
}

function VideoReviewCard({
  selectedReview,
  onSelectReview,
  onOpenReview,
}: {
  selectedReview: MiniMockReview;
  onSelectReview: (review: MiniMockReview) => void;
  onOpenReview: (review: MiniMockReview) => void;
}) {
  const selectedStatus = getReviewStatus(selectedReview.videoAvailable);
  const hasYoutubeLink = Boolean(selectedReview.youtubeUrl);
  const [comingSoonMessage, setComingSoonMessage] = useState('');

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold leading-none text-white">
          Video Review
        </h3>
        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-200">
          NEW
        </span>
      </div>

      <p className="mt-2 text-sm leading-5 text-white/62">
        Watch Mini Mock question walkthroughs with answers, explanations, and
        test-taking reminders.
      </p>

      <div className="mt-4 grid w-full min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(230px,320px)] 2xl:items-start">
        <div className="min-w-0">
          <h4 className="text-xl font-semibold leading-tight text-white">
            Mini Mock Video Reviews
          </h4>
          <div className="mt-2 text-sm font-medium text-yellow-100/80">
            Review each Mini Mock with guided question walkthroughs and
            explanations.
          </div>

          <BrandedVideoPlayer
            review={selectedReview}
            onOpenModal={() => onOpenReview(selectedReview)}
          />

          {comingSoonMessage ? (
            <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm font-medium text-yellow-100">
              {comingSoonMessage}
            </div>
          ) : null}

          <p className="mt-3 text-sm leading-6 text-white/62">
            {selectedReview.videoAvailable
              ? selectedReview.videoTitle
              : `${selectedReview.videoTitle} is coming soon.`}
          </p>

          {hasYoutubeLink ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TrackedYoutubeLink
                href={selectedReview.youtubeUrl}
                location="dashboard_video_review_youtube_button"
                label="Watch on YouTube"
                videoTitle={selectedReview.videoTitle}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  captureEvent('watch_on_youtube_clicked', {
                    miniMockNumber: selectedReview.miniMockNumber,
                    title: selectedReview.videoTitle,
                    availability: selectedStatus,
                    source: 'youtube',
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-yellow-400/35 bg-yellow-400/10 px-4 py-2.5 text-sm font-bold text-yellow-100 transition hover:border-yellow-300/60 hover:bg-yellow-400/15"
              >
                Watch on YouTube
              </TrackedYoutubeLink>
            </div>
          ) : null}
        </div>

        <div className="grid w-full min-w-0 gap-1.5 overflow-hidden">
          {miniMockReviews.map((review) => (
            <VideoReviewRow
              key={review.miniMockNumber}
              review={review}
              selected={
                review.miniMockNumber === selectedReview.miniMockNumber
              }
              onSelect={(nextReview) => {
                if (!nextReview.videoAvailable) {
                  setComingSoonMessage(
                    `${nextReview.videoTitle} is coming soon.`,
                  );
                  return;
                }

                setComingSoonMessage('');
                onSelectReview(nextReview);
                onOpenReview(nextReview);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AudioReviewCard({
  selectedReview,
  onSelectReview,
}: {
  selectedReview: MiniMockReview;
  onSelectReview: (review: MiniMockReview) => void;
}) {
  const [comingSoonMessage, setComingSoonMessage] = useState('');

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold leading-none text-white">
            Audio Review
          </h3>
          <span className="rounded-full border border-yellow-400/30 bg-yellow-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-200">
            NEW
          </span>
        </div>
        <HeadphonesIcon className="h-6 w-6 text-violet-300" />
      </div>

      <p className="mt-2 text-sm leading-5 text-white/62">
        Listen to Mini Mock question reviews while driving, exercising,
        commuting, or studying away from your screen.
      </p>

      <div className="mt-4 grid w-full min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(230px,320px)] 2xl:items-start">
        <div className="min-w-0">
          <h4 className="text-xl font-semibold leading-tight text-white">
            Mini Mock Audio Reviews
          </h4>
          <div className="mt-2 text-sm font-medium text-yellow-100/80">
            Audio walkthroughs with questions, answer choices, pauses, and
            correct answers.
          </div>

          <BrandedAudioPlayer review={selectedReview} />

          {comingSoonMessage ? (
            <div className="mt-3 rounded-xl border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-sm font-medium text-violet-100">
              {comingSoonMessage}
            </div>
          ) : null}

          <p className="mt-3 text-sm leading-6 text-white/62">
            {selectedReview.audioAvailable
              ? selectedReview.audioTitle
              : `${selectedReview.audioTitle} audio is coming soon.`}
          </p>
        </div>

        <div className="grid w-full min-w-0 gap-1.5 overflow-hidden">
          {miniMockReviews.map((review) => (
            <AudioReviewRow
              key={review.miniMockNumber}
              review={review}
              selected={
                review.miniMockNumber === selectedReview.miniMockNumber
              }
              onSelect={(nextReview) => {
                if (!nextReview.audioAvailable) {
                  setComingSoonMessage(
                    `${nextReview.audioTitle} is coming soon.`,
                  );
                  return;
                }

                setComingSoonMessage('');
                onSelectReview(nextReview);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function VideoReviewModalTestLauncher() {
  const firstAvailableVideo =
    miniMockReviews.find((review) => review.videoAvailable) ?? miniMockReviews[0];
  const [modalVideoReview, setModalVideoReview] =
    useState<MiniMockReview | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalVideoReview(firstAvailableVideo)}
        className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
      >
        Open Video Review Modal
      </button>

      {modalVideoReview ? (
        <VideoReviewModal
          review={modalVideoReview}
          onClose={() => setModalVideoReview(null)}
        />
      ) : null}
    </>
  );
}

export default function VideoReviewSection() {
  const firstAvailableVideo = useMemo(
    () =>
      miniMockReviews.find((review) => review.videoAvailable) ??
      miniMockReviews[0],
    [],
  );
  const firstAvailableAudio = useMemo(
    () =>
      miniMockReviews.find((review) => review.audioAvailable) ??
      miniMockReviews[0],
    [],
  );
  const [selectedVideoReview, setSelectedVideoReview] =
    useState<MiniMockReview>(firstAvailableVideo);
  const [selectedAudioReview, setSelectedAudioReview] =
    useState<MiniMockReview>(firstAvailableAudio);
  const [modalVideoReview, setModalVideoReview] =
    useState<MiniMockReview | null>(null);

  return (
    <>
      <div className="grid w-full gap-5 lg:grid-cols-2">
        <VideoReviewCard
          selectedReview={selectedVideoReview}
          onSelectReview={setSelectedVideoReview}
          onOpenReview={setModalVideoReview}
        />
        <AudioReviewCard
          selectedReview={selectedAudioReview}
          onSelectReview={setSelectedAudioReview}
        />
      </div>

      {modalVideoReview ? (
        <VideoReviewModal
          review={modalVideoReview}
          onClose={() => setModalVideoReview(null)}
        />
      ) : null}
    </>
  );
}
