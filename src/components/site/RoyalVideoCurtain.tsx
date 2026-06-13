import curtainLeft from "@/assets/curtain/panel-left.jpg";
import curtainRight from "@/assets/curtain/panel-right.jpg";

export type CurtainMotion = "closed" | "opening" | "closing" | "done";

type RoyalVideoCurtainProps = {
  motion: CurtainMotion;
  onOpeningComplete?: () => void;
  onClosingComplete?: () => void;
};

function CurtainPanel({
  side,
  onAnimationEnd,
}: {
  side: "left" | "right";
  onAnimationEnd?: (event: React.AnimationEvent<HTMLDivElement>) => void;
}) {
  const src = side === "left" ? curtainLeft : curtainRight;

  return (
    <div
      className={`royal-curtain royal-curtain--${side}`}
      onAnimationEnd={side === "left" ? onAnimationEnd : undefined}
    >
      <img
        src={src}
        alt=""
        className="royal-curtain-texture"
        draggable={false}
        aria-hidden
      />
      <div className="royal-curtain-fold" aria-hidden />
      <div className="royal-curtain-shadow" aria-hidden />
    </div>
  );
}

export function RoyalVideoCurtain({ motion, onOpeningComplete, onClosingComplete }: RoyalVideoCurtainProps) {
  const handleAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (motion === "opening") onOpeningComplete?.();
    if (motion === "closing") onClosingComplete?.();
  };

  return (
    <div className={`royal-stage-curtains royal-stage-curtains--${motion}`} aria-hidden>
      <div className="royal-stage-spotlight" />
      <CurtainPanel side="left" onAnimationEnd={handleAnimationEnd} />
      <CurtainPanel side="right" />
    </div>
  );
}

/** @deprecated Use CurtainMotion */
export type VideoCurtainPhase = "closed" | "ajar" | "open";
