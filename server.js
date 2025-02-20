const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const LOGSNAG_API_URL = "https://api.logsnag.com/v1/log";
const LOGSNAG_API_KEY = process.env.LOGSNAG_API_KEY;

/**
 * API endpoint for the proxy.
 * The request body gets extracted and then sent to the final API.
 * That way the LogSnap don't get the IP address of the user, but instead the IP address of the proxy.
 */
app.post("/log", async (req, res) => {
    try {
        const eventData = req.body;
        remove_IP_address_from_req(req);
        await send_to_logsnag(eventData);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({ success: false });
    }

});

/**
 * This is currently not needed because the request is not getting forwarded in that sense.
 * However, since I looked the header up and implemented it, I am keeping it here, in case I change it in the future.
 *
 * @param {*} req 
 * @returns {void}
 */
function remove_IP_address_from_req(req) {
    delete req.headers["x-forwarded-for"];
    delete req.headers["cf-connecting-ip"];
    delete req.headers["x-real-ip"];
}

/**
 * Sends the data which got sent to the proxy to the final API.
 *
 * @param {any} data
 * @returns {void}
 */
async function send_to_logsnag(data) {
    console.log("Sending to LogSnag:", data);
    const response = await fetch(LOGSNAG_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${LOGSNAG_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const responseText = await response.text();
    console.log("LogSnag Response:", response.status, responseText);

    if (!response.ok) {
        console.error("LogSnag Error:", responseText);
        throw new Error(`Failed to send telemetry: ${response.status}`);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));