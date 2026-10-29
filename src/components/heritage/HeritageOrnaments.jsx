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

export function RoyalToran() {
  return null;
}

export function FloralDivider() {
  return null;
}

export function HeritageArch() {
  return null;
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

export function HeritagePillar() {
  return null;
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

export function PublicHeroOrnaments() {
  return null;
}
