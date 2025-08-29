import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get current metrics from all tables
    const [precipitationResult, tempResult, windResult] = await Promise.all([
      connection.execute(`
        SELECT 
          AVG(precipitation_mm) as avg_precipitation,
          MAX(precipitation_mm) as max_precipitation,
          COUNT(*) as total_records
        FROM precipitation 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `),
      connection.execute(`
        SELECT 
          AVG(temperature_c) as avg_temperature,
          MIN(temperature_c) as min_temperature,
          MAX(temperature_c) as max_temperature
        FROM SnowpkTempProfile 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `),
      connection.execute(`
        SELECT 
          AVG(wind_speed_ms) as avg_wind_speed,
          MAX(wind_speed_ms) as max_wind_speed,
          AVG(wind_direction_deg) as avg_wind_direction
        FROM Wind 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `)
    ]);

    // Get recent data for charts (last 48 hours)
    const recentDataResult = await connection.execute(`
      SELECT 
        DATE_FORMAT(p.timestamp, '%Y-%m-%d %H:00:00') as hour,
        AVG(p.precipitation_mm) as precipitation,
        AVG(t.temperature_c) as temperature,
        AVG(w.wind_speed_ms) as wind_speed,
        l.name as location_name
      FROM precipitation p
      LEFT JOIN SnowpkTempProfile t ON p.location_id = t.location_id AND DATE_FORMAT(p.timestamp, '%Y-%m-%d %H') = DATE_FORMAT(t.timestamp, '%Y-%m-%d %H')
      LEFT JOIN Wind w ON p.location_id = w.location_id AND DATE_FORMAT(p.timestamp, '%Y-%m-%d %H') = DATE_FORMAT(w.timestamp, '%Y-%m-%d %H')
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE p.timestamp >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
      GROUP BY DATE_FORMAT(p.timestamp, '%Y-%m-%d %H'), p.location_id, l.name
      ORDER BY p.timestamp DESC
      LIMIT 50
    `);

    await connection.close();

    const analytics = {
      current_metrics: {
        precipitation: {
          average: precipitationResult.rows?.[0]?.[0] || 0,
          maximum: precipitationResult.rows?.[0]?.[1] || 0,
          total_records: precipitationResult.rows?.[0]?.[2] || 0
        },
        temperature: {
          average: tempResult.rows?.[0]?.[0] || 0,
          minimum: tempResult.rows?.[0]?.[1] || 0,
          maximum: tempResult.rows?.[0]?.[2] || 0
        },
        wind: {
          average_speed: windResult.rows?.[0]?.[0] || 0,
          max_speed: windResult.rows?.[0]?.[1] || 0,
          average_direction: windResult.rows?.[0]?.[2] || 0
        }
      },
      recent_data: recentDataResult.rows || []
    };

    return new Response(
      JSON.stringify(analytics),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch analytics', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})