import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherDataParams {
  table: 'precipitation' | 'SnowpkTempProfile' | 'table1' | 'Wind';
  location_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const table = url.searchParams.get('table') || 'precipitation';
    const location_id = url.searchParams.get('location_id');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const { createConnection } = await import('https://deno.land/x/mysql@v2.12.1/mod.ts');
    
    const connection = await createConnection({
      hostname: Deno.env.get('MYSQL_HOST') || 'localhost',
      username: Deno.env.get('MYSQL_USER') || 'root',
      password: Deno.env.get('MYSQL_PASSWORD') || '',
      db: Deno.env.get('MYSQL_DATABASE') || 'summit2shore',
      port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
    });

    // Build dynamic query based on table and filters
    let query = `SELECT * FROM ${table}`;
    const conditions: string[] = [];
    const params: any[] = [];

    if (location_id) {
      conditions.push('location_id = ?');
      params.push(parseInt(location_id));
    }

    if (start_date) {
      conditions.push('timestamp >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('timestamp <= ?');
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC';
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    console.log('Executing query:', query, 'with params:', params);

    const result = await connection.execute(query, params);
    await connection.close();

    return new Response(
      JSON.stringify({ 
        data: result.rows || [],
        table,
        total_records: result.rows?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weather data', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})