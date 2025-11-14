import { For } from "solid-js"

export default function() {
  const text = "KLAROWANKI"
  const colors = [
    "#FF3366",
    "#00E5CC",
    "#00BFFF",
    "#FF6347",
    "#00FFB3",
    "#FFD700",
    "#DA70FF",
    "#00D4FF",
    "#FFA500",
    "#00FF7F",
  ]
  const letters = text.split("").map((letter, index) => {
    const baseRotation = Math.random() * 16 - 8
    const wobbleAmount = Math.random() * 8 + 4
    return {
      char: letter,
      color: colors[index % colors.length],
      baseRotation,
      wobbleAmount,
      index,
    }
  })

  const fontSize = 110
  const charWidth = fontSize * 0.7
  const totalWidth = charWidth * letters.length
  const startX = (780 - totalWidth) / 2
  const curveAmount = 1.0

  return (
    <>
      <style>
        {`
          @keyframes squiggle {
            0%, 100% {
              transform: rotate(var(--base-rotation));
            }
            33% {
              transform: rotate(calc(var(--base-rotation) + var(--wobble-amount) * 0.7));
            }
            66% {
              transform: rotate(calc(var(--base-rotation) - var(--wobble-amount) * 0.5));
            }
          }
          
          .headline-letter-svg {
            animation: squiggle 2.5s ease-in-out infinite;
            animation-delay: calc(var(--letter-index) * 0.08s);
            transform-box: fill-box;
            transform-origin: center;
          }

          .inner-outline {
            stroke: color-mix(in srgb, var(--char-color), white 40%);
          }
        `}
      </style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 -10 780 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Adjusted viewBox height */}
        <defs>
          {/* inner highlight (top edge) */}
          <linearGradient id="highlight-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="white" stop-opacity="0.9" />
            <stop offset="40%" stop-color="white" stop-opacity="0" />
          </linearGradient>
        </defs>

        <For each={letters}>
          {(letter, i) => {
            const xPos = startX + i() * charWidth + charWidth / 2
            const yOffset = curveAmount
              * Math.pow(i() - (letters.length - 1) / 2, 2)
            const yPos = 77.75 + yOffset // Adjusted base y position
            const clipPathId = `text-clip-${i()}`

            return (
              <g
                class="headline-letter-svg"
                style={{
                  "--base-rotation": `${letter.baseRotation}deg`,
                  "--wobble-amount": `${letter.wobbleAmount}deg`,
                  "--letter-index": letter.index,
                  "--char-color": letter.color,
                }}
              >
                {/* BASE SHAPE & OUTER STROKE */}
                <text
                  x={xPos}
                  y={yPos}
                  text-anchor="middle"
                  font-size={fontSize.toString()}
                  font-family="Chewy, system-ui, sans-serif"
                  fill="var(--char-color)"
                  stroke="#c36b1e"
                  stroke-width="10"
                  paint-order="stroke"
                >
                  {letter.char}
                </text>

                {/* INNER EDGE */}
                <text
                  class="inner-outline"
                  x={xPos}
                  y={yPos}
                  text-anchor="middle"
                  font-size={fontSize.toString()}
                  font-family="Chewy, system-ui, sans-serif"
                  fill="none"
                  stroke-width="4"
                  paint-order="stroke"
                >
                  {letter.char}
                </text>

                {/* TOP HIGHLIGHT */}
                <clipPath id={clipPathId}>
                  <text
                    x={xPos}
                    y={yPos}
                    text-anchor="middle"
                    font-size={fontSize.toString()}
                    font-family="Chewy, system-ui, sans-serif"
                  >
                    {letter.char}
                  </text>
                </clipPath>
                <rect
                  x={xPos - charWidth / 2}
                  y="0"
                  width={charWidth}
                  height="70%"
                  clip-path={`url(#${clipPathId})`}
                  fill="url(#highlight-gradient)"
                />
              </g>
            )
          }}
        </For>
      </svg>
    </>
  )
}
