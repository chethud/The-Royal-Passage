import { type ReactNode } from "react";
import { motion } from "motion/react";
import passportCoverUrl from "@/assets/passport/royal-passport-wax-seal.png";
import passportSpreadUrl from "@/assets/passport/royal-passport-parchment-spread.png";
import passportLeftBorderUrl from "@/assets/passport/royal-passport-page-border.png";
import passportCrestUrl from "@/assets/passport/royal-passport-crest-logo.png";
import passportEndorsementsUrl from "@/assets/passport/royal-passport-endorsements-divider.png";
import type { SignInCinematicPhase } from "@/components/auth/cinematic/types";

const softEase = [0.22, 1, 0.36, 1] as const;

type SignInPassportBookProps = {
  phase: SignInCinematicPhase;
  children: ReactNode;
  reduceMotion?: boolean;
};

export function SignInPassportBook({ phase, children, reduceMotion = false }: SignInPassportBookProps) {
  const onPedestal = phase === "reveal";
  const opening = phase === "opening";
  const open = phase === "portal" || phase === "ready";
  const showClosed = phase === "reveal" && !open;
  const coverOpen = opening || open;

  if (reduceMotion) {
    return (
      <div className="royal-signin-passport-stage is-ready">
        <div className="royal-signin-passport-3d is-open">
          <div className="royal-signin-passport-rig">
            <div className="royal-signin-passport-interior is-visible">
              <div className="royal-signin-passport-spread">
                <img src={passportSpreadUrl} alt="" className="royal-signin-passport-spread__art" />
                <img
                  src={passportLeftBorderUrl}
                  alt=""
                  className="royal-signin-passport-spread__border royal-signin-passport-spread__border--left"
                />
                <img
                  src={passportLeftBorderUrl}
                  alt=""
                  className="royal-signin-passport-spread__border royal-signin-passport-spread__border--right"
                />
                <div className="royal-signin-passport-spread__right-deco">
                  <img src={passportCrestUrl} alt="" className="royal-signin-passport-spread__crest" />
                  <img
                    src={passportEndorsementsUrl}
                    alt=""
                    className="royal-signin-passport-spread__divider"
                  />
                  <p className="royal-signin-passport-spread__verse">
                    By royal decree, entry is granted to those bearing a true account upon the heritage
                    register of Mysuru.
                  </p>
                </div>
                <div className="royal-signin-passport-spread__left-portal">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={[
        "royal-signin-passport-stage",
        onPedestal ? "is-pedestal" : "",
        opening ? "is-opening" : "",
        open ? "is-open is-ready" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      initial={{ opacity: 0, y: 32, scale: 0.92 }}
      animate={{
        opacity: 1,
        y: onPedestal ? -12 : open ? 0 : -4,
        scale: onPedestal ? 1.02 : open ? 1.08 : 1,
        rotateX: onPedestal ? -8 : open ? 0 : -4,
        rotateY: onPedestal ? 8 : 0,
        rotateZ: 0,
      }}
      transition={{ duration: 1.4, ease: softEase }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="royal-signin-pedestal" aria-hidden>
        <div className="royal-signin-pedestal__velvet" />
        <div className="royal-signin-pedestal__rim" />
      </div>

      <div
        className={[
          "royal-signin-passport-3d",
          coverOpen ? "is-opening" : "",
          open ? "is-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="royal-signin-passport-rig">
          {showClosed || opening ? (
            <motion.div
              className={[
                "royal-signin-passport-cover",
                coverOpen ? "is-open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              animate={{ rotateY: coverOpen ? -168 : 0 }}
              transition={{ duration: 1.35, ease: softEase }}
            >
              <div className="royal-signin-passport-cover__leather" />
              <img
                src={passportCoverUrl}
                alt=""
                className="royal-signin-passport-cover__seal"
              />
              <div className="royal-signin-passport-cover__foil" aria-hidden />
              <div className="royal-signin-passport-cover__edge" aria-hidden />
            </motion.div>
          ) : null}

          <div
            className={[
              "royal-signin-passport-interior",
              open ? "is-visible" : opening ? "is-emerging" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="royal-signin-passport-spread">
              <img src={passportSpreadUrl} alt="" className="royal-signin-passport-spread__art" />
              <img
                src={passportLeftBorderUrl}
                alt=""
                className="royal-signin-passport-spread__border royal-signin-passport-spread__border--left"
              />
              <img
                src={passportLeftBorderUrl}
                alt=""
                className="royal-signin-passport-spread__border royal-signin-passport-spread__border--right"
              />
              <div className="royal-signin-passport-spread__right-deco">
                <img src={passportCrestUrl} alt="" className="royal-signin-passport-spread__crest" />
                <img
                  src={passportEndorsementsUrl}
                  alt=""
                  className="royal-signin-passport-spread__divider"
                />
                <p className="royal-signin-passport-spread__verse">
                  By royal decree, entry is granted to those bearing a true account upon the heritage
                  register of Mysuru.
                </p>
              </div>
              <div className="royal-signin-passport-spread__left-portal">{children}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="royal-signin-passport-glow" aria-hidden />
    </motion.div>
  );
}
