"use client";
import React, { useState, FormEvent, useEffect } from "react";
import "./page.css"; // Import your custom CSS file
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { getKpiData } from "./api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { KpiDataResponse, Option } from "./types";
import { calculateChanges, getChartData, extractKPIValue } from "./helpers";

const monthOptions: Option[] = [
  { label: "Årsgjennomsnitt" },
  { label: "Januar" },
  { label: "Februar" },
  { label: "Mars" },
  { label: "April" },
  { label: "Mai" },
  { label: "Juni" },
  { label: "Juli" },
  { label: "August" },
  { label: "September" },
  { label: "Oktober" },
  { label: "November" },
  { label: "Desember" },
];

export default function Home() {
  const [amount, setAmount] = useState<string>("");
  const [fromYear, setFromYear] = useState<string>("");
  const [fromMonth, setFromMonth] = useState<string>("");
  const [toYear, setToYear] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");
  const [percentageChange, setPercentageChange] = useState<number | null>(null); // State variable to store percentage change
  const [newAmount, setNewAmount] = useState<number | null>(null); // State variable to store new amount
  const [chartData, setChartData] = useState<any[]>([]); // State variable to store line chart data
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false); // State variable to track form submission
  const [kpiData, setKpiData] = useState<KpiDataResponse | null>(null); // State variable to track form submission
  const [yearsRange, setYearsRange] = useState<{
    min: string;
    max: string;
  }>({ min: "1865", max: "2023" }); // State variable to store allowed years range

  useEffect(() => {
    getKpiData().then((res) => {
      const { yearData } = res;
      const years = yearData.map((item) => parseInt(item.year));
      setYearsRange({
        min: Math.min(...years).toString(),
        max: Math.max(...years).toString(),
      });
      setKpiData(res); // Store API respoonse
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { yearData, monthData } = kpiData as KpiDataResponse;
      const fromDateKPI = extractKPIValue(
        fromYear,
        fromMonth,
        yearData,
        monthData
      );
      const toDateKPI = extractKPIValue(toYear, toMonth, yearData, monthData);
      const { percentageChange, newAmount } = calculateChanges(
        Number(amount),
        fromDateKPI ?? 0,
        toDateKPI ?? 0
      );

      const chartData = getChartData(yearData, fromYear, toYear);

      setChartData(chartData);
      setPercentageChange(percentageChange);
      setNewAmount(newAmount);
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl">
        <div className="card form-container">
          <h1 className="card-title">Beregn prisendring</h1>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="amount">Skriv inn beløp</label>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      className="form-control"
                      required
                      pattern="[0-9]+([.][0-9]+)?"
                      title="Du kan kun skrive inn et tall, for eksempel 150.50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="fromYear">Fra år</label>
                    <input
                      type="number"
                      id="fromYear"
                      name="fromYear"
                      className="form-control"
                      required
                      min={yearsRange.min}
                      max={yearsRange.max}
                      value={fromYear}
                      onChange={(e) => setFromYear(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="fromMonth">Velg måned</label>
                    <select
                      id="fromMonth"
                      name="fromMonth"
                      className="form-control"
                      required
                      value={fromMonth}
                      onChange={(e) => setFromMonth(e.target.value)}
                    >
                      <option value=""></option>
                      {monthOptions.map((option, index) => (
                        <option key={index} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="toYear">Til år</label>
                    <input
                      type="number"
                      id="toYear"
                      name="toYear"
                      className="form-control"
                      required
                      min={yearsRange.min}
                      max={yearsRange.max}
                      value={toYear}
                      onChange={(e) => setToYear(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="toMonth">Velg måned</label>
                    <select
                      id="toMonth"
                      name="toMonth"
                      className="form-control"
                      required
                      value={toMonth}
                      onChange={(e) => setToMonth(e.target.value)}
                    >
                      <option value=""></option>
                      {monthOptions.map((option, index) => (
                        <option key={index} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">
                      Se prisendring
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Conditionally render ResultPage based on form submission */}
      {formSubmitted && (
        <div className="container mt-4">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">
                Beløpet tilsvarer {newAmount ?? 0}kr
              </h1>
              <p className="card-text">
                Prisstigningen er på {percentageChange ?? 0}%
              </p>
              <p className="card-text"></p>

              <LineChart width={600} height={300} data={chartData}>
                <XAxis dataKey="label" />
                <YAxis domain={["dataMin", "dataMax"]} />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="yearKPI"
                  stroke="#4a90e2"
                  dot={false}
                />
              </LineChart>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
