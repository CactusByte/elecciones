"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [results, setResults] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);

  // Function to fetch data from the actual API endpoint
  const fetchResults = async () => {
    try {
      const response = await axios.get(
        "https://api-elecciones2024.elnuevodia.com/gobernacion"
      );
      setResults(response.data.data);
      setUpdatedAt(new Date(response.data.updatedAt).toLocaleString());
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  // Polling every 30 seconds
  useEffect(() => {
    fetchResults();

    // Countdown interval
    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev === 1) {
          fetchResults();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval); // Cleanup on unmount
  }, []);

  // Mapping of party to image URLs and abbreviations
  const partyLogos = {
    "Partido Nuevo Progresista": { src: "/pnp.jpg", abbreviation: "PNP" },
    "Partido Popular Democrático": { src: "/ppd.png", abbreviation: "PPD" },
    "Partido Independentista Puertorriqueño": { src: "/pip.png", abbreviation: "PIP" },
    "Proyecto Dignidad": { src: "/dignidad.svg", abbreviation: "PD" },
    "Movimiento Victoria Ciudadana": { src: "/victoriaciud.svg", abbreviation: "MVC" },
  };

  // Filter results by position
  const governorResults = results.filter(
    (result) => result.Puesto === "Gobernador"
  );
  const commissionerResults = results.filter(
    (result) => result.Puesto === "Comisionado Residente"
  );

  // Get the candidate with the highest percentage and votes
  const getWinner = (data) => {
    if (data.length === 0) return null;
    return data.reduce(
      (max, candidate) =>
        parseFloat(candidate.PorCiento) > parseFloat(max.PorCiento)
          ? candidate
          : max,
      data[0]
    );
  };

  const governorWinner = getWinner(governorResults);
  const commissionerWinner = getWinner(commissionerResults);

  // Render table component
  const renderTable = (data, title, winner) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">Image</th>
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">Candidato</th>
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">Partido</th>
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">Votos</th>
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">PorCiento</th>
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">Ganador</th>
            </tr>
          </thead>
          <tbody>
            {data.map((result, index) => (
              <tr
                key={index}
                className={`border-b last:border-none ${
                  winner && winner.Candidato === result.Candidato
                    ? "bg-yellow-100 font-bold"
                    : ""
                }`}
              >
                <td className="px-2 py-2">
                  <img
                    src={partyLogos[result.Partido]?.src || "/default-logo.png"}
                    alt={result.Partido}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </td>
                <td className="px-2 py-2 text-gray-700">{result.Candidato}</td>
                <td className="px-2 py-2 text-gray-700">
                  {partyLogos[result.Partido]?.abbreviation || result.Partido}
                </td>
                <td className="px-2 py-2 text-gray-700">
                  {result.Votos.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-gray-700">{result.PorCiento}</td>
                <td className="px-2 py-2 text-center">
                  {result.Ganador ? (
                    <span className="text-green-500 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-500 font-semibold">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Election Results</h1>
      <p className="text-gray-500 mb-2">Last Updated: {updatedAt}</p>
      <p className="text-red-500 mb-8">Refreshing in {secondsUntilRefresh} seconds</p>
      {renderTable(governorResults, "Gobernador", governorWinner)}
      {renderTable(
        commissionerResults,
        "Comisionado Residente",
        commissionerWinner
      )}
    </div>
  );
}
