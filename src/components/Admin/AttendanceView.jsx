import React, { useEffect, useState } from 'react';
import { getAttendance, getEmployees, getLeaders, getAdmins } from '../../http';
import Loading from '../Loading';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AttendanceView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [employeeMap, setEmployeeMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState('');

  useEffect(() => {
    const dt = new Date();
    const obj = {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      date: dt.getDate(),
    };

    let empObj = {};

    const fetchData = async () => {
      try {
        const res = await getAttendance(obj);
        const { data } = res;
        setAttendance(data);
        setNoDataMessage(data.length === 0 ? "No attendance records found for today." : "");
      } catch (error) {
        console.error(error);
        setNoDataMessage("Error fetching attendance data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      const emps = await getEmployees();
      const leaders = await getLeaders();
      const admins = await getAdmins();

      emps.data.forEach((employee) => (empObj[employee.id] = [employee.name, employee.email]));
      leaders.data.forEach((leader) => (empObj[leader.id] = [leader.name, leader.email]));
      admins.data.forEach((admin) => (empObj[admin.id] = [admin.name, admin.email]));

      setEmployeeMap(empObj);
      setEmployees([...emps.data, ...leaders.data, ...admins.data]);
    };

    fetchEmployees();
    fetchData();
  }, []);

  // 🔹 Search attendance by specific date
  const searchAttendance = async () => {
    setLoading(true);
    setNoDataMessage('');
    const obj = {};

    if (selectedEmployee) {
      obj["employeeID"] = selectedEmployee;
    }

    if (selectedDate) {
      obj["year"] = selectedDate.getFullYear();
      obj["month"] = selectedDate.getMonth() + 1;
      obj["date"] = selectedDate.getDate();
    }

    console.log("Searching attendance with:", obj);

    try {
      const res = await getAttendance(obj);
      const { data } = res;
      setAttendance(data);
      if (data.length === 0) {
        setNoDataMessage("No attendance records found for the selected date.");
      } else {
        setNoDataMessage('');
      }
    } catch (error) {
      console.error(error);
      setNoDataMessage("Error fetching attendance data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Search attendance by month and year
  const searchAttendanceByMonth = async () => {
    if (!selectedMonthYear) {
      alert("Please select a month & year!");
      return;
    }
    if (!selectedEmployee) {
      alert("Please select an employee!");
      return;
    }

    setLoading(true);
    setNoDataMessage('');

    const obj = {
      employeeID: selectedEmployee,
      year: selectedMonthYear.getFullYear(),
      month: selectedMonthYear.getMonth() + 1,
    };

    console.log("Fetching monthly attendance with:", obj);

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

  if (loading) {
    return <Loading />;
  }

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
              <option value="">Select Employee</option>
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
          <button onClick={searchAttendance} className="btn btn-lg btn-primary col-sm-2">
            Search By (Day)
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
                      ? `${String(selectedMonthYear.getMonth() + 1).padStart(2, "0")}/${selectedMonthYear.getFullYear()}`
                      : ""
                  }
                  readOnly
                />
              }
            />
          </div>

          {/* Search Button (Monthly) */}
          <button onClick={searchAttendanceByMonth} className="btn btn-lg btn-success col-sm-2">
            Search By (Month)
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
              </tr>
            </thead>
            <tbody>
              {attendance.map((att, idx) => (
                <tr key={`${att._id || idx}-${att.date}-${att.month}`}>
                  <td>{idx + 1}</td>
                  <td>{employeeMap[att.employeeID]?.[0]}</td>
                  <td>{employeeMap[att.employeeID]?.[1]}</td>
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
                </tr>
              ))}
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
    </div>
  );
};

export default AttendanceView;
