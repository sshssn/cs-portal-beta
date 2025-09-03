import React from "react";

const statusColor = {
  green: "#28a745",
  amber: "#ffc107",
  red: "#dc3545",
};

const EscalationDashboard = ({ jobs }) => (
  <div className="card mt-4">
    <h2>Escalation Dashboard</h2>
    <table className="table">
      <thead>
        <tr>
          <th>Job Number</th>
          <th>Customer</th>
          <th>Engineer</th>
          <th>Contact Name</th>
          <th>Contact Number</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.jobNumber}>
            <td>{job.jobNumber}</td>
            <td>{job.customer}</td>
            <td>{job.engineer}</td>
            <td>{job.contact.name}</td>
            <td>{job.contact.number}</td>
            <td>
              <span
                style={{
                  background: statusColor[job.status],
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "12px",
                }}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EscalationDashboard;
