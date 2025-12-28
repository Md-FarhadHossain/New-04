import { NextResponse } from 'next/server';
import { FacebookAdsApi, ServerEvent, EventRequest, UserData, CustomData } from 'facebook-nodejs-business-sdk';

export async function POST(request) {
    try {
        const body = await request.json();
        const { eventName, eventId, eventSourceUrl, userData: clientUserData, customData: clientCustomData, config } = body;

        if (!config.accessToken || !config.pixelId) {
            return NextResponse.json({ error: 'Missing Config' }, { status: 400 });
        }

        const access_token = config.accessToken;
        const pixel_id = config.pixelId;

        const api = FacebookAdsApi.init(access_token);
        
        if (config.testCode) {
             // Not readily available in global init, handled event-server-side usually or via graph API directly
             // SDK treats test code on EventRequest
        }

        const mainCustomData = new CustomData();
        // Map all custom params
        Object.keys(clientCustomData || {}).forEach(key => {
            // Check for standard properties first
            if (key === 'value') mainCustomData.setValue(clientCustomData[key]);
            else if (key === 'currency') mainCustomData.setCurrency(clientCustomData[key]);
            else if (key === 'content_name') mainCustomData.setContentName(clientCustomData[key]);
            else if (key === 'content_ids') mainCustomData.setContentIds(clientCustomData[key]);
            else if (key === 'content_type') mainCustomData.setContentType(clientCustomData[key]);
            else if (key === 'num_items') mainCustomData.setNumItems(clientCustomData[key]);
            else {
                 // Add as custom property
                 const customProps = mainCustomData._custom_properties || {};
                 customProps[key] = clientCustomData[key];
                 mainCustomData.setCustomProperties(customProps);
            }
        });


        const mainUserData = new UserData()
            .setClientIpAddress(request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0')
            .setClientUserAgent(request.headers.get('user-agent'))
            .setFbp(clientUserData.fbp)
            .setFbc(clientUserData.fbc);

        // Add hashed User Data if present
        if (clientUserData.em) mainUserData.setEmail(clientUserData.em);
        if (clientUserData.ph) mainUserData.setPhone(clientUserData.ph);
        if (clientUserData.fn) mainUserData.setFirstName(clientUserData.fn);
        if (clientUserData.ln) mainUserData.setLastName(clientUserData.ln);
        if (clientUserData.ct) mainUserData.setCity(clientUserData.ct);
        if (clientUserData.st) mainUserData.setState(clientUserData.st);
        if (clientUserData.country) mainUserData.setCountry(clientUserData.country);
        if (clientUserData.external_id) mainUserData.setExternalId(clientUserData.external_id);


        const serverEvent = new ServerEvent()
            .setEventName(eventName)
            .setEventTime(Math.floor(Date.now() / 1000))
            .setEventSourceUrl(eventSourceUrl)
            .setActionSource('website')
            .setUserData(mainUserData)
            .setCustomData(mainCustomData)
            .setEventId(eventId);

        const eventRequest = new EventRequest(access_token, pixel_id).setEvents([serverEvent]);
        
        if (config.testCode) {
            eventRequest.setTestEventCode(config.testCode);
        }

        try {
            const response = await eventRequest.execute();
            return NextResponse.json({ success: true, fb_trace_id: response.fb_trace_id });
        } catch (e) {
            console.error("FB SDK Error:", e);
             return NextResponse.json({ error: e.message }, { status: 500 });
        }

    } catch (e) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
