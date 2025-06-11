import { Patient } from "../../models/index.js";

class PatientViewController {
  async index(req, res, next) {
    try {
      // Extract query parameters
      const search = req.query.search || "";
      const patientId = req.query.patientId || "";
      const dateFrom = req.query.dateFrom || "";
      const dateTo = req.query.dateTo || "";

      // Build filters object
      const filters = {};
      if (search) filters.search = search;
      if (patientId) filters.patientId = patientId;
      if (dateFrom) filters.dateFrom = new Date(dateFrom);
      if (dateTo) filters.dateTo = new Date(dateTo);

      // Get page and limit
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10; // Get total count for pagination
      const total = await Patient.countAll(filters);

      // Get patients with filters
      const patients = await Patient.findAll(filters, page, limit);

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      res.render("patients/index", {
        title: "Patients",
        active: "patients",
        patients,
        user: req.session.user,
        currentPage: page,
        totalPages,
        query: {
          search,
          patientId,
          dateFrom,
          dateTo,
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      next(error);
    }
  }

  async new(req, res) {
    res.render("patients/form", {
      title: "New Patient",
      user: req.session.user,
      patient: null,
    });
  }

  async edit(req, res) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.redirect("/patients");
      }

      res.render("patients/form", {
        title: "Edit Patient",
        patient,
        user: req.session.user,
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      next(error);
    }
  }

  async show(req, res) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.redirect("/patients");
      }

      res.render("patients/show", {
        title: `Patient: ${patient.name}`,
        patient,
        user: req.session.user,
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      // Extract patient data from form
      const patientData = req.body;
      // Save patient using the Patient model
      await Patient.create(patientData);
      // Redirect to patients list with success message
      res.redirect("/patients");
    } catch (error) {
      console.error("Error creating patient:", error);
      // Optionally, re-render the form with error message and previous input
      res.render("patients/form", {
        title: "New Patient",
        user: req.session.user,
        error: error.message,
        patient: req.body,
      });
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id;
      const patientData = { ...req.body };
      delete patientData._method; // Remove _method before DB update
      await Patient.update(id, patientData);
      res.redirect("/patients/" + id);
    } catch (error) {
      console.error("Error updating patient:", error);
      // Re-render the form with error and previous input
      res.render("patients/form", {
        title: "Edit Patient",
        user: req.session.user,
        error: error.message,
        patient: { ...req.body, id: req.params.id },
      });
    }
  }
}

export default PatientViewController;
