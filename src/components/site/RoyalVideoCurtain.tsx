import curtainLeft from "@/assets/curtain/panel-left.jpg";
import curtainRight from "@/assets/curtain/panel-right.jpg";

export type VideoCurtainPhase = "closed" | "ajar" | "open";

type RoyalVideoCurtainProps = {
  phase: VideoCurtainPhase;
  fadingOut?: boolean;
};

function CurtainPanel({ side }: { side: "left" | "right" }) {
  const src = side === "left" ? curtainLeft : curtainRight;

  return (
    <div className={`royal-curtain royal-curtain--${side}`}>
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

export function RoyalVideoCurtain({ phase, fadingOut = false }: RoyalVideoCurtainProps) {
  return (
    <div
      className={`royal-stage-curtains royal-stage-curtains--${phase} ${fadingOut ? "is-fading-out" : ""}`}
      aria-hidden
    >
      <div className="royal-stage-void-layer" />
      <div className="royal-stage-spotlight" />
      <CurtainPanel side="left" />
      <CurtainPanel side="right" />
    </div>
  );
}
