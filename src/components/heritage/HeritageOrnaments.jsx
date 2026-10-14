import {
  useMemo
} from "react";

/*
 * =========================================================
 * ORIGINAL KSHATRIYA HERITAGE VECTOR SYSTEM
 * =========================================================
 *
 * These ornaments are intentionally drawn as reusable SVG
 * line-art instead of raster images.
 *
 * Design language:
 * - Rajput palace geometry
 * - restrained lotus / floral carving
 * - chhatri-inspired domes
 * - jharokha-inspired arches
 * - hand-crafted architectural framing
 *
 * They are NOT direct copies of any supplied reference.
 *
 * All artwork inherits currentColor so every page can
 * control its appearance through Tailwind text-* classes.
 * =========================================================
 */

export function PalaceCrest({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 760 430"
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
        {/* ground */}

        <path
          d="M78 372H682"
          strokeWidth="2"
        />

        <path
          d="M102 387H658"
          strokeWidth="1.2"
          opacity=".65"
        />

        {/* central gateway */}

        <path
          d="M284 370V244C284 186 327 143 380 143C433 143 476 186 476 244V370"
          strokeWidth="3"
        />

        <path
          d="M311 370V248C311 204 341 174 380 174C419 174 449 204 449 248V370"
          strokeWidth="1.5"
          opacity=".65"
        />

        {/* scalloped central arch */}

        <path
          d="M311 258
             C322 252 326 241 330 229
             C338 240 345 243 354 244
             C360 231 369 222 380 216
             C391 222 400 231 406 244
             C415 243 422 240 430 229
             C434 241 438 252 449 258"
          strokeWidth="2"
        />

        {/* central dome */}

        <path
          d="M300 145
             C309 94 340 59 380 46
             C420 59 451 94 460 145"
          strokeWidth="3"
        />

        <path
          d="M322 139
             C333 101 352 78 380 66
             C408 78 427 101 438 139"
          strokeWidth="1.4"
          opacity=".7"
        />

        <path
          d="M296 145H464"
          strokeWidth="3"
        />

        <path
          d="M310 157H450"
          strokeWidth="1.5"
        />

        {/* dome ribs */}

        <path
          d="M380 66V139"
          strokeWidth="1"
          opacity=".55"
        />

        <path
          d="M352 78C362 96 367 116 368 139"
          strokeWidth="1"
          opacity=".45"
        />

        <path
          d="M408 78C398 96 393 116 392 139"
          strokeWidth="1"
          opacity=".45"
        />

        {/* finial */}

        <path
          d="M380 47V25"
          strokeWidth="2"
        />

        <path
          d="M371 27
             C375 17 380 12 380 12
             C380 12 385 17 389 27
             C383 31 377 31 371 27Z"
          strokeWidth="1.5"
        />

        {/* left pavilion */}

        <path
          d="M118 370V220H258V370"
          strokeWidth="2.5"
        />

        <path
          d="M134 220
             C143 184 164 162 188 152
             C212 162 233 184 242 220"
          strokeWidth="2.5"
        />

        <path
          d="M128 220H248"
          strokeWidth="2"
        />

        <path
          d="M188 152V137"
          strokeWidth="1.8"
        />

        <path
          d="M181 139
             C184 131 188 127 188 127
             C188 127 192 131 195 139"
          strokeWidth="1.3"
        />

        {/* left pavilion arch */}

        <path
          d="M148 370V277
             C148 252 165 237 188 237
             C211 237 228 252 228 277V370"
          strokeWidth="1.7"
        />

        <path
          d="M148 289
             C156 285 160 278 163 270
             C170 278 178 280 188 272
             C198 280 206 278 213 270
             C216 278 220 285 228 289"
          strokeWidth="1.2"
          opacity=".75"
        />

        {/* right pavilion */}

        <path
          d="M502 370V220H642V370"
          strokeWidth="2.5"
        />

        <path
          d="M518 220
             C527 184 548 162 572 152
             C596 162 617 184 626 220"
          strokeWidth="2.5"
        />

        <path
          d="M512 220H632"
          strokeWidth="2"
        />

        <path
          d="M572 152V137"
          strokeWidth="1.8"
        />

        <path
          d="M565 139
             C568 131 572 127 572 127
             C572 127 576 131 579 139"
          strokeWidth="1.3"
        />

        {/* right pavilion arch */}

        <path
          d="M532 370V277
             C532 252 549 237 572 237
             C595 237 612 252 612 277V370"
          strokeWidth="1.7"
        />

        <path
          d="M532 289
             C540 285 544 278 547 270
             C554 278 562 280 572 272
             C582 280 590 278 597 270
             C600 278 604 285 612 289"
          strokeWidth="1.2"
          opacity=".75"
        />

        {/* wings */}

        <path
          d="M78 372V263H118"
          strokeWidth="2"
        />

        <path
          d="M682 372V263H642"
          strokeWidth="2"
        />

        <path
          d="M78 278H118"
          strokeWidth="1"
          opacity=".6"
        />

        <path
          d="M642 278H682"
          strokeWidth="1"
          opacity=".6"
        />

        {/* balcony rail */}

        <path
          d="M258 308H284"
          strokeWidth="2"
        />

        <path
          d="M476 308H502"
          strokeWidth="2"
        />

        <path
          d="M258 324H284"
          strokeWidth="1"
          opacity=".6"
        />

        <path
          d="M476 324H502"
          strokeWidth="1"
          opacity=".6"
        />

        {/* central rosette */}

        <circle
          cx="380"
          cy="117"
          r="15"
          strokeWidth="1.5"
        />

        <circle
          cx="380"
          cy="117"
          r="5"
          strokeWidth="1.2"
        />

        <path
          d="M380 102C386 108 387 113 380 117C373 113 374 108 380 102Z"
          strokeWidth="1"
        />

        <path
          d="M395 117C389 123 384 124 380 117C384 110 389 111 395 117Z"
          strokeWidth="1"
        />

        <path
          d="M380 132C374 126 373 121 380 117C387 121 386 126 380 132Z"
          strokeWidth="1"
        />

        <path
          d="M365 117C371 111 376 110 380 117C376 124 371 123 365 117Z"
          strokeWidth="1"
        />

        {/* repeating carved panels */}

        {[
          154,
          181,
          208,
          552,
          579,
          606
        ].map(
          (
            x
          ) => (
            <g
              key={x}
            >
              <rect
                x={x}
                y="330"
                width="18"
                height="25"
                rx="2"
                strokeWidth=".9"
                opacity=".65"
              />

              <path
                d={`M${x + 4} 348
                    C${x + 9} 338 ${x + 9} 338 ${x + 14} 348`}
                strokeWidth=".8"
                opacity=".65"
              />
            </g>
          )
        )}
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
        {/* outer architectural frame */}

        <path
          d="M64 606V248
             C64 129 141 53 240 53
             C339 53 416 129 416 248V606"
          strokeWidth="2.4"
        />

        <path
          d="M86 606V253
             C86 148 153 80 240 80
             C327 80 394 148 394 253V606"
          strokeWidth="1.2"
          opacity=".7"
        />

        {/* scalloped inner arch */}

        <path
          d="M116 606V282
             C116 243 126 214 145 188
             C155 199 165 204 178 204
             C182 189 189 176 202 164
             C211 176 224 182 240 182
             C256 182 269 176 278 164
             C291 176 298 189 302 204
             C315 204 325 199 335 188
             C354 214 364 243 364 282V606"
          strokeWidth="2"
        />

        {/* crown */}

        <path
          d="M181 83
             C198 62 217 48 240 39
             C263 48 282 62 299 83"
          strokeWidth="1.5"
        />

        <path
          d="M240 39V17"
          strokeWidth="1.6"
        />

        <path
          d="M232 19
             C235 10 240 6 240 6
             C240 6 245 10 248 19"
          strokeWidth="1.3"
        />

        {/* side capitals */}

        <path
          d="M45 282H116"
          strokeWidth="2"
        />

        <path
          d="M364 282H435"
          strokeWidth="2"
        />

        <path
          d="M49 297H116"
          strokeWidth="1"
          opacity=".6"
        />

        <path
          d="M364 297H431"
          strokeWidth="1"
          opacity=".6"
        />

        {/* lotus centerpiece */}

        <path
          d="M240 113
             C226 101 219 91 220 80
             C232 86 238 94 240 105
             C242 94 248 86 260 80
             C261 91 254 101 240 113Z"
          strokeWidth="1.2"
        />

        <path
          d="M240 113
             C222 117 211 114 204 105
             C217 103 228 106 240 113
             C252 106 263 103 276 105
             C269 114 258 117 240 113Z"
          strokeWidth="1"
          opacity=".8"
        />

        {/* carved vertical lines */}

        <path
          d="M82 318V570"
          strokeWidth=".8"
          opacity=".45"
        />

        <path
          d="M398 318V570"
          strokeWidth=".8"
          opacity=".45"
        />

        <path
          d="M98 318V570"
          strokeWidth=".8"
          opacity=".25"
        />

        <path
          d="M382 318V570"
          strokeWidth=".8"
          opacity=".25"
        />
      </g>
    </svg>
  );
}

