import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { updateSalary, viewAllSalaries } from '../../http';
import { toast } from 'react-toastify';
import Loading from '../Loading';
import HeaderSection from "../../components/HeaderSection";

const SalaryView = () => {
  const { id } = useParams();
  const [salary, setSalary] = useState(null);
  const [formData, setFormData] = useState({ salary: '', bonus: '', reasonForBonus: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const res = await viewAllSalaries({ _id: id });
        if (res?.success && res.data?.length) {
          setSalary(res.data[0]);
        } else {
          toast.error("Salary record not found!");
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchSalary();
  }, [id]);

  const inputEvent = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const { salary: newSalary, bonus, reasonForBonus } = formData;
    if (!newSalary || !bonus || !reasonForBonus) return toast.error("All fields are required!");

    const payload = {
      employeeID: salary.employeeID._id,
      salary: Number(newSalary),
      bonus: Number(bonus),
      reasonForBonus,
    };

    const res = await updateSalary(payload);
    if (res?.success) {
      toast.success("Salary updated successfully!");
    } else {
      toast.error("Update failed!");
    }
  };

  if (loading) return <Loading />;

  const emp = salary?.employeeID;

  return (
    <div className="main-content">
      <section className="section">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4>Salary Details ({salary?.assignedDate})</h4>
          </div>
        </div>

        <div className="col-md-9">
          <table className="table">
            <tbody>
              <tr><th>Name</th><td>{emp?.name}</td></tr>
              <tr><th>Email</th><td>{emp?.email}</td></tr>
              <tr><th>Username</th><td>{emp?.username}</td></tr>
              <tr><th>Mobile</th><td>{emp?.mobile}</td></tr>
              <tr><th>Salary</th><td>{salary?.earnings?.gross ?? '—'}</td></tr>
              <tr><th>Bonus</th><td>{salary?.earnings?.bonus ?? '—'}</td></tr>
              <tr><th>Assigned Date</th><td>{salary?.assignedDate}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Update form */}
      <section className="section">
        <HeaderSection title="Update Salary" />
        <div className="card">
          <div className="card-body pr-5 pl-5 m-1">
            <form className="row" onSubmit={onSubmit}>
              <div className="form-group col-md-6">
                <label>Enter Salary</label>
                <input onChange={inputEvent} value={formData.salary} name="salary" type="number" className="form-control" />
              </div>
              <div className="form-group col-md-6">
                <label>Enter Bonus</label>
                <input onChange={inputEvent} value={formData.bonus} name="bonus" type="number" className="form-control" />
              </div>
              <div className="form-group col-md-12">
                <label>Enter Reason</label>
                <input onChange={inputEvent} value={formData.reasonForBonus} name="reasonForBonus" type="text" className="form-control" />
              </div>
              <div className="form-group text-center col-md-12">
                <button className="btn btn-primary btn-lg" type="submit" style={{ width: '30vh' }}>Update Salary</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalaryView;
