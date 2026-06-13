export type VideoCurtainPhase = "closed" | "ajar" | "open";

type RoyalVideoCurtainProps = {
  phase: VideoCurtainPhase;
};

function CurtainPanel({ side }: { side: "left" | "right" }) {
  return (
    <div className={`royal-curtain royal-curtain--${side}`}>
      <div className="royal-curtain-valance" aria-hidden />
      <div className="royal-curtain-panel">
        <div className="royal-curtain-velvet" aria-hidden />
        <div className="royal-curtain-folds" aria-hidden />
        <div className="royal-curtain-depth" aria-hidden />
        <div className="royal-curtain-sheen" aria-hidden />
        <div className="royal-curtain-edge" aria-hidden />
        <div className="royal-curtain-tassel" aria-hidden>
          <span className="royal-curtain-tassel-cord" />
          <span className="royal-curtain-tassel-head" />
          <span className="royal-curtain-tassel-fringe" />
        </div>
      </div>
    </div>
  );
}

export function RoyalVideoCurtain({ phase }: RoyalVideoCurtainProps) {
  return (
    <div className={`royal-video-curtains royal-video-curtains--${phase}`} aria-hidden>
      <div className="royal-stage-spotlight" />
      <div className="royal-curtain-tiebacks">
        <span className="royal-tieback royal-tieback--left">
          <span className="royal-tieback-rope" />
          <span className="royal-tieback-tassel" />
        </span>
        <span className="royal-tieback royal-tieback--right">
          <span className="royal-tieback-rope" />
          <span className="royal-tieback-tassel" />
        </span>
      </div>
      <CurtainPanel side="left" />
      <CurtainPanel side="right" />
    </div>
  );
}
