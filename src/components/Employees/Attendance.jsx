import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {
  checkInEmployeeAttendance,
  checkOutEmployeeAttendance,
  viewEmployeeAttendance,
} from "../../http";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../Loading";
import "react-datepicker/dist/react-datepicker.css";

const OFFICE_LAT = 23.0361925;
const OFFICE_LNG = 72.5133962;
const ALLOWED_DISTANCE = 30000; // in kilometers (≈200 meters)

const Attendance = () => {
  const { user } = useSelector((state) => state.authSlice);
  const [attendance, setAttendance] = useState();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isNearOffice, setIsNearOffice] = useState(false);

  // --- Helper to calculate distance between two coordinates ---
  const getDistanceFromOffice = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // --- Check user's location if workType is Onsite ---
  const checkLocation = () => {
    if (user.workType !== "Onsite") {
      setIsNearOffice(true); // Remote/hybrid employees can mark attendance anywhere
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistanceFromOffice(
          latitude,
          longitude,
          OFFICE_LAT,
          OFFICE_LNG
        );
        if (distance <= ALLOWED_DISTANCE) {
          setIsNearOffice(true);
          toast.success("You're at the office. Attendance enabled!");
        } else {
          setIsNearOffice(false);
          toast.error("You must be at the office to mark attendance!");
        }
      },
      (err) => {
        console.error(err);
        toast.error("Unable to fetch location. Please enable GPS.");
      }
    );
  };

  // --- Fetch attendance data ---
  useEffect(() => {
    const fetchData = async () => {
      const dt = new Date();
      const obj = {
        employeeID: user.id,
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
      };
      const res = await viewEmployeeAttendance(obj);
      setAttendance(res.data);

      const today = res.data?.find(
        (a) =>
          a.date === dt.getDate() &&
          a.month === dt.getMonth() + 1 &&
          a.year === dt.getFullYear()
      );
      if (today) {
        if (today.attendanceIn) setIsCheckedIn(true);
        if (today.attendanceOut) setIsCheckedOut(true);
      }
    };

    fetchData();
    checkLocation();
  }, [user.id]);

  const handleCheckIn = async () => {
    if (user.workType === "Onsite" && !isNearOffice) {
      toast.error("You must be at the office to check in!");
      return;
    }

    const res = await checkInEmployeeAttendance({ employeeID: user.id });
    if (res.success) {
      toast.success(res.message);
      setIsCheckedIn(true);
    } else toast.error(res.message);
  };

  const handleCheckOut = async () => {
    if (user.workType === "Onsite" && !isNearOffice) {
      toast.error("You must be at the office to check out!");
      return;
    }

    const res = await checkOutEmployeeAttendance({ employeeID: user.id });
    if (res.success) {
      toast.success(res.message);
      setIsCheckedOut(true);
    } else toast.error(res.message);
  };

  return (
    <>
      {attendance ? (
        <div className="main-content">
          <section className="section">
            <div className="card-header d-flex justify-content-between">
              <h4 className="text-white">Attendance</h4>
              <div>
                {!isCheckedIn ? (
                  <button
                    className="btn btn-success"
                    onClick={handleCheckIn}
                    disabled={user.workType === "Onsite" && !isNearOffice}
                  >
                    Check In
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    className="btn btn-danger"
                    onClick={handleCheckOut}
                    disabled={user.workType === "Onsite" && !isNearOffice}
                  >
                    Check Out
                  </button>
                ) : (
                  <button className="btn btn-secondary" disabled>
                    Attendance Completed
                  </button>
                )}
              </div>
            </div>
          </section>

          <div className="table-responsive mt-4">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                  <th>Late</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendance?.length > 0 ? (
                  attendance.map((att, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{`${att.date}/${att.month}/${att.year}`}</td>
                      <td>{att.day}</td>
                      <td>{att.attendanceIn || "-"}</td>
                      <td>{att.attendanceOut || "-"}</td>
                      <td>{att.late || "-"}</td>
                      <td>{att.totalHours || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
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
