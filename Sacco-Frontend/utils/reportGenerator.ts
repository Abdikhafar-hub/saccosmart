import jsPDF from "jspdf";
import "jspdf-autotable";// Enables types and doc.lastAutoTable
import autoTable from "jspdf-autotable";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title as ChartTitle,
  CategoryScale,
  PieController,
  ArcElement,
} from "chart.js";

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, ChartTitle, CategoryScale, PieController, ArcElement);

// Interfaces for data
interface Contribution {
  amount: number;
  date: string;
  status: string;
}

interface Loan {
  amount: number;
  term: string;
  status: string;
}

interface Member {
  name: string;
  email: string;
}

interface TrendData {
  name: string;
  value: number;
}

interface StatusData {
  name: string;
  value: number;
}

export const generatePDFReport = async (): Promise<Blob> => {
  const doc = new jsPDF();

  const token = localStorage.getItem("token");
  const [dashboardData, contributionsTrend, loanStatusData] = await Promise.all([
    fetch("http://localhost:5000/api/dashboard/admin", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),
    fetch("http://localhost:5000/api/analytics/contributions-trend", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),
    fetch("http://localhost:5000/api/analytics/loan-status-distribution", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),
  ]);

  // Header
  doc.setFontSize(16);
  doc.text("SaccoSmart Monthly Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);
  doc.text("Prepared by: SaccoSmart Admin", 14, 26);

  // Summary Table
  autoTable(doc, {
    head: [["Total Contributions", "Total Members", "Approved Loans"]],
    body: [[
      `KES ${(dashboardData.contributions as Contribution[]).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`,
      `${(dashboardData.members as Member[]).length}`,
      `${(dashboardData.loans as Loan[]).filter((l) => l.status === "approved").length}`,
    ]],
    startY: 32,
    theme: 'striped',
  });

  // Helper function for safe Y positioning
  const getNextY = () => (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 5 : 40;

  // Contributions Table
  autoTable(doc, {
    head: [["Amount", "Date", "Status"]],
    body: (dashboardData.contributions as Contribution[]).slice(0, 5).map((c) => [
      `KES ${c.amount.toLocaleString()}`,
      new Date(c.date).toLocaleDateString(),
      c.status,
    ]),
    startY: getNextY(),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Loans Table
  autoTable(doc, {
    head: [["Amount", "Term", "Status"]],
    body: (dashboardData.loans as Loan[]).slice(0, 5).map((l) => [
      `KES ${l.amount.toLocaleString()}`,
      l.term,
      l.status,
    ]),
    startY: getNextY(),
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96] },
  });

  // Members Table
  autoTable(doc, {
    head: [["Name", "Email"]],
    body: (dashboardData.members as Member[]).map((m) => [m.name, m.email]),
    startY: getNextY(),
    theme: 'grid',
    headStyles: { fillColor: [155, 89, 182] },
  });

  // Render Chart Image
  const renderChartToImage = async (type: "line" | "pie", data: any): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);

    new Chart(canvas, {
      type,
      data,
      options: {
        plugins: { legend: { display: true } },
        animation: false,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    const img = canvas.toDataURL("image/png");
    document.body.removeChild(canvas);
    return img;
  };

  // Charts
  const lineChartImage = await renderChartToImage("line", {
    labels: (contributionsTrend as TrendData[]).map((c) => c.name),
    datasets: [{
      label: "Monthly Contributions",
      data: (contributionsTrend as TrendData[]).map((c) => c.value),
      borderColor: "#2980b9",
      backgroundColor: "rgba(41, 128, 185, 0.2)",
      fill: true,
    }],
  });

  const pieChartImage = await renderChartToImage("pie", {
    labels: (loanStatusData as StatusData[]).map((s) => s.name),
    datasets: [{
      data: (loanStatusData as StatusData[]).map((s) => s.value),
      backgroundColor: ["#f39c12", "#27ae60", "#e74c3c"],
    }],
  });

  // Insert chart images
  const chartY = getNextY();
  doc.addImage(lineChartImage, "PNG", 10, chartY, 90, 50);
  doc.addImage(pieChartImage, "PNG", 110, chartY, 90, 50);

  // Return the PDF as a blob
  return doc.output('blob');
};
