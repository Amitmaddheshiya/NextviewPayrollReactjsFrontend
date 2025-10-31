import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateSalary, viewAllSalaries, } from "../../http";
import { toast } from "react-toastify";
import Loading from "../Loading";
import HeaderSection from "../../components/HeaderSection";

const SalaryView = () => {
  const { id } = useParams();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    basic: "",
    hra: "",
    conveyance: "",
    medical: "",
    specialAllowance: "",
    overtimeHours: "",
    overtimeRate: "",
    overtimePay: "",
    bonus: "",
    otherBenefits: "",
    reasonForBonus: "",
  });

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const res = await viewAllSalaries({ _id: id });
        if (res?.success && res.data?.length) {
          const data = res.data[0];
          setSalary(data);
          setFormData({
            basic: data.earnings.basic || "",
            hra: data.earnings.hra || "",
            conveyance: data.earnings.conveyance || "",
            medical: data.earnings.medical || "",
            specialAllowance: data.earnings.specialAllowance || "",
            overtimeHours: data.earnings.overtimeHours || "",
            overtimeRate: data.earnings.overtimeRate || "",
            overtimePay: data.earnings.overtimePay || "",
            bonus: data.earnings.bonus || "",
            otherBenefits: data.earnings.otherBenefits || "",
            reasonForBonus: data.reasonForBonus || "",
          });
        } else {
          toast.error("Salary record not found!");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch salary!");
      }
      setLoading(false);
    };
    fetchSalary();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGross = () => {
    const {
      basic,
      hra,
      conveyance,
      medical,
      specialAllowance,
      overtimePay,
      bonus,
      otherBenefits,
    } = formData;

    return (
      Number(basic) +
      Number(hra) +
      Number(conveyance) +
      Number(medical) +
      Number(specialAllowance) +
      Number(overtimePay) +
      Number(bonus) +
      Number(otherBenefits)
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const gross = calculateGross();
    const totalDeductions = salary?.deductions?.totalDeductions || 0;
    const netPay = gross - totalDeductions;

    const updatedEarnings = {
      basic: Number(formData.basic),
      hra: Number(formData.hra),
      conveyance: Number(formData.conveyance),
      medical: Number(formData.medical),
      specialAllowance: Number(formData.specialAllowance),
      overtimeHours: Number(formData.overtimeHours),
      overtimeRate: Number(formData.overtimeRate),
      overtimePay: Number(formData.overtimePay),
      bonus: Number(formData.bonus),
      otherBenefits: Number(formData.otherBenefits),
      gross,
    };

    const payload = {
      employeeID: salary.employeeID._id,
      earnings: updatedEarnings,
      deductions: salary.deductions,
      netPay,
      reasonForBonus: formData.reasonForBonus,
    };

    try {
      const res = await updateSalary(payload);
      if (res?.success) toast.success("Salary updated successfully!");
      else toast.error(res?.message || "Update failed!");
    } catch (err) {
      console.error(err);
      toast.error("Error updating salary!");
    }
  };

  if (loading || !salary) return <Loading />;

  const emp = salary.employeeID;
  console.log(emp);
  const { earnings, deductions, netPay, assignedDate, month, year } = salary;

  return (
    <div className="main-content">
      <section className="section">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4>Salary Details ({month} {year}) - {emp?.name}</h4>
          </div>
        </div>

        <div className="card">
          <div className="card-body row">
            <div className="col-md-3">
              <img
                className="img-fluid img-thumbnail"
                 src={`${process.env.REACT_APP_API_URL}/storage/images/profile/${emp?.profile}`}
                alt={emp?.name || "User"}
              />
            </div>

            <div className="col-md-9">
              {/* ==== Employee Info ==== */}
              <h5 className="mb-3">Employee Details</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr><th>Name</th><td>{emp?.name}</td></tr>
                  <tr><th>Email</th><td>{emp?.email}</td></tr>
                  <tr><th>Mobile</th><td>{emp?.mobile}</td></tr>
                  <tr><th>Username</th><td>{emp?.username}</td></tr>
                  <tr><th>Address</th><td>{emp?.address}</td></tr>
                  <tr><th>Month</th><td>{month}</td></tr>
                  <tr><th>Year</th><td>{year}</td></tr>
                  <tr><th>Assigned Date</th><td>{assignedDate}</td></tr>
                </tbody>
              </table>

              {/* ==== Earnings ==== */}
              <h5 className="mt-4 mb-3">Earnings</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr><th>Basic</th><td>₹ {earnings?.basic}</td></tr>
                  <tr><th>HRA</th><td>₹ {earnings?.hra}</td></tr>
                  <tr><th>Conveyance</th><td>₹ {earnings?.conveyance}</td></tr>
                  <tr><th>Medical</th><td>₹ {earnings?.medical}</td></tr>
                  <tr><th>Special Allowance</th><td>₹ {earnings?.specialAllowance}</td></tr>
                  <tr><th>Overtime Hours</th><td>{earnings?.overtimeHours}</td></tr>
                  <tr><th>Overtime Rate</th><td>₹ {earnings?.overtimeRate}</td></tr>
                  <tr><th>Overtime Pay</th><td>₹ {earnings?.overtimePay}</td></tr>
                  <tr><th>Bonus</th><td>₹ {earnings?.bonus}</td></tr>
                  <tr><th>Other Benefits</th><td>₹ {earnings?.otherBenefits}</td></tr>
                  <tr className="table-success">
                    <th>Gross Salary</th>
                    <td><b>₹ {earnings?.gross}</b></td>
                  </tr>
                </tbody>
              </table>

              {/* ==== Deductions ==== */}
              <h5 className="mt-4 mb-3">Deductions</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr><th>PF Employee %</th><td>{deductions?.pfEmployeePercent}%</td></tr>
                  <tr><th>PF Employee</th><td>₹ {deductions?.pfEmployee}</td></tr>
                  <tr><th>PF Employer %</th><td>{deductions?.pfEmployerPercent}%</td></tr>
                  <tr><th>PF Employer</th><td>₹ {deductions?.pfEmployer}</td></tr>
                  <tr><th>ESI Employee %</th><td>{deductions?.esiEmployeePercent}%</td></tr>
                  <tr><th>ESI Employee</th><td>₹ {deductions?.esiEmployee}</td></tr>
                  <tr><th>ESI Employer %</th><td>{deductions?.esiEmployerPercent}%</td></tr>
                  <tr><th>ESI Employer</th><td>₹ {deductions?.esiEmployer}</td></tr>
                  <tr><th>Professional Tax</th><td>₹ {deductions?.professionalTax}</td></tr>
                  <tr><th>Loan Recovery</th><td>₹ {deductions?.loanRecovery}</td></tr>
                  <tr><th>TDS Monthly</th><td>₹ {deductions?.tdsMonthly}</td></tr>
                  <tr className="table-danger">
                    <th>Total Deductions</th>
                    <td><b>₹ {deductions?.totalDeductions}</b></td>
                  </tr>
                </tbody>
              </table>

              {/* ==== Net Pay ==== */}
              <h5 className="mt-4 mb-3 text-success">Net Pay</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr className="table-primary">
                    <th>Net Pay (Take Home)</th>
                    <td><b>₹ {netPay?.toFixed(2)}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Update Salary Form ===== */}
      <section className="section">
        <HeaderSection title="Update Salary" />
        <div className="card">
          <div className="card-body pr-5 pl-5 m-1">
            <form className="row" onSubmit={onSubmit}>
              {[
                "basic", "hra", "conveyance", "medical", "specialAllowance",
                "overtimeHours", "overtimeRate", "overtimePay", "bonus", "otherBenefits",
              ].map((field) => (
                <div className="form-group col-md-6" key={field}>
                  <label>
                    {field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              ))}

              <div className="form-group col-md-12">
                <label>Reason for Bonus / Update</label>
                <input
                  onChange={handleChange}
                  value={formData.reasonForBonus}
                  name="reasonForBonus"
                  type="text"
                  className="form-control"
                />
              </div>

              <div className="form-group col-md-12 text-center">
                <h5 className="mt-3">
                  Gross Salary: ₹ <b>{calculateGross()}</b>
                </h5>
                <h6>
                  Net Pay (after deductions): ₹{" "}
                  <b>{(calculateGross() - (deductions?.totalDeductions || 0)).toFixed(2)}</b>
                </h6>
                <button
                  className="btn btn-primary btn-lg mt-3"
                  type="submit"
                  style={{ width: "30vh" }}
                >
                  Update Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalaryView;
