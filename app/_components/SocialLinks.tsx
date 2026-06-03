import TrackedYoutubeLink from '@/app/app/_components/TrackedYoutubeLink';

const SOCIAL_LINKS = {
  tiktok: 'https://www.tiktok.com/@theradtechtutor',
  youtube: 'https://www.youtube.com/@TheRadTechTutor',
};

export default function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
      <span className="font-semibold text-white/70">Follow The Rad Tech Tutor:</span>

      <a
        href={SOCIAL_LINKS.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
      >
        TikTok
      </a>

      <TrackedYoutubeLink
        href={SOCIAL_LINKS.youtube}
        location="footer_youtube_link"
        label="YouTube"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-white"
      >
        YouTube
      </TrackedYoutubeLink>
    </div>
  );
}
