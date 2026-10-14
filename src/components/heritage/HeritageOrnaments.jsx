import {
  useMemo
} from "react";

/*
 * =========================================================
 * KSHATRIYA / RAJASTHANI CRAFT VECTOR SYSTEM
 * =========================================================
 *
 * Original reusable SVG artwork inspired by:
 * - Rajasthani jaali geometry
 * - hand embroidery / bharatkaam rhythm
 * - lotus and bel-patti motifs
 * - toran / carved border compositions
 *
 * No supplied reference is copied directly.
 *
 * All SVGs use currentColor.
 * =========================================================
 */

export function JaliMedallion({
  className = ""
}) {
  const petals =
    Array.from({
      length: 12
    });

  return (
    <svg
      viewBox="0 0 420 420"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="210"
          cy="210"
          r="176"
          strokeWidth="1.8"
        />

        <circle
          cx="210"
          cy="210"
          r="151"
          strokeWidth="1.05"
          opacity=".82"
        />

        <circle
          cx="210"
          cy="210"
          r="108"
          strokeWidth="1.05"
          opacity=".78"
        />

        {petals.map(
          (
            _,
            index
          ) => (
            <g
              key={index}
              transform={`rotate(${index * 30} 210 210)`}
            >
              <path
                d="
                  M210 101
                  C193 126 192 150 210 174
                  C228 150 227 126 210 101Z
                "
                strokeWidth="1.5"
              />

              <path
                d="
                  M210 174
                  C188 158 167 161 153 176
                  C172 188 191 187 210 174Z
                "
                strokeWidth="1.05"
                opacity=".9"
              />
            </g>
          )
        )}

        <path
          d="
            M210 155
            C188 173 178 194 183 217
            C196 210 205 200 210 185
            C215 200 224 210 237 217
            C242 194 232 173 210 155Z
          "
          strokeWidth="1.8"
        />

        <path
          d="
            M183 217
            C196 239 210 249 210 249
            C210 249 224 239 237 217
          "
          strokeWidth="1.4"
        />

        <circle
          cx="210"
          cy="210"
          r="17"
          strokeWidth="1.5"
        />

        <circle
          cx="210"
          cy="210"
          r="5"
          strokeWidth="1.2"
        />

        <path
          d="M210 34V57"
          strokeWidth=".9"
          opacity=".7"
        />

        <path
          d="M210 363V386"
          strokeWidth=".9"
          opacity=".7"
        />

        <path
          d="M34 210H57"
          strokeWidth=".9"
          opacity=".7"
        />

        <path
          d="M363 210H386"
          strokeWidth=".9"
          opacity=".7"
        />
      </g>
    </svg>
  );
}

