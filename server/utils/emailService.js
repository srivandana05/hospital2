const nodemailer = require('nodemailer');
// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({  // ✅ FIXED HERE
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email notification
const sendEmailNotification = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"MediCare Hospital" <${process.env.EMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MediCare Hospital</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">${emailData.subject}</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${emailData.message}
            </div>
            <div style="margin-top: 20px; text-align: center; color: #666;">
              <p>This is an automated message from MediCare Hospital System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment confirmation to patient
const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
  const emailData = {
    to: patient.email,
    subject: 'Appointment Confirmation - MediCare Hospital',
    message: `
      <h3>Dear ${patient.name},</h3>
      <p>Your appointment has been successfully booked!</p>
      <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h4>Appointment Details:</h4>
        <p><strong>Doctor:</strong> ${doctor.name}</p>
        <p><strong>Department:</strong> ${appointment.department}</p>
        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        ${appointment.symptoms ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>` : ''}
      </div>
      <p>Please arrive 15 minutes before your scheduled appointment time.</p>
      <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
      <p>Thank you for choosing MediCare Hospital!</p>
    `
  };
  
  return await sendEmailNotification(emailData);
};

// Send appointment notification to admin
const sendAdminNotification = async (appointment, patient, doctor) => {
  const emailData = {
    to: process.env.ADMIN_EMAIL,
    subject: 'New Appointment Booked - MediCare Hospital',
    message: `
      <h3>New Appointment Alert</h3>
      <p>A new appointment has been booked in the system.</p>
      <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h4>Appointment Details:</h4>
        <p><strong>Patient:</strong> ${patient.name} (${patient.email})</p>
        <p><strong>Phone:</strong> ${patient.phone}</p>
        <p><strong>Doctor:</strong> ${doctor.name}</p>
        <p><strong>Department:</strong> ${appointment.department}</p>
        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        ${appointment.symptoms ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>` : ''}
        <p><strong>Booked At:</strong> ${new Date(appointment.createdAt).toLocaleString()}</p>
      </div>
      <p>Please review this appointment in the admin dashboard.</p>
    `
  };
  
  return await sendEmailNotification(emailData);
};

// Send appointment status update
const sendStatusUpdateNotification = async (appointment, patient, doctor, newStatus) => {
  const statusMessages = {
    completed: 'Your appointment has been completed.',
    cancelled: 'Your appointment has been cancelled.',
    'no-show': 'You were marked as no-show for your appointment.'
  };

  const emailData = {
    to: patient.email,
    subject: `Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - MediCare Hospital`,
    message: `
      <h3>Dear ${patient.name},</h3>
      <p>${statusMessages[newStatus] || `Your appointment status has been updated to: ${newStatus}`}</p>
      <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h4>Appointment Details:</h4>
        <p><strong>Doctor:</strong> ${doctor.name}</p>
        <p><strong>Department:</strong> ${appointment.department}</p>
        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${newStatus.toUpperCase()}</p>
      </div>
      <p>If you have any questions, please contact our support team.</p>
      <p>Thank you for choosing MediCare Hospital!</p>
    `
  };
  
  return await sendEmailNotification(emailData);
};

module.exports = {
  sendEmailNotification,
  sendAppointmentConfirmation,
  sendAdminNotification,
  sendStatusUpdateNotification
};
