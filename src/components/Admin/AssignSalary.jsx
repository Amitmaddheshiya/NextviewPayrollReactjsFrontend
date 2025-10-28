// src/components/Admin/AssignSalary.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { assignSalary, getAllUsers } from "../../http";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";

const AssignSalary = () => {
  const initialState = {
    basic: "",
    hra: "",
    conveyance: "",
    medical: "",
    specialAllowance: "",
    overtimeHours: "",
    overtimeRate: "",
    otherBenefits: "",
    bonus: "",
    reasonForBonus: "",
    pfEmployeePercent: "12",
    pfEmployerPercent: "12",
    esiEmployeePercent: "1.75",
    esiEmployerPercent: "4.75",
    professionalTax: "0",
    loanRecovery: "0",
    tdsMonthlyOverride: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useSelector((s) => s.authSlice || {});

  // Fetch all users
  useEffect(() => {
    (async () => {
      try {
        const resp = await getAllUsers();
        const list = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp?.data?.data)
          ? resp.data.data
          : [];
        setEmployees(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employees");
      }
    })();
  }, []);

  const n = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const parsed = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // ===== Calculations =====
  const overtimePay = useMemo(
    () => n(formData.overtimeHours) * n(formData.overtimeRate),
    [formData.overtimeHours, formData.overtimeRate]
  );

  const grossEarnings = useMemo(() => {
    return (
      n(formData.basic) +
      n(formData.hra) +
      n(formData.conveyance) +
      n(formData.medical) +
      n(formData.specialAllowance) +
      n(formData.bonus) +
      n(formData.otherBenefits) +
      overtimePay
    );
  }, [formData, overtimePay]);

  const pfEmployee = (n(formData.basic) * n(formData.pfEmployeePercent)) / 100;
  const pfEmployer = (n(formData.basic) * n(formData.pfEmployerPercent)) / 100;
  const esiEmployee = (grossEarnings * n(formData.esiEmployeePercent)) / 100;
  const esiEmployer = (grossEarnings * n(formData.esiEmployerPercent)) / 100;
  const professionalTax = n(formData.professionalTax);
  const loanRecovery = n(formData.loanRecovery);

  const calculateAnnualTDSFromSlabs = (annualTaxable) => {
    const slabs = [
      { upto: 250000, rate: 0 },
      { upto: 500000, rate: 0.05 },
      { upto: 1000000, rate: 0.2 },
      { upto: Infinity, rate: 0.3 },
    ];
    let remaining = annualTaxable;
    let tax = 0;
    let lower = 0;
    for (let i = 0; i < slabs.length; i++) {
      const slab = slabs[i];
      const cap = slab.upto;
      const slabAmount = Math.max(0, Math.min(cap - lower, remaining));
      if (slabAmount > 0) {
        tax += slabAmount * slab.rate;
        remaining -= slabAmount;
      }
      lower = cap;
      if (remaining <= 0) break;
    }
    return Math.max(0, tax);
  };

  const annualTaxable = Math.max(
    0,
    (grossEarnings - pfEmployee - professionalTax - esiEmployee) * 12
  );
  const annualTDS = calculateAnnualTDSFromSlabs(annualTaxable);
  const monthlyTDSPreviewFromSlabs = annualTDS / 12;

  const monthlyTDS =
    formData.tdsMonthlyOverride && n(formData.tdsMonthlyOverride) > 0
      ? n(formData.tdsMonthlyOverride)
      : monthlyTDSPreviewFromSlabs;

  const totalDeductions =
    pfEmployee + esiEmployee + professionalTax + loanRecovery + monthlyTDS;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ===== Submit Function =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error("Select an employee");
      return;
    }

    const payload = {
      employeeID: selectedEmployee,
      assignedDate: selectedDate.toISOString().slice(0, 10),
      day: selectedDate.getDate(),
      month: selectedDate.getMonth() + 1,
      year: selectedDate.getFullYear(),

      earnings: {
        basic: n(formData.basic),
        hra: n(formData.hra),
        conveyance: n(formData.conveyance),
        medical: n(formData.medical),
        specialAllowance: n(formData.specialAllowance),
        overtimeHours: n(formData.overtimeHours),
        overtimeRate: n(formData.overtimeRate),
        overtimePay,
        bonus: n(formData.bonus),
        otherBenefits: n(formData.otherBenefits),
        gross: grossEarnings,
      },

      deductions: {
        pfEmployeePercent: n(formData.pfEmployeePercent),
        pfEmployee,
        pfEmployerPercent: n(formData.pfEmployerPercent),
        pfEmployer,
        esiEmployeePercent: n(formData.esiEmployeePercent),
        esiEmployee,
        esiEmployerPercent: n(formData.esiEmployerPercent),
        esiEmployer,
        professionalTax,
        loanRecovery,
        tdsMonthly: monthlyTDS,
        totalDeductions,
      },

      netPay,
      meta: {
        assignedBy: user?._id || null,
        note: formData.reasonForBonus || "",
      },
    };

    try {
      const resp = await assignSalary(payload);
      if (resp?.success) {
        toast.success("Salary assigned successfully");
        setFormData(initialState);
        setSelectedEmployee("");
        setSelectedDate(new Date());
      } else {
        toast.error(resp?.message || "Failed to assign salary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign salary (server error)");
    }
  };

  return (
    <>
      <HeaderSection title="Assign Salary" />
      <div className="container my-4">
        <section className="card p-3">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <label>Select Employee</label>
                <select
                  className="form-control"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">-- Select employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.id} value={emp.id || emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
  <div className="d-flex flex-column">
    <label className="mb-1 fw-semibold">Select Date (Day / Month / Year)</label>
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      dateFormat="dd/MM/yyyy"
      className="form-control"
      placeholderText="Select Date"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      popperPlacement="bottom-start"
    />
  </div>
</div>

            </div>

            {/* EARNINGS SECTION */}
            <h5 className="mt-3">Earnings</h5>
            <div className="row">
              {[
                "basic",
                "hra",
                "conveyance",
                "medical",
                "specialAllowance",
                "bonus",
                "overtimeHours",
                "overtimeRate",
                "otherBenefits",
              ].map((field, idx) => (
                <div key={idx} className="col-md-4 mt-2">
                  <label>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
                  <input
                    name={field}
                    className="form-control"
                    value={formData[field]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            {/* DEDUCTIONS SECTION */}
            <h5 className="mt-3">Deductions & Contributions</h5>
            <div className="row">
              {[
                "pfEmployeePercent",
                "pfEmployerPercent",
                "esiEmployeePercent",
                "esiEmployerPercent",
                "professionalTax",
                "loanRecovery",
                "tdsMonthlyOverride",
              ].map((field, idx) => (
                <div key={idx} className="col-md-4 mt-2">
                  <label>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
                  <input
                    name={field}
                    className="form-control"
                    value={formData[field]}
                    onChange={handleChange}
                  />
                </div>
              ))}
              <div className="col-md-12 mt-2">
                <label>Reason / Note</label>
                <textarea
                  name="reasonForBonus"
                  className="form-control"
                  value={formData.reasonForBonus}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* PREVIEW SECTION */}
            <div className="row mt-3">
              <div className="col-md-6">
                <div className="card p-3">
                  <h6>Preview</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td>Gross Earnings</td>
                        <td>₹ {grossEarnings.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Total Deductions</td>
                        <td>₹ {totalDeductions.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Net Pay</strong>
                        </td>
                        <td>
                          <strong>₹ {netPay.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6 d-flex align-items-end justify-content-end">
                <div>
                  <button
                    className="btn btn-secondary me-2"
                    type="button"
                    onClick={() => {
                      setFormData(initialState);
                      setSelectedEmployee("");
                      setSelectedDate(new Date());
                    }}
                  >
                    Reset
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Assign Salary
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default AssignSalary;
