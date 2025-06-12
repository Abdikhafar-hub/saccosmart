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
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  ChartTitle,
  CategoryScale,
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

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

  try {
    const token = localStorage.getItem("token");
    const [dashboardData, contributionsTrend, loanStatusData] = await Promise.all([
      fetch("https://saccosmart.onrender.com/api/dashboard/admin", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch("https://saccosmart.onrender.com/api/analytics/contributions-trend", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch("https://saccosmart.onrender.com/api/analytics/loan-status-distribution", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ]);

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("SaccoSmart Monthly Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text("Prepared by: SaccoSmart Admin", 14, 35);

    // Summary Table
    autoTable(doc, {
      head: [["Metric", "Value"]],
      body: [
        ["Total Contributions", `KES ${(dashboardData.contributions as Contribution[]).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`],
        ["Total Members", `${(dashboardData.members as Member[]).length}`],
        ["Active Loans", `${(dashboardData.loans as Loan[]).filter((l) => l.status === "approved").length}`],
        ["Total Loan Amount", `KES ${(dashboardData.loans as Loan[]).reduce((sum, l) => sum + l.amount, 0).toLocaleString()}`],
      ],
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // Helper function for safe Y positioning
    const getNextY = () => (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 45;

    // Recent Contributions Table
    autoTable(doc, {
      head: [["Amount", "Date", "Status"]],
      body: (dashboardData.contributions as Contribution[]).slice(0, 5).map((c) => [
        `KES ${c.amount.toLocaleString()}`,
        new Date(c.date).toLocaleDateString(),
        c.status,
      ]),
      startY: getNextY(),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    // Recent Loans Table
    autoTable(doc, {
      head: [["Amount", "Term", "Status"]],
      body: (dashboardData.loans as Loan[]).slice(0, 5).map((l) => [
        `KES ${l.amount.toLocaleString()}`,
        l.term || "N/A",
        l.status,
      ]),
      startY: getNextY(),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    // Render Chart Image
    const renderChartToImage = async (type: "line" | "pie", data: any): Promise<string> => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      new Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              enabled: true,
            },
          },
          animation: false,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const img = canvas.toDataURL("image/png", 1.0);
      document.body.removeChild(canvas);
      return img;
    };

    // Contributions Trend Chart
    const lineChartImage = await renderChartToImage("line", {
      labels: (contributionsTrend as TrendData[]).map((c) => c.name),
      datasets: [{
        label: "Monthly Contributions",
        data: (contributionsTrend as TrendData[]).map((c) => c.value),
        borderColor: "#2980b9",
        backgroundColor: "rgba(41, 128, 185, 0.2)",
        fill: true,
        tension: 0.4,
      }],
    });

    // Loan Status Distribution Chart
    const pieChartImage = await renderChartToImage("pie", {
      labels: (loanStatusData as StatusData[]).map((s) => s.name),
      datasets: [{
        data: (loanStatusData as StatusData[]).map((s) => s.value),
        backgroundColor: ["#f39c12", "#27ae60", "#e74c3c", "#3498db"],
      }],
    });

    // Add charts to PDF
    const chartY = getNextY();
    doc.addImage(lineChartImage, "PNG", 14, chartY, 90, 45);
    doc.addImage(pieChartImage, "PNG", 110, chartY, 90, 45);

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
