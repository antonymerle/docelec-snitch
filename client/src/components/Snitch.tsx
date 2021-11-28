import { useState, useEffect } from "react";

// interface SnitchLog {
//   generalInfo: string[];
//   test: string[];
//   success: string[];
//   failure: string[];
//   report: string[];
// }

interface URLTableSchema {
  id: number;
  url: string;
  success: number;
  report_id: number;
}

interface SnitchLog {
  startDate: null | Date;
  endDate: null | Date;
  durationInSeconds: number;
  success: string[];
  failure: string[];
  report: URLTableSchema[];
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
    fetch("/report/34")
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

      <h3>{log.failure.length} échecs (à vérifier manuellement)</h3>

      {log.failure.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Ressources vérifiées avec succès : {log.success.length}</h3>
      {log.success.map((line) => (
        <p key={line}>{line}</p>
      ))}

      {/* <h3>Rapport</h3>
      {log.report.map((line) => (
        <p key={line.id}>{line.url}</p>
      ))} */}

      <h3>Ressources testées : </h3>
      {log.report.map((line) => (
        <p
          key={line.id}
          style={line.success === 1 ? { color: "green" } : { color: "red" }}
        >
          {line.url} : {line.success === 1 ? "Succès" : "Echec"}
        </p>
      ))}
    </div>
  );
};

export default Snitch;
