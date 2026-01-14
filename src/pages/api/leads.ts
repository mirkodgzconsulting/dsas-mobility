export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { vehicle, version, config, user } = body;

        // Use Service Role Key to bypass RLS
        const supabaseAdmin = createClient(
            import.meta.env.PUBLIC_SUPABASE_URL,
            import.meta.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // 1. Insert into Supabase (Primary Source of Truth)
        let dbId = null;
        try {
            const { data: dbData, error: dbError } = await supabaseAdmin
                .from('leads')
                .insert([
                    {
                        full_name: user.name,
                        email: user.email,
                        phone: user.phone,
                        fiscal_code: user.fiscalCode,
                        customer_type: user.type === 'piva' ? 'P.IVA' : 'Privato',
                        message: user.message,
                        vehicle_snapshot: { title: vehicle, version: version },
                        configuration: config,
                    }
                ])
                .select()
                .single();

            if (dbError) {
                console.error('Database Operation Failed (Continuing to Email):', dbError);
            } else {
                dbId = dbData.id;
            }
        } catch (dbEx) {
            console.error('Database Exception (Refusing to crash):', dbEx);
        }

        // 2. Send Email via Resend
        // Note: RESEND_API_KEY must be set in .env
        const resendApiKey = import.meta.env.RESEND_API_KEY;

        let emailStatus = 'skipped';
        if (resendApiKey) {
            const resend = new Resend(resendApiKey);

            // Using standard HTML template
            const htmlContent = `
                <h1>Nuova Richiesta Preventivo</h1>
                <p><strong>Veicolo:</strong> ${vehicle} ${version}</p>
                <p><strong>Configurazione:</strong> ${config.months} Mesi / ${config.km} Km annui</p>
                <hr />
                <h3>Dati Cliente (${user.type === 'piva' ? 'P.IVA' : 'Privato'})</h3>
                <ul>
                    <li><strong>Nome:</strong> ${user.name}</li>
                    <li><strong>Email:</strong> ${user.email}</li>
                    <li><strong>Telefono:</strong> ${user.phone}</li>
                    <li><strong>CF/P.IVA:</strong> ${user.fiscalCode || 'N/D'}</li>
                </ul>
                <p><strong>Messaggio:</strong><br/>${user.message || 'Nessuno'}</p>
            `;

            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'DSAS Mobility <onboarding@resend.dev>', // Update this once domain is verified
                to: ['assistenza@dsas-mobility.it'],
                subject: `Lead: ${user.name} - ${vehicle}`,
                html: htmlContent,
            });

            if (emailError) {
                console.error('Email Error:', emailError);
                // We don't throw here to avoid failing the whole request if DB saved ok
                emailStatus = 'failed';
            } else {
                emailStatus = 'sent';
            }
        }

        return new Response(JSON.stringify({
            success: true,
            id: dbId || 'orphan-email',
            email: emailStatus,
            dbStatus: dbId ? 'saved' : 'failed-but-email-sent'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
