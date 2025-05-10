"use client";
import React, { useEffect, useRef, useState } from "react";

import "../admin/AdmDashborad.css";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

// Register required components
ChartJS.register(ArcElement, Tooltip, Legend);
import {
    BarChart,
    Bar,
    ResponsiveContainer,
} from "recharts";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    // Tooltip,
} from "recharts";
import userService from "@/services/userService";

export default function Dashboard() {
    const [analytics, setAnalytics] = useState<any>({});

    useEffect(() => {
        userService.getAdminDashboardAnalytics().then((res) => {
            setAnalytics(res)
        })
    }, [])

    const data = {
        labels: ["Song Genre 1", "Song Genre 2", "Song Genre 3", "Song Genre 4", "Song Genre 5",],
        datasets: [
            {
                data: [38, 20, 12, 15, 15],
                backgroundColor: ["#C2A771", "#FFEDCA", "#F8D082", "#C2A771", "#D9B535"],
                hoverBackgroundColor: ["#0073E6", "#00B894", "#FFAB00", "#FF703F"],
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                display: false,
                position: "bottom" as const,
                labels: {
                    color: "#F4F4F4",
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    const data0 = [
        { name: "18-24", uv: 1500, pv: 2400, amt: 2400 },
        { name: "25-34", uv: 2200, pv: 2300, amt: 2300 },
        { name: "35-44", uv: 3000, pv: 2100, amt: 2100 },
        { name: "45-54", uv: 1800, pv: 1900, amt: 1900 },
        { name: "55-64", uv: 2500, pv: 2000, amt: 2000 },
        { name: "65+", uv: 3200, pv: 2500, amt: 2500 },
    ];

    return (
        <>Dashboard
            <div className={`mb-10 p-2 transition-all duration-300`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Apps Integrated</p>
                            <p className="dashboard-number-text">{analytics.totalApps}</p>
                        </div>
                    </div>
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Users</p>
                            <p className="dashboard-number-text">{analytics.totalUsers}</p>
                        </div>
                    </div>
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Songs</p>
                            <p className="dashboard-number-text">{analytics.totalTracks}</p>
                        </div>
                    </div>
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Albums</p>
                            <p className="dashboard-number-text">{analytics.totalAlbums}</p>
                        </div>
                    </div>
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Playlists</p>
                            <p className="dashboard-number-text">{analytics.totalPlaylists}</p>
                        </div>
                    </div>
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Purchases</p>
                            <p className="dashboard-number-text">{analytics.totalPurchases}</p>
                        </div>
                    </div>
                    <div className="card-tile">
                        <div className="">
                            <p className="dashboard-text ">Total Subscriptions</p>
                            <p className="dashboard-number-text">{analytics.totalSubscription}</p>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col min-w-0 break-words w-full">
                    Performance Analytics
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2  dashboard-grid-box mt-3 gap-4">
                    {/* chart */}
                    <div className="relative flex flex-col min-w-0 break-words w-full">

                        <div className="card-tile mt-5 h-full">
                            <div className="flex justify-between items-center">
                                <span className="stream-text">Best Performing Games</span>
                                <select id="date" className="px-3 py-2 mt-3 dashboard-tabs" value="Last 30 Days">
                                    <option className="last-week-text">
                                        Last 30 Days
                                    </option>
                                    <option>28 Days</option>
                                    <option>20 Days</option>
                                    <option>25 Days</option>
                                </select>
                            </div>
                            <table className="w-full  dashboard-table-data-background">
                                <thead className="table-heading">
                                    <tr>
                                        <th scope="col" className=" py-3">
                                            Game Name{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Total Player{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Genre{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Artist{" "}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-sub-heading">
                                    <tr className="border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">Artist_3</td>
                                    </tr>
                                    <tr className=" border-b-2 table-border ">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Paid</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4 ">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">HipHop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 pb-5 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">Classical</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_2</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0  break-words  w-full ">
                        <div className="card-tile mt-5 h-full">
                            <div className="flex justify-between items-center">
                                <span className="stream-text">Geographic Distribution</span>
                                <select id="date" className="px-3 py-2 mt-3 dashboard-tabs">
                                    <option className="last-week-text" selected>
                                        Last 7 Days
                                    </option>
                                    <option>28 Days</option>
                                    <option>20 Days</option>
                                    <option>25 Days</option>
                                </select>
                            </div>

                            <div className="w-full chart-container px-5 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5">
                                {/* Your content */}
                                <div className="text-start me-4">
                                    <ul className="list-unstyled">
                                        {data.labels.map((label, index) => (
                                            <li key={index} className="mb-3 d-flex align-items-center">
                                                {/* Color indicator (square) */}
                                                <span
                                                    className="me-2"
                                                    style={{
                                                        display: "inline-block",
                                                        width: "16px",
                                                        height: "16px",
                                                        backgroundColor: data.datasets[0].backgroundColor[index],
                                                    }}
                                                ></span>
                                                {/* Label text */}
                                                <span style={{ fontSize: "16px", color: "#4A4A4A" }}>{label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={{ width: "400px", height: "400px" }}>
                                    <Doughnut data={data} options={options} />
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
                <div className="relative flex flex-col min-w-0 break-words w-full mt-10">
                    Top Genres
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2  dashboard-grid-box mt-3 gap-4">
                    <div className="relative flex flex-col min-w-0 break-words w-full">
                        <div className="card-tile mt-5 h-full">
                            <div className="flex justify-between items-center">
                                <span className="stream-text">Best Performing Games</span>
                                <select id="date" className="px-3 py-2 mt-3 dashboard-tabs" value="Last 30 Days">
                                    <option className="last-week-text">
                                        Last 30 Days
                                    </option>
                                    <option>28 Days</option>
                                    <option>20 Days</option>
                                    <option>25 Days</option>
                                </select>
                            </div>
                            <table className="w-full  dashboard-table-data-background">
                                <thead className="table-heading">
                                    <tr>
                                        <th scope="col" className=" py-3">
                                            Game Name{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Total Player{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Genre{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Artist{" "}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-sub-heading">
                                    <tr className="border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">Artist_3</td>
                                    </tr>
                                    <tr className=" border-b-2 table-border ">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Paid</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4 ">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">HipHop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 pb-5 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">Classical</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_2</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="relative flex flex-col min-w-0 break-words w-full">
                        <div className="card-tile mt-5 h-full">
                            <div className="flex justify-between items-center">
                                <span className="stream-text">Best Performing Games</span>
                                <select id="date" className="px-3 py-2 mt-3 dashboard-tabs" value="Last 30 Days">
                                    <option className="last-week-text">
                                        Last 30 Days
                                    </option>
                                    <option>28 Days</option>
                                    <option>20 Days</option>
                                    <option>25 Days</option>
                                </select>
                            </div>
                            <table className="w-full  dashboard-table-data-background">
                                <thead className="table-heading">
                                    <tr>
                                        <th scope="col" className=" py-3">
                                            Game Name{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Total Player{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Genre{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Artist{" "}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-sub-heading">
                                    <tr className="border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">Artist_3</td>
                                    </tr>
                                    <tr className=" border-b-2 table-border ">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Paid</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4 ">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">HipHop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 pb-5 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">Classical</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_2</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* chart */}
                <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0 break-words  w-full mt-10">
                    User Demographics
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2  dashboard-grid-box mt-3 gap-4">
                    <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0 break-words  w-full ">
                        <div className="card-tile mt-5 h-full">
                            <div className="flex justify-between items-center">
                                <span className="stream-text">Age Demographics</span>
                                <select id="date" className="px-3 py-2 mt-3 dashboard-tabs">
                                    <option className="last-week-text" selected>
                                        Last 7 Days
                                    </option>
                                    <option>28 Days</option>
                                    <option>20 Days</option>
                                    <option>25 Days</option>
                                </select>
                            </div>
                            <div className="w-full mt-20 mb-5">
                                <BarChart width={550} height={300} data={data0}>
                                    <XAxis dataKey="name" stroke="#888" />
                                    <YAxis />
                                    <CartesianGrid
                                        stroke="#ccc"
                                        strokeDasharray="5 5"
                                        vertical={false}
                                    />
                                    <Bar dataKey="uv" fill="#D9B535" barSize={30} />
                                </BarChart>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex flex-col min-w-0 break-words w-full">
                        <div className="card-tile mt-5 h-full">
                            <div className="flex justify-between items-center">
                                <span className="stream-text">Best Performing Games</span>
                                <select id="date" className="px-3 py-2 mt-3 dashboard-tabs" value="Last 30 Days">
                                    <option className="last-week-text">
                                        Last 30 Days
                                    </option>
                                    <option>28 Days</option>
                                    <option>20 Days</option>
                                    <option>25 Days</option>
                                </select>
                            </div>
                            <table className="w-full  dashboard-table-data-background">
                                <thead className="table-heading">
                                    <tr>
                                        <th scope="col" className=" py-3">
                                            Game Name{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Total Player{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Genre{" "}
                                        </th>
                                        <th scope="col" className=" py-3">
                                            Top Artist{" "}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-sub-heading">
                                    <tr className="border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">Artist_3</td>
                                    </tr>
                                    <tr className=" border-b-2 table-border ">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Paid</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4 ">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">K-Pop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">HipHop</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_1</span>
                                        </td>
                                    </tr>
                                    <tr className=" border-b-2 pb-5 table-border">
                                        <td scope="row" className=" py-4">
                                            Game_Name_1
                                        </td>
                                        <td className=" py-4">2.5%</td>
                                        <td className=" py-4">Classical</td>
                                        <td className=" py-4">
                                            <span className="Paid-text">Artist_2</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>


                </div>

            </div>


        </>
    )
}