import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkRequestData {
  userName: string;
  userEmail: string;
  database: string;
  table: string;
  locations: string[];
  attributes: string[];
  startDate: string;
  endDate: string;
  additionalNotes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: BulkRequestData = await req.json();
    console.log('Bulk download request received:', requestData);

    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.uvm.edu';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');

    if (!smtpUser || !smtpPassword) {
      throw new Error('SMTP credentials not configured');
    }

    // Prepare email content for s2s@uvm.edu
    const adminEmailBody = `
New Bulk Download Request

User Information:
- Name: ${requestData.userName}
- Email: ${requestData.userEmail}

Download Parameters:
- Database: ${requestData.database}
- Table: ${requestData.table}
- Locations: ${requestData.locations.join(', ')}
- Attributes: ${requestData.attributes.join(', ')}
- Date Range: ${requestData.startDate} to ${requestData.endDate}

${requestData.additionalNotes ? `Additional Notes:\n${requestData.additionalNotes}` : ''}

---
This is an automated notification from the Summit2Shore Data Portal.
    `.trim();

    // Prepare confirmation email for requester
    const userEmailBody = `
Thank you for your bulk download request!

Your request has been received and is being processed. Here are the details:

Database: ${requestData.database}
Table: ${requestData.table}
Locations: ${requestData.locations.join(', ')}
Attributes: ${requestData.attributes.join(', ')}
Date Range: ${requestData.startDate} to ${requestData.endDate}

We will process your request and contact you at ${requestData.userEmail} when your data is ready.

If you have any questions, please contact us at s2s@uvm.edu.

Best regards,
Summit2Shore Team

---
This is an automated confirmation from the Summit2Shore Data Portal.
    `.trim();

    // Send email to admin (s2s@uvm.edu)
    const adminEmailResponse = await sendEmail(
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpUser,
      's2s@uvm.edu',
      'New Bulk Download Request - Summit2Shore Data Portal',
      adminEmailBody
    );

    console.log('Admin notification sent:', adminEmailResponse);

    // Send confirmation email to requester
    const userEmailResponse = await sendEmail(
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpUser,
      requestData.userEmail,
      'Bulk Download Request Confirmation - Summit2Shore Data Portal',
      userEmailBody
    );

    console.log('User confirmation sent:', userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bulk download request submitted successfully. Check your email for confirmation.' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-bulk-request function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendEmail(
  host: string,
  port: number,
  user: string,
  password: string,
  from: string,
  to: string,
  subject: string,
  body: string
): Promise<string> {
  // Connect to SMTP server
  const conn = await Deno.connect({ hostname: host, port });
  
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  async function readResponse(): Promise<string> {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    return decoder.decode(buffer.subarray(0, n || 0));
  }
  
  async function sendCommand(command: string): Promise<string> {
    await conn.write(encoder.encode(command + '\r\n'));
    return await readResponse();
  }
  
  try {
    // SMTP handshake
    await readResponse(); // Read greeting
    await sendCommand(`EHLO ${host}`);
    await sendCommand('STARTTLS');
    
    // Upgrade to TLS
    const tlsConn = await Deno.startTls(conn, { hostname: host });
    
    // Re-define functions for TLS connection
    async function readResponseTls(): Promise<string> {
      const buffer = new Uint8Array(1024);
      const n = await tlsConn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    }
    
    async function sendCommandTls(command: string): Promise<string> {
      await tlsConn.write(encoder.encode(command + '\r\n'));
      return await readResponseTls();
    }
    
    await sendCommandTls(`EHLO ${host}`);
    await sendCommandTls('AUTH LOGIN');
    await sendCommandTls(btoa(user));
    await sendCommandTls(btoa(password));
    await sendCommandTls(`MAIL FROM:<${from}>`);
    await sendCommandTls(`RCPT TO:<${to}>`);
    await sendCommandTls('DATA');
    
    // Send email content
    const emailContent = [
      `From: Summit2Shore Data Portal <${from}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
      '.',
    ].join('\r\n');
    
    await sendCommandTls(emailContent);
    await sendCommandTls('QUIT');
    
    tlsConn.close();
    return 'Email sent successfully';
  } catch (error) {
    conn.close();
    throw error;
  }
}
