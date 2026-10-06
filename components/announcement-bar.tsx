import Link from "next/link";

const message = "We partner with just 3 clients each month to deliver focused, high-quality work.";

export function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <Link href="/contact" className="announcement-window" aria-label={`${message} Reserve your project slot today.`}>
        <span className="announcement-track" aria-hidden="true">
          {[0, 1].map((group) => <span className="announcement-group" key={group}>
            {[0, 1, 2].map((item) => <span className="announcement-item" key={item}>{message} <span className="announcement-flag">⚑</span> Reserve your project slot today.</span>)}
          </span>)}
        </span>
      </Link>
    </div>
  );
}