export function HeritagePillar({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 180 760"
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
        {/* crown */}

        <path
          d="M26 67H154"
          strokeWidth="2"
        />

        <path
          d="M37 49H143"
          strokeWidth="1.3"
        />

        <path
          d="M48 30H132"
          strokeWidth="1.7"
        />

        <path
          d="M58 12H122"
          strokeWidth="1.2"
        />

        <path
          d="M34 67
             C47 78 54 91 58 112
             H122
             C126 91 133 78 146 67"
          strokeWidth="2"
        />

        {/* shaft */}

        <path
          d="M59 112V648"
          strokeWidth="2"
        />

        <path
          d="M121 112V648"
          strokeWidth="2"
        />

        <path
          d="M72 119V640"
          strokeWidth=".9"
          opacity=".55"
        />

        <path
          d="M108 119V640"
          strokeWidth=".9"
          opacity=".55"
        />

        {/* floral stem */}

        <path
          d="M90 151
             C74 174 76 192 90 207
             C106 225 105 245 90 264
             C74 284 76 303 90 319
             C106 338 105 358 90 376
             C74 397 76 416 90 432
             C106 451 105 471 90 489
             C74 509 76 528 90 544
             C106 563 105 583 90 603"
          strokeWidth="1.2"
        />

        {[
          183,
          241,
          298,
          355,
          412,
          469,
          526,
          583
        ].map(
          (
            y,
            index
          ) => (
            <g
              key={y}
            >
              <path
                d={
                  index %
                    2 ===
                  0
                    ? `M90 ${y}
                       C77 ${y - 15} 67 ${y - 13} 62 ${y - 5}
                       C74 ${y - 4} 82 ${y} 90 ${y + 8}`
                    : `M90 ${y}
                       C103 ${y - 15} 113 ${y - 13} 118 ${y - 5}
                       C106 ${y - 4} 98 ${y} 90 ${y + 8}`
                }
                strokeWidth=".9"
                opacity=".85"
              />

              <circle
                cx="90"
                cy={y + 8}
                r="4"
                strokeWidth=".8"
              />
            </g>
          )
        )}

        {/* base */}

        <path
          d="M45 648H135"
          strokeWidth="2"
        />

        <path
          d="M36 667H144"
          strokeWidth="1.3"
        />

        <path
          d="M26 688H154"
          strokeWidth="2"
        />

        <path
          d="M18 717H162"
          strokeWidth="1.5"
        />

        <path
          d="M35 688
             C48 677 54 674 61 667"
          strokeWidth="1"
        />

        <path
          d="M145 688
             C132 677 126 674 119 667"
          strokeWidth="1"
        />

        {/* bottom lotus */}

        <path
          d="M90 695
             C79 684 75 675 77 668
             C85 674 89 680 90 690
             C91 680 95 674 103 668
             C105 675 101 684 90 695Z"
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
    <svg
      viewBox="0 0 520 520"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform={
          mirror
            ? "translate(520 0) scale(-1 1)"
            : undefined
        }
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* architectural L-frame */}

        <path
          d="M53 462V78
             C53 60 68 45 86 45
             H468"
          strokeWidth="3"
        />

        <path
          d="M74 462V101
             C74 83 89 67 107 67
             H468"
          strokeWidth="1.2"
          opacity=".7"
        />

        {/* top capital */}

        <path
          d="M36 98H104"
          strokeWidth="2"
        />

        <path
          d="M43 116H96"
          strokeWidth="1"
        />

        {/* floral curve */}

        <path
          d="M91 402
             C136 376 147 330 133 288
             C117 239 131 197 177 171
             C215 149 258 153 292 176
             C326 199 359 199 395 177"
          strokeWidth="2"
        />

        <path
          d="M91 402
             C114 382 117 356 106 332"
          strokeWidth="1"
          opacity=".75"
        />

        {/* leaves */}

        <path
          d="M139 291
             C169 282 187 290 194 309
             C171 310 153 305 139 291Z"
          strokeWidth="1.3"
        />

        <path
          d="M174 174
             C184 145 204 132 225 137
             C218 159 202 171 174 174Z"
          strokeWidth="1.3"
        />

        <path
          d="M278 170
             C289 143 309 133 328 140
             C318 159 302 168 278 170Z"
          strokeWidth="1.3"
        />

        {/* lotus */}

        <path
          d="M126 347
             C112 334 108 321 112 309
             C123 316 129 326 126 340
             C135 328 145 323 157 325
             C151 338 141 345 126 347Z"
          strokeWidth="1.2"
        />

        <path
          d="M248 175
             C235 160 233 147 238 136
             C249 145 253 154 248 168
             C260 158 270 155 282 159
             C273 170 262 175 248 175Z"
          strokeWidth="1.2"
        />

        {/* hanging detail */}

        <path
          d="M395 177
             C413 163 429 157 447 158"
          strokeWidth="1.3"
        />

        <path
          d="M443 148
             L456 158
             L443 168
             L430 158Z"
          strokeWidth="1"
        />

        {/* pillar ornaments */}

        <circle
          cx="64"
          cy="188"
          r="9"
          strokeWidth="1"
        />

        <path
          d="M64 202V258"
          strokeWidth="1"
        />

        <path
          d="M55 228
             C60 218 68 218 73 228
             C68 238 60 238 55 228Z"
          strokeWidth=".9"
        />

        <path
          d="M48 436H80"
          strokeWidth="1.4"
        />

        <path
          d="M42 449H86"
          strokeWidth="1"
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
          strokeWidth="1"
          opacity=".5"
        />

        <path
          d="M435 38H710"
          strokeWidth="1"
          opacity=".5"
        />

        <path
          d="M285 38
             C307 38 315 27 327 20
             C337 28 345 31 360 31
             C375 31 383 28 393 20
             C405 27 413 38 435 38"
          strokeWidth="1.4"
        />

        <path
          d="M360 12
             C350 20 347 30 360 38
             C373 30 370 20 360 12Z"
          strokeWidth="1.2"
        />

        <path
          d="M360 38
             C347 46 350 56 360 64
             C370 56 373 46 360 38Z"
          strokeWidth="1.2"
        />

        <path
          d="M340 38
             C332 30 322 29 313 34
             C322 43 331 45 340 38Z"
          strokeWidth="1"
        />

        <path
          d="M380 38
             C388 30 398 29 407 34
             C398 43 389 45 380 38Z"
          strokeWidth="1"
        />

        <circle
          cx="360"
          cy="38"
          r="4"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

/*
 * Route-aware decorative composition used behind the
 * public page hero areas.
 */

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

        if (
          pathname ===
          "/"
        ) {
          return "home";
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
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[760px] overflow-hidden"
    >
      {variant ===
        "home" && (
        <>
          <PalaceCrest className="absolute -right-[100px] top-[88px] hidden w-[650px] text-[#E2B36F] opacity-[0.075] lg:block xl:w-[760px]" />

          <HeritageCorner
            mirror
            className="absolute -right-16 top-14 hidden w-[400px] text-[#D8A65F] opacity-[0.11] xl:block"
          />
        </>
      )}

      {variant ===
        "about" && (
        <>
          <HeritageArch className="absolute -right-[75px] top-[82px] hidden h-[660px] text-[#C89355] opacity-[0.13] lg:block" />

          <PalaceCrest className="absolute -left-[170px] top-[340px] hidden w-[620px] text-[#9D673D] opacity-[0.055] xl:block" />
        </>
      )}

      {variant ===
        "stories" && (
        <>
          <PalaceCrest className="absolute -left-[130px] top-[215px] hidden w-[580px] text-[#A77847] opacity-[0.075] lg:block" />

          <HeritageCorner
            mirror
            className="absolute -right-[50px] top-[96px] hidden w-[420px] text-[#B9824B] opacity-[0.14] lg:block"
          />
        </>
      )}

      {variant ===
        "how" && (
        <>
          <HeritagePillar className="absolute -right-[12px] top-[96px] hidden h-[650px] text-[#A87343] opacity-[0.095] xl:block" />

          <HeritageArch className="absolute -left-[90px] top-[145px] hidden h-[620px] text-[#AF7D4F] opacity-[0.07] lg:block" />
        </>
      )}
    </div>
  );
}