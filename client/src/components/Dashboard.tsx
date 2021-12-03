import React, { useState, useEffect } from "react";
import Snitch from "./Snitch";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

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

const Dashboard = () => {
  const [fetchDataStatus, setfetchDataStatus] = useState("idle");

  const [listeRapports, setListeRapports] = useState<string[]>([
    "Choisir un rapport",
  ]);
  const [reportToFetch, setReportToFetch] =
    useState<string>("Choisir un rapport");
  const [canFetch, setCanFetch] = useState(
    fetchDataStatus === "idle" && reportToFetch !== "Choisir un rapport"
  );

  const [report, setReport] = useState<SnitchLog>({
    startDate: null,
    endDate: null,
    durationInSeconds: -1,
    success: [],
    failure: [],
    report: [],
  });
  useEffect(() => {
    fetch("/report/list")
      .then((res) => res.json())
      .then((data) => setListeRapports([listeRapports, ...data]));
  }, []);

  const fetchReport = async (route: string): Promise<SnitchLog> => {
    const response = await fetch(route);
    const data = await response.json();
    console.log(data);

    return data;
  };

  const onFetch = async () => {
    fetchDataStatus === "idle" && reportToFetch !== "Choisir un rapport"
      ? setCanFetch(true)
      : setCanFetch(false);

    if (canFetch) {
      try {
        setfetchDataStatus("pending");
        const response = await fetchReport(`/report/${reportToFetch}`);
        setReport(response);
      } catch (error) {
        console.log("echec de la récupération des données : " + error);
      } finally {
        setfetchDataStatus("idle");
        setCanFetch(false);
      }
    }
  };

  return (
    <div>
      <Form className="form-item">
        <Form.Group>
          <Form.Control
            as="select"
            onChange={(e) => {
              setReportToFetch(e.target.value);
              setCanFetch(true);
            }}
          >
            {listeRapports.map((rapport) => (
              <option value={rapport} key={rapport}>
                {rapport}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Form>

      <Button variant="dark" onClick={onFetch}>
        Afficher l'analyse
      </Button>
      <Snitch report={report} />
    </div>
  );
};

export default Dashboard;
