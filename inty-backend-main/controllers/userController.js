const Quote = require('../models/Quote.js');
const nodemailer = require('nodemailer');
const { generateEmailTemplate } = require('../utils/emailTemplate.js');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use 'gmail' service instead of manual SMTP configuration
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // This should be an App Password
  },
  tls: {
    rejectUnauthorized: false // Only for development!  Remove in production
  },
  debug: true
});

// Verify connectionn
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

exports.submitQuote = async (req, res) => {
  try {
    // Create and save quote
    const quote = new Quote(req.body);
    await quote.save();

    // Send email
    try {
      await transporter.sendMail({
        from: `"Interior Design Calculator" <${process.env.EMAIL_USER}>`,
        to: req.body.userDetails.email,
        subject: 'Your Interior Design Quote',
        html: generateEmailTemplate(req.body)
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email error details:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Quote submitted successfully',
      quote
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit quote',
      error: error.message 
    });
  }
};