const express = require('express');
const router = express.Router();

// Mock email service - in production, you'd integrate with actual email service
const sendEmail = async (to, subject, html) => {
  console.log(`📧 Sending email to: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Content: ${html}`);
  return Promise.resolve({ success: true, messageId: 'mock-' + Date.now() });
};

// Bulk download request endpoint
router.post('/request', async (req, res) => {
  try {
    const {
      name,
      email,
      organization,
      purpose,
      research_description,
      datasets_requested,
      date_range,
      preferred_format,
      submitted_at,
      user_agent,
      page_url
    } = req.body;

    // Validate required fields
    if (!name || !email || !purpose || !datasets_requested || datasets_requested.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, purpose, and at least one dataset'
      });
    }

    // Generate request ID
    const requestId = `BDR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Prepare data summary for emails
    const datasetNames = {
      'table1': 'Primary Environmental Data',
      'wind': 'Wind Measurements',
      'precipitation': 'Precipitation Data',
      'snow_temp': 'Snow Temperature Profile',
      'raw_complete': 'Complete Raw Dataset',
      'processed_complete': 'Complete Processed Dataset'
    };

    const selectedDatasets = datasets_requested
      .map(id => datasetNames[id] || id)
      .join(', ');

    // Email to S2S team
    const teamEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔔 New Bulk Download Request</h2>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Request ID: ${requestId}</h3>
          <p><strong>Submitted:</strong> ${new Date(submitted_at).toLocaleString()}</p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #374151; margin-top: 0;">👤 Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #374151; margin-top: 0;">🔬 Research Details</h3>
          <p><strong>Purpose:</strong> ${purpose}</p>
          <p><strong>Date Range:</strong> ${date_range || 'Not specified'}</p>
          <p><strong>Preferred Format:</strong> ${preferred_format}</p>
          ${research_description ? `<p><strong>Description:</strong><br>${research_description}</p>` : ''}
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #374151; margin-top: 0;">📊 Requested Datasets</h3>
          <p>${selectedDatasets}</p>
        </div>

        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            <strong>Technical Info:</strong><br>
            User Agent: ${user_agent}<br>
            Page URL: ${page_url}
          </p>
        </div>

        <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>⏰ Next Steps:</strong><br>
            1. Review the request details<br>
            2. Prepare the requested datasets<br>
            3. Send download links to: ${email}<br>
            4. Expected processing time: 2-5 business days
          </p>
        </div>
      </div>
    `;

    // Confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">✅ Bulk Download Request Received</h2>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for your bulk download request. We have successfully received your request and forwarded it to the Summit-to-Shore research team.</p>

        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #0c4a6e; margin-top: 0;">📋 Request Summary</h3>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Submitted:</strong> ${new Date(submitted_at).toLocaleString()}</p>
          <p><strong>Datasets Requested:</strong> ${selectedDatasets}</p>
          <p><strong>Format:</strong> ${preferred_format}</p>
          ${date_range ? `<p><strong>Date Range:</strong> ${date_range}</p>` : ''}
        </div>

        <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #15803d; margin-top: 0;">🔄 What Happens Next</h3>
          <ul style="color: #166534; margin: 0; padding-left: 20px;">
            <li>✅ Your request has been forwarded to our data team</li>
            <li>⏳ Data preparation typically takes 2-5 business days</li>
            <li>📧 You'll receive download links via email when ready</li>
            <li>🔒 All data is provided under UVM's data sharing agreement</li>
          </ul>
        </div>

        <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #d97706; margin-top: 0;">📞 Need Help?</h3>
          <p style="color: #92400e; margin: 0;">
            If you have any questions or need urgent assistance:<br>
            📧 Email: <a href="mailto:s2s@uvm.edu" style="color: #2563eb;">s2s@uvm.edu</a><br>
            📞 Phone: (802) 656-2215<br>
            💬 Expected response time: Within 24 hours during business days
          </p>
        </div>

        <p style="color: #64748b;">
          Best regards,<br>
          <strong>Summit-to-Shore Research Team</strong><br>
          University of Vermont
        </p>

        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin: 16px 0; border-top: 2px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      // Send email to S2S team
      await sendEmail(
        's2s@uvm.edu',
        `🔔 New Bulk Download Request - ${requestId}`,
        teamEmailHtml
      );

      // Send confirmation email to user
      await sendEmail(
        email,
        `✅ Bulk Download Request Confirmed - ${requestId}`,
        userEmailHtml
      );

      console.log(`✅ Bulk download request processed successfully: ${requestId}`);
      console.log(`📊 Requested datasets: ${selectedDatasets}`);
      console.log(`👤 Requestor: ${name} (${email})`);

      res.status(200).json({
        success: true,
        request_id: requestId,
        message: 'Request submitted successfully. Confirmation emails have been sent.',
        expected_processing_time: '2-5 business days'
      });

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      
      // Still return success since the request was received
      // In production, you might want to queue the email for retry
      res.status(200).json({
        success: true,
        request_id: requestId,
        message: 'Request submitted successfully. There may be a delay in email confirmation.',
        warning: 'Email notification may be delayed',
        expected_processing_time: '2-5 business days'
      });
    }

  } catch (error) {
    console.error('❌ Bulk download request error:', error);
    res.status(500).json({
      error: 'Internal server error processing bulk download request',
      message: 'Please try again or contact s2s@uvm.edu directly'
    });
  }
});

// Get all bulk download requests (for admin purposes)
router.get('/requests', (req, res) => {
  // This would typically fetch from a database
  // For now, return a mock response
  res.json({
    message: 'Bulk download requests endpoint - would return stored requests from database',
    note: 'This endpoint requires admin authentication in production'
  });
});

module.exports = router;