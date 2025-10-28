// src/components/Admin/MonthlySalaries.jsx
import React, { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import { viewAllSalaries } from "../../http";
import Loading from "../Loading";
import { toast } from "react-toastify";

/**
 * MonthlySalaries.jsx
 * - Fetches all salary documents via admin/view-all-salary
 * - Displays a table of salary breakdowns and net pays
 *
 * Notes:
 * - The backend should return salary docs that contain the detailed structure:
 *   { employeeID, earnings: {...}, deductions: {...}, netPay, assignedDate, month, year }
 * - If backend returns a different structure, adjust the render mapping accordingly.
 */

const MonthlySalaries = () => {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const resp = await viewAllSalaries({});
      if (resp?.data?.success) {
        setRows(resp.data.data || []);
      } else {
        setRows([]);
        toast.info(resp?.data?.message || "No salaries found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salaries");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <HeaderSection title="Monthly Salaries" />
      <div className="container my-4">
        <section className="card p-3">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h5>All Assigned Salaries</h5>
            <div>
              <button className="btn btn-sm btn-outline-primary" onClick={fetchSalaries}>Refresh</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Assigned Date</th>
                  <th>Gross (₹)</th>
                  <th>PF (₹)</th>
                  <th>ESI (₹)</th>
                  <th>TDS (₹)</th>
                  <th>Other Deductions (₹)</th>
                  <th>Net Pay (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows && rows.length ? rows.map((r) => {
                  const empName = r.employeeID?.name || r.employeeID || "—";
                  const monthYear = r.month ? `${r.month}/${r.year || ''}` : (r.assignedDate || '').slice(0, 7);
                  const gross = r.earnings?.gross ?? (
                    (r.earnings && Object.values(r.earnings).reduce((s, x) => s + (typeof x === 'number' ? x : 0), 0)) || 0
                  );
                  const pf = r.deductions?.pfEmployee ?? 0;
                  const esi = r.deductions?.esiEmployee ?? 0;
                  const tds = r.deductions?.tdsMonthly ?? 0;
                  const other = ((r.deductions?.professionalTax || 0) + (r.deductions?.loanRecovery || 0));
                  const net = r.netPay ?? Math.max(0, gross - (pf + esi + tds + other));
                  return (
                    <tr key={r._id}>
                      <td>{empName}</td>
                      <td>{monthYear}</td>
                      <td>{r.assignedDate ? r.assignedDate.slice(0, 10) : "-"}</td>
                      <td>{Number(gross).toFixed(2)}</td>
                      <td>{Number(pf).toFixed(2)}</td>
                      <td>{Number(esi).toFixed(2)}</td>
                      <td>{Number(tds).toFixed(2)}</td>
                      <td>{Number(other).toFixed(2)}</td>
                      <td><strong>{Number(net).toFixed(2)}</strong></td>
                      <td>
                        {/* Future: open salary details, edit or export payslip */}
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigator.clipboard?.writeText(JSON.stringify(r))}>
                          Copy JSON
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="10" className="text-center">No salaries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

export default MonthlySalaries;
