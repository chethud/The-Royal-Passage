import curtainLeft from "@/assets/curtain/panel-left.jpg";
import curtainRight from "@/assets/curtain/panel-right.jpg";
import tiebackLeft from "@/assets/curtain/tieback-left.jpg";
import tiebackRight from "@/assets/curtain/tieback-right.jpg";

export type VideoCurtainPhase = "closed" | "ajar" | "open";

type RoyalVideoCurtainProps = {
  phase: VideoCurtainPhase;
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
      <div className="royal-curtain-shadow" aria-hidden />
    </div>
  );
}

export function RoyalVideoCurtain({ phase }: RoyalVideoCurtainProps) {
  return (
    <div className={`royal-video-curtains royal-video-curtains--${phase}`} aria-hidden>
      <div className="royal-stage-spotlight" />
      <CurtainPanel side="left" />
      <CurtainPanel side="right" />
      <div className="royal-curtain-tiebacks">
        <img src={tiebackLeft} alt="" className="royal-tieback royal-tieback--left" draggable={false} />
        <img src={tiebackRight} alt="" className="royal-tieback royal-tieback--right" draggable={false} />
      </div>
    </div>
  );
}
