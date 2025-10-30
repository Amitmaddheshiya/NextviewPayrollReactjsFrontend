import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { updateUser, getUser } from "../../http";
import Modal from "../../components/modal/Modal";

const EditUser = () => {
  const initialState = {
    name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    type: "Employee",
    designation: "",
    address: "",
    profile: "",
    status: "Active",
    adminPassword: "",
    aadhaarNumber: "",
    panNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  };

  const [imagePreview, setImagePreview] = useState("/assets/icons/user.png");
  const [formData, setFormData] = useState(initialState);
  const [updateFormData, setUpdatedFormData] = useState({});
  const [userType, setUserType] = useState("User");
  const [showModal, setShowModal] = useState(false);

  const { id } = useParams();

  // 🧠 Fetch user data when component loads
  useEffect(() => {
    (async () => {
      const res = await getUser(id);
      if (res.success) {
        const data = res.data;
        setUserType(data.type);

        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          mobile: data.mobile || "",
          password: "",
          type: data.type || "Employee",
          designation: data.designation || "",
          address: data.address || "",
          profile: data.profile || "",
          status: data.status || "Active",
          adminPassword: "",
          aadhaarNumber: data.aadhaarNumber || "",
          panNumber: data.panNumber || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
        });

        // 🖼️ set preview if existing image
        if (data.profile) {
         setImagePreview(res.data.profile);
        } else {
          setImagePreview("/assets/icons/user.png");
        }
      }
    })();
  }, [id]);

  // 🧩 Handle input field changes
  const inputEvent = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
    setUpdatedFormData((old) => ({ ...old, [name]: value }));
  };

  // 🖼️ Handle profile image capture
  const captureImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((old) => ({ ...old, profile: file }));
    setUpdatedFormData((old) => ({ ...old, profile: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // 🚀 Submit updated data
  const onSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // append only updated fields
    Object.keys(updateFormData).forEach((key) => {
      if (key === "profile" || key === "image") return;
      fd.append(key, updateFormData[key]);
    });

    // image
    if (updateFormData.profile) {
      fd.append("profile", updateFormData.profile);
    }

    const { success, message } = await updateUser(id, fd);
    if (success) {
      toast.success(message || "User updated successfully");
    } else {
      toast.error(message || "Failed to update user");
    }
  };

  const modalAction = () => setShowModal((prev) => !prev);

  return (
    <>
      {showModal && (
        <Modal close={modalAction} title="Update User" width="35%">
          <div className="row" style={{ margin: "20px" }}>
            <div className="col col-md-4 text-center">
              <img className="rounded" src={imagePreview} width="120" alt="" />
            </div>
            <div className="col col-md-8">
              <table className="table table-md">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{formData.name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{formData.email}</td>
                  </tr>
                  <tr>
                    <th>User Type</th>
                    <td>{formData.type}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-group col-md-12">
            <label>Enter Your Password</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">
                  <i className="fas fa-lock"></i>
                </div>
              </div>
              <input
                onChange={inputEvent}
                value={formData.adminPassword}
                type="password"
                placeholder={`Enter Your Password To Change ${formData.name}'s Type`}
                id="adminPassword"
                name="adminPassword"
                className="form-control"
              />
            </div>
          </div>

          <div className="text-center mb-3">
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              form="updateUserForm"
              style={{ width: "30vh" }}
            >
              Update {formData.type}
            </button>
          </div>
        </Modal>
      )}

      <div className="main-content">
        <section className="section">
          <HeaderSection title={`Edit ${userType}`} />
          <div className="card">
            <div className="card-body pr-5 pl-5 m-1">
              <form className="row" onSubmit={onSubmit} id="updateUserForm">
                {/* 🖼️ Profile Image Upload */}
                <div className="form-group col-md-12 text-center">
  <input
    type="file"
    id="profile"
    name="profile"
    className="form-control d-none"
    onChange={captureImage}
    accept="image/*"
  />
  <label htmlFor="profile" style={{ cursor: "pointer" }}>
    <img
      src={imagePreview || "/assets/icons/user.png"}
      alt="User"
      width="130"
      height="130"
      style={{
        objectFit: "cover",
        borderRadius: "50%",
        border: "3px solid #ddd",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
        transition: "0.3s",
      }}
      onError={(e) => (e.target.src = "/assets/icons/user.png")}
    />
  </label>
  <small className="form-text text-muted mt-2">
    Click image to change profile photo
  </small>
</div>


                {/* 🔹 Basic Details */}
                <div className="form-group col-md-4">
                  <label>Enter Name</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.name}
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group col-md-4">
                  <label>Enter Email</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-envelope"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.email}
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group col-md-4">
                  <label>Enter Username</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-user-circle"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.username}
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group col-md-3">
                  <label>Enter Mobile Number</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-phone"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.mobile}
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group col-md-3">
                  <label>Enter Password</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.password}
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group col-md-3">
                  <label>User Type</label>
                  <select
                    name="type"
                    onChange={inputEvent}
                    value={formData.type}
                    className="form-control select2"
                  >
                    <option>Employee</option>
                    <option>Leader</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div className="form-group col-md-3">
                  <label>User Status</label>
                  <select
                    name="status"
                    onChange={inputEvent}
                    value={formData.status}
                    className="form-control select2"
                  >
                    <option>Active</option>
                    <option>Banned</option>
                  </select>
                </div>

                <div className="form-group col-md-12">
                  <label>Enter Address</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.address}
                      type="text"
                      id="address"
                      name="address"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group col-md-6">
                  <label>Designation</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fas fa-briefcase"></i>
                      </div>
                    </div>
                    <input
                      onChange={inputEvent}
                      value={formData.designation}
                      type="text"
                      id="designation"
                      name="designation"
                      placeholder="e.g. Software Engineer"
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Personal & Bank Details */}
                <div className="col-md-12 mt-3">
                  <h5 className="text-primary">Personal & Bank Details</h5>
                  <hr />
                </div>

                <div className="form-group col-md-6">
                  <label>Aadhaar Number</label>
                  <input
                    onChange={inputEvent}
                    value={formData.aadhaarNumber}
                    type="text"
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    className="form-control"
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>PAN Number</label>
                  <input
                    onChange={inputEvent}
                    value={formData.panNumber}
                    type="text"
                    id="panNumber"
                    name="panNumber"
                    className="form-control"
                  />
                </div>

                <div className="form-group col-md-4">
                  <label>Bank Name</label>
                  <input
                    onChange={inputEvent}
                    value={formData.bankName}
                    type="text"
                    id="bankName"
                    name="bankName"
                    className="form-control"
                  />
                </div>

                <div className="form-group col-md-4">
                  <label>Account Number</label>
                  <input
                    onChange={inputEvent}
                    value={formData.accountNumber}
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    className="form-control"
                  />
                </div>

                <div className="form-group col-md-4">
                  <label>IFSC Code</label>
                  <input
                    onChange={inputEvent}
                    value={formData.ifscCode}
                    type="text"
                    id="ifscCode"
                    name="ifscCode"
                    className="form-control"
                  />
                </div>

                <div className="form-group text-center col-md-12">
                  <button
                    className="btn btn-primary btn-lg"
                    type="submit"
                    style={{ width: "30vh" }}
                  >
                    Update {userType}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EditUser;
