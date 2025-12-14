import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthEmailRequest {
  type: 'verification' | 'password_reset';
  email: string;
  token: string;
  userName?: string;
  baseUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AuthEmailRequest = await req.json();
    console.log('Auth email request received:', { type: requestData.type, email: requestData.email });

    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.uvm.edu';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');

    if (!smtpUser || !smtpPassword) {
      throw new Error('SMTP credentials not configured');
    }

    let subject: string;
    let body: string;

    if (requestData.type === 'verification') {
      const verifyUrl = `${requestData.baseUrl}/auth?action=verify&token=${requestData.token}`;
      subject = 'Verify Your Email - Summit2Shore Data Portal';
      body = `
Hello${requestData.userName ? ` ${requestData.userName}` : ''},

Welcome to the Summit2Shore Data Portal!

Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.

Best regards,
Summit2Shore Team

---
This is an automated message from the Summit2Shore Data Portal.
Contact us at crrels2s@uvm.edu if you have any questions.
      `.trim();
    } else {
      const resetUrl = `${requestData.baseUrl}/auth?action=reset&token=${requestData.token}`;
      subject = 'Reset Your Password - Summit2Shore Data Portal';
      body = `
Hello${requestData.userName ? ` ${requestData.userName}` : ''},

We received a request to reset your password for the Summit2Shore Data Portal.

Click the link below to set a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
Summit2Shore Team

---
This is an automated message from the Summit2Shore Data Portal.
Contact us at crrels2s@uvm.edu if you have any questions.
      `.trim();
    }

    // Send email
    const emailResponse = await sendEmail(
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpUser,
      requestData.email,
      subject,
      body
    );

    console.log('Auth email sent:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${requestData.type === 'verification' ? 'Verification' : 'Password reset'} email sent successfully.` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-auth-email function:', error);
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
