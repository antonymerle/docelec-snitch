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

interface Props {
  report: SnitchLog;
}

const Snitch: React.FC<Props> = ({ report }) => {
  return (
    report.durationInSeconds === -1 ?  null :
    <div className="rapport">
      <h3>Informations générales</h3>
      {report.startDate ? (
        <p>
          Analyse commencée le {new Date(report.startDate).toLocaleDateString()}
          à {new Date(report.startDate).toLocaleTimeString()}
        </p>
      ) : null}

      <p>Analyse réalisée en {report.durationInSeconds} secondes.</p>
      <p>
        {report.report.length} ressources scannées. {report.success.length} sont
        OK - {report.failure.length} échecs.
      </p>

      <h3>{report.failure.length} échecs (à vérifier manuellement)</h3>

      {report.failure.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Ressources vérifiées avec succès : {report.success.length}</h3>
      {report.success.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <h3>Rapport complet des ressources testées : </h3>
      {report.report.map((line) => (
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
