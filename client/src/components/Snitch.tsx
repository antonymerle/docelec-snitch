import { useState, useEffect } from "react";

interface SnitchLog {
  generalInfo: string[];
  test: string[];
  success: string[];
  failure: string[];
  report: string[];
}

const Snitch = () => {
  const [log, setLog] = useState<SnitchLog>({
    generalInfo: ["Démarrage du scan..."],
    test: [],
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
      <h3>General Info</h3>
      {log.generalInfo.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Rapport</h3>
      {log.report.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Failures : {log.failure.length}</h3>
      <h4>
        Ressources pour lesquelles la vérification a échoué : (à vérifier
        manuellement)
      </h4>
      {log.failure.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Success : {log.success.length}</h3>
      {log.success.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Ressources testées : </h3>
      {log.test.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
};

export default Snitch;
