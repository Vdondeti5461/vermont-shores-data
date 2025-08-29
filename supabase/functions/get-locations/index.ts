import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  status?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { createConnection } = await import('https://deno.land/x/mysql@v2.12.1/mod.ts');
    
    const connection = await createConnection({
      hostname: Deno.env.get('MYSQL_HOST') || 'localhost',
      username: Deno.env.get('MYSQL_USER') || 'root',
      password: Deno.env.get('MYSQL_PASSWORD') || '',
      db: Deno.env.get('MYSQL_DATABASE') || 'summit2shore',
      port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
    });

    // Query the locations table
    const result = await connection.execute('SELECT * FROM locations ORDER BY name');
    
    const locations: LocationData[] = result.rows?.map((row: any) => ({
      id: row[0],
      name: row[1],
      latitude: parseFloat(row[2]),
      longitude: parseFloat(row[3]),
      elevation: row[4] ? parseFloat(row[4]) : undefined,
      status: row[5] || 'active'
    })) || [];

    await connection.close();

    return new Response(
      JSON.stringify({ locations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch locations', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})