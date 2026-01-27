/**
 * Minigame Utilities: Coordinate Sync System
 * Handles automated player positioning via secure server-side commands.
 */

let isTeleportEnabled = false; // Default state for incoming requests

/**
 * Listens for hidden network messages to reposition the player character
 * @param {Object} data - The incoming socket data package
 */
function PlayerPositionListener(data) {
    // Validate message type, system status, and sender permissions
    if (data.Type === "Hidden" && 
        data.Content.startsWith("Teleport ") && 
        isTeleportEnabled === true && 
        ChatRoomData.Admin.includes(data.Sender)) {
        
        // Parse destination coordinates: [targetID, x, y]
        const [target, x, y] = data.Content.replace("Teleport ", "").split(" ");
        
        // Confirm the command is intended for this player
        if (target && target === Player.MemberNumber.toString()) {
            const xNum = parseInt(x);
            const yNum = parseInt(y);

            // Sanity check for coordinate validity and map boundaries
            if (!isNaN(xNum) && !isNaN(yNum)) {
                if (xNum >= 0 && xNum < ChatRoomMapViewWidth && yNum >= 0 && yNum < ChatRoomMapViewHeight) {
                    
                    // Apply new coordinates to player object
                    Player.MapData.Pos.X = xNum;
                    Player.MapData.Pos.Y = yNum;
                    
                    // Trigger map redraw/update
                    ChatRoomMapViewUpdatePlayerFlag(-ChatRoomMapViewUpdatePlayerTime);
                    
                    console.log(`Navigation: Player moved to (${xNum}, ${yNum})`);
                }
            }
        }
    }
}

// Attach listener to the communication socket
ServerSocket.on("ChatRoomMessage", PlayerPositionListener);

/**
 * Utility to inject system messages into the local chat log
 * @param {string} msg - The text to display locally
 */
function addSystemLog(msg) {
    const div = document.createElement("div");
    div.setAttribute('class', 'ChatMessage ChatMessageWhisper');
    div.setAttribute('data-time', ChatRoomCurrentTime());
    div.setAttribute('data-sender', Player.MemberNumber.toString());
    div.innerHTML = msg;

    const chatLog = document.getElementById("TextAreaChatLog");
    const isInputFocused = document.activeElement.id == "InputChat";
    const isAtBottom = ElementIsScrolledToEnd("TextAreaChatLog");

    if (chatLog != null) {
        chatLog.appendChild(div);
        if (isAtBottom) ElementScrollToEnd("TextAreaChatLog");
        if (isInputFocused) ElementFocus("InputChat");
    }
}

// Expose helper globally
window.addSystemLog = addSystemLog;

// Initial Load Message
addSystemLog("<b>Movement System:</b> Teleport requests are currently <b>Disabled</b>.<br>Use <i>/teleport-toggle</i> to switch states.");

/**
 * Command registration for the user interface
 */
let TeleportCommands = [{
    Tag: 'teleport-toggle',
    Description: "Toggles whether room admins can move your character.",
    Action: () => {
        isTeleportEnabled = !isTeleportEnabled;
        const statusText = isTeleportEnabled ? "Enabled" : "Disabled";
        
        console.log(`Navigation System: ${statusText}`);
        addSystemLog(`Navigation System: <b>${statusText}</b>`);
    }
}];

CommandCombine(TeleportCommands);
