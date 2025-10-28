import React, { useEffect, useState } from 'react'
import { getAttendance, getEmployees, getLeaders, getAdmins } from '../../http';
import Loading from '../Loading';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AttendanceView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState(null);
  const [employeeMap, setEmployeeMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState('');

  useEffect(() => {
    const dt = new Date();
    const obj = {
      "year": dt.getFullYear(),
      "month": dt.getMonth() + 1,
      "date": dt.getDate(),
    }

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
    }

    const fetchEmployees = async () => {
      const emps = await getEmployees();
      const leaders = await getLeaders();
      const admins = await getAdmins();
      emps.data.forEach(employee => empObj[employee.id] = [employee.name, employee.email]);
      leaders.data.forEach(leader => empObj[leader.id] = [leader.name, leader.email]);
      admins.data.forEach(admin => empObj[admin.id] = [admin.name, admin.email]);
      setEmployeeMap(empObj);
      setEmployees([...emps.data, ...leaders.data, ...admins.data]);
    }

    fetchEmployees();
    fetchData();
  }, []);

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
        setNoDataMessage("No attendance records found for the selected criteria.");
      } else {
        setNoDataMessage('');
      }
    } catch (error) {
      console.error(error);
      setNoDataMessage("Error fetching attendance data.");
    } finally {
      setLoading(false);
    }
  }

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

        <div className="d-flex justify-content-center w-100 align-items-center mt-3 flex-wrap gap-2">

          {/* Employee Select */}
          <div className="col-sm-3">
            <select
              className='form-control select2'
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees?.map((employee) => (
                <option key={employee._id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="col-sm-3">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              placeholderText="Select Date"
            />
          </div>

          {/* Search Button */}
          <button onClick={searchAttendance} className="btn btn-lg btn-primary col-sm-2">
            Search
          </button>
        </div>
      </section>

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
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{employeeMap[att.employeeID]?.[0]}</td>
                  <td>{employeeMap[att.employeeID]?.[1]}</td>
                  <td>{`${att.date}/${att.month}/${att.year}`}</td>
                  <td>{att.day}</td>
                  <td>
                    <span className={`badge ${att.present ? "badge-success" : "badge-danger"}`}>
                      {att.present ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5">
            <h5 className="text-muted">{noDataMessage || "No attendance data available."}</h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceView;
