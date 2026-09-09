function OrganicCloudTexture() {
  return (
    <svg className="confirmed-cloud-breath-texture" focusable="false" viewBox="0 0 1200 700">
      <defs>
        <filter id="confirmed-cloud-breath-noise">
          <feTurbulence baseFrequency="0.009 0.015" numOctaves="3" seed="14" type="fractalNoise" />
          <feDisplacementMap in="SourceGraphic" scale="38" />
        </filter>
        <radialGradient id="confirmed-cloud-breath-fill">
          <stop offset="0" stopColor="#fff" stopOpacity=".54" />
          <stop offset=".58" stopColor="#f8fcff" stopOpacity=".24" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#confirmed-cloud-breath-noise)">
        <ellipse className="confirmed-cloud-breath confirmed-cloud-breath-a" cx="180" cy="150" fill="url(#confirmed-cloud-breath-fill)" rx="260" ry="105" />
        <ellipse className="confirmed-cloud-breath confirmed-cloud-breath-b" cx="1030" cy="460" fill="url(#confirmed-cloud-breath-fill)" rx="330" ry="125" />
      </g>
    </svg>
  );
}

export function ConfirmedAmbient() {
  return (
    <div className="confirmed-ambient" aria-hidden="true">
      <div className="confirmed-day-scene" data-environment="cloud-breath" data-day-environment="cloud-breath" data-day-variant="clear">
        <i className="confirmed-refinement-sky-depth" />
        <OrganicCloudTexture />
        <i className="confirmed-cloud-breath-light" />
        <i className="confirmed-cloud-breath-shadow" />
      </div>
      <div className="confirmed-night-scene" data-environment="evening-star">
        <i className="confirmed-evening-star" />
        <div className="confirmed-distant-lights">
          {Array.from({ length: 11 }, (_, index) => <i key={index} />)}
        </div>
      </div>
    </div>
  );
}
