export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="bg-ink text-ivory">
      <p className="container-x py-2 text-center text-[13px] leading-6 tracking-wide text-ivory/85">{text}</p>
    </div>
  );
}
