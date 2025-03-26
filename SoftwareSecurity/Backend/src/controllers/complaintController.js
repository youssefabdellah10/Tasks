const fs = require('fs');
const path = require('path');
const { Complaint } = require('../models/models');

// A10:2021 – Server-Side Request Forgery
const complaintController = {
  submitComplaint: async (req, res) => {
    try {
      // No validation for file type or size
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No file was uploaded' });
      }
      
      const { description } = req.body;
      const uploadedFile = req.files.file;
      
      // Vulnerable path handling - allows directory traversal
      const uploadPath = path.join(__dirname, '../../uploads/', uploadedFile.name);
      
      // A8:2021 – Software and Data Integrity Failures
      // No validation of file content or type - allows uploading executable files
      uploadedFile.mv(uploadPath, async (err) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
        
        const complaint = new Complaint({
          userId: req.session.userId,
          description,
          filePath: uploadPath
        });
        
        await complaint.save();
        
        res.json({ message: 'Complaint submitted successfully', complaint });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // A1:2021 – Broken Access Control
  // No proper authorization checks for viewing complaints
  getComplaints: async (req, res) => {
    try {
      // No role check - any user can view all complaints
      const complaints = await Complaint.find()
        .populate('userId', 'username email');
      
      res.json(complaints);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // A4:2021 – Insecure Design
  // Vulnerable to SSRF
  downloadComplaintAttachment: async (req, res) => {
    try {
      const { complaintId } = req.params;
      const complaint = await Complaint.findById(complaintId);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      // SSRF vulnerability - allows specifying an arbitrary URL
      const fileUrl = req.query.file || complaint.filePath;
      
      // This is vulnerable to path traversal and SSRF
      res.download(fileUrl, path.basename(fileUrl), (err) => {
        if (err) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = complaintController;