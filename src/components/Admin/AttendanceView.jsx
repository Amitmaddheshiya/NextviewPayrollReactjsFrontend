import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";





import {
  getAttendance,
  getEmployees,
  getLeaders,
  getAdmins,
  updateEmployeeAttendance,
} from "../../http";
import Loading from "../Loading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";   // ✅ add this
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaEdit } from "react-icons/fa";


const AttendanceView = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date()); // ✅ default to current month
  const [attendance, setAttendance] = useState(null);
  const [employeeMap, setEmployeeMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState("");



  const [showModal, setShowModal] = useState(false);
const [editData, setEditData] = useState(null);
const [editInTime, setEditInTime] = useState("");
const [editOutTime, setEditOutTime] = useState("");


  // ✅ Fetch all employees + current month attendance on load
  useEffect(() => {
    const fetchEmployeesAndAttendance = async () => {
      setLoading(true);
      let empObj = {};

      try {
        // Fetch employee lists
        const [emps, leaders, admins] = await Promise.all([
          getEmployees(),
          getLeaders(),
          getAdmins(),
        ]);

        emps.data.forEach(
          (e) => (empObj[e.id] = [e.name, e.email])
        );
        leaders.data.forEach(
          (l) => (empObj[l.id] = [l.name, l.email])
        );
        admins.data.forEach(
          (a) => (empObj[a.id] = [a.name, a.email])
        );

        setEmployeeMap(empObj);
        setEmployees([...emps.data, ...leaders.data, ...admins.data]);

        // ✅ Fetch attendance for current month (all employees)
        const now = new Date();
        const obj = {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        };

        const res = await getAttendance(obj);
        const { data } = res;
        setAttendance(data);
        setNoDataMessage(
          data.length === 0
            ? "No attendance records found for this month."
            : ""
        );
      } catch (error) {
        console.error(error);
        setNoDataMessage("Error fetching attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesAndAttendance();
  }, []);

  // ✅ Search by specific date (for specific employee if selected)
  const searchAttendance = async () => {
    if (!selectedDate) {
      alert("Please select a date first!");
      return;
    }

    setLoading(true);
    setNoDataMessage("");
    const obj = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      date: selectedDate.getDate(),
    };

    if (selectedEmployee) obj.employeeID = selectedEmployee; // ✅ Filter by employee if selected

    try {
      const res = await getAttendance(obj);
      const { data } = res;
      setAttendance(data);
      setNoDataMessage(
        data.length === 0
          ? "No attendance records found for the selected date."
          : ""
      );
    } catch (error) {
      console.error(error);
      setNoDataMessage("Error fetching attendance data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search attendance by month & year (for all employees or one)
  const searchAttendanceByMonth = async () => {
    if (!selectedMonthYear) {
      alert("Please select a month & year!");
      return;
    }

    setLoading(true);
    setNoDataMessage("");

    const obj = {
      year: selectedMonthYear.getFullYear(),
      month: selectedMonthYear.getMonth() + 1,
    };

    if (selectedEmployee) obj.employeeID = selectedEmployee; // ✅ Add employee filter

    try {
      const res = await getAttendance(obj);
      const data = res?.data || [];
      setAttendance(data);
      setNoDataMessage(
        data.length === 0
          ? "No attendance records found for this month."
          : ""
      );
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      setNoDataMessage("Error fetching monthly attendance.");
    } finally {
      setLoading(false);
    }
  };

  
  if (loading) return <Loading />;

  return (
    <div className="main-content">
      <section className="section">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4>Attendance</h4>
          </div>
        </div>

        {/* 🔹 Search Filters */}
        <div className="d-flex justify-content-center w-100 align-items-center mt-3 flex-wrap gap-3">
          {/* Employee Select */}
          <div className="col-sm-2">
            <select
              className="form-control select2"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees?.map((employee) => (
                <option key={employee._id || employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker (Daily) */}
          <div className="col-sm-2">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              placeholderText="Select Date"
            />
          </div>

          {/* Search Button (Daily) */}
          <button
            onClick={searchAttendance}
            className="btn btn-lg btn-primary col-sm-2"
          >
            Search (Day)
          </button>

          {/* Month & Year Picker */}
          <div className="col-sm-2">
            <DatePicker
              selected={selectedMonthYear}
              onChange={(date) => setSelectedMonthYear(date)}
              showMonthYearPicker
              dateFormat="MM/yyyy"
              className="form-control text-center"
              placeholderText="Select Month & Year"
              customInput={
                <input
                  className="form-control text-center"
                  style={{ minWidth: "200px" }}
                  value={
                    selectedMonthYear
                      ? `${String(selectedMonthYear.getMonth() + 1).padStart(
                          2,
                          "0"
                        )}/${selectedMonthYear.getFullYear()}`
                      : ""
                  }
                  readOnly
                />
              }
            />
          </div>

          {/* Search Button (Monthly) */}
          <button
            onClick={searchAttendanceByMonth}
            className="btn btn-lg btn-success col-sm-2"
          >
            Search (Month)
          </button>
        </div>
      </section>

      {/* 🔹 Attendance Table */}
      <div className="table-responsive mt-4">
        {attendance && attendance.length > 0 ? (
          <table className="table table-striped table-md center-text">
           <thead>
  <tr>
    <th>#</th>
    <th>Name</th>
    <th>Email</th>
    <th>Date</th>
    <th>Day</th>
    <th>Status</th>
    <th>In Time</th>
    <th>Out Time</th>
    <th>Late</th>
    <th>Total Hours</th>
    <th>Time Status</th>
  </tr>
</thead>
<tbody>
  {attendance.map((att, idx) => {
    // ✅ Parse total hours safely
    const rawTotal = att.totalHours;
    const totalHrs =
      rawTotal === null || rawTotal === undefined || rawTotal === ""
        ? NaN
        : typeof rawTotal === "string"
        ? parseFloat(rawTotal)
        : Number(rawTotal);

    const day = (att.day || "").toLowerCase();

    // ✅ Calculate Time Status
    let timeStatus = "-";
    if (day === "sunday") {
      timeStatus = "Full Time";
    } else if (day === "saturday") {
      timeStatus = totalHrs >= 5 ? "Full Time" : "Half Time";
    } else {
      timeStatus = totalHrs >= 7 ? "Full Time" : "Half Time";
    }

    return (
      <tr key={`${att._id || idx}-${att.date}-${att.month}`}>
        <td>{idx + 1}</td>
        <td>{employeeMap[att.employeeID]?.[0] || "-"}</td>
        <td>{employeeMap[att.employeeID]?.[1] || "-"}</td>
        <td>{`${att.date}/${att.month}/${att.year}`}</td>
        <td>{att.day}</td>
        <td>
          <span
            className={`badge ${
              att.present ? "badge-success" : "badge-danger"
            }`}
          >
            {att.present ? "Present" : "Absent"}
          </span>
        </td>
        <td>{att.attendanceIn || "-"}</td>
        <td>{att.attendanceOut || "-"}</td>
        <td
          style={{
            color: att.late === "Yes" ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {att.late || "-"}
        </td>
        <td>{!isNaN(totalHrs) ? totalHrs : "-"}</td>
     <td
  style={{
    color: timeStatus === "Full Time" ? "green" : "orange",
    fontWeight: "bold",
  }}
>
  {timeStatus}
  <FaEdit
    style={{
      marginLeft: "8px",
      cursor: "pointer",
      color: "#007bff",
    }}
    onClick={() => {
      setEditData(att);
      setEditInTime(att.attendanceIn || "");
      setEditOutTime(att.attendanceOut || "");
      setShowModal(true);
    }}
  />
</td>


      </tr>
    );
  })}
</tbody>

          </table>
        ) : (
          <div className="text-center py-5">
            <h5 className="text-muted">
              {noDataMessage || "No attendance data available."}
            </h5>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Attendance</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {editData && (
      <>
        <p><b>Date:</b> {`${editData.date}/${editData.month}/${editData.year}`}</p>
        <p><b>Day:</b> {editData.day}</p>
        <p><b>Status:</b> {editData.present ? "Present" : "Absent"}</p>

        <div className="form-group">
          <label>In Time</label>
          <input
            type="time"
            className="form-control"
            value={editInTime}
            onChange={(e) => setEditInTime(e.target.value)}
          />
        </div>

        <div className="form-group mt-3">
          <label>Out Time</label>
          <input
            type="time"
            className="form-control"
            value={editOutTime}
            onChange={(e) => setEditOutTime(e.target.value)}
          />
        </div>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button
      variant="primary"
      onClick={async () => {
        if (!editInTime || !editOutTime) {
          return toast.error("Both In Time and Out Time are required!");
        }

        const obj = {
          id: editData._id,
          attendanceIn: editInTime,
          attendanceOut: editOutTime,
        };

        const res = await updateEmployeeAttendance(obj);
        if (res.success) {
          toast.success("Attendance updated successfully!");
          setShowModal(false);

          const refreshed = await getAttendance({
            year: selectedMonthYear.getFullYear(),
            month: selectedMonthYear.getMonth() + 1,
          });
          setAttendance(refreshed.data);
        } else {
          toast.error("Failed to update attendance");
        }
      }}
    >
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default AttendanceView;
