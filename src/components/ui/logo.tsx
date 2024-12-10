export function Logo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80" width="200" height="50">
      <style>
        {`@media (prefers-color-scheme: dark) {
      .dog-head { fill: #B87333; }
      .dog-stroke { stroke: #FFE4C4; }
      .dog-features { stroke: #FFE4C4; }
      .coffee-cup { fill: #8B4513; stroke: #FFE4C4; }
      .text { fill: #FFE4C4; }
    }
    @media (prefers-color-scheme: light) {
      .dog-head { fill: #B87333; }
      .dog-stroke { stroke: #4A2511; }
      .dog-features { stroke: #2D1810; }
      .coffee-cup { fill: #4A2511; stroke: #2D1810; }
      .text { fill: #2D1810; }
    }`}
      </style>

      {/* Logo container */}
      <g id="logoGroup" transform="translate(10,10)">
        {/* Dog head */}
        <g transform="scale(0.6)">
          {/* Head */}
          <circle
            cx="50"
            cy="40"
            r="30"
            className="dog-head dog-stroke"
            strokeWidth="3"
          />

          {/* Peaceful closed eyes */}
          <path
            d="M35 40 Q45 45 55 40"
            className="dog-features"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M45 40 Q55 45 65 40"
            className="dog-features"
            strokeWidth="2"
            fill="none"
          />

          {/* Serene smile */}
          <path
            d="M40 50 Q50 55 60 50"
            fill="none"
            className="dog-features"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Coffee cup */}
          <g transform="translate(65,45) rotate(10)">
            <path
              d="M0 0 L12 0 L10 20 L2 20 Z"
              className="coffee-cup"
              strokeWidth="1.5"
            />
            <path
              d="M12 5 L16 6 L14 18 L12 17"
              className="coffee-cup"
              strokeWidth="1.5"
            />
          </g>

          {/* Ears */}
          <path
            d="M25 30 Q20 20 30 15"
            fill="none"
            className="dog-stroke"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M75 30 Q80 20 70 15"
            fill="none"
            className="dog-stroke"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* Text part */}
        <g transform="translate(80,0)">
          {/* "THIS IS" - smaller text */}
          <text x="0" y="30" fontFamily="Impact" fontSize="20" className="text">
            THIS IS
          </text>

          {/* "FINE" - larger text */}
          <text
            x="70"
            y="55"
            fontFamily="Impact"
            fontSize="45"
            className="text"
          >
            FINE
          </text>
        </g>
      </g>
    </svg>
  );
}
