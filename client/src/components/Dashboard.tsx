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
  const [canFetch, setCanFetch] = useState(fetchDataStatus === "idle");
  const [listeRapports, setListeRapports] = useState<string[]>(["Choisir"]);

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
      .then((data) => setListeRapports(data));
  }, []);

  const fetchReport = async (route: string): Promise<SnitchLog> => {
    const response = await fetch(route);
    const data = await response.json();
    return data;
  };

  const onFetch = async () => {
    if (canFetch) {
      try {
        setfetchDataStatus("pending");
        const response = await fetchReport("/report/34");
        setReport(response);
      } catch (error) {
        console.log("echec de la récupération des données : " + error);
      } finally {
        setfetchDataStatus("idle");
      }
    }
  };

  return (
    <div>
      <Form className="form-item">
        <Form.Group>
          <Form.Control as="select" onChange={(e) => e.target.value}>
            {listeRapports.map((rapport) => (
              <option value={rapport} key={rapport}>
                {rapport}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Form>

      <Button variant="dark">Lancer l'analyse</Button>
      <Snitch report={report} />
    </div>
  );
};

export default Dashboard;
