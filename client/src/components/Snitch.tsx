import { useState, useEffect } from "react";

// interface SnitchLog {
//   generalInfo: string[];
//   test: string[];
//   success: string[];
//   failure: string[];
//   report: string[];
// }

interface SnitchLog {
  startDate: null | Date;
  endDate: null | Date;
  durationInSeconds: number;
  success: string[];
  failure: string[];
  report: string[];
}

const Snitch = () => {
  const [log, setLog] = useState<SnitchLog>({
    startDate: null,
    endDate: null,
    durationInSeconds: -1,
    success: [],
    failure: [],
    report: [],
  });
  useEffect(() => {
    fetch("/snitch")
      .then((res) => res.json())
      .then((data) => setLog(data));
  }, []);
  return (
    <div>
      <h3>Informations générales</h3>
      {log.startDate ? (
        <p>
          Analyse commencée le {new Date(log.startDate).toLocaleDateString()}à{" "}
          {new Date(log.startDate).toLocaleTimeString()}
        </p>
      ) : null}

      <p>Analyse réalisée en {log.durationInSeconds} secondes.</p>
      <p>
        {log.report.length} ressources scannées. {log.success.length} sont OK -{" "}
        {log.failure.length} échecs.
      </p>

      <h3>Rapport</h3>
      {log.report.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Echecs : {log.failure.length}</h3>
      <h4>
        Ressources pour lesquelles la vérification a échoué : (à vérifier
        manuellement)
      </h4>
      {log.failure.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Ressources vérifiées avec succès : {log.success.length}</h3>
      {log.success.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Ressources testées : </h3>
      {log.report.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
};

export default Snitch;
