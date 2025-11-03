import React, { useEffect, useState } from "react";
import { Table, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getPayrollPolicies, updatePayrollPolicy } from "../../http";

const PayrollPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // ✅ Fetch payroll policies on component mount
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const res = await getPayrollPolicies();
        const data = res?.data ?? res;
        if (Array.isArray(data)) {
          setPolicies(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load payroll policies");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  // ✅ Handle field change inline
  const handleChange = (index, field, value) => {
    const updated = [...policies];
    updated[index] = { ...updated[index], [field]: value };
    setPolicies(updated);
  };

  // ✅ Save individual policy
  const handleSave = async (policy) => {
    try {
      setSavingId(policy._id);
      const res = await updatePayrollPolicy(policy._id, policy);
      if (res?.success || res?.data) {
        toast.success("Policy updated");
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Save error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="card">
          <div className="card-header">
            <h4>Corporate Payroll Policies</h4>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center my-3">
                <Spinner animation="border" />
              </div>
            ) : (
              <Table bordered hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p, i) => (
                    <tr key={p._id || i}>
                      <td>{i + 1}</td>
                      <td style={{ width: "240px" }}>
                        <Form.Control
                          value={p.title}
                          onChange={(e) => handleChange(i, "title", e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={p.content}
                          onChange={(e) => handleChange(i, "content", e.target.value)}
                          style={{ height: "150px", text: "center" }}
                        />
                      </td>
                      <td style={{ width: "100px" }} className="text-center">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={savingId === p._id}
                          onClick={() => handleSave(p)}
                        >
                          {savingId === p._id ? "Saving..." : "Save"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PayrollPolicies;
