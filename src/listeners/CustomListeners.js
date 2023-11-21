import { Actions, Manager } from "@twilio/flex-ui";
const PLUGIN = "SIP-OUTBOUND-DIAL";

// Adding a workerClient listener
Manager.getInstance().workerClient.on('reservationCreated', (reservation) => {

    let Flex = Twilio.Flex;

    let mediaId = Flex.AudioPlayerManager.play({
        url: 'https://api.twilio.com/cowbell.mp3',
        repeatable: true,
    })

    reservation.on('accepted', () => Flex.AudioPlayerManager.stop(mediaId))
    reservation.on('canceled', () => Flex.AudioPlayerManager.stop(mediaId))
    reservation.on('completed', () => Flex.AudioPlayerManager.stop(mediaId))
    reservation.on('rejected', () => Flex.AudioPlayerManager.stop(mediaId))
    reservation.on('rescinded', () => Flex.AudioPlayerManager.stop(mediaId))
    reservation.on('timeout', () => Flex.AudioPlayerManager.stop(mediaId))
    reservation.on('wrapup', () => Flex.AudioPlayerManager.stop(mediaId))
})

// Adding a WrapUpTask action listener
Actions.addListener('beforeWrapupTask', (payload) => {
    Actions.invokeAction("SendMessage", { body: "Task Wrapup message", conversationSid: payload.task.attributes.conversationSid });
})

// Adding a StartOutboundCall action listener
Actions.addListener('beforeStartOutboundCall', (payload) => {
    /* 
    
        CRITICAL!!!! Update emergencyNumbers to include any emergency numbers relevant to your business  CRITICAL!!!!
                     Update allowedCountryCodes to represent country codes you are allowed to dial

        It is critical you have Emergency dialing to your business desired destination.  IE through Twilio's Super Network
        or via your SIP connection.  If you wish to have emergency dialing through your SIP connect, remove the Emergency Dialing
        Excemption below

    */

    // Emergency Dialing Excemption

    console.log(PLUGIN,` payload`, payload);
    const emergencyNumbers = ["911", "060", "065"];
    if (emergencyNumbers.some(n => payload.destination.match(n))) {
        console.log(PLUGIN,` - Emergency Number Dialed!`);
    } else {
        // List of number(s) or range(s) you wish to leverage as a SIP target
        const numbers = ["+18556998340", "18556998340", "9000", "9003"];
        console.log(PLUGIN, `original payload.destination: ${payload.destination}`);
        if (numbers.some(n => payload.destination.includes(n))) {
            console.log(PLUGIN,` - Match found, leveraging SIP target!`);

            // Storing the original destination and cleaning up the UI so it doesn't show a SIP target
            payload.taskAttributes = {to: payload.destination};
            // Match found, we will overwrite the payload destintation to leverage a SIP Enpoint/Interface target
            // REPLACE the @xxxx with your SIP Endpoint
            payload.destination = `sip:${payload.destination}@179.190.50.254:5060`;
        } else {
            console.log(PLUGIN,` - Non-SIP call taken!`);
        }
        console.log(PLUGIN, `final payload.destination: ${payload.destination}`);
    }
});