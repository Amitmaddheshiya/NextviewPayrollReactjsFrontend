import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { markEmployeeAttendance, viewEmployeeAttendance } from "../../http";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../Loading";
import "react-datepicker/dist/react-datepicker.css";

const Attendance = () => {
  const { user } = useSelector((state) => state.authSlice);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [attendance, setAttendance] = useState();

  useEffect(() => {
    const storedData = localStorage.getItem(user.id);
    if (storedData) {
      const data = JSON.parse(storedData);
      const dt = `${data.date}/${data.month}/${data.year}`;
      if (dt === new Date().toLocaleDateString()) {
        setIsAttendanceMarked(true);
      } else localStorage.clear();
    }
  }, [user.id]);

  useEffect(() => {
    const dt = new Date();
    const obj = {
      employeeID: user.id,
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
    };
    const fetchData = async () => {
      const res = await viewEmployeeAttendance(obj);
      setAttendance(res.data);
    };
    fetchData();
  }, [user.id]);

  const markAttendance = async () => {
    const res = await markEmployeeAttendance({ employeeID: user.id });
    const { success } = res;
    if (success) {
      toast.success(res.message);
      const { newAttendance } = res;
      localStorage.setItem(user.id, JSON.stringify(newAttendance));
      setIsAttendanceMarked(true);
    }
  };

  // 🔍 Search by single date
  const searchAttendanceByDate = async () => {
    if (!selectedDate) {
      toast.error("Please select a date!");
      return;
    }
    const obj = {
      employeeID: user.id,
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      date: selectedDate.getDate(),
    };
    const res = await viewEmployeeAttendance(obj);
    setAttendance(res.data);
  };

  // 🔍 Search by month & year
  const searchAttendanceByMonth = async () => {
    if (!selectedMonthYear) {
      toast.error("Please select month & year!");
      return;
    }
    const obj = {
      employeeID: user.id,
      year: selectedMonthYear.getFullYear(),
      month: selectedMonthYear.getMonth() + 1,
    };
    const res = await viewEmployeeAttendance(obj);
    setAttendance(res.data);
  };

  return (
    <>
      {attendance ? (
        <div className="main-content">
          <section className="section">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h4>Attendance</h4>
                <button
                  className={`btn btn-lg ${
                    isAttendanceMarked ? "btn-secondary" : "btn-primary"
                  } btn-icon-split`}
                  onClick={markAttendance}
                >
                  {isAttendanceMarked ? "Attendance Marked" : "Mark Attendance"}
                </button>
              </div>
            </div>

            {/* 🔹 Date Filter Section */}
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 w-100">
              {/* Single Date Picker */}
              <div>
                <label className="fw-bold">Select Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  placeholderText="Select specific date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              <button
                onClick={searchAttendanceByDate}
                className="btn btn-lg btn-primary mr-4"
              >
                Search Date
              </button>

              {/* Month-Year Picker */}
              <div>
                <label className="fw-bold">Select Month & Year</label>
                <DatePicker
                  selected={selectedMonthYear}
                  onChange={(date) => setSelectedMonthYear(date)}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="form-control"
                  placeholderText="Select month & year"
                />
              </div>
              <button
                onClick={searchAttendanceByMonth}
                className="btn btn-lg btn-success"
              >
                Search Month
              </button>
            </div>
          </section>

          {/* Attendance Table */}
          <div className="table-responsive mt-4">
            <table className="table table-striped table-md center-text">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance?.length > 0 ? (
                  attendance.map((att, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{`${att.date}/${att.month}/${att.year}`}</td>
                      <td>{att.day}</td>
                      <td>{att.present ? "Present" : "Absent"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No attendance record found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Attendance;
