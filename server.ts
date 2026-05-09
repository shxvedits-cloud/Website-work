import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

// Simple in-memory store for OTPs (expires in 5 minutes)
const otpStore = new Map<string, { otp: string; expires: number }>();

async function startServer() {
  const sendgridApiKey = (process.env.SENDGRID_API_KEY || "").trim();
  const sendgridFromEmail = (process.env.SENDGRID_FROM_EMAIL || "notifications@prayagdentalcare.com").trim();
  
  if (!sendgridApiKey) {
    console.warn("WARNING: SENDGRID_API_KEY is not set. Email notifications will be simulated.");
  } else {
    sgMail.setApiKey(sendgridApiKey);
  }

  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || "").trim();

  const twilioClient = (twilioSid.startsWith("AC") && twilioToken)
    ? twilio(twilioSid, twilioToken)
    : null;

  if (!twilioClient) {
    if (twilioSid || twilioToken) {
      console.warn("TWILIO_CONFIG_ERROR: SID or Token provided but invalid. SID must start with 'AC'. WhatsApp messages will be simulated.");
    } else {
      console.warn("TWILIO_CONFIG_MISSING: Account SID or Auth Token missing. WhatsApp messages will be simulated in server logs.");
    }
  } else if (!twilioPhone) {
    console.warn("TWILIO_PHONE_MISSING: TWILIO_PHONE_NUMBER is not set. WhatsApp messages will be simulated.");
  } else {
    console.log("TWILIO_READY: WhatsApp and SMS services initialized successfully.");
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending OTP
  app.post("/api/send-otp", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    otpStore.set(phoneNumber, { otp, expires });

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    if (twilioClient && twilioPhone) {
      try {
        await twilioClient.messages.create({
          body: `Your Prayag Dental Care OTP is: ${otp}. It will expire in 5 minutes.`,
          from: twilioPhone,
          to: phoneNumber,
        });
        res.status(200).json({ success: true, message: "OTP sent successfully." });
      } catch (error: any) {
        console.error("Twilio Error:", error);
        res.status(500).json({ error: "Failed to send SMS. Please check the phone number format." });
      }
    } else {
      // Simulation mode
      res.status(200).json({ 
        success: true, 
        message: "OTP sent (SIMULATED). Check server logs for the code.",
        simulated: true,
        otp: process.env.NODE_ENV !== 'production' ? otp : undefined // Only expose OTP in dev logs/response for testing
      });
    }
  });

  // API Route for verifying OTP
  app.post("/api/verify-otp", async (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: "Phone number and OTP are required." });
    }

    const storedData = otpStore.get(phoneNumber);
    if (!storedData) {
      return res.status(400).json({ error: "No OTP found for this number. Please request a new one." });
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // OTP is valid
    otpStore.delete(phoneNumber);
    res.status(200).json({ success: true, message: "OTP verified successfully." });
  });

  // API Route for sending appointment confirmation via SMS
  app.post("/api/send-confirmation", async (req, res) => {
    const { patientPhone, patientName, doctorName, date, time } = req.body;

    if (!patientPhone || !patientName || !doctorName || !date || !time) {
      return res.status(400).json({ error: "Missing required appointment details." });
    }

    const adminPhone = (process.env.ADMIN_MOBILE_NUMBER || "").trim();

    try {
      console.log(`Attempting to send confirmation SMS. Patient: ${patientPhone}, Admin: ${adminPhone}`);
      
      const smsPromises = [];

      // Send SMS to patient
      if (twilioClient && twilioPhone) {
        smsPromises.push(
          twilioClient.messages.create({
            body: `Prayag Dental Care: Hi ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}. We look forward to seeing you!`,
            from: twilioPhone,
            to: patientPhone,
          })
        );

        // Send SMS to admin if configured
        if (adminPhone) {
          smsPromises.push(
            twilioClient.messages.create({
              body: `Prayag Dental Alert: New appointment booked. Patient: ${patientName} (${patientPhone}), Doctor: ${doctorName}, Date: ${date}, Time: ${time}.`,
              from: twilioPhone,
              to: adminPhone,
            })
          );
        }

        await Promise.all(smsPromises);
        res.status(200).json({ success: true, message: "Confirmation SMS sent successfully." });
      } else {
        // Simulation mode
        console.log("SIMULATION: Confirmation SMS would be sent now.");
        console.log(`To Patient (${patientPhone}): Hi ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}.`);
        if (adminPhone) {
          console.log(`To Admin (${adminPhone}): New appointment booked. Patient: ${patientName} (${patientPhone}), Doctor: ${doctorName}, Date: ${date}, Time: ${time}.`);
        }
        res.status(200).json({ 
          success: true, 
          message: "Confirmation SMS simulated (check server logs).",
          simulated: true 
        });
      }
    } catch (error) {
      console.error("Error sending confirmation SMS:", error);
      res.status(500).json({ error: "Failed to send confirmation SMS." });
    }
  });

  // Health Check for configuration
  app.get("/api/config-check", (req, res) => {
    res.json({
      sendgrid: {
        hasKey: !!sendgridApiKey,
        fromEmail: sendgridFromEmail,
      },
      twilio: {
        hasSid: !!twilioSid,
        hasToken: !!twilioToken,
        hasPhone: !!twilioPhone,
        isReady: !!twilioClient && !!twilioPhone
      }
    });
  });

  // API Route for sending appointment emails (booking/cancellation)
  app.post("/api/send-appointment-email", async (req, res) => {
    const { 
      patientEmail, 
      patientName, 
      doctorName, 
      date, 
      time, 
      serviceTitle,
      type // 'booking' or 'cancellation'
    } = req.body;

    if (!patientEmail || !patientName || !doctorName || !date || !time || !serviceTitle || !type) {
      return res.status(400).json({ error: "Missing required appointment details." });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "shxvedits@gmail.com").trim();

    if (!sendgridApiKey) {
      const msg = `SIMULATION: Email ${type} would be sent to ${patientEmail} (SENDGRID_API_KEY missing).`;
      console.log(msg);
      return res.status(200).json({ 
        success: true, 
        message: msg,
        simulated: true 
      });
    }

    if (!sendgridFromEmail || sendgridFromEmail === "notifications@prayagdentalcare.com") {
      console.warn("Using default or missing SENDGRID_FROM_EMAIL. Ensure this is verified in SendGrid.");
    }

    try {
      const isBooking = type === 'booking';
      const patientSubject = isBooking 
        ? "Appointment Confirmed - Prayag Dental Care" 
        : "Appointment Cancelled - Prayag Dental Care";
      
      const adminSubject = isBooking
        ? `New Appointment Booked - ${patientName}`
        : `Appointment Cancelled - ${patientName}`;

      const patientHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: ${isBooking ? '#0f172a' : '#ef4444'}; font-size: 24px; margin-bottom: 16px;">
            Appointment ${isBooking ? 'Confirmed' : 'Cancelled'}
          </h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${patientName},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            ${isBooking 
              ? "Thank you for choosing Prayag Dental Care. Your appointment has been successfully scheduled." 
              : "Your scheduled appointment at Prayag Dental Care has been cancelled as per your request or update."}
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Appointment Details</h2>
            <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceTitle}</p>
            <p style="margin: 8px 0;"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
          </div>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            ${isBooking 
              ? "We look forward to seeing you soon!" 
              : "If this was a mistake, please visit our website to reschedule."}
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 14px;">Prayag Dental Care Clinic</p>
        </div>
      `;

      const adminHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 16px;">
            ${isBooking ? 'New Appointment Alert' : 'Appointment Cancellation Alert'}
          </h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            An appointment has been ${isBooking ? 'booked' : 'cancelled'} via the website.
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Patient Information</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${patientName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${patientEmail}</p>
            
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 24px;">Appointment Details</h2>
            <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceTitle}</p>
            <p style="margin: 8px 0;"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
          </div>
        </div>
      `;

      // Send to Patient
      await sgMail.send({
        to: patientEmail,
        from: sendgridFromEmail,
        subject: patientSubject,
        html: patientHtml,
      });

      // Send to Admin (Doctor)
      if (adminEmail) {
        await sgMail.send({
          to: adminEmail,
          from: sendgridFromEmail,
          subject: adminSubject,
          html: adminHtml,
        });
      }

      res.status(200).json({ success: true, message: `Email ${type} sent successfully.` });
    } catch (error: any) {
      console.error(`Error sending email ${type}:`, error.response?.body || error);
      res.status(500).json({ error: `Failed to send email ${type}.` });
    }
  });

  // API Route for sending appointment confirmation via WhatsApp
  app.post("/api/send-whatsapp-confirmation", async (req, res) => {
    const { patientPhone, patientName, doctorName, date, time } = req.body;
    const doctorWhatsapp = (process.env.DOCTOR_WHATSAPP_NUMBER || "+918896512561").trim();
    const doctorWa = doctorWhatsapp.startsWith("+") ? doctorWhatsapp : `+91${doctorWhatsapp}`;

    if (!patientPhone || !patientName || !doctorName || !date || !time) {
      return res.status(400).json({ error: "Missing required appointment details." });
    }

    try {
      console.log(`WhatsApp Request - Patient: ${patientPhone}, Doctor: ${doctorName}`);
      
      if (twilioClient && twilioPhone) {
        const patientWa = patientPhone.startsWith("+") ? patientPhone : `+91${patientPhone}`;
        console.log(`Sending real WhatsApp - From: ${twilioPhone}, To: ${patientWa}`);
        
        // Send to Patient
        await twilioClient.messages.create({
          body: `*Prayag Dental Care*\n\nHi ${patientName}, thank you for booking your appointment! \n\n*Details:*\n👨‍⚕️ Doctor: ${doctorName}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nWe look forward to seeing you!`,
          from: `whatsapp:${twilioPhone}`,
          to: `whatsapp:${patientWa}`
        });

        // Send to Doctor (Admin)
        console.log(`Sending Admin Alert to: ${doctorWa}`);
        await twilioClient.messages.create({
          body: `*New Appointment Alert*\n\nPatient: ${patientName}\nPhone: ${patientPhone}\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}`,
          from: `whatsapp:${twilioPhone}`,
          to: `whatsapp:${doctorWa}`
        });

        res.status(200).json({ success: true, message: "WhatsApp notifications sent." });
      } else {
        console.warn("WHATSAPP SIMULATION ACTIVE: Twilio keys missing or invalid.");
        console.log(`[SIMULATED] To Patient (${patientPhone}): Thank you for booking...`);
        console.log(`[SIMULATED] To Doctor (${doctorWa}): New Appointment Alert: ${patientName}...`);
        res.status(200).json({ 
          success: true, 
          message: "WhatsApp simulated in server logs (keys missing).",
          simulated: true 
        });
      }
    } catch (error: any) {
      console.error("WhatsApp Notification Error:", error.message || error);
      res.status(500).json({ error: `Failed to process WhatsApp notifications: ${error.message || "Unknown error"}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
