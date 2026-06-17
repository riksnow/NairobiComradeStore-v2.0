const PHRASES = [
  "Pay with M-Pesa or Cash on Delivery",
  "Delivered across Nairobi & beyond",
  "By comrades, for comrades 🎓",
  "New drops every week",
  "Secure checkout, every time",
  "Real prices in Ksh — no surprises",
  "Quality kit for campus life",
  "Built for Kenyan students & comrades",
];

export function AnnouncementMarquee() {
  // Duplicated track so the -50% translate loops seamlessly.
  const track = [...PHRASES, ...PHRASES];
  return (
    <div className="marquee-pause overflow-hidden border-b border-border bg-primary text-primary-foreground">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2">
        {track.map((p, i) => (
          <span key={i} className="mx-6 inline-flex items-center text-xs font-medium tracking-wide">
            <span className="mr-6 opacity-50">✦</span>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
