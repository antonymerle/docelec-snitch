import React from "react";

// semantic versioning : 0.XY
// X => new feature added
// Y => bug or maintenance correction (dataset change in api)

// LOG
// 0.1  lancement beta

export const Footer: React.FC = () => {
  return (
    <div className="footer">
      <p>Chaque jour, un rapport est généré à 6h00 et à 13h00.</p>
      <p >
        <a href="https://github.com/waldganger/docelec-snitch">Docelec-Snitch</a>
        {" "}
        {new Date().getFullYear()} -- v 0.1
      </p>
    </div>
  );
};
