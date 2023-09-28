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
  Legend,
} from "recharts";

interface Option {
  label: string;
}

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
  const [kpiData, setKpiData] = useState<any>(false); // State variable to track form submission
  const [yearsRange, setYearsRange] = useState<{
    min: string;
    max: string;
  }>({ min: "1865", max: "2023" }); // State variable to store allowed years range

  useEffect(() => {
    getKpiData().then((res) => {
      const [yearData] = res;
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

    // Collect the form values
    const inputData = {
      amount,
      fromYear,
      fromMonth,
      toYear,
      toMonth,
    };

    try {
      // Call the API to fetch the required data
      const [yearData, monthData] = kpiData;

      let fromDateKPI = null;
      let toDateKPI = null;

      // Check if fromYear is in monthData
      const monthDataYears = Object.keys(monthData);
      const isFromYearInMonthData = monthDataYears.includes(fromYear);

      // Check if toYear is in monthData
      const isToYearInMonthData = monthDataYears.includes(toYear);

      // Extract monthKPI value from monthData for the corresponding fromYear and fromMonth
      if (isFromYearInMonthData && fromMonth) {
        const fromYearData = monthData[fromYear as keyof typeof monthData];
        const fromMonthData = fromYearData.find(
          (data: any) => data.label.toLowerCase() === fromMonth.toLowerCase()
        );
        if (fromMonthData) {
          fromDateKPI = fromMonthData.monthKPI;
          if (fromDateKPI === null) {
            // Find the next non-null monthKPI
            const nextNonNullMonthData = fromYearData.find(
              (data: any) => data.monthKPI !== null
            );
            if (nextNonNullMonthData) {
              fromDateKPI = nextNonNullMonthData.monthKPI;
            }
          }
        }
      }

      // Extract monthKPI value from monthData for the corresponding toYear and toMonth
      if (isToYearInMonthData && toMonth) {
        const toYearData = monthData[toYear as keyof typeof monthData];
        const toMonthData = toYearData.find(
          (data: any) => data.label.toLowerCase() === toMonth.toLowerCase()
        );
        if (toMonthData) {
          toDateKPI = toMonthData.monthKPI;
          if (toDateKPI === null) {
            // Find the next non-null monthKPI
            const nextNonNullMonthData = toYearData.find(
              (data: any) => data.monthKPI !== null
            );
            if (nextNonNullMonthData) {
              toDateKPI = nextNonNullMonthData.monthKPI;
            }
          }
        }
      }

      // If fromYear is not in monthData, collect yearKPI from yearData
      if (!isFromYearInMonthData) {
        const fromYearData = yearData.find(
          (data: any) => data.year === fromYear
        );
        if (fromYearData) {
          fromDateKPI = fromYearData.yearKPI;
        }
      }

      // If toYear is not in monthData, collect yearKPI from yearData
      if (!isToYearInMonthData) {
        const toYearData = yearData.find((data: any) => data.year === toYear);
        if (toYearData) {
          toDateKPI = toYearData.yearKPI;
        }
      }

      // Utregning av prosentvis endring
      const pointChange = Math.round((toDateKPI ?? 0) - (fromDateKPI ?? 0));
      const percentageChange = Math.round(
        (pointChange * 100) / (fromDateKPI ?? 1)
      );

      // Utregning av nytt kronebeløp ved bruk av prosentvis endring i konsumprisindeksen
      const newAmount = Math.round(
        (Number(amount) * (toDateKPI ?? 1)) / (fromDateKPI ?? 1)
      );

      const chartData = yearData.reduce((data: any[], year: any) => {
        const yearValue = year.year;
        if (
          (parseInt(fromYear) <= parseInt(toYear) &&
            parseInt(yearValue) >= parseInt(fromYear) &&
            parseInt(yearValue) <= parseInt(toYear)) ||
          (parseInt(fromYear) > parseInt(toYear) &&
            parseInt(yearValue) >= parseInt(toYear) &&
            parseInt(yearValue) <= parseInt(fromYear))
        ) {
          const yearKPI = year.yearKPI;
          data.push({
            label: yearValue,
            yearKPI: yearKPI,
          });
        }
        return data;
      }, []);

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
                      pattern="[0-9]+([,.][0-9]+)?"
                      title="Du kan kun skrive inn et tall, for eksempel 150,50"
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
                      min="1865"
                      max="2023"
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