export function BharatKalamCorner({
  className = "",
  mirror = false
}) {
  return (
    <svg
      viewBox="0 0 560 560"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform={
          mirror
            ? "translate(560 0) scale(-1 1)"
            : undefined
        }
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="
            M54 506V104
            C54 76 76 54 104 54
            H506
          "
          strokeWidth="3"
        />

        <path
          d="
            M78 506V121
            C78 98 97 78 121 78
            H506
          "
          strokeWidth="1.25"
          opacity=".72"
        />

        <path
          d="
            M91 454
            C116 414 112 372 139 339
            C168 303 215 303 241 267
            C266 232 255 190 291 163
            C329 134 372 150 401 119
          "
          strokeWidth="2.5"
        />

        <path
          d="
            M125 382
            C101 366 90 344 94 325
            C117 330 133 350 125 382Z
          "
          strokeWidth="1.7"
        />

        <path
          d="
            M157 326
            C172 299 193 286 216 291
            C211 317 190 330 157 326Z
          "
          strokeWidth="1.7"
        />

        <path
          d="
            M248 250
            C226 231 219 207 227 188
            C250 198 262 218 248 250Z
          "
          strokeWidth="1.6"
        />

        <path
          d="
            M305 155
            C319 131 340 121 361 128
            C352 150 332 160 305 155Z
          "
          strokeWidth="1.6"
        />

        <g>
          <circle
            cx="132"
            cy="390"
            r="9"
            strokeWidth="1.25"
          />

          <path
            d="
              M132 372
              C120 378 117 387 132 390
              C147 387 144 378 132 372Z
            "
            strokeWidth="1.1"
          />

          <path
            d="
              M150 390
              C144 378 135 375 132 390
              C135 405 144 402 150 390Z
            "
            strokeWidth="1.1"
          />

          <path
            d="
              M132 408
              C144 402 147 393 132 390
              C117 393 120 402 132 408Z
            "
            strokeWidth="1.1"
          />

          <path
            d="
              M114 390
              C120 402 129 405 132 390
              C129 375 120 378 114 390Z
            "
            strokeWidth="1.1"
          />
        </g>

        <g>
          <circle
            cx="284"
            cy="177"
            r="8"
            strokeWidth="1.1"
          />

          <path
            d="
              M284 161
              C274 166 271 175 284 177
              C297 175 294 166 284 161Z
            "
            strokeWidth="1"
          />

          <path
            d="
              M300 177
              C295 167 286 164 284 177
              C286 190 295 187 300 177Z
            "
            strokeWidth="1"
          />
        </g>

        <path
          d="M401 119C427 101 451 97 476 99"
          strokeWidth="1.5"
        />

        <path
          d="
            M476 88
            L490 99
            L476 110
            L462 99Z
          "
          strokeWidth="1.2"
        />

        <path
          d="M490 99H520"
          strokeWidth="1"
          opacity=".8"
        />

        {[
          151,
          195,
          239,
          283,
          327,
          371,
          415
        ].map(
          (
            y
          ) => (
            <g
              key={y}
            >
              <path
                d={`M57 ${y}H75`}
                strokeWidth="1"
                opacity=".8"
              />

              <circle
                cx="66"
                cy={y}
                r="3"
                strokeWidth=".9"
                opacity=".85"
              />
            </g>
          )
        )}
      </g>
    </svg>
  );
}

export function JaliStrip({
  className = ""
}) {
  const cells =
    Array.from({
      length: 12
    });

  return (
    <svg
      viewBox="0 0 960 110"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M20 21H940"
          strokeWidth="1.15"
          opacity=".72"
        />

        <path
          d="M20 89H940"
          strokeWidth="1.15"
          opacity=".72"
        />

        {cells.map(
          (
            _,
            index
          ) => {
            const x =
              62 +
              index *
                76;

            return (
              <g
                key={index}
              >
                <path
                  d={`
                    M${x} 55
                    C${x - 15} 37 ${x - 30} 37 ${x - 36} 55
                    C${x - 30} 73 ${x - 15} 73 ${x} 55
                    C${x + 15} 37 ${x + 30} 37 ${x + 36} 55
                    C${x + 30} 73 ${x + 15} 73 ${x} 55Z
                  `}
                  strokeWidth="1.25"
                />

                <circle
                  cx={x}
                  cy="55"
                  r="4.5"
                  strokeWidth="1"
                />

                <path
                  d={`
                    M${x} 31V79
                  `}
                  strokeWidth=".75"
                  opacity=".65"
                />
              </g>
            );
          }
        )}
      </g>
    </svg>
  );
}

