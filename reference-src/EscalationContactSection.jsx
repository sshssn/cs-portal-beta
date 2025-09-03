import React, { useState } from "react";

const EscalationContactSection = ({ onSave }) => {
  const [contact, setContact] = useState({
    name: "",
    number: "",
    email: "",
    relationship: "",
  });

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  return (
    <div className="card mb-4">
      <h2>Escalation Contact Details</h2>
      <div className="form-row">
        <div className="form-group col-md-3">
          <label>Name</label>
          <input type="text" className="form-control" name="name" value={contact.name} onChange={handleChange} required />
        </div>
        <div className="form-group col-md-3">
          <label>Number</label>
          <input type="tel" className="form-control" name="number" value={contact.number} onChange={handleChange} required />
        </div>
        <div className="form-group col-md-3">
          <label>Email</label>
          <input type="email" className="form-control" name="email" value={contact.email} onChange={handleChange} required />
        </div>
        <div className="form-group col-md-3">
          <label>Relationship</label>
          <input type="text" className="form-control" name="relationship" value={contact.relationship} onChange={handleChange} required />
        </div>
      </div>
      <button className="btn btn-primary mt-2" onClick={() => onSave(contact)}>
        Save Contact
      </button>
    </div>
  );
};

export default EscalationContactSection;