export function RoyalToran({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 920 230"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M42 44H878"
          strokeWidth="2"
        />

        <path
          d="M66 58H854"
          strokeWidth="1"
          opacity=".7"
        />

        {[
          115,
          220,
          325,
          460,
          595,
          700,
          805
        ].map(
          (
            x,
            index
          ) => (
            <g
              key={x}
            >
              <path
                d={`
                  M${x} 57
                  C${x - 11} 77 ${x - 8} 97 ${x} 113
                  C${x + 8} 97 ${x + 11} 77 ${x} 57Z
                `}
                strokeWidth="1.35"
              />

              <path
                d={`
                  M${x} 113V${index === 3 ? 183 : 155}
                `}
                strokeWidth="1"
              />

              <path
                d={`
                  M${x - 9} ${index === 3 ? 177 : 149}
                  L${x} ${index === 3 ? 191 : 163}
                  L${x + 9} ${index === 3 ? 177 : 149}
                `}
                strokeWidth="1"
              />
            </g>
          )
        )}

        <path
          d="
            M412 59
            C426 81 440 92 460 95
            C480 92 494 81 508 59
          "
          strokeWidth="1.6"
        />

        <path
          d="
            M460 95
            C440 111 433 129 439 145
            C451 139 457 129 460 116
            C463 129 469 139 481 145
            C487 129 480 111 460 95Z
          "
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}

export function FloralDivider({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 720 76"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M10 38H285"
          strokeWidth="1.15"
          opacity=".65"
        />

        <path
          d="M435 38H710"
          strokeWidth="1.15"
          opacity=".65"
        />

        <path
          d="
            M285 38
            C307 38 315 27 327 20
            C337 28 345 31 360 31
            C375 31 383 28 393 20
            C405 27 413 38 435 38
          "
          strokeWidth="1.7"
        />

        <path
          d="
            M360 12
            C350 20 347 30 360 38
            C373 30 370 20 360 12Z
          "
          strokeWidth="1.45"
        />

        <path
          d="
            M360 38
            C347 46 350 56 360 64
            C370 56 373 46 360 38Z
          "
          strokeWidth="1.45"
        />

        <path
          d="
            M340 38
            C332 30 322 29 313 34
            C322 43 331 45 340 38Z
          "
          strokeWidth="1.2"
        />

        <path
          d="
            M380 38
            C388 30 398 29 407 34
            C398 43 389 45 380 38Z
          "
          strokeWidth="1.2"
        />

        <circle
          cx="360"
          cy="38"
          r="4.5"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}

export function HeritageArch({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 480 620"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="
            M72 608V273
            C72 143 145 65 240 65
            C335 65 408 143 408 273V608
          "
          strokeWidth="2.7"
        />

        <path
          d="
            M101 608V287
            C101 175 161 104 240 104
            C319 104 379 175 379 287V608
          "
          strokeWidth="1.2"
          opacity=".82"
        />

        <path
          d="
            M131 608V305
            C131 257 143 219 168 191
            C179 203 190 209 204 209
            C213 187 225 173 240 162
            C255 173 267 187 276 209
            C290 209 301 203 312 191
            C337 219 349 257 349 305V608
          "
          strokeWidth="1.8"
        />

        <path
          d="
            M180 144
            C197 124 217 112 240 107
            C263 112 283 124 300 144
          "
          strokeWidth="1.3"
        />

        <path
          d="
            M240 107
            C226 125 226 139 240 153
            C254 139 254 125 240 107Z
          "
          strokeWidth="1.25"
        />

        <path
          d="
            M202 139
            C217 146 228 151 240 153
            C252 151 263 146 278 139
          "
          strokeWidth="1"
          opacity=".85"
        />

        <circle
          cx="240"
          cy="153"
          r="5.5"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

export function HeritageCorner({
  className = "",
  mirror = false
}) {
  return (
    <BharatKalamCorner
      className={
        className
      }
      mirror={
        mirror
      }
    />
  );
}

export function HeritagePillar({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 170 760"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M34 54H136"
          strokeWidth="2"
        />

        <path
          d="M45 75H125"
          strokeWidth="1.3"
        />

        <path
          d="M51 75V651"
          strokeWidth="2"
        />

        <path
          d="M119 75V651"
          strokeWidth="2"
        />

        <path
          d="M65 92V636"
          strokeWidth=".9"
          opacity=".7"
        />

        <path
          d="M105 92V636"
          strokeWidth=".9"
          opacity=".7"
        />

        <path
          d="
            M85 120
            C66 145 69 169 85 186
            C101 204 103 229 85 250
            C67 271 69 296 85 314
            C101 332 103 357 85 378
            C67 399 69 424 85 442
            C101 460 103 485 85 506
            C67 527 69 552 85 570
            C101 588 103 613 85 632
          "
          strokeWidth="1.3"
        />

        {[
          164,
          233,
          302,
          371,
          440,
          509,
          578
        ].map(
          (
            y,
            index
          ) => (
            <path
              key={y}
              d={
                index %
                    2 ===
                  0
                    ? `
                      M85 ${y}
                      C72 ${y - 13} 61 ${y - 10} 57 ${y}
                      C69 ${y + 3} 77 ${y + 6} 85 ${y + 15}
                    `
                    : `
                      M85 ${y}
                      C98 ${y - 13} 109 ${y - 10} 113 ${y}
                      C101 ${y + 3} 93 ${y + 6} 85 ${y + 15}
                    `
              }
              strokeWidth="1"
            />
          )
        )}

        <path
          d="M42 651H128"
          strokeWidth="2"
        />

        <path
          d="M29 679H141"
          strokeWidth="1.5"
        />

        <path
          d="M20 712H150"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

export function PalaceCrest({
  className = ""
}) {
  return (
    <JaliMedallion
      className={
        className
      }
    />
  );
}

export function PublicHeroOrnaments({
  pathname = "/"
}) {
  const variant =
    useMemo(
      () => {
        if (
          pathname ===
          "/about"
        ) {
          return "about";
        }

        if (
          pathname ===
          "/success-stories"
        ) {
          return "stories";
        }

        if (
          pathname ===
          "/how-it-works"
        ) {
          return "how";
        }

        return null;
      },
      [
        pathname
      ]
    );

  if (
    !variant
  ) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[830px] overflow-hidden"
    >
      {/* ======================================
          ABOUT

          Bold circular jaali +
          bharatkaam corner +
          lower decorative strip
      ======================================= */}

      {variant ===
        "about" && (
        <>
          <JaliMedallion
            className="absolute -right-[115px] top-[115px] hidden w-[520px] text-[#8D572F] opacity-[0.24] lg:block xl:w-[610px]"
          />

          <BharatKalamCorner
            className="absolute -left-[155px] top-[260px] hidden w-[460px] text-[#965C32] opacity-[0.18] xl:block"
          />

          <JaliStrip
            className="absolute bottom-[45px] left-1/2 hidden w-[820px] -translate-x-1/2 text-[#8F5A34] opacity-[0.20] lg:block"
          />
        </>
      )}

      {/* ======================================
          SUCCESS STORIES

          More festive:
          toran +
          bold embroidery corner +
          giant lower medallion
      ======================================= */}

      {variant ===
        "stories" && (
        <>
          <RoyalToran
            className="absolute left-1/2 top-[84px] hidden w-[930px] -translate-x-1/2 text-[#945B31] opacity-[0.25] lg:block"
          />

          <BharatKalamCorner
            mirror
            className="absolute -right-[100px] top-[255px] hidden w-[500px] text-[#874D29] opacity-[0.22] xl:block"
          />

          <JaliMedallion
            className="absolute -left-[155px] bottom-[-55px] hidden w-[470px] text-[#9A6034] opacity-[0.16] lg:block"
          />
        </>
      )}

      {/* ======================================
          HOW IT WORKS

          More architectural:
          jaali arch +
          carved vertical pillar +
          medallion +
          lower strip
      ======================================= */}

      {variant ===
        "how" && (
        <>
          <HeritageArch
            className="absolute -left-[135px] top-[135px] hidden h-[690px] text-[#8F562F] opacity-[0.20] lg:block"
          />

          <HeritagePillar
            className="absolute right-[24px] top-[105px] hidden h-[700px] text-[#8B542E] opacity-[0.20] xl:block"
          />

          <JaliMedallion
            className="absolute -right-[150px] top-[260px] hidden w-[500px] text-[#955B30] opacity-[0.17] lg:block"
          />

          <JaliStrip
            className="absolute bottom-[28px] left-1/2 hidden w-[850px] -translate-x-1/2 text-[#8E5730] opacity-[0.18] lg:block"
          />
        </>
      )}
    </div>
  );
}